"""Parties, products, designs."""
from __future__ import annotations

import re
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from deps import (
    db, get_current_user, iso, next_doc_no, now_utc, require_admin, validate_custom_fields,
)

router = APIRouter(prefix="/api/v1", tags=["catalog"])

# ---- Parties ----


class PartyIn(BaseModel):
    name: str
    legal_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    gstin: Optional[str] = None
    address_line: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    is_provider: bool = False
    is_customer: bool = False
    is_seller: bool = False
    opening_balance: float = 0
    custom_fields: dict = {}


@router.get("/parties")
async def list_parties(role: Optional[str] = None, q: str = "", limit: int = 100,
                       user=Depends(get_current_user)):
    query: dict = {"is_active": True}
    if role == "PROVIDER":
        query["is_provider"] = True
    elif role == "CUSTOMER":
        query["is_customer"] = True
    elif role == "SELLER":
        query["is_seller"] = True
    if q:
        query["name"] = {"$regex": re.escape(q), "$options": "i"}
    return await db.party.find(query, {"_id": 0}).sort("name", 1).to_list(limit)


@router.post("/parties")
async def create_party(body: PartyIn, user=Depends(get_current_user)):
    cf = await validate_custom_fields("PARTY", body.custom_fields)
    doc = body.model_dump()
    doc["custom_fields"] = cf
    doc.update({
        "id": str(uuid.uuid4()), "is_active": True,
        "created_at": iso(now_utc()), "updated_at": iso(now_utc()),
    })
    await db.party.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.get("/parties/{id}")
async def get_party(id: str, user=Depends(get_current_user)):
    p = await db.party.find_one({"id": id}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Not found")
    return p


@router.put("/parties/{id}")
async def update_party(id: str, body: PartyIn, user=Depends(get_current_user)):
    cf = await validate_custom_fields("PARTY", body.custom_fields)
    upd = body.model_dump()
    upd["custom_fields"] = cf
    upd["updated_at"] = iso(now_utc())
    r = await db.party.update_one({"id": id}, {"$set": upd})
    if r.matched_count == 0:
        raise HTTPException(404, "Not found")
    return await db.party.find_one({"id": id}, {"_id": 0})


@router.delete("/parties/{id}")
async def delete_party(id: str, user=Depends(require_admin)):
    r = await db.party.update_one({"id": id}, {"$set": {"is_active": False}})
    if r.matched_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}


# ---- Products ----


class ProductIn(BaseModel):
    name: str
    category_id: Optional[str] = None
    default_unit_id: Optional[str] = None
    hsn_code: Optional[str] = None
    custom_fields: dict = {}


@router.get("/products")
async def list_products(q: str = "", limit: int = 100, user=Depends(get_current_user)):
    query: dict = {"is_active": True}
    if q:
        query["$or"] = [
            {"name": {"$regex": re.escape(q), "$options": "i"}},
            {"code": {"$regex": re.escape(q), "$options": "i"}},
        ]
    return await db.product.find(query, {"_id": 0}).sort("name", 1).to_list(limit)


@router.post("/products")
async def create_product(body: ProductIn, user=Depends(get_current_user)):
    cf = await validate_custom_fields("PRODUCT", body.custom_fields)
    code = await next_doc_no("PRODUCT")
    doc = body.model_dump()
    doc["custom_fields"] = cf
    doc.update({
        "id": str(uuid.uuid4()), "code": code, "is_active": True,
        "created_at": iso(now_utc()), "updated_at": iso(now_utc()),
    })
    await db.product.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.put("/products/{id}")
async def update_product(id: str, body: ProductIn, user=Depends(get_current_user)):
    cf = await validate_custom_fields("PRODUCT", body.custom_fields)
    upd = body.model_dump()
    upd["custom_fields"] = cf
    upd["updated_at"] = iso(now_utc())
    r = await db.product.update_one({"id": id}, {"$set": upd})
    if r.matched_count == 0:
        raise HTTPException(404, "Not found")
    return await db.product.find_one({"id": id}, {"_id": 0})


# ---- Designs ----


