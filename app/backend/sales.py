"""Sales with bill-type split logic + stock consumption."""
from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from deps import (
    db, get_current_user, iso, next_doc_no, now_utc, require_admin, validate_custom_fields,
)
from masterdata import get_setting
from purchase import _get_or_create_rm, _post_inventory_txn

router = APIRouter(prefix="/api/v1", tags=["sales"])


async def _resolve_inventory_item(it: SaleItemIn) -> dict | None:
    if it.raw_material_id:
        rm = await db.raw_material.find_one({"id": it.raw_material_id})
        if rm:
            return rm

    if not it.product_id:
        return None

    query: dict = {"product_id": it.product_id}
    if it.unit_id:
        query["unit_id"] = it.unit_id
    if it.piece_no:
        query["piece_no"] = {"$regex": f"^{it.piece_no}$", "$options": "i"}
    if it.design_id:
        query["design_id"] = {"$in": [it.design_id, "", None]} if it.design_id == "" else it.design_id

    rm = await db.raw_material.find_one(query)
    if rm:
        return rm

    if it.piece_no:
        rm = await db.raw_material.find_one({
            "product_id": it.product_id,
            "piece_no": {"$regex": f"^{it.piece_no}$", "$options": "i"}
        })
        if rm:
            return rm

    rm = await db.raw_material.find_one({"product_id": it.product_id})
    return rm


async def _preflight_check_stock(items: list[SaleItemIn], allow_neg: bool) -> None:
    usage_map: dict[str, float] = {}
    for it in items:
        rm = await _resolve_inventory_item(it)
        if not rm:
            if not allow_neg:
                raise HTTPException(422, f"Insufficient stock: Item (Line {it.line_no}) not found in inventory.")
            continue
        rm_id = rm["id"]
        it.raw_material_id = rm_id
        cur_qty = float(rm.get("quantity", 0) or 0)
        usage_map[rm_id] = usage_map.get(rm_id, 0.0) + float(it.quantity)
        if cur_qty - usage_map[rm_id] < -0.001 and not allow_neg:
            name = rm.get("converted_name") or rm.get("piece_no") or f"Line {it.line_no}"
            raise HTTPException(
                422,
                f"Insufficient stock for {name}. Available: {round(cur_qty, 3)}, Requested: {round(usage_map[rm_id], 3)}"
            )


class SaleItemIn(BaseModel):
    line_no: int
    raw_material_id: Optional[str] = None
    product_id: Optional[str] = None
    design_id: Optional[str] = None
    piece_no: Optional[str] = None
    design_no: Optional[str] = None
    quantity: float
    unit_id: str
    rate: float
    custom_fields: dict = {}


class SaleIn(BaseModel):
    sale_date: str
    seller_party_id: Optional[str] = None  # salesperson
    customer_party_id: Optional[str] = None
    bill_type_id: str
    bill_no: Optional[str] = None
    bill_date: Optional[str] = None
    # split_amounts fields (populated only when bill_type says so)
    payable_amount: Optional[float] = None
    taxable_amount: Optional[float] = None
    tax_percent: Optional[float] = None
    tax_amount: Optional[float] = None
    rebate_percent: Optional[float] = None
    rebate_amount: Optional[float] = None
    notes: Optional[str] = None
    custom_fields: dict = {}
    items: list[SaleItemIn]


def _resolve_base(base_key: str, payable, taxable, gross) -> float:
    b = (base_key or "TAXABLE").upper()
    if b == "PAYABLE":
        return float(payable or 0)
    if b == "GROSS":
        return float(gross or 0)
    return float(taxable or 0)


def _eval_profit(formula: str, vars_: dict) -> float:
    """Safe arithmetic eval using whitelisted variable names."""
    allowed = {"payable", "taxable", "gross", "tax_amount", "rebate_amount",
               "tax_percent", "rebate_percent"}
    # very simple: only allow identifiers from allowed + numbers + operators
    import re
    tokens = re.findall(r"[A-Za-z_][A-Za-z0-9_]*", formula)
    for t in tokens:
        if t not in allowed:
            return 0.0
    safe_globals = {"__builtins__": {}}
    try:
        return float(eval(formula, safe_globals, vars_))
    except Exception:
        return 0.0


