"""Purchase orders + goods receipts + inventory ledger."""
from __future__ import annotations

import logging
import os
import uuid
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from catalog import convert_qty
from deps import (
    db, get_current_user, iso, next_doc_no, now_utc, require_admin, validate_custom_fields,
)
from masterdata import get_setting

# ── GRN Validation Logger ──────────────────────────────────────────────────
logger = logging.getLogger("grn.validation")
if not logger.handlers:
    _handler = logging.StreamHandler()
    _handler.setFormatter(logging.Formatter(
        "%(asctime)s [GRN] %(levelname)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    ))
    logger.addHandler(_handler)
    logger.setLevel(logging.DEBUG)


def _log_grn_step(
    step: int,
    product_code: str,
    ordered_qty: float,
    previously_received: float,
    current_receipt_qty: float,
    remaining_after: float,
    *,
    status: str = "",
    rule_failed: str = "",
    extra: str = "",
) -> None:
    """Emit a structured validation log entry for every GRN processing step."""
    total_after = previously_received + current_receipt_qty
    receipt_type = "FINAL" if remaining_after <= 0.001 else "PARTIAL"
    lines = [
        f"STEP {step} ─────────────────────────────────────────",
        f"  Product Code       : {product_code}",
        f"  Ordered Qty        : {ordered_qty}",
        f"  Previously Received: {round(previously_received, 3)}",
        f"  This Receipt Qty   : {round(current_receipt_qty, 3)}",
        f"  Cumulative Total   : {round(total_after, 3)}",
        f"  Remaining After    : {round(remaining_after, 3)}",
        f"  Receipt Type       : {receipt_type}",
    ]
    if status:
        lines.append(f"  PO Status          : {status}")
    if extra:
        lines.append(f"  Note               : {extra}")
    if rule_failed:
        lines.append(f"  *** VALIDATION FAILED *** Rule: {rule_failed}")
        logger.error("\n".join(lines))
    else:
        logger.info("\n".join(lines))

router = APIRouter(prefix="/api/v1", tags=["purchase"])


# ---------------- Purchase orders ----------------


class OrderItemIn(BaseModel):
    line_no: int
    product_id: str
    design_id: Optional[str] = ""
    qty_ordered: float
    unit_id: str
    hsn_code: str = ""
    quality_id: Optional[str] = ""
    rate: float
    piece_no: Optional[str] = None
    custom_fields: dict = {}


class OrderIn(BaseModel):
    provider_id: str
    order_date: str  # ISO date
    expected_date: Optional[str] = None
    notes: Optional[str] = None
    custom_fields: dict = {}
    items: list[OrderItemIn]


async def _order_view(order: dict) -> dict:
    """Attach items + progress."""
    items = await db.purchase_order_item.find(
        {"order_id": order["id"]}, {"_id": 0}
    ).sort("line_no", 1).to_list(200)
    for it in items:
        agg = await db.goods_receipt_item.aggregate([
            {"$match": {"order_item_id": it["id"]}},
            {"$group": {"_id": None, "s": {"$sum": "$qty_in_order_unit"}}},
        ]).to_list(1)
        received = agg[0]["s"] if agg else 0
        it["qty_received"] = round(received, 3)
        it["qty_pending"] = round(it["qty_ordered"] - received, 3)
    order["items"] = items
    total_ord = sum(i["qty_ordered"] for i in items) or 0
    total_rcv = sum(i["qty_received"] for i in items) or 0
    order["totals"] = {
        "qty_ordered": round(total_ord, 3),
        "qty_received": round(total_rcv, 3),
        "value": round(sum(i["qty_ordered"] * i["rate"] for i in items), 2),
        "fill_pct": round((total_rcv / total_ord) * 100, 1) if total_ord else 0,
    }
    return order


@router.get("/purchase-orders")
async def list_orders(status: Optional[str] = None, providerId: Optional[str] = None,
                      q: str = "", limit: int = 100, user=Depends(get_current_user)):
    query: dict = {}
    if status:
        query["status"] = status
    if providerId:
        query["provider_id"] = providerId
    if q:
        query["order_no"] = {"$regex": q, "$options": "i"}
    rows = await db.purchase_order.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for o in rows:
        await _order_view(o)
    return rows


@router.get("/purchase-orders/pending-lines")
async def pending_lines(user=Depends(get_current_user)):
    """All order lines with qty_pending > 0."""
    orders = await db.purchase_order.find(
        {"status": {"$in": ["PENDING", "PARTIALLY_RECEIVED"]}}, {"_id": 0}
    ).to_list(500)
    out = []
    for o in orders:
        items = await db.purchase_order_item.find(
            {"order_id": o["id"]}, {"_id": 0}
        ).to_list(200)
        for it in items:
            agg = await db.goods_receipt_item.aggregate([
                {"$match": {"order_item_id": it["id"]}},
                {"$group": {"_id": None, "s": {"$sum": "$qty_in_order_unit"}}},
            ]).to_list(1)
            received = agg[0]["s"] if agg else 0
            pending = it["qty_ordered"] - received
            if pending > 0.001:
                it["qty_received"] = round(received, 3)
                it["qty_pending"] = round(pending, 3)
                it["order_no"] = o["order_no"]
                it["provider_id"] = o["provider_id"]
                out.append(it)
    return out


@router.post("/purchase-orders")
async def create_order(body: OrderIn, user=Depends(get_current_user)):
    if not body.items:
        raise HTTPException(422, "At least one item required")
    cf = await validate_custom_fields("PURCHASE_ORDER", body.custom_fields)
    order_no = await next_doc_no("PURCHASE_ORDER")
    oid = str(uuid.uuid4())
    order_doc = {
        "id": oid, "order_no": order_no,
        "provider_id": body.provider_id,
        "order_date": body.order_date,
        "expected_date": body.expected_date,
        "status": "PENDING", "is_fully_received": False,
        "fully_received_at": None, "fully_received_by": None,
        "notes": body.notes, "custom_fields": cf,
        "created_by": user["id"],
        "created_at": iso(now_utc()), "updated_at": iso(now_utc()),
        "row_version": 0,
    }
    await db.purchase_order.insert_one(order_doc)
    for it in body.items:
        item_cf = await validate_custom_fields("PURCHASE_ORDER_ITEM", it.custom_fields)
        d = it.model_dump()
        d["custom_fields"] = item_cf
        d.update({"id": str(uuid.uuid4()), "order_id": oid})
        await db.purchase_order_item.insert_one(d)
    order_doc.pop("_id", None)
    return await _order_view(order_doc)


@router.get("/purchase-orders/{id}")
async def get_order(id: str, user=Depends(get_current_user)):
    o = await db.purchase_order.find_one({"id": id}, {"_id": 0})
    if not o:
        raise HTTPException(404, "Not found")
    return await _order_view(o)


@router.put("/purchase-orders/{id}")
async def update_order(id: str, body: OrderIn, user=Depends(get_current_user)):
    o = await db.purchase_order.find_one({"id": id})
    if not o:
        raise HTTPException(404, "Not found")
    if o.get("status") in ("FULLY_RECEIVED", "CANCELLED"):
        raise HTTPException(409, f"Cannot edit {o['status']} order")
    cf = await validate_custom_fields("PURCHASE_ORDER", body.custom_fields)
    await db.purchase_order.update_one({"id": id}, {"$set": {
        "provider_id": body.provider_id,
        "order_date": body.order_date,
        "expected_date": body.expected_date,
        "notes": body.notes, "custom_fields": cf,
        "updated_at": iso(now_utc()),
        "row_version": (o.get("row_version", 0) or 0) + 1,
    }})
    receipts = await db.goods_receipt_item.count_documents({
        "order_item_id": {"$in": [i["id"] for i in await db.purchase_order_item.find(
            {"order_id": id}, {"id": 1}).to_list(200)]}
    })
    if receipts == 0:
        await db.purchase_order_item.delete_many({"order_id": id})
        for it in body.items:
            item_cf = await validate_custom_fields("PURCHASE_ORDER_ITEM", it.custom_fields)
            d = it.model_dump()
            d["custom_fields"] = item_cf
            d.update({"id": str(uuid.uuid4()), "order_id": id})
            await db.purchase_order_item.insert_one(d)
    return await _order_view(await db.purchase_order.find_one({"id": id}, {"_id": 0}))


@router.delete("/purchase-orders/{id}")
async def delete_order(id: str, user=Depends(require_admin)):
    items = await db.purchase_order_item.find({"order_id": id}, {"id": 1}).to_list(500)
    if items:
        count = await db.goods_receipt_item.count_documents({
            "order_item_id": {"$in": [i["id"] for i in items]}
        })
        if count > 0:
            raise HTTPException(409, "Cannot delete order with receipts")
    await db.purchase_order_item.delete_many({"order_id": id})
    r = await db.purchase_order.delete_one({"id": id})
    if r.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}


@router.post("/purchase-orders/{id}/mark-received")
async def mark_received(id: str, user=Depends(get_current_user)):
    r = await db.purchase_order.update_one(
        {"id": id},
        {"$set": {
            "is_fully_received": True, "status": "FULLY_RECEIVED",
            "fully_received_at": iso(now_utc()), "fully_received_by": user["id"],
            "updated_at": iso(now_utc()),
        }},
    )
    if r.matched_count == 0:
        raise HTTPException(404, "Not found")
    return await _order_view(await db.purchase_order.find_one({"id": id}, {"_id": 0}))


# ---------------- Goods receipts ----------------


class ReceiptItemIn(BaseModel):
    order_item_id: str
    qty_received: float
    unit_id: str
    rate: float
    product_id: Optional[str] = None
    design_id: Optional[str] = None
    piece_no: Optional[str] = None
    design_no: Optional[str] = None
    weight: Optional[float] = None
    custom_fields: dict = {}


class ReceiptIn(BaseModel):
    order_id: str
    receive_date: str
    bill_no: Optional[str] = None
    bill_date: Optional[str] = None
    bill_amount: Optional[float] = None
    notes: Optional[str] = None
    custom_fields: dict = {}
    items: list[ReceiptItemIn]
    mark_fully_received: bool = False


async def _post_inventory_txn(*, raw_material_id: str, txn_type: str, qty_delta: float,
                              rate: Optional[float], txn_date: str,
                              ref_type: str, ref_id: str, user_id: str,
                              note: Optional[str] = None):
    """Insert inventory_txn and update raw_material cache (idempotent by ref)."""
    if await db.inventory_txn.find_one({"ref_type": ref_type, "ref_id": ref_id}):
        return
    rm = await db.raw_material.find_one({"id": raw_material_id})
    if not rm:
        raise HTTPException(500, "raw_material missing")
    cur_qty = rm.get("quantity", 0) or 0
    cur_avg = rm.get("avg_rate", 0) or 0
    new_avg = cur_avg
    if qty_delta > 0 and rate is not None:
        total_next = cur_qty + qty_delta
        if total_next != 0:
            new_avg = ((cur_qty * cur_avg) + (qty_delta * rate)) / total_next
    new_qty = cur_qty + qty_delta
    if new_qty < -0.001:
        allow_neg = await get_setting("inventory.allow_negative_stock", False)
        if not allow_neg:
            raise HTTPException(422, "Insufficient stock")
    txn = {
        "id": str(uuid.uuid4()),
        "raw_material_id": raw_material_id,
        "txn_type": txn_type, "qty_delta": qty_delta, "rate": rate,
        "txn_date": txn_date, "ref_type": ref_type, "ref_id": ref_id,
        "note": note, "created_by": user_id, "created_at": iso(now_utc()),
    }
    await db.inventory_txn.insert_one(txn)
    upd: dict[str, Any] = {"quantity": round(new_qty, 3), "avg_rate": round(new_avg, 4)}
    if rate is not None:
        upd["last_rate"] = rate
    if txn_type == "PURCHASE_IN":
        upd["last_purchase_date"] = txn_date
    await db.raw_material.update_one({"id": raw_material_id}, {"$set": upd})


async def _get_or_create_rm(
    product_id: str, design_id: str, unit_id: str,
    piece_no: Optional[str] = None,
    design_no: Optional[str] = None,
    weight: Optional[float] = None,
) -> str:
    """Atomically find-or-create a raw_material record.

    Unique index: (product_id, design_id, unit_id, piece_no).
    Each piece_no = separate inventory row.
    """
    from pymongo import ReturnDocument
    from pymongo.errors import DuplicateKeyError

    now = iso(now_utc())

    filter_q = {
        "product_id": product_id,
        "design_id": design_id,
        "unit_id": unit_id,
        "piece_no": piece_no or None,
    }

    # $set — always applied (update or insert)
    set_fields: dict = {
        "updated_at": now,
        "design_no": design_no or None,
    }
    if weight is not None:
        set_fields["weight"] = weight

    # $setOnInsert — only on new doc creation, must NOT overlap with $set
    on_insert = {
        "id": str(uuid.uuid4()),
        "product_id": product_id, "design_id": design_id, "unit_id": unit_id,
        "piece_no": piece_no or None,
        "quantity": 0, "avg_rate": 0, "last_rate": None, "last_purchase_date": None,
        "reorder_level": None, "custom_fields": {},
        "created_at": now,
    }

    try:
        doc = await db.raw_material.find_one_and_update(
            filter_q,
            {"$set": set_fields, "$setOnInsert": on_insert},
            upsert=True,
            return_document=ReturnDocument.AFTER,
            projection={"_id": 0, "id": 1},
        )
        if doc and doc.get("id"):
            return doc["id"]
        existing = await db.raw_material.find_one(filter_q, {"_id": 0, "id": 1})
        if existing:
            return existing["id"]
        raise HTTPException(500, "raw_material upsert returned no document")
    except DuplicateKeyError:
        logger.warning(f"DuplicateKeyError retry | product={product_id} piece={piece_no}")
        existing = await db.raw_material.find_one(filter_q, {"_id": 0, "id": 1})
        if existing:
            return existing["id"]
        raise HTTPException(500, "raw_material conflict and retry failed")





async def _recompute_order_status(order_id: str):
    """Recompute and persist PO status based on cumulative received quantities.

    Status transitions:
      PENDING            → total_rcv == 0
      PARTIALLY_RECEIVED → 0 < total_rcv < total_ord
      FULLY_RECEIVED     → total_rcv >= total_ord  (auto-detected, no manual flag needed)
    """
    order = await db.purchase_order.find_one({"id": order_id})
    if not order:
        return
    if order.get("status") == "CANCELLED":
        return

    items = await db.purchase_order_item.find({"order_id": order_id}).to_list(500)
    total_ord = sum(i["qty_ordered"] for i in items)
    total_rcv = 0.0
    for it in items:
        agg = await db.goods_receipt_item.aggregate([
            {"$match": {"order_item_id": it["id"]}},
            {"$group": {"_id": None, "s": {"$sum": "$qty_in_order_unit"}}},
        ]).to_list(1)
        total_rcv += agg[0]["s"] if agg else 0

    remaining = total_ord - total_rcv

    # Determine new status
    if order.get("is_fully_received") or total_rcv >= total_ord - 0.001:
        new_status = "FULLY_RECEIVED"
        # Auto-stamp fully_received metadata if not already set
        extra_set: dict = {"status": new_status, "updated_at": iso(now_utc())}
        if not order.get("is_fully_received"):
            extra_set["is_fully_received"] = True
            extra_set["fully_received_at"] = iso(now_utc())
            logger.info(
                f"PO {order_id} auto-marked FULLY_RECEIVED | "
                f"total_ordered={round(total_ord, 3)} total_received={round(total_rcv, 3)}"
            )
        await db.purchase_order.update_one({"id": order_id}, {"$set": extra_set})
        return
    elif total_rcv <= 0.001:
        new_status = "PENDING"
    else:
        new_status = "PARTIALLY_RECEIVED"

    logger.info(
        f"PO {order_id} status → {new_status} | "
        f"ordered={round(total_ord, 3)} received={round(total_rcv, 3)} remaining={round(remaining, 3)}"
    )
    await db.purchase_order.update_one(
        {"id": order_id}, {"$set": {"status": new_status, "updated_at": iso(now_utc())}}
    )


@router.get("/goods-receipts")
async def list_receipts(orderId: Optional[str] = None, limit: int = 100,
                        user=Depends(get_current_user)):
    q: dict = {}
    if orderId:
        q["order_id"] = orderId
    rows = await db.goods_receipt.find(q, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for r in rows:
        items = await db.goods_receipt_item.find(
            {"receipt_id": r["id"]}, {"_id": 0}
        ).to_list(200)
        r["items"] = items
    return rows


@router.post("/goods-receipts")
async def create_receipt(body: ReceiptIn, user=Depends(get_current_user)):
    """Create a Goods Receipt Note (GRN) against a Purchase Order.

    Supports:
    - Partial receipts (multiple GRNs against same PO)
    - Different product codes (SKU overrides) per receipt line
    - Automatic FULLY_RECEIVED detection when cumulative qty = ordered qty
    - Detailed per-step validation logging
    - Exact rule-failure messages on 422 errors
    """
    # ── GUARD: Fetch and validate the PO ─────────────────────────────────
    order = await db.purchase_order.find_one({"id": body.order_id})
    if not order:
        raise HTTPException(404, "Order not found")

    order_no = order.get("order_no", body.order_id)
    logger.info(f"GRN creation started | PO={order_no} | User={user.get('username', user['id'])} | Items={len(body.items)}")

    if order["status"] == "CANCELLED":
        msg = f"Cannot create receipt. Purchase Order {order_no} has been CANCELLED."
        logger.error(f"PO={order_no} | {msg}")
        raise HTTPException(409, msg)

    if order["status"] == "FULLY_RECEIVED" or order.get("is_fully_received"):
        # Compute how much was received for the rejection message
        po_items = await db.purchase_order_item.find({"order_id": body.order_id}).to_list(500)
        total_ord = sum(i["qty_ordered"] for i in po_items)
        total_rcv = 0.0
        for it in po_items:
            agg = await db.goods_receipt_item.aggregate([
                {"$match": {"order_item_id": it["id"]}},
                {"$group": {"_id": None, "s": {"$sum": "$qty_in_order_unit"}}},
            ]).to_list(1)
            total_rcv += agg[0]["s"] if agg else 0
        rule = "received_qty + current_receipt_qty <= ordered_qty"
        msg = (
            f"Cannot create receipt. Purchase Order {order_no} quantity has already been fully received. "
            f"Ordered: {round(total_ord, 3)} | Total Received: {round(total_rcv, 3)} | Remaining: 0. "
            f"Validation rule: {rule}"
        )
        logger.error(
            f"PO={order_no} | REJECTED — fully received | "
            f"ordered={round(total_ord, 3)} received={round(total_rcv, 3)} | Rule: {rule}"
        )
        raise HTTPException(409, msg)

    allow_over = await get_setting("purchase.allow_over_receipt", False)
    cf = await validate_custom_fields("GOODS_RECEIPT", body.custom_fields)
    rid = str(uuid.uuid4())
    receipt_no = await next_doc_no("GOODS_RECEIPT")
    receipt = {
        "id": rid, "receipt_no": receipt_no, "order_id": body.order_id,
        "receive_date": body.receive_date,
        "bill_no": body.bill_no, "bill_date": body.bill_date, "bill_amount": body.bill_amount,
        "notes": body.notes, "custom_fields": cf, "created_by": user["id"],
        "created_at": iso(now_utc()), "updated_at": iso(now_utc()),
    }
    await db.goods_receipt.insert_one(receipt)
    logger.info(f"GRN header created | Receipt={receipt_no} | PO={order_no}")

    # Running total within this batch (handles same order_item_id appearing multiple times)
    batch_qty_by_oi: dict[str, float] = {}

    try:
        for step_idx, it in enumerate(body.items, start=1):

            # ── STEP 1: Verify order item belongs to this PO ─────────────
            oi = await db.purchase_order_item.find_one({"id": it.order_item_id})
            if not oi or oi["order_id"] != body.order_id:
                rule = "order_item_id must belong to the target purchase order"
                msg = (
                    f"Receipt line {step_idx}: order_item_id '{it.order_item_id}' "
                    f"does not belong to PO {order_no}. Rule: {rule}"
                )
                logger.error(f"PO={order_no} | Step {step_idx} | FAILED | {msg}")
                raise HTTPException(422, msg)

            # ── STEP 2: Resolve effective product code ────────────────────
            effective_product_id = oi["product_id"]
            effective_design_id = oi.get("design_id") or None
            product_code = effective_product_id  # default display name

            if it.product_id:
                prod = await db.product.find_one({"id": it.product_id, "is_active": True})
                if not prod:
                    rule = "receipt product_id must reference an active product in the catalog"
                    msg = (
                        f"Receipt line {step_idx}: product_id '{it.product_id}' not found "
                        f"in product catalog or is inactive. Rule: {rule}"
                    )
                    logger.error(f"PO={order_no} | Step {step_idx} | FAILED | {msg}")
                    raise HTTPException(422, msg)
                effective_product_id = it.product_id
                product_code = prod.get("name") or prod.get("code") or it.product_id
                logger.debug(
                    f"PO={order_no} | Step {step_idx} | Product override: "
                    f"{oi['product_id']} → {effective_product_id} ({product_code})"
                )

            if it.design_id and it.design_id.strip():
                effective_design_id = it.design_id

            # ── STEP 3: Aggregate all previous receipts for this order line ─
            recv_unit = (it.unit_id or "").strip() or oi["unit_id"]
            qty_in_order_unit = await convert_qty(
                it.qty_received, recv_unit, oi["unit_id"], oi["product_id"]
            )

            agg = await db.goods_receipt_item.aggregate([
                {"$match": {"order_item_id": it.order_item_id, "receipt_id": {"$ne": rid}}},
                {"$group": {"_id": None, "s": {"$sum": "$qty_in_order_unit"}}},
            ]).to_list(1)
            already_prev = round(agg[0]["s"] if agg else 0, 3)
            already_batch = batch_qty_by_oi.get(it.order_item_id, 0.0)
            cumulative_prev = already_prev + already_batch
            ordered_qty = oi["qty_ordered"]
            pending = ordered_qty - cumulative_prev
            total_after = cumulative_prev + qty_in_order_unit
            remaining_after = ordered_qty - total_after

            # ── STEP 4: Validate — no over-receipt ───────────────────────
            if qty_in_order_unit > pending + 0.001 and not allow_over:
                rule = "previously_received + current_receipt_qty <= ordered_qty"
                excess = round(qty_in_order_unit - pending, 3)
                msg = (
                    f"Cannot create receipt. Over-receipt detected for PO {order_no}, "
                    f"product '{product_code}' (line {oi.get('line_no', step_idx)}). "
                    f"Ordered: {ordered_qty} | Previously Received: {round(cumulative_prev, 3)} | "
                    f"This Receipt: {round(qty_in_order_unit, 3)} | "
                    f"Would exceed ordered qty by {excess}. "
                    f"Validation rule: {rule}"
                )
                _log_grn_step(
                    step_idx, product_code,
                    ordered_qty, cumulative_prev, qty_in_order_unit, remaining_after,
                    rule_failed=rule,
                    extra=f"excess={excess}",
                )
                raise HTTPException(422, msg)

            # ── STEP 5: Log successful validation step ───────────────────
            po_status_after = "FULLY RECEIVED" if remaining_after <= 0.001 else "PARTIALLY RECEIVED"
            _log_grn_step(
                step_idx, product_code,
                ordered_qty, cumulative_prev, qty_in_order_unit, remaining_after,
                status=po_status_after,
            )

            # ── STEP 6: Persist receipt item + inventory transaction ─────
            batch_qty_by_oi[it.order_item_id] = already_batch + qty_in_order_unit
            item_cf = await validate_custom_fields("GOODS_RECEIPT_ITEM", it.custom_fields)
            ri_id = str(uuid.uuid4())
            ri_doc = {
                "id": ri_id, "receipt_id": rid, "order_item_id": it.order_item_id,
                "qty_received": it.qty_received, "unit_id": recv_unit,
                "qty_in_order_unit": round(qty_in_order_unit, 3),
                "rate": it.rate,
                "product_id": effective_product_id,
                "design_id": effective_design_id,
                "piece_no": it.piece_no or None,
                "design_no": it.design_no or None,
                "weight": it.weight,
                "custom_fields": item_cf,
            }
            await db.goods_receipt_item.insert_one(ri_doc)
            logger.debug(
                f"PO={order_no} | Step {step_idx} | GRI saved | "
                f"product={product_code} qty={it.qty_received} unit={recv_unit}"
            )

            rm_id = await _get_or_create_rm(
                effective_product_id, effective_design_id or "", recv_unit,
                piece_no=it.piece_no or None,
                design_no=it.design_no or None,
                weight=it.weight,
            )
            await _post_inventory_txn(
                raw_material_id=rm_id, txn_type="PURCHASE_IN",
                qty_delta=it.qty_received, rate=it.rate, txn_date=body.receive_date,
                ref_type="GOODS_RECEIPT_ITEM", ref_id=ri_id, user_id=user["id"],
                note=f"GRN {receipt_no}",
            )
            logger.info(
                f"PO={order_no} | Step {step_idx} | Inventory updated | "
                f"product={product_code} +{it.qty_received} {recv_unit}"
            )

    except HTTPException:
        # Roll back orphan records before re-raising
        await db.goods_receipt.delete_one({"id": rid})
        await db.goods_receipt_item.delete_many({"receipt_id": rid})
        logger.warning(f"GRN {receipt_no} rolled back due to validation failure | PO={order_no}")
        raise
    except Exception as exc:
        await db.goods_receipt.delete_one({"id": rid})
        await db.goods_receipt_item.delete_many({"receipt_id": rid})
        logger.exception(f"GRN {receipt_no} rolled back due to unexpected error | PO={order_no} | {exc}")
        raise HTTPException(500, f"Receipt creation failed: {exc}") from exc

    if body.mark_fully_received:
        await db.purchase_order.update_one(
            {"id": body.order_id},
            {"$set": {
                "is_fully_received": True, "fully_received_at": iso(now_utc()),
                "fully_received_by": user["id"],
            }},
        )

    await _recompute_order_status(body.order_id)

    # Fetch final status for the completion log
    final_order = await db.purchase_order.find_one({"id": body.order_id}, {"status": 1})
    logger.info(
        f"GRN {receipt_no} posted successfully | PO={order_no} | "
        f"Final PO status: {final_order.get('status', 'UNKNOWN')}"
    )
    return await _receipt_view(rid)



async def _receipt_view(rid: str):
    r = await db.goods_receipt.find_one({"id": rid}, {"_id": 0})
    if not r:
        raise HTTPException(404, "Not found")
    items = await db.goods_receipt_item.find(
        {"receipt_id": rid}, {"_id": 0}
    ).to_list(200)
    r["items"] = items
    unit_totals: dict = {}
    total_pieces = 0
    for it in items:
        uid = it.get("unit_id", "")
        unit_totals[uid] = unit_totals.get(uid, 0) + (it.get("qty_received") or 0)
        if it.get("piece_no"):
            total_pieces += 1
    unit_ids = list(unit_totals.keys())
    unit_docs = {u["id"]: u async for u in db.lookup_value.find({"id": {"$in": unit_ids}})}
    r["totals"] = {
        "qty_by_unit": [
            {"unit_id": uid, "unit_label": unit_docs.get(uid, {}).get("label", uid),
             "total_qty": round(v, 3)}
            for uid, v in unit_totals.items()
        ],
        "total_pieces": total_pieces,
        "total_items": len(items),
    }
    return r


@router.get("/goods-receipts/{id}")
async def get_receipt(id: str, user=Depends(get_current_user)):
    return await _receipt_view(id)


@router.delete("/goods-receipts/{id}")
async def delete_receipt(id: str, user=Depends(require_admin)):
    r = await db.goods_receipt.find_one({"id": id})
    if not r:
        raise HTTPException(404, "Not found")
    items = await db.goods_receipt_item.find({"receipt_id": id}).to_list(500)
    for it in items:
        oi = await db.purchase_order_item.find_one({"id": it["order_item_id"]})
        if not oi:
            continue
        rm = await db.raw_material.find_one({
            "product_id": oi["product_id"], "design_id": oi["design_id"],
            "unit_id": it["unit_id"],
        })
        if rm:
            await _post_inventory_txn(
                raw_material_id=rm["id"], txn_type="ADJUSTMENT",
                qty_delta=-it["qty_received"], rate=it["rate"],
                txn_date=r["receive_date"],
                ref_type="GOODS_RECEIPT_ITEM_REVERSAL", ref_id=it["id"],
                user_id=user["id"], note=f"Reversal of GRN {r['receipt_no']}",
            )
    await db.goods_receipt_item.delete_many({"receipt_id": id})
    await db.goods_receipt.delete_one({"id": id})
    await _recompute_order_status(r["order_id"])
    return {"ok": True}
