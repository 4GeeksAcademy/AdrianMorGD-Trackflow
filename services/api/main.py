"""FastAPI endpoints for TrackFlow incident reporting."""

from __future__ import annotations

import os
from datetime import datetime, timezone

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from tinydb import TinyDB

from adrianmorgd_trackflow.incidents.analyzer import (
    CATEGORIES,
    INVALID_LABELS,
    STATUSES,
    analyze_csv_bytes,
    serialize_summary,
)
from services.api.auth import CurrentUser, create_access_token, verify_password
from services.api.user_service import UserService
from services.api.suppliers import (
    Supplier,
    SupplierCountry,
    SupplierCreate,
    SupplierProductCategory,
    SupplierRateUpdate,
    SupplierStatusUpdate,
)
from services.api.users import (
    ProfileRepository,
    User,
    UserCreate,
    UserLogin,
    UserRepository,
    UserResponse,
    UserRole,
    UserUpdate,
)

app = FastAPI(title="TrackFlow API")

_users_database_path = os.getenv("TRACKFLOW_USERS_DB_PATH", "data/users.json")
_users_database = TinyDB(_users_database_path)
_suppliers_database_path = os.getenv("TRACKFLOW_SUPPLIERS_DB_PATH", "data/suppliers.json")
_suppliers_database = TinyDB(_suppliers_database_path)
_suppliers_table = _suppliers_database.table("suppliers")
user_repository = UserRepository(_users_database)
profile_repository = ProfileRepository(_users_database)
user_service = UserService(user_repository, profile_repository)