async def compute_sale_amounts(bill_type_id: str, items: list, provided: dict) -> dict:
    gross = round(sum(i["quantity"] * i["rate"] for i in items), 4)
    bt = await db.lookup_value.find_one({"id": bill_type_id})
    if not bt:
        raise HTTPException(422, "Invalid bill_type_id")
    split = (bt.get("attributes") or {}).get("split_amounts", False)
    result = {"gross_amount": round(gross, 2), "bill_type_split": bool(split)}
    if not split:
        result.update({
            "payable_amount": None, "taxable_amount": None,
            "tax_percent": None, "tax_amount": None,
            "rebate_percent": None, "rebate_amount": None,
            "profit_amount": None,
        })
        return result
    taxable = provided.get("taxable_amount")
    if taxable is None:
        taxable = gross
    payable = provided.get("payable_amount")
    if payable is None:
        raise HTTPException(422, "payable_amount required for split bill types")
    tax_percent = provided.get("tax_percent") or 0
    rebate_percent = provided.get("rebate_percent") or 0

    tax_base_key = await get_setting("sales.tax_base", "TAXABLE")
    rebate_base_key = await get_setting("sales.rebate_base", "TAXABLE")
    tax_base = _resolve_base(tax_base_key, payable, taxable, gross)
    rebate_base = _resolve_base(rebate_base_key, payable, taxable, gross)

    tax_amount = provided.get("tax_amount")
    if tax_amount is None:
        tax_amount = round(tax_base * float(tax_percent) / 100.0, 2)
    rebate_amount = provided.get("rebate_amount")
    if rebate_amount is None:
        rebate_amount = round(rebate_base * float(rebate_percent) / 100.0, 2)

    formula = await get_setting("sales.profit_formula", "payable - taxable - tax_amount")
    profit = _eval_profit(formula, {
        "payable": float(payable), "taxable": float(taxable), "gross": float(gross),
        "tax_amount": float(tax_amount), "rebate_amount": float(rebate_amount),
        "tax_percent": float(tax_percent), "rebate_percent": float(rebate_percent),
    })
    result.update({
        "payable_amount": round(float(payable), 2),
        "taxable_amount": round(float(taxable), 2),
        "tax_percent": float(tax_percent),
        "tax_amount": round(float(tax_amount), 2),
        "rebate_percent": float(rebate_percent),
        "rebate_amount": round(float(rebate_amount), 2),
        "profit_amount": round(profit, 2),
    })
    return result


def _strip_admin_fields(s: dict) -> dict:
    for k in ("payable_amount", "taxable_amount", "tax_percent", "tax_amount",
              "rebate_percent", "rebate_amount", "profit_amount"):
        s.pop(k, None)
    return s


async def _attach_sale_names(sale: dict):
    if sale.get("customer_party_id"):
        c = await db.party.find_one({"id": sale["customer_party_id"]}, {"name": 1})
        sale["customer_name"] = c["name"] if c else None
    else:
        sale["customer_name"] = None
    if sale.get("seller_party_id"):
        s = await db.party.find_one({"id": sale["seller_party_id"]}, {"name": 1})
        sale["seller_name"] = s["name"] if s else None
    else:
        sale["seller_name"] = None
    if sale.get("bill_type_id"):
        bt = await db.lookup_value.find_one({"id": sale["bill_type_id"]}, {"label": 1, "attributes": 1, "code": 1})
        sale["bill_type_label"] = bt["label"] if bt else None
        sale["bill_type_split"] = (bt.get("attributes") or {}).get("split_amounts", False) if bt else False
    else:
        sale["bill_type_label"] = None
        sale["bill_type_split"] = False
    
    for it in sale.get("items", []):
        if not it.get("raw_material_id") and it.get("product_id"):
            query = {
                "product_id": it.get("product_id") or "",
                "design_id": it.get("design_id") or "",
                "unit_id": it.get("unit_id") or "",
            }
            if it.get("piece_no"):
                query["piece_no"] = it.get("piece_no")
            rm = await db.raw_material.find_one(query, {"id": 1})
            if rm:
                it["raw_material_id"] = rm["id"]

        if it.get("raw_material_id"):
            rm = await db.raw_material.find_one({"id": it["raw_material_id"]})
            if rm:
                if not it.get("product_id") and rm.get("product_id"):
                    it["product_id"] = rm["product_id"]
                if not it.get("design_id") and rm.get("design_id"):
                    it["design_id"] = rm["design_id"]
                if not it.get("piece_no") and rm.get("piece_no"):
                    it["piece_no"] = rm["piece_no"]
                if not it.get("design_no") and rm.get("design_no"):
                    it["design_no"] = rm["design_no"]
                if rm.get("converted_name"):
                    it["product_name"] = rm["converted_name"]
                it["available_qty"] = rm.get("quantity")

        if it.get("product_id") and not it.get("product_name"):
            p = await db.product.find_one({"id": it["product_id"]}, {"name": 1, "code": 1})
            it["product_name"] = p["name"] if p else None
            it["product_code"] = p["code"] if p else None
        if it.get("design_id"):
            d = await db.design.find_one({"id": it["design_id"]}, {"name": 1, "design_code": 1})
            it["design_code"] = d["design_code"] if d else None
            it["design_name"] = d["name"] if d else None
        if it.get("unit_id"):
            u = await db.lookup_value.find_one({"id": it["unit_id"]}, {"label": 1, "code": 1})
            it["unit_label"] = (u.get("label") if u else None) or (u.get("code") if u else None) or it["unit_id"]


