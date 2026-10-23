"""Seed initial master data on startup (idempotent)."""
from __future__ import annotations

import uuid
from deps import db, hash_password, now_utc, iso


async def _ensure_lookup_type(code: str, name: str, is_system: bool, attribute_schema: list) -> str:
    existing = await db.lookup_type.find_one({"code": code})
    if existing:
        return existing["id"]
    doc = {
        "id": str(uuid.uuid4()),
        "code": code,
        "name": name,
        "is_system": is_system,
        "attribute_schema": attribute_schema,
        "sort_order": 0,
        "is_active": True,
        "created_at": iso(now_utc()),
        "updated_at": iso(now_utc()),
    }
    await db.lookup_type.insert_one(doc)
    return doc["id"]


async def _ensure_lookup_value(type_id: str, code: str, label: str, sort: int, attrs: dict):
    existing = await db.lookup_value.find_one({"type_id": type_id, "code": code})
    if existing:
        return existing["id"]
    doc = {
        "id": str(uuid.uuid4()),
        "type_id": type_id,
        "code": code,
        "label": label,
        "attributes": attrs,
        "sort_order": sort,
        "is_active": True,
        "created_at": iso(now_utc()),
        "updated_at": iso(now_utc()),
    }
    await db.lookup_value.insert_one(doc)
    return doc["id"]


async def _ensure_sequence(entity: str, prefix: str, pad: int, reset: str):
    existing = await db.doc_sequence.find_one({"entity": entity})
    if existing:
        return
    await db.doc_sequence.insert_one({
        "entity": entity, "prefix": prefix, "next_value": 1,
        "pad_width": pad, "reset_period": reset, "period_key": None,
    })


async def _ensure_setting(key: str, value, data_type: str, label: str, category: str):
    existing = await db.app_setting.find_one({"key": key})
    if existing:
        return
    await db.app_setting.insert_one({
        "key": key, "value": value, "data_type": data_type,
        "label": label, "category": category, "is_editable": True,
        "updated_at": iso(now_utc()),
    })


async def _ensure_admin_user():
    existing = await db.app_user.find_one({"username": "admin"})
    if existing:
        return
    now = iso(now_utc())
    await db.app_user.insert_one({
        "id": str(uuid.uuid4()),
        "username": "admin",
        "password_hash": hash_password("admin123"),
        "full_name": "Warehouse Admin",
        "phone": None,
        "role": "ADMIN",
        "is_active": True,
        "last_login_at": None,
        "created_at": now,
        "updated_at": now,
    })
    # Seed a staff user too
    await db.app_user.insert_one({
        "id": str(uuid.uuid4()),
        "username": "staff",
        "password_hash": hash_password("staff123"),
        "full_name": "Warehouse Staff",
        "phone": None,
        "role": "STAFF",
        "is_active": True,
        "last_login_at": None,
        "created_at": now,
        "updated_at": now,
    })


async def _ensure_indexes():
    await db.app_user.create_index("username", unique=True)
    await db.app_user.create_index("id", unique=True)
    await db.lookup_type.create_index("code", unique=True)
    await db.lookup_type.create_index("id", unique=True)
    await db.lookup_value.create_index([("type_id", 1), ("code", 1)], unique=True)
    await db.lookup_value.create_index("id", unique=True)
    await db.custom_field_def.create_index([("entity_type", 1), ("field_key", 1)], unique=True)
    await db.custom_field_def.create_index("id", unique=True)
    await db.party.create_index("id", unique=True)
    await db.product.create_index("id", unique=True)
    await db.product.create_index("code", unique=True)
    await db.design.create_index("id", unique=True)
    await db.design.create_index("design_code", unique=True)
    await db.purchase_order.create_index("id", unique=True)
    await db.purchase_order.create_index("order_no", unique=True)
    await db.purchase_order_item.create_index("id", unique=True)
    await db.goods_receipt.create_index("id", unique=True)
    await db.goods_receipt.create_index("receipt_no", unique=True)
    await db.goods_receipt_item.create_index("id", unique=True)
    # Migrate raw_material index: drop old 3-field, create new 4-field with piece_no
    try:
        await db.raw_material.drop_index("product_id_1_design_id_1_unit_id_1")
    except Exception:
        pass  # index may not exist yet
    await db.raw_material.create_index(
        [("product_id", 1), ("design_id", 1), ("unit_id", 1), ("piece_no", 1)],
        unique=True,
    )
    await db.raw_material.create_index("id", unique=True)
    await db.inventory_txn.create_index("id", unique=True)
    await db.inventory_txn.create_index([("ref_type", 1), ("ref_id", 1)])
    await db.sale.create_index("id", unique=True)
    await db.sale.create_index("sale_no", unique=True)
    await db.sale_item.create_index("id", unique=True)
    await db.doc_sequence.create_index("entity", unique=True)
    await db.app_setting.create_index("key", unique=True)