class DesignIn(BaseModel):
    name: str
    product_id: Optional[str] = None
    quality_id: Optional[str] = None
    colour_id: Optional[str] = None
    image_path: Optional[str] = None
    notes: Optional[str] = None
    custom_fields: dict = {}


@router.get("/designs")
async def list_designs(productId: Optional[str] = None, q: str = "", limit: int = 100,
                       user=Depends(get_current_user)):
    query: dict = {"is_active": True}
    if productId:
        query["product_id"] = productId
    if q:
        query["$or"] = [
            {"name": {"$regex": re.escape(q), "$options": "i"}},
            {"design_code": {"$regex": re.escape(q), "$options": "i"}},
        ]
    return await db.design.find(query, {"_id": 0}).sort("design_code", 1).to_list(limit)


@router.post("/designs")
async def create_design(body: DesignIn, user=Depends(get_current_user)):
    cf = await validate_custom_fields("DESIGN", body.custom_fields)
    code = await next_doc_no("DESIGN")
    doc = body.model_dump()
    doc["custom_fields"] = cf
    doc.update({
        "id": str(uuid.uuid4()), "design_code": code, "is_active": True,
        "created_by": user["id"],
        "created_at": iso(now_utc()), "updated_at": iso(now_utc()),
    })
    await db.design.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.put("/designs/{id}")
async def update_design(id: str, body: DesignIn, user=Depends(get_current_user)):
    cf = await validate_custom_fields("DESIGN", body.custom_fields)
    upd = body.model_dump()
    upd["custom_fields"] = cf
    upd["updated_at"] = iso(now_utc())
    r = await db.design.update_one({"id": id}, {"$set": upd})
    if r.matched_count == 0:
        raise HTTPException(404, "Not found")
    return await db.design.find_one({"id": id}, {"_id": 0})


# ---- Unit conversions ----


class UnitConvIn(BaseModel):
    from_unit_id: str
    to_unit_id: str
    factor: float
    product_id: Optional[str] = None


@router.get("/unit-conversions")
async def list_conv(fromUnit: Optional[str] = None, toUnit: Optional[str] = None,
                    productId: Optional[str] = None, user=Depends(get_current_user)):
    q: dict = {}
    if fromUnit:
        q["from_unit_id"] = fromUnit
    if toUnit:
        q["to_unit_id"] = toUnit
    if productId:
        q["product_id"] = productId
    return await db.unit_conversion.find(q, {"_id": 0}).to_list(200)


@router.post("/unit-conversions")
async def create_conv(body: UnitConvIn, user=Depends(get_current_user)):
    if body.factor <= 0:
        raise HTTPException(422, "Factor must be > 0")
    doc = body.model_dump()
    doc.update({"id": str(uuid.uuid4()), "created_at": iso(now_utc())})
    await db.unit_conversion.insert_one(doc)
    # reverse conversion too
    rev = {
        "id": str(uuid.uuid4()),
        "from_unit_id": body.to_unit_id, "to_unit_id": body.from_unit_id,
        "factor": 1.0 / body.factor, "product_id": body.product_id,
        "created_at": iso(now_utc()),
    }
    await db.unit_conversion.insert_one(rev)
    doc.pop("_id", None)
    return doc


@router.delete("/unit-conversions/{id}")
async def del_conv(id: str, user=Depends(require_admin)):
    r = await db.unit_conversion.delete_one({"id": id})
    if r.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}


async def convert_qty(qty: float, from_unit_id: str, to_unit_id: str,
                      product_id: Optional[str] = None) -> float:
    if from_unit_id == to_unit_id:
        return qty
    # product-specific first
    if product_id:
        c = await db.unit_conversion.find_one({
            "from_unit_id": from_unit_id, "to_unit_id": to_unit_id, "product_id": product_id,
        })
        if c:
            return qty * c["factor"]
    c = await db.unit_conversion.find_one({
        "from_unit_id": from_unit_id, "to_unit_id": to_unit_id, "product_id": None,
    })
    if c:
        return qty * c["factor"]
    raise HTTPException(422, {
        "code": "UNIT_CONVERSION_MISSING",
        "from_unit_id": from_unit_id, "to_unit_id": to_unit_id,
    })
