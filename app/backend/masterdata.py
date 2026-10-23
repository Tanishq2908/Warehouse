"""Master data: lookup types, lookup values, custom field defs, settings."""
from __future__ import annotations

import re
import uuid
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from deps import db, get_current_user, iso, now_utc, require_admin

router = APIRouter(prefix="/api/v1", tags=["masterdata"])

# -------- lookup types --------


class LookupTypeIn(BaseModel):
    code: str
    name: str
    attribute_schema: list = []
    sort_order: int = 0


@router.get("/lookup-types")
async def list_lookup_types(activeOnly: bool = True, user=Depends(get_current_user)):
    q = {"is_active": True} if activeOnly else {}
    rows = await db.lookup_type.find(q, {"_id": 0}).sort("sort_order", 1).to_list(500)
    return rows


@router.post("/lookup-types")
async def create_lookup_type(body: LookupTypeIn, user=Depends(require_admin)):
    code = body.code.upper().replace(" ", "_")
    if not re.match(r"^[A-Z][A-Z0-9_]*$", code):
        raise HTTPException(422, "Code must be UPPER_SNAKE")
    if await db.lookup_type.find_one({"code": code}):
        raise HTTPException(409, "Code already exists")
    doc = {
        "id": str(uuid.uuid4()), "code": code, "name": body.name,
        "is_system": False, "attribute_schema": body.attribute_schema,
        "sort_order": body.sort_order, "is_active": True,
        "created_at": iso(now_utc()), "updated_at": iso(now_utc()),
    }
    await db.lookup_type.insert_one(doc)
    doc.pop("_id", None)
    return doc


class LookupTypePatch(BaseModel):
    name: Optional[str] = None
    attribute_schema: Optional[list] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


@router.put("/lookup-types/{id}")
async def update_lookup_type(id: str, body: LookupTypePatch, user=Depends(require_admin)):
    upd = {k: v for k, v in body.model_dump().items() if v is not None}
    upd["updated_at"] = iso(now_utc())
    r = await db.lookup_type.update_one({"id": id}, {"$set": upd})
    if r.matched_count == 0:
        raise HTTPException(404, "Not found")
    return await db.lookup_type.find_one({"id": id}, {"_id": 0})


# -------- lookup values --------


class LookupValueIn(BaseModel):
    code: Optional[str] = None
    label: str
    attributes: dict = {}
    sort_order: int = 0


@router.get("/lookups/{typeCode}/values")
async def list_values(
    typeCode: str, q: str = "", activeOnly: bool = True, limit: int = 200,
    user=Depends(get_current_user),
):
    t = await db.lookup_type.find_one({"code": typeCode.upper()})
    if not t:
        raise HTTPException(404, "Type not found")
    query: dict[str, Any] = {"type_id": t["id"]}
    if activeOnly:
        query["is_active"] = True
    if q:
        query["label"] = {"$regex": re.escape(q), "$options": "i"}
    rows = await db.lookup_value.find(query, {"_id": 0}).sort("sort_order", 1).to_list(limit)
    return rows


@router.post("/lookups/{typeCode}/values")
async def create_value(typeCode: str, body: LookupValueIn, user=Depends(get_current_user)):
    t = await db.lookup_type.find_one({"code": typeCode.upper()})
    if not t:
        raise HTTPException(404, "Type not found")
    code = (body.code or body.label).upper().replace(" ", "_")
    code = re.sub(r"[^A-Z0-9_]+", "_", code)[:60] or "VAL"
    # ensure unique per type
    base = code
    n = 1
    while await db.lookup_value.find_one({"type_id": t["id"], "code": code}):
        n += 1
        code = f"{base}_{n}"
    doc = {
        "id": str(uuid.uuid4()), "type_id": t["id"], "code": code, "label": body.label,
        "attributes": body.attributes or {}, "sort_order": body.sort_order,
        "is_active": True, "created_by": user["id"],
        "created_at": iso(now_utc()), "updated_at": iso(now_utc()),
    }
    await db.lookup_value.insert_one(doc)
    doc.pop("_id", None)
    return doc


class LookupValuePatch(BaseModel):
    label: Optional[str] = None
    attributes: Optional[dict] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


@router.put("/lookup-values/{id}")
async def update_value(id: str, body: LookupValuePatch, user=Depends(get_current_user)):
    upd = {k: v for k, v in body.model_dump().items() if v is not None}
    upd["updated_at"] = iso(now_utc())
    r = await db.lookup_value.update_one({"id": id}, {"$set": upd})
    if r.matched_count == 0:
        raise HTTPException(404, "Not found")
    return await db.lookup_value.find_one({"id": id}, {"_id": 0})


