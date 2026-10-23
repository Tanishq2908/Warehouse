"""Auth routes: login, refresh, logout, me + user management."""
from __future__ import annotations

import hashlib
import uuid
from datetime import timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from deps import (
    ACCESS_TTL_MIN, REFRESH_TTL_DAYS, db, decode_token, get_current_user,
    hash_password, iso, make_access_token, make_refresh_token, now_utc, verify_password,
    require_admin,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginBody(BaseModel):
    username: str
    password: str


class RefreshBody(BaseModel):
    refreshToken: str


def _hash_refresh(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


@router.post("/login")
async def login(body: LoginBody):
    user = await db.app_user.find_one({"username": body.username.lower()})
    if not user or not user.get("is_active", True):
        raise HTTPException(401, "Invalid credentials")
    if not verify_password(body.password, user["password_hash"]):
        raise HTTPException(401, "Invalid credentials")
    access = make_access_token(user["id"], user["username"], user["role"])
    refresh, exp = make_refresh_token(user["id"])
    await db.refresh_token.insert_one({
        "id": str(uuid.uuid4()), "user_id": user["id"],
        "token_hash": _hash_refresh(refresh), "device_info": None,
        "expires_at": iso(exp), "revoked_at": None, "created_at": iso(now_utc()),
    })
    await db.app_user.update_one({"id": user["id"]}, {"$set": {"last_login_at": iso(now_utc())}})
    return {
        "accessToken": access, "refreshToken": refresh,
        "expiresIn": ACCESS_TTL_MIN * 60,
        "user": {"id": user["id"], "username": user["username"], "fullName": user["full_name"], "role": user["role"]},
    }


@router.post("/refresh")
async def refresh(body: RefreshBody):
    payload = decode_token(body.refreshToken)
    if payload.get("type") != "refresh":
        raise HTTPException(401, "Wrong token type")
    row = await db.refresh_token.find_one({"token_hash": _hash_refresh(body.refreshToken)})
    if not row or row.get("revoked_at"):
        raise HTTPException(401, "Refresh token invalid or revoked")
    user = await db.app_user.find_one({"id": payload["sub"]})
    if not user or not user.get("is_active", True):
        raise HTTPException(401, "User not found")
    access = make_access_token(user["id"], user["username"], user["role"])
    return {"accessToken": access, "expiresIn": ACCESS_TTL_MIN * 60}


@router.post("/logout")
async def logout(body: RefreshBody):
    await db.refresh_token.update_one(
        {"token_hash": _hash_refresh(body.refreshToken)},
        {"$set": {"revoked_at": iso(now_utc())}},
    )
    return {"ok": True}


@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return {"id": user["id"], "username": user["username"], "fullName": user["full_name"], "role": user["role"]}


class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str
    phone: Optional[str] = None
    role: str = "STAFF"


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


@router.get("/users")
async def list_users(user=Depends(require_admin)):
    rows = await db.app_user.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(500)
    return rows


@router.post("/users")
async def create_user(body: UserCreate, user=Depends(require_admin)):
    if body.role not in ("ADMIN", "MANAGER", "STAFF"):
        raise HTTPException(422, "Role must be ADMIN, MANAGER, or STAFF")
    username = body.username.strip().lower()
    if not username:
        raise HTTPException(422, "Username required")
    if len(body.password) < 4:
        raise HTTPException(422, "Password must be at least 4 characters")
    if await db.app_user.find_one({"username": username}):
        raise HTTPException(409, "Username already taken")
    doc = {
        "id": str(uuid.uuid4()), "username": username,
        "password_hash": hash_password(body.password), "full_name": body.full_name.strip(),
        "phone": body.phone, "role": body.role, "is_active": True, "last_login_at": None,
        "created_at": iso(now_utc()), "updated_at": iso(now_utc()),
    }
    await db.app_user.insert_one(doc)
    doc.pop("_id", None); doc.pop("password_hash", None)
    return doc


@router.put("/users/{id}")
async def update_user(id: str, body: UserUpdate, user=Depends(require_admin)):
    existing = await db.app_user.find_one({"id": id})
    if not existing:
        raise HTTPException(404, "User not found")
    upd = {}
    if body.full_name is not None: upd["full_name"] = body.full_name.strip()
    if body.phone is not None: upd["phone"] = body.phone
    if body.role is not None:
        if body.role not in ("ADMIN", "MANAGER", "STAFF"): raise HTTPException(422, "Invalid role")
        upd["role"] = body.role
    if body.is_active is not None: upd["is_active"] = body.is_active
    if body.password is not None:
        if len(body.password) < 4: raise HTTPException(422, "Password must be at least 4 characters")
        upd["password_hash"] = hash_password(body.password)
    upd["updated_at"] = iso(now_utc())
    await db.app_user.update_one({"id": id}, {"$set": upd})
    return await db.app_user.find_one({"id": id}, {"_id": 0, "password_hash": 0})


@router.delete("/users/{id}")
async def delete_user(id: str, user=Depends(require_admin)):
    if id == user["id"]: raise HTTPException(409, "Cannot deactivate yourself")
    r = await db.app_user.update_one({"id": id}, {"$set": {"is_active": False, "updated_at": iso(now_utc())}})
    if r.matched_count == 0: raise HTTPException(404, "Not found")
    return {"ok": True}


# ── User Management (Admin only) - added ──────────────────────────────────────
from typing import Optional as _Opt
import uuid as _uuid
from fastapi import APIRouter as _AR, Depends as _Dep, HTTPException as _HE
from pydantic import BaseModel as _BM
from deps import db as _db, require_admin as _ra, iso as _iso, now_utc as _now, hash_password as _hp

class _UserCreate(_BM):
    username: str
    password: str
    full_name: str
    phone: _Opt[str] = None
    role: str = "STAFF"

class _UserUpdate(_BM):
    full_name: _Opt[str] = None
    phone: _Opt[str] = None
    role: _Opt[str] = None
    is_active: _Opt[bool] = None
    password: _Opt[str] = None

# Patch onto existing router
from auth import router as _auth_router

@_auth_router.get("/users")
async def _list_users(user=_Dep(_ra)):
    rows = await _db.app_user.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(500)
    return rows

@_auth_router.post("/users")
async def _create_user(body: _UserCreate, user=_Dep(_ra)):
    if body.role not in ("ADMIN", "MANAGER", "STAFF"):
        raise _HE(422, "Role must be ADMIN, MANAGER, or STAFF")
    username = body.username.strip().lower()
    if not username: raise _HE(422, "Username required")
    if len(body.password) < 4: raise _HE(422, "Min 4 chars")
    if await _db.app_user.find_one({"username": username}): raise _HE(409, "Username taken")
    doc = {
        "id": str(_uuid.uuid4()), "username": username, "password_hash": _hp(body.password),
        "full_name": body.full_name.strip(), "phone": body.phone, "role": body.role,
        "is_active": True, "last_login_at": None, "created_at": _iso(_now()), "updated_at": _iso(_now()),
    }
    await _db.app_user.insert_one(doc)
    doc.pop("_id", None); doc.pop("password_hash", None)
    return doc

@_auth_router.put("/users/{uid}")
async def _update_user(uid: str, body: _UserUpdate, user=_Dep(_ra)):
    ex = await _db.app_user.find_one({"id": uid})
    if not ex: raise _HE(404, "User not found")
    upd = {}
    if body.full_name is not None: upd["full_name"] = body.full_name.strip()
    if body.phone is not None: upd["phone"] = body.phone
    if body.role is not None:
        if body.role not in ("ADMIN","MANAGER","STAFF"): raise _HE(422, "Invalid role")
        upd["role"] = body.role
    if body.is_active is not None: upd["is_active"] = body.is_active
    if body.password is not None:
        if len(body.password) < 4: raise _HE(422, "Min 4 chars")
        upd["password_hash"] = _hp(body.password)
    upd["updated_at"] = _iso(_now())
    await _db.app_user.update_one({"id": uid}, {"$set": upd})
    return await _db.app_user.find_one({"id": uid}, {"_id": 0, "password_hash": 0})

@_auth_router.delete("/users/{uid}")
async def _delete_user(uid: str, user=_Dep(_ra)):
    if uid == user["id"]: raise _HE(409, "Cannot deactivate yourself")
    r = await _db.app_user.update_one({"id": uid}, {"$set": {"is_active": False, "updated_at": _iso(_now())}})
    if r.matched_count == 0: raise _HE(404, "Not found")
    return {"ok": True}
