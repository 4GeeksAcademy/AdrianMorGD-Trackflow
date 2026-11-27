"""HTTP routes for supplier operations."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response

from services.api.auth import CurrentUser
from services.api.supplier_service import SupplierNotFoundError, SupplierService
from services.api.suppliers import (
    Supplier,
    SupplierCountry,
    SupplierCreate,
    SupplierProductCategory,
    SupplierRateUpdate,
    SupplierStatusUpdate,
)

router = APIRouter()


def get_supplier_service(request: Request) -> SupplierService:
    """Resolve the supplier use cases from the composed FastAPI application."""
    return request.app.state.supplier_service


SupplierServiceDependency = Annotated[SupplierService, Depends(get_supplier_service)]


@router.post("/suppliers", response_model=Supplier, status_code=201)
async def create_supplier(
    supplier_data: SupplierCreate,
    current_user: CurrentUser,
    supplier_service: SupplierServiceDependency,
) -> Supplier:
    """Register a supplier."""
    return supplier_service.create(supplier_data)


@router.get("/suppliers", response_model=list[Supplier])
async def list_suppliers(
    current_user: CurrentUser,
    supplier_service: SupplierServiceDependency,
    country: SupplierCountry | None = None,
    product_category: SupplierProductCategory | None = None,
) -> list[Supplier]:
    """List suppliers, optionally filtering by country and product category."""
    return supplier_service.list(country, product_category)


@router.get("/suppliers/{supplier_id}", response_model=Supplier)
async def get_supplier(
    supplier_id: int,
    current_user: CurrentUser,
    supplier_service: SupplierServiceDependency,
) -> Supplier:
    """Return one supplier by ID."""
    try:
        return supplier_service.get(supplier_id)
    except SupplierNotFoundError as error:
        raise HTTPException(status_code=404, detail="Supplier not found.") from error


@router.patch("/suppliers/{supplier_id}/rate", response_model=Supplier)
async def update_supplier_rate(
    supplier_id: int,
    rate_update: SupplierRateUpdate,
    current_user: CurrentUser,
    supplier_service: SupplierServiceDependency,
) -> Supplier:
    """Update a supplier's rate."""
    try:
        return supplier_service.update_rate(supplier_id, rate_update.rate)
    except SupplierNotFoundError as error:
        raise HTTPException(status_code=404, detail="Supplier not found.") from error


@router.patch("/suppliers/{supplier_id}", response_model=Supplier)
async def update_supplier_status(
    supplier_id: int,
    status_update: SupplierStatusUpdate,
    current_user: CurrentUser,
    supplier_service: SupplierServiceDependency,
) -> Supplier:
    """Activate or suspend a supplier."""
    try:
        return supplier_service.update_status(supplier_id, status_update.status)
    except SupplierNotFoundError as error:
        raise HTTPException(status_code=404, detail="Supplier not found.") from error


@router.delete("/suppliers/{supplier_id}", status_code=204)
async def delete_supplier(
    supplier_id: int,
    current_user: CurrentUser,
    supplier_service: SupplierServiceDependency,
) -> Response:
    """Remove a supplier."""
    try:
        supplier_service.delete(supplier_id)
    except SupplierNotFoundError as error:
        raise HTTPException(status_code=404, detail="Supplier not found.") from error
    return Response(status_code=204)