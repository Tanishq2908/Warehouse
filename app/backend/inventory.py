"""Inventory read-only endpoints + admin adjust + convert-to-product."""
from __future__ import annotations

import uuid
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from deps import db, get_current_user, iso, now_utc, require_admin
from purchase import _post_inventory_txn

router = APIRouter(prefix="/api/v1", tags=["inventory"])


@router.get("/raw-materials")
async def list_rm(productId: Optional[str] = None, designId: Optional[str] = None,
                  lowStock: bool = False, q: str = "", pieceNo: Optional[str] = None,
                  limit: int = 200, user=Depends(get_current_user)):
    query: dict = {}
    if productId:
        query["product_id"] = productId
    if designId:
        query["design_id"] = designId
    if pieceNo:
        query["piece_no"] = {"$regex": pieceNo, "$options": "i"}
    rows = await db.raw_material.find(query, {"_id": 0}).sort("updated_at", -1).to_list(limit)
    # attach product/design/unit labels
    prod_ids = list({r["product_id"] for r in rows if r.get("product_id")})
    dsg_ids = list({r["design_id"] for r in rows if r.get("design_id")})
    unit_ids = list({r["unit_id"] for r in rows if r.get("unit_id")})
    prods = {p["id"]: p async for p in db.product.find({"id": {"$in": prod_ids}})}
    dsgs = {d["id"]: d async for d in db.design.find({"id": {"$in": dsg_ids}})}
    units = {u["id"]: u async for u in db.lookup_value.find({"id": {"$in": unit_ids}})}
    out = []
    for r in rows:
        pid = r.get("product_id", "")
        r["product"] = {
            "id": pid,
            "code": prods.get(pid, {}).get("code"),
            "name": prods.get(pid, {}).get("name"),
        }
        dsg_id = r.get("design_id") or ""
        d = dsgs.get(dsg_id, {})
        r["design"] = {
            "id": dsg_id, "design_code": d.get("design_code"), "name": d.get("name"),
        }
        uid = r.get("unit_id", "")
        u = units.get(uid, {})
        r["unit"] = {"id": uid, "code": u.get("code"), "label": u.get("label")}
        if q:
            hay = " ".join([
                str(r["product"]["name"] or ""), str(r["product"]["code"] or ""),
                str(r["design"]["name"] or ""), str(r["design"]["design_code"] or ""),
                str(r.get("piece_no") or ""), str(r.get("design_no") or ""),
                str(r.get("converted_name") or ""),
            ]).lower()
            if q.lower() not in hay:
                continue
        if lowStock and r.get("reorder_level"):
            if r["quantity"] > r["reorder_level"]:
                continue
        out.append(r)
    return out


@router.get("/raw-materials/{id}")
async def get_rm(id: str, user=Depends(get_current_user)):
    r = await db.raw_material.find_one({"id": id}, {"_id": 0})
    if not r:
        raise HTTPException(404, "Not found")
    return r


@router.get("/raw-materials/{id}/ledger")
async def get_ledger(id: str, user=Depends(get_current_user)):
    txns = await db.inventory_txn.find(
        {"raw_material_id": id}, {"_id": 0}
    ).sort("created_at", -1).to_list(500)
    return txns


class AdjustIn(BaseModel):
    qty_delta: float
    reason: str
    rate: Optional[float] = None


@router.post("/raw-materials/{id}/adjust")
async def adjust_stock(id: str, body: AdjustIn, user=Depends(require_admin)):
    if not body.reason or len(body.reason.strip()) < 3:
        raise HTTPException(422, "Reason required")
    rm = await db.raw_material.find_one({"id": id})
    if not rm:
        raise HTTPException(404, "Not found")
    await _post_inventory_txn(
        raw_material_id=id, txn_type="ADJUSTMENT",
        qty_delta=body.qty_delta, rate=body.rate,
        txn_date=now_utc().date().isoformat(),
        ref_type="MANUAL_ADJUSTMENT", ref_id=str(uuid.uuid4()),
        user_id=user["id"], note=body.reason,
    )
    return await db.raw_material.find_one({"id": id}, {"_id": 0})


# --------------- Convert to Product ---------------

class ConvertExtraField(BaseModel):
    label: str
    value: str


class ConvertIn(BaseModel):
    source_rm_id: str
    qty_used: float
    unit_id: str
    output_name: str
    output_design_no: Optional[str] = None
    output_piece_no: Optional[str] = None
    qty_produced: float
    output_unit_id: str
    output_rate: Optional[float] = None
    convert_date: Optional[str] = None
    notes: Optional[str] = None
    extra_fields: list[ConvertExtraField] = []


