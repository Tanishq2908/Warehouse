"""Shared dependencies: DB, auth, common utils."""
from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Any, Optional
from pathlib import Path

import bcrypt
import jwt
from dotenv import load_dotenv
from fastapi import Depends, Header, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ.get("JWT_SECRET", "change-me-warehouse-2026-devsecret")
JWT_ALG = "HS256"
ACCESS_TTL_MIN = 15
REFRESH_TTL_DAYS = 30

_client = AsyncIOMotorClient(MONGO_URL)
db: AsyncIOMotorDatabase = _client[DB_NAME]


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def iso(dt: datetime | None) -> Optional[str]:
    if dt is None:
        return None
    if isinstance(dt, str):
        return dt
    return dt.isoformat()


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def make_access_token(user_id: str, username: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "username": username,
        "role": role,
        "type": "access",
        "iat": int(now_utc().timestamp()),
        "exp": int((now_utc() + timedelta(minutes=ACCESS_TTL_MIN)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def make_refresh_token(user_id: str) -> tuple[str, datetime]:
    exp = now_utc() + timedelta(days=REFRESH_TTL_DAYS)
    payload = {
        "sub": user_id,
        "type": "refresh",
        "iat": int(now_utc().timestamp()),
        "exp": int(exp.timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG), exp


def decode_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1].strip()
    payload = decode_token(token)
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Wrong token type")
    user = await db.app_user.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user or not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="User not found or inactive")
    return user


def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin only")
    return user


# Doc sequence helper -----------------------------------------------------------
async def next_doc_no(entity: str) -> str:
    """Atomic doc number generator with fiscal-year/monthly/yearly reset."""
    seq = await db.doc_sequence.find_one({"entity": entity})
    if not seq:
        raise HTTPException(status_code=500, detail=f"No sequence for {entity}")

    now = now_utc()
    reset = seq.get("reset_period", "NEVER")
    if reset == "YEARLY":
        cur_key = now.strftime("%Y")
    elif reset == "MONTHLY":
        cur_key = now.strftime("%Y%m")
    elif reset == "FISCAL_YEAR":
        # India fiscal year: April-March
        month = now.month
        year = now.year if month >= 4 else now.year - 1
        cur_key = str(year)
    else:
        cur_key = ""

    next_value = seq.get("next_value", 1)
    if reset != "NEVER" and seq.get("period_key") != cur_key:
        next_value = 1

    await db.doc_sequence.update_one(
        {"entity": entity},
        {"$set": {"next_value": next_value + 1, "period_key": cur_key}},
    )
    prefix = seq.get("prefix", "")
    pad = seq.get("pad_width", 5)
    parts = [prefix]
    if cur_key:
        parts.append(cur_key + "-")
    parts.append(str(next_value).zfill(pad))
    return "".join(parts)


# Custom field validator --------------------------------------------------------
async def validate_custom_fields(entity_type: str, values: dict | None) -> dict:
    """Validate custom_fields against custom_field_def rows for entity_type."""
    values = values or {}
    defs = await db.custom_field_def.find(
        {"entity_type": entity_type, "is_active": True}, {"_id": 0}
    ).to_list(1000)
    def_map = {d["field_key"]: d for d in defs}
    # unknown keys
    for k in values.keys():
        if k not in def_map:
            raise HTTPException(422, f"Unknown custom field '{k}' for {entity_type}")
    result: dict = {}
    for key, d in def_map.items():
        v = values.get(key)
        if v is None or v == "":
            if d.get("default_value") is not None:
                v = d["default_value"]
            elif d.get("is_required"):
                raise HTTPException(422, f"Custom field '{key}' is required")
            else:
                continue
        dt = d["data_type"]
        val = d.get("validation") or {}
        if dt in ("NUMBER", "INTEGER"):
            try:
                v = float(v) if dt == "NUMBER" else int(v)
            except (ValueError, TypeError):
                raise HTTPException(422, f"'{key}' must be a number")
            if "min" in val and v < val["min"]:
                raise HTTPException(422, f"'{key}' below min")
            if "max" in val and v > val["max"]:
                raise HTTPException(422, f"'{key}' above max")
        elif dt == "BOOLEAN":
            v = bool(v)
        elif dt in ("TEXT", "MULTILINE"):
            v = str(v)
            if "maxLength" in val and len(v) > val["maxLength"]:
                raise HTTPException(422, f"'{key}' too long")
        elif dt in ("LOOKUP",):
            # must be a valid lookup_value id
            if not isinstance(v, str) or not v:
                raise HTTPException(422, f"'{key}' must be a lookup id")
            exists = await db.lookup_value.find_one({"id": v, "is_active": True})
            if not exists:
                raise HTTPException(422, f"'{key}' lookup value not found")
        result[key] = v
    return result