@router.get("/sales")
async def list_sales(billTypeId: Optional[str] = None, customerId: Optional[str] = None,
                     from_: Optional[str] = None, to_: Optional[str] = None,
                     limit: int = 100, user=Depends(get_current_user)):
    q: dict = {}
    if billTypeId:
        q["bill_type_id"] = billTypeId
    if customerId:
        q["customer_party_id"] = customerId
    if from_:
        q.setdefault("sale_date", {})["$gte"] = from_
    if to_:
        q.setdefault("sale_date", {})["$lte"] = to_
    rows = await db.sale.find(q, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for s in rows:
        s["items"] = await db.sale_item.find({"sale_id": s["id"]}, {"_id": 0}).to_list(100)
        await _attach_sale_names(s)
    if user.get("role") != "ADMIN":
        rows = [_strip_admin_fields(s) for s in rows]
    return rows


@router.post("/sales")
async def create_sale(body: SaleIn, user=Depends(get_current_user)):
    if not body.items:
        raise HTTPException(422, "At least one item required")
    bt = await db.lookup_value.find_one({"id": body.bill_type_id})
    if not bt:
        raise HTTPException(422, "Invalid bill_type_id")
    if (bt.get("attributes") or {}).get("admin_only") and user.get("role") != "ADMIN":
        raise HTTPException(403, "This bill type is admin-only")

    allow_neg = await get_setting("inventory.allow_negative_stock", False)
    await _preflight_check_stock(body.items, allow_neg)

    cf = await validate_custom_fields("SALE", body.custom_fields)
    items_data = [i.model_dump() for i in body.items]
    amounts = await compute_sale_amounts(body.bill_type_id, items_data, body.model_dump())

    sid = str(uuid.uuid4())
    sale_no = await next_doc_no("SALE")
    sale_doc = {
        "id": sid, "sale_no": sale_no, "sale_date": body.sale_date,
        "seller_party_id": body.seller_party_id,
        "customer_party_id": body.customer_party_id,
        "bill_type_id": body.bill_type_id,
        "bill_no": body.bill_no, "bill_date": body.bill_date,
        **{k: v for k, v in amounts.items() if k != "bill_type_split"},
        "notes": body.notes, "custom_fields": cf,
        "created_by": user["id"],
        "created_at": iso(now_utc()), "updated_at": iso(now_utc()),
        "row_version": 0,
    }
    await db.sale.insert_one(sale_doc)
    
    try:
        # items + stock consumption
        for it in body.items:
            item_cf = await validate_custom_fields("SALE_ITEM", it.custom_fields)
            item_id = str(uuid.uuid4())
            d = it.model_dump()
            d["custom_fields"] = item_cf
            d["amount"] = round(it.quantity * it.rate, 4)
            d.update({"id": item_id, "sale_id": sid})
            await db.sale_item.insert_one(d)
            
            rm_id = it.raw_material_id
            if not rm_id and it.product_id:
                rm_id = await _get_or_create_rm(
                    it.product_id, it.design_id or "", it.unit_id,
                    piece_no=it.piece_no, design_no=it.design_no
                )
            if rm_id:
                await _post_inventory_txn(
                    raw_material_id=rm_id, txn_type="SALE_OUT",
                    qty_delta=-it.quantity, rate=it.rate, txn_date=body.sale_date,
                    ref_type="SALE_ITEM", ref_id=item_id, user_id=user["id"],
                    note=f"Sale {sale_no}",
                )
    except Exception as e:
        await db.sale_item.delete_many({"sale_id": sid})
        await db.sale.delete_one({"id": sid})
        raise e
            
    sale_doc.pop("_id", None)
    sale_doc["items"] = await db.sale_item.find({"sale_id": sid}, {"_id": 0}).to_list(100)
    await _attach_sale_names(sale_doc)
    if user.get("role") != "ADMIN":
        sale_doc = _strip_admin_fields(sale_doc)
    return sale_doc


@router.get("/sales/{id}")
async def get_sale(id: str, user=Depends(get_current_user)):
    s = await db.sale.find_one({"id": id}, {"_id": 0})
    if not s:
        raise HTTPException(404, "Not found")
    s["items"] = await db.sale_item.find({"sale_id": id}, {"_id": 0}).to_list(200)
    await _attach_sale_names(s)
    if user.get("role") != "ADMIN":
        s = _strip_admin_fields(s)
    return s


@router.put("/sales/{id}")
async def update_sale(id: str, body: SaleIn, user=Depends(get_current_user)):
    s = await db.sale.find_one({"id": id})
    if not s:
        raise HTTPException(404, "Not found")
    bt = await db.lookup_value.find_one({"id": body.bill_type_id})
    if not bt:
        raise HTTPException(422, "Invalid bill_type_id")
    if (bt.get("attributes") or {}).get("admin_only") and user.get("role") != "ADMIN":
        raise HTTPException(403, "Admin-only bill type")
        
    old_items = await db.sale_item.find({"sale_id": id}).to_list(500)
    for oit in old_items:
        rm_id = oit.get("raw_material_id")
        if not rm_id and oit.get("product_id"):
            query = {
                "product_id": oit.get("product_id") or "",
                "design_id": oit.get("design_id") or "",
                "unit_id": oit.get("unit_id") or "",
            }
            if oit.get("piece_no"):
                query["piece_no"] = oit.get("piece_no")
            rm = await db.raw_material.find_one(query)
            if rm:
                rm_id = rm["id"]
        if rm_id:
            await _post_inventory_txn(
                raw_material_id=rm_id, txn_type="RETURN_IN",
                qty_delta=oit["quantity"], rate=oit.get("rate"), txn_date=s["sale_date"],
                ref_type="SALE_ITEM_EDIT_REVERSAL", ref_id=oit["id"], user_id=user["id"],
                note=f"Edit reversal of sale {s['sale_no']}"
            )
            
    await db.sale_item.delete_many({"sale_id": id})
    allow_neg = await get_setting("inventory.allow_negative_stock", False)
    await _preflight_check_stock(body.items, allow_neg)

    cf = await validate_custom_fields("SALE", body.custom_fields)
    items_data = [i.model_dump() for i in body.items]
    amounts = await compute_sale_amounts(body.bill_type_id, items_data, body.model_dump())
    
    await db.sale.update_one({"id": id}, {"$set": {
        "sale_date": body.sale_date, "seller_party_id": body.seller_party_id,
        "customer_party_id": body.customer_party_id, "bill_type_id": body.bill_type_id,
        "bill_no": body.bill_no, "bill_date": body.bill_date,
        **{k: v for k, v in amounts.items() if k != "bill_type_split"},
        "notes": body.notes, "custom_fields": cf, "updated_at": iso(now_utc()),
        "row_version": (s.get("row_version", 0) or 0) + 1,
    }})
    
    try:
        for it in body.items:
            item_cf = await validate_custom_fields("SALE_ITEM", it.custom_fields)
            item_id = str(uuid.uuid4())
            d = it.model_dump()
            d["custom_fields"] = item_cf
            d["amount"] = round(it.quantity * it.rate, 4)
            d.update({"id": item_id, "sale_id": id})
            await db.sale_item.insert_one(d)
            
            rm_id = it.raw_material_id
            if not rm_id and it.product_id:
                rm_id = await _get_or_create_rm(
                    it.product_id, it.design_id or "", it.unit_id,
                    piece_no=it.piece_no, design_no=it.design_no
                )
            if rm_id:
                await _post_inventory_txn(
                    raw_material_id=rm_id, txn_type="SALE_OUT",
                    qty_delta=-it.quantity, rate=it.rate, txn_date=body.sale_date,
                    ref_type="SALE_ITEM", ref_id=item_id, user_id=user["id"],
                    note=f"Sale {s['sale_no']}"
                )
    except Exception as e:
        # Avoid leaving sale without items on unexpected failure
        raise e
            
    result = await db.sale.find_one({"id": id}, {"_id": 0})
    result["items"] = await db.sale_item.find({"sale_id": id}, {"_id": 0}).to_list(100)
    await _attach_sale_names(result)
    if user.get("role") != "ADMIN":
        result = _strip_admin_fields(result)
    return result


@router.delete("/sales/{id}")
async def delete_sale(id: str, user=Depends(require_admin)):
    s = await db.sale.find_one({"id": id})
    if not s:
        raise HTTPException(404, "Not found")
    items = await db.sale_item.find({"sale_id": id}).to_list(500)
    for it in items:
        rm_id = it.get("raw_material_id")
        if not rm_id and it.get("product_id"):
            query = {
                "product_id": it.get("product_id") or "",
                "design_id": it.get("design_id") or "",
                "unit_id": it.get("unit_id") or "",
            }
            if it.get("piece_no"):
                query["piece_no"] = it.get("piece_no")
            rm = await db.raw_material.find_one(query)
            if rm:
                rm_id = rm["id"]
        if rm_id:
            await _post_inventory_txn(
                raw_material_id=rm_id, txn_type="RETURN_IN",
                qty_delta=it["quantity"], rate=it.get("rate"), txn_date=s["sale_date"],
                ref_type="SALE_ITEM_REVERSAL", ref_id=it["id"], user_id=user["id"],
                note=f"Reversal of sale {s['sale_no']}"
            )
    await db.sale_item.delete_many({"sale_id": id})
    await db.sale.delete_one({"id": id})
    return {"ok": True}
