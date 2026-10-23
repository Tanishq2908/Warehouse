"""
Clear all transactional data from the database (orders, receipts, inventory, sales)
BUT preserve master data: users, lookup types/values, settings, sequences.

Run this script when you want a fresh start without losing your configuration.
"""
import asyncio
import os
import uuid
import bcrypt
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# Support both docker hostname and localhost
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017").replace("mongo:", "localhost:")
DB_NAME = os.environ.get("DB_NAME", "warehouse")

# Collections to wipe (transactional data only)
TRANSACTIONAL = [
    "purchase_order",
    "purchase_order_item",
    "goods_receipt",
    "goods_receipt_item",
    "raw_material",
    "inventory_txn",
    "sale",
    "sale_item",
    "conversion_log",
    "refresh_token",
]

# Collections to KEEP (master / config data)
KEEP = [
    "app_user",        # ← users must survive so login still works
    "lookup_type",
    "lookup_value",
    "app_setting",
    "doc_sequence",
    "custom_field_def",
    "product",
    "design",
    "party",
]


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


async def ensure_admin(db):
    """Guarantee admin user exists after clearing."""
    existing = await db.app_user.find_one({"username": "admin"})
    if existing:
        print("  admin user already exists ✓")
        return
    now = now_iso()
    await db.app_user.insert_one({
        "id": str(uuid.uuid4()),
        "username": "admin",
        "password_hash": hash_pw("admin123"),
        "full_name": "Warehouse Admin",
        "phone": None,
        "role": "ADMIN",
        "is_active": True,
        "last_login_at": None,
        "created_at": now,
        "updated_at": now,
    })
    await db.app_user.insert_one({
        "id": str(uuid.uuid4()),
        "username": "staff",
        "password_hash": hash_pw("staff123"),
        "full_name": "Warehouse Staff",
        "phone": None,
        "role": "STAFF",
        "is_active": True,
        "last_login_at": None,
        "created_at": now,
        "updated_at": now,
    })
    print("  Created admin + staff users ✓")


async def main():
    print(f"\nConnecting to {MONGO_URL}/{DB_NAME} ...\n")
    client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
    db = client[DB_NAME]

    # Ping to confirm connection
    await db.command("ping")
    print("Connected ✓\n")

    print("=== Clearing TRANSACTIONAL collections ===")
    for coll in TRANSACTIONAL:
        result = await db[coll].delete_many({})
        if result.deleted_count:
            print(f"  Cleared {result.deleted_count:4d} docs from  {coll}")
        else:
            print(f"  (empty)              {coll}")

    print("\n=== Keeping MASTER data ===")
    for coll in KEEP:
        count = await db[coll].count_documents({})
        print(f"  Kept {count:4d} docs in  {coll}")

    print("\n=== Ensuring admin user ===")
    await ensure_admin(db)

    print("\n✅ Done! You can now log in with:")
    print("   admin  / admin123   (Admin role)")
    print("   staff  / staff123   (Staff role)\n")


if __name__ == "__main__":
    asyncio.run(main())
