"""Dashboard aggregates."""
from __future__ import annotations

from fastapi import APIRouter, Depends

from deps import db, get_current_user, now_utc

router = APIRouter(prefix="/api/v1", tags=["dashboard"])


@router.get("/dashboard")
async def dashboard(user=Depends(get_current_user)):
    now = now_utc()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).date().isoformat()

    pending_orders = await db.purchase_order.count_documents(
        {"status": {"$in": ["PENDING", "PARTIALLY_RECEIVED"]}}
    )
    # value of pending
    pending_value = 0.0
    pend_orders = await db.purchase_order.find(
        {"status": {"$in": ["PENDING", "PARTIALLY_RECEIVED"]}}, {"id": 1}
    ).to_list(500)
    for o in pend_orders:
        items = await db.purchase_order_item.find({"order_id": o["id"]}).to_list(200)
        for it in items:
            agg = await db.goods_receipt_item.aggregate([
                {"$match": {"order_item_id": it["id"]}},
                {"$group": {"_id": None, "s": {"$sum": "$qty_in_order_unit"}}},
            ]).to_list(1)
            received = agg[0]["s"] if agg else 0
            pending_qty = it["qty_ordered"] - received
            if pending_qty > 0:
                pending_value += pending_qty * it["rate"]

    receipts_this_month = await db.goods_receipt.count_documents({
        "receive_date": {"$gte": month_start}
    })
    sales_agg = await db.sale.aggregate([
        {"$match": {"sale_date": {"$gte": month_start}}},
        {"$group": {"_id": None, "gross": {"$sum": "$gross_amount"},
                    "profit": {"$sum": "$profit_amount"}, "count": {"$sum": 1}}},
    ]).to_list(1)
    sales_month = sales_agg[0] if sales_agg else {"gross": 0, "profit": 0, "count": 0}

    # low stock
    low_stock = 0
    async for rm in db.raw_material.find({"reorder_level": {"$ne": None}}):
        if rm.get("reorder_level") is not None and rm["quantity"] <= rm["reorder_level"]:
            low_stock += 1

    inventory_count = await db.raw_material.count_documents({})

    # recent activity: last 10 orders, receipts, sales
    recent = []
    async for o in db.purchase_order.find({}, {"_id": 0}).sort("created_at", -1).limit(5):
        recent.append({"type": "order", "id": o["id"], "label": o["order_no"],
                       "at": o["created_at"], "status": o["status"]})
    async for r in db.goods_receipt.find({}, {"_id": 0}).sort("created_at", -1).limit(5):
        recent.append({"type": "receipt", "id": r["id"], "label": r["receipt_no"],
                       "at": r["created_at"]})
    async for s in db.sale.find({}, {"_id": 0}).sort("created_at", -1).limit(5):
        recent.append({"type": "sale", "id": s["id"], "label": s["sale_no"],
                       "at": s["created_at"]})
    recent.sort(key=lambda x: x.get("at") or "", reverse=True)

    out = {
        "pending_orders": pending_orders,
        "pending_value": round(pending_value, 2),
        "receipts_this_month": receipts_this_month,
        "low_stock_count": low_stock,
        "inventory_count": inventory_count,
        "sales_this_month": {
            "gross": round(sales_month.get("gross") or 0, 2),
            "count": sales_month.get("count") or 0,
        },
        "recent": recent[:12],
    }
    if user.get("role") == "ADMIN":
        out["sales_this_month"]["profit"] = round(sales_month.get("profit") or 0, 2)
    return out