@router.delete("/lookup-values/{id}")
async def delete_value(id: str, user=Depends(require_admin)):
    # soft-delete: block if referenced in inventory/orders/etc.
    # For MVP: check for use in a few key places
    ref_counts = {}
    for coll in ("purchase_order_item", "goods_receipt_item", "sale_item", "raw_material"):
        c = await db[coll].count_documents({"unit_id": id})
        if c:
            ref_counts[coll] = c
    if ref_counts:
        raise HTTPException(409, f"Value in use: {ref_counts}")
    r = await db.lookup_value.update_one({"id": id}, {"$set": {"is_active": False}})
    if r.matched_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}


# -------- custom fields --------


class FieldDefIn(BaseModel):
    entity_type: str
    field_key: str
    label: str
    data_type: str
    lookup_type_id: Optional[str] = None
    is_required: bool = False
    default_value: Optional[Any] = None
    validation: dict = {}
    sort_order: int = 0
    show_in_list: bool = True


VALID_DATA_TYPES = {
    "TEXT", "MULTILINE", "NUMBER", "INTEGER", "DATE", "DATETIME",
    "BOOLEAN", "LOOKUP", "MULTI_LOOKUP", "FILE",
}


@router.get("/meta/fields/{entityType}")
async def get_field_defs(entityType: str, user=Depends(get_current_user)):
    rows = await db.custom_field_def.find(
        {"entity_type": entityType, "is_active": True}, {"_id": 0}
    ).sort("sort_order", 1).to_list(500)
    return rows


@router.post("/meta/fields")
async def create_field_def(body: FieldDefIn, user=Depends(require_admin)):
    if body.data_type not in VALID_DATA_TYPES:
        raise HTTPException(422, "Invalid data_type")
    key = re.sub(r"[^a-z0-9_]+", "_", body.field_key.lower())
    if not re.match(r"^[a-z][a-z0-9_]*$", key):
        raise HTTPException(422, "field_key must be snake_case starting with letter")
    if body.data_type in ("LOOKUP", "MULTI_LOOKUP") and not body.lookup_type_id:
        raise HTTPException(422, "lookup_type_id required for LOOKUP fields")
    if await db.custom_field_def.find_one({"entity_type": body.entity_type, "field_key": key}):
        raise HTTPException(409, "Field already exists")
    doc = {**body.model_dump(), "field_key": key, "id": str(uuid.uuid4()),
           "is_active": True, "created_at": iso(now_utc())}
    await db.custom_field_def.insert_one(doc)
    doc.pop("_id", None)
    return doc


class FieldDefPatch(BaseModel):
    label: Optional[str] = None
    is_required: Optional[bool] = None
    default_value: Optional[Any] = None
    validation: Optional[dict] = None
    sort_order: Optional[int] = None
    show_in_list: Optional[bool] = None
    is_active: Optional[bool] = None


@router.put("/meta/fields/{id}")
async def update_field_def(id: str, body: FieldDefPatch, user=Depends(require_admin)):
    upd = {k: v for k, v in body.model_dump().items() if v is not None}
    r = await db.custom_field_def.update_one({"id": id}, {"$set": upd})
    if r.matched_count == 0:
        raise HTTPException(404, "Not found")
    return await db.custom_field_def.find_one({"id": id}, {"_id": 0})


@router.delete("/meta/fields/{id}")
async def delete_field_def(id: str, user=Depends(require_admin)):
    r = await db.custom_field_def.update_one({"id": id}, {"$set": {"is_active": False}})
    if r.matched_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}


# -------- settings --------


@router.get("/settings")
async def get_settings(user=Depends(get_current_user)):
    rows = await db.app_setting.find({}, {"_id": 0}).to_list(500)
    return rows


class SettingPatch(BaseModel):
    value: Any


@router.put("/settings/{key}")
async def update_setting(key: str, body: SettingPatch, user=Depends(require_admin)):
    r = await db.app_setting.update_one(
        {"key": key},
        {"$set": {"value": body.value, "updated_at": iso(now_utc()), "updated_by": user["id"]}},
    )
    if r.matched_count == 0:
        raise HTTPException(404, "Setting not found")
    return await db.app_setting.find_one({"key": key}, {"_id": 0})


async def get_setting(key: str, default=None):
    row = await db.app_setting.find_one({"key": key})
    if not row:
        return default
    return row.get("value", default)


# -- Admin: Clear all data ------------------------------------------------------
from pydantic import BaseModel as _ClearBM
class _ClearDataBody(_ClearBM):
    confirm: str

@router.post("/admin/clear-data")
async def clear_all_data(body: _ClearDataBody, user=Depends(require_admin)):
    """Clear all transactional data. Preserves master data."""
    if body.confirm != "DELETE_ALL_DATA":
        raise HTTPException(422, 'Send {"confirm": "DELETE_ALL_DATA"} to proceed')
    for coll_name in [
        "purchase_order", "purchase_order_item",
        "goods_receipt", "goods_receipt_item",
        "raw_material", "inventory_txn",
        "sale", "sale_item",
    ]:
        await db[coll_name].delete_many({})
    await db.doc_sequence.update_many({}, {"$set": {"next_value": 1, "period_key": None}})
    return {"ok": True, "message": "All orders, receipts, inventory, and sales cleared."}
