"""Warehouse Management System — FastAPI entrypoint."""
from __future__ import annotations

import logging
import os

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware

from auth import router as auth_router
from catalog import router as catalog_router
from dashboard import router as dashboard_router
from deps import db
from inventory import router as inventory_router
from masterdata import router as masterdata_router
from purchase import router as purchase_router
from sales import router as sales_router
from seed import run_seed

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("wms")

app = FastAPI(title="Warehouse Management System", version="1.0.0")

# CORS
origins = os.environ.get("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(masterdata_router)
app.include_router(catalog_router)
app.include_router(purchase_router)
app.include_router(inventory_router)
app.include_router(sales_router)
app.include_router(dashboard_router)

# Serve uploaded files
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/api/health")
async def health():
    try:
        await db.command("ping")
        return {"status": "ok", "db": "up"}
    except Exception as e:
        return {"status": "degraded", "db": "down", "error": str(e)}


@app.get("/api/")
async def root():
    return {"service": "warehouse", "version": "1.0.0", "ok": True}


@app.on_event("startup")
async def on_startup():
    logger.info("Seeding master data...")
    await run_seed()
    logger.info("Seed complete.")


@app.on_event("shutdown")
async def on_shutdown():
    pass