@router.post("/raw-materials/convert")
async def convert_to_product(body: ConvertIn, user=Depends(get_current_user)):
    """Deduct qty_used from source raw material, create new raw_material for output."""
    # --- Validate ---
    source = await db.raw_material.find_one({"id": body.source_rm_id})
    if not source:
        raise HTTPException(404, "Source material not found")
    if body.qty_used <= 0:
        raise HTTPException(422, "qty_used must be positive")
    if body.qty_produced <= 0:
        raise HTTPException(422, "qty_produced must be positive")
    if source.get("quantity", 0) < body.qty_used - 0.001:
        raise HTTPException(
            422,
            f"Insufficient stock: {source.get('quantity', 0)} available, {body.qty_used} needed"
        )

    txn_date = body.convert_date or now_utc().date().isoformat()
    conv_ref = str(uuid.uuid4())

    # --- 1. Deduct from source ---
    await _post_inventory_txn(
        raw_material_id=body.source_rm_id,
        txn_type="CONVERSION_OUT",
        qty_delta=-body.qty_used,
        rate=source.get("avg_rate"),
        txn_date=txn_date,
        ref_type="CONVERSION",
        ref_id=f"src-{conv_ref}",  # unique per conversion direction
        user_id=user["id"],
        note=f"Converted → {body.output_name}" + (f" | {body.notes}" if body.notes else ""),
    )

    # --- 2. Find or create output raw_material ---
    output_piece_no = body.output_piece_no or None
    output_rm: Optional[dict] = None
    if output_piece_no:
        output_rm = await db.raw_material.find_one({"piece_no": output_piece_no})

    if not output_rm:
        extra: dict[str, Any] = {f.label: f.value for f in body.extra_fields if f.label.strip()}
        output_rm_doc: dict[str, Any] = {
            "id": str(uuid.uuid4()),
            "product_id": source["product_id"],
            "design_id": source.get("design_id") or "",
            "unit_id": body.output_unit_id,
            "piece_no": output_piece_no,
            "design_no": body.output_design_no,
            "converted_name": body.output_name,
            "weight": None,
            "quantity": 0,
            "avg_rate": body.output_rate or 0,
            "last_rate": body.output_rate,
            "last_purchase_date": None,
            "reorder_level": None,
            "custom_fields": extra,
            "source_conversion_ref": conv_ref,
            "created_at": iso(now_utc()), "updated_at": iso(now_utc()),
        }
        await db.raw_material.insert_one(output_rm_doc)
        output_rm_id = output_rm_doc["id"]
    else:
        output_rm_id = output_rm["id"]
        extra = {f.label: f.value for f in body.extra_fields if f.label.strip()}
        await db.raw_material.update_one({"id": output_rm_id}, {"$set": {
            "converted_name": body.output_name,
            "design_no": body.output_design_no,
            "custom_fields": {**output_rm.get("custom_fields", {}), **extra},
            "updated_at": iso(now_utc()),
        }})

    # --- 3. Credit the output material ---
    piece_ref = source.get("piece_no") or source["id"][:8]
    await _post_inventory_txn(
        raw_material_id=output_rm_id,
        txn_type="CONVERSION_IN",
        qty_delta=body.qty_produced,
        rate=body.output_rate,
        txn_date=txn_date,
        ref_type="CONVERSION",
        ref_id=f"out-{conv_ref}",  # unique per conversion direction
        user_id=user["id"],
        note=f"Converted from #{piece_ref}" + (f" | {body.notes}" if body.notes else ""),
    )

    # --- 4. Log conversion record ---
    conv_log: dict[str, Any] = {
        "id": conv_ref,
        "source_rm_id": body.source_rm_id,
        "output_rm_id": output_rm_id,
        "qty_used": body.qty_used, "unit_id": body.unit_id,
        "qty_produced": body.qty_produced, "output_unit_id": body.output_unit_id,
        "output_name": body.output_name,
        "output_design_no": body.output_design_no,
        "output_piece_no": output_piece_no,
        "notes": body.notes,
        "extra_fields": [ef.model_dump() for ef in body.extra_fields],
        "created_by": user["id"], "created_at": iso(now_utc()),
    }
    await db.conversion_log.insert_one(conv_log)
    conv_log.pop("_id", None)

    src_updated = await db.raw_material.find_one({"id": body.source_rm_id}, {"_id": 0})
    out_updated = await db.raw_material.find_one({"id": output_rm_id}, {"_id": 0})
    return {
        "ok": True,
        "conversion_ref": conv_ref,
        "source": src_updated,
        "output": out_updated,
    }