_default_cors_origins = "http://localhost:3000,http://127.0.0.1:3000"
_cors_origins = [
    origin.strip()
    for origin in os.getenv("TRACKFLOW_CORS_ORIGINS", _default_cors_origins).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

MAX_UPLOAD_BYTES = 10 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {
    "text/csv",
    "application/vnd.ms-excel",
    "application/octet-stream",
}
_last_analysis: dict[str, object] | None = None


@app.get("/")
async def health_check() -> dict[str, str]:
    """Report that the API process is responding."""
    return {"status": "ok"}


@app.post("/suppliers", response_model=Supplier, status_code=201)
async def create_supplier(supplier_data: SupplierCreate) -> Supplier:
    """Validate, persist, and return a supplier with its TinyDB document ID."""
    document = supplier_data.model_dump(mode="json")
    document_id = _suppliers_table.insert(document)
    return Supplier.model_validate({**document, "id": document_id})


@app.get("/suppliers", response_model=list[Supplier])
async def list_suppliers(
    country: SupplierCountry | None = None,
    product_category: SupplierProductCategory | None = None,
) -> list[Supplier]:
    """List suppliers, optionally filtering by country and product category."""
    suppliers = [
        Supplier.model_validate({**document, "id": document.doc_id})
        for document in _suppliers_table.all()
    ]
    if country is not None:
        suppliers = [supplier for supplier in suppliers if supplier.country == country]
    if product_category is not None:
        suppliers = [
            supplier
            for supplier in suppliers
            if product_category in supplier.product_categories
        ]
    return suppliers


@app.get("/suppliers/{supplier_id}", response_model=Supplier)
async def get_supplier(supplier_id: int) -> Supplier:
    """Return one supplier by TinyDB document ID, or 404 if it does not exist."""
    document = _suppliers_table.get(doc_id=supplier_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Supplier not found.")
    return Supplier.model_validate({**document, "id": document.doc_id})


@app.patch("/suppliers/{supplier_id}/rate", response_model=Supplier)
async def update_supplier_rate(
    supplier_id: int, rate_update: SupplierRateUpdate
) -> Supplier:
    """Update a supplier's positive rate and record the update timestamp."""
    document = _suppliers_table.get(doc_id=supplier_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Supplier not found.")

    updated_document = dict(document)
    updated_document["rate"] = rate_update.rate
    updated_document["updated_at"] = datetime.now(timezone.utc)
    updated_supplier = Supplier.model_validate(
        {**updated_document, "id": supplier_id}
    )
    _suppliers_table.update(
        updated_supplier.model_dump(mode="json", exclude={"id"}),
        doc_ids=[supplier_id],
    )
    return updated_supplier


@app.patch("/suppliers/{supplier_id}", response_model=Supplier)
async def update_supplier_status(
    supplier_id: int, status_update: SupplierStatusUpdate
) -> Supplier:
    """Activate or suspend a supplier using a supported enum status."""
    document = _suppliers_table.get(doc_id=supplier_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Supplier not found.")

    updated_document = dict(document)
    updated_document["status"] = status_update.status
    updated_document["updated_at"] = datetime.now(timezone.utc)
    updated_supplier = Supplier.model_validate(
        {**updated_document, "id": supplier_id}
    )
    _suppliers_table.update(
        updated_supplier.model_dump(mode="json", exclude={"id"}),
        doc_ids=[supplier_id],
    )
    return updated_supplier


@app.delete("/suppliers/{supplier_id}", status_code=204)
async def delete_supplier(supplier_id: int) -> None:
    """Remove a supplier from the directory, or return 404 if absent."""
    if _suppliers_table.get(doc_id=supplier_id) is None:
        raise HTTPException(status_code=404, detail="Supplier not found.")
    _suppliers_table.remove(doc_ids=[supplier_id])


@app.post("/auth/token")
async def issue_access_token(credentials: UserLogin) -> dict[str, str]:
    """Authenticate credentials and issue a bearer token."""
    user = user_service.get_user_by_email(credentials.email)
    if (
        user is None
        or not user.is_active
        or not verify_password(credentials.password, user.hashed_password)
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"access_token": create_access_token(user), "token_type": "bearer"}


@app.post("/users", response_model=UserResponse, status_code=201)
async def create_user(user_data: UserCreate) -> UserResponse:
    """Register a user and optional profile; new registrations always use user role."""
    try:
        return user_service.create_user(user_data)
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error


@app.get("/users", response_model=list[UserResponse])
async def list_users(current_user: CurrentUser) -> list[UserResponse]:
    """List users; administrator access only."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Administrator role required.")
    return user_service.list_users()


@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, current_user: CurrentUser) -> UserResponse:
    """Get a user by ID; only the user or an administrator may access it."""
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to access this user.")
    user = user_service.get_user_response_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


@app.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user: CurrentUser,
) -> UserResponse:
    """Update credentials; role changes are restricted to administrators."""
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to update this user.")
    if user_data.role is not None and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only administrators may change roles.")
    try:
        user = user_service.update_user(user_id, user_data)
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


@app.delete("/users/{user_id}", status_code=204)
async def delete_user(user_id: str, current_user: CurrentUser) -> None:
    """Delete a user and linked profile; only self or administrator may do so."""
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to delete this user.")
    if not user_service.delete_user(user_id):
        raise HTTPException(status_code=404, detail="User not found.")


def _build_api_report(summary: dict[str, object]) -> dict[str, object]:
    """Translate the shared analyzer summary into the endpoint response schema."""
    issue_counts = summary["issue_counts"]
    categories = summary["categories"]
    statuses = summary["statuses"]
    countries = summary["countries"]
    scores = summary["scored_closed"]

    valid_count = int(summary["valid"])
    return {
        "total_records": int(summary["total"]),
        "valid_records": valid_count,
        "invalid_records": int(summary["invalid"]),
        "invalid_breakdown": {
            rule: {"description": INVALID_LABELS[rule], "count": issue_counts.get(rule, 0)}
            for rule in INVALID_LABELS
            if issue_counts.get(rule, 0)
        },
        "category_breakdown": {
            category: {
                "count": categories.get(category, 0),
                "percentage": round(categories.get(category, 0) / valid_count * 100, 1)
                if valid_count
                else 0.0,
            }
            for category in CATEGORIES
        },
        "status_breakdown": {
            status: {
                "count": statuses.get(status, 0),
                "percentage": round(statuses.get(status, 0) / valid_count * 100, 1)
                if valid_count
                else 0.0,
            }
            for status in STATUSES
        },
        "country_breakdown": {
            country: {
                "count": countries.get(country, 0),
                "percentage": round(countries.get(country, 0) / valid_count * 100, 1)
                if valid_count
                else 0.0,
            }
            for country in ("US", "ES")
        },
        "satisfaction": {
            "scored_closed_incidents": len(scores),
            "closed_incidents": statuses.get("CLOSED", 0),
            "average_score": round(sum(scores) / len(scores), 2) if scores else None,
            "score_breakdown": {str(score): scores.count(score) for score in range(1, 6)},
        },
    }


@app.post("/api/incidents/analyze")
async def analyze_incidents(file: UploadFile = File(...)) -> dict[str, object]:
    """Analyze an uploaded CSV; personally identifiable data is never returned."""
    global _last_analysis

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=415, detail="Upload a CSV file using multipart/form-data.")

    content = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="CSV exceeds the 10 mebibyte upload limit.")

    try:
        summary = analyze_csv_bytes(content)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from None
    _last_analysis = summary
    return _build_api_report(summary)


@app.get("/api/incidents/results/export")
async def export_last_analysis() -> Response:
    """Download aggregate metrics from the most recent analysis as CSV."""
    if _last_analysis is None:
        raise HTTPException(
            status_code=404,
            detail="No analysis is available. Upload a CSV to /api/incidents/analyze first.",
        )

    csv_content = serialize_summary(_last_analysis)
    return Response(
        content=csv_content,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="incident-analysis.csv"'},
    )