async def run_seed():
    await _ensure_indexes()
    # Sequences
    await _ensure_sequence("PURCHASE_ORDER", "PO-", 5, "FISCAL_YEAR")
    await _ensure_sequence("GOODS_RECEIPT", "GRN-", 5, "FISCAL_YEAR")
    await _ensure_sequence("SALE", "SL-", 5, "FISCAL_YEAR")
    await _ensure_sequence("DESIGN", "DSG-", 5, "NEVER")
    await _ensure_sequence("PRODUCT", "PRD-", 5, "NEVER")

    # Lookup types + values
    unit_id = await _ensure_lookup_type("UNIT", "Units", True,
        [{"key": "decimals", "type": "INTEGER"}, {"key": "base_unit", "type": "TEXT"}])
    await _ensure_lookup_type("QUALITY", "Quality grades", True, [])
    bill_id = await _ensure_lookup_type("BILL_TYPE", "Bill types", True,
        [{"key": "split_amounts", "type": "BOOLEAN"}, {"key": "admin_only", "type": "BOOLEAN"}])
    await _ensure_lookup_type("PRODUCT_CATEGORY", "Product categories", False, [])
    await _ensure_lookup_type("COLOUR", "Colours", False, [{"key": "hex", "type": "TEXT"}])
    await _ensure_lookup_type("PAYMENT_MODE", "Payment modes", False, [])

    await _ensure_lookup_value(unit_id, "MTR", "Meter", 1, {"decimals": 3})
    await _ensure_lookup_value(unit_id, "PCS", "Pieces", 2, {"decimals": 0})
    await _ensure_lookup_value(unit_id, "KG", "Kilogram", 3, {"decimals": 3})
    await _ensure_lookup_value(unit_id, "THAAN", "Thaan", 4, {"decimals": 2})

    await _ensure_lookup_value(bill_id, "PAKKA", "Pakka", 1,
        {"split_amounts": False, "admin_only": False})
    await _ensure_lookup_value(bill_id, "KACCHA", "Kaccha", 2,
        {"split_amounts": True, "admin_only": True})

    # Quality grades
    quality_type = await db.lookup_type.find_one({"code": "QUALITY"})
    if quality_type:
        await _ensure_lookup_value(quality_type["id"], "A", "Grade A", 1, {})
        await _ensure_lookup_value(quality_type["id"], "B", "Grade B", 2, {})

    # Colours
    col = await db.lookup_type.find_one({"code": "COLOUR"})
    if col:
        await _ensure_lookup_value(col["id"], "RED", "Red", 1, {"hex": "#DC2626"})
        await _ensure_lookup_value(col["id"], "BLUE", "Blue", 2, {"hex": "#2563EB"})
        await _ensure_lookup_value(col["id"], "WHITE", "White", 3, {"hex": "#F5F5F5"})

    # Settings
    await _ensure_setting("sales.rebate_base", "TAXABLE", "ENUM", "Rebate calculated on", "Sales")
    await _ensure_setting("sales.tax_base", "TAXABLE", "ENUM", "Tax calculated on", "Sales")
    await _ensure_setting("sales.profit_formula", "payable - taxable - tax_amount",
        "FORMULA", "Profit formula", "Sales")
    await _ensure_setting("inventory.allow_negative_stock", False, "BOOLEAN",
        "Allow negative stock", "Inventory")
    await _ensure_setting("inventory.costing_method", "WEIGHTED_AVG", "ENUM",
        "Costing method", "Inventory")
    await _ensure_setting("purchase.allow_over_receipt", False, "BOOLEAN",
        "Allow over-receipt", "Purchase")
    await _ensure_setting("company.name", "My Warehouse", "STRING", "Company name", "General")
    await _ensure_setting("company.fiscal_year_start_month", 4, "INTEGER",
        "Fiscal year start month", "General")

    await _ensure_admin_user()
