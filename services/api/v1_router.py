"""Versioned public API router."""

from fastapi import APIRouter

from services.api.incident_router import router as incident_router
from services.api.supplier_router import router as supplier_router
from services.api.user_router import router as user_router

router = APIRouter(prefix="/api/v1")
router.include_router(supplier_router)
router.include_router(user_router)
router.include_router(incident_router)