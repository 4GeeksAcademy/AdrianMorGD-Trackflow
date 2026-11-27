"""FastAPI application factory and dependency composition for TrackFlow."""

from __future__ import annotations

import os
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from tinydb import TinyDB

from services.api.incident_router import router as incident_router
from services.api.incident_service import IncidentService
from services.api.supplier_router import router as supplier_router
from services.api.supplier_service import SupplierService
from services.api.supplier_tinydb import TinyDBSupplierRepository
from services.api.user_router import router as user_router
from services.api.user_service import UserService
from services.api.user_tinydb import TinyDBProfileRepository, TinyDBUserRepository
from services.api.users import User, UserRole
from services.api.v1_router import router as v1_router


def _validation_error_response(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Return validation details without echoing submitted values."""
    safe_errors = [
        {key: value for key, value in error.items() if key not in {"input", "ctx"}}
        for error in exc.errors()
    ]
    return JSONResponse(status_code=422, content={"detail": safe_errors})


def create_app(
    *,
    users_database_path: str | Path | None = None,
    suppliers_database_path: str | Path | None = None,
    cors_origins: list[str] | None = None,
    user_service: UserService | None = None,
    supplier_service: SupplierService | None = None,
    incident_service: IncidentService | None = None,
) -> FastAPI:
    """Compose an API instance, allowing isolated storage and services in tests."""
    app = FastAPI(title="TrackFlow API")
    app.add_exception_handler(RequestValidationError, _validation_error_response)

    configured_users_path = users_database_path or os.getenv(
        "TRACKFLOW_USERS_DB_PATH", "data/users.json"
    )
    configured_suppliers_path = suppliers_database_path or os.getenv(
        "TRACKFLOW_SUPPLIERS_DB_PATH", "data/suppliers.json"
    )
    users_database = TinyDB(str(configured_users_path))
    suppliers_database = TinyDB(str(configured_suppliers_path))

    app.state.users_database = users_database
    app.state.suppliers_database = suppliers_database
    app.state.user_repository = TinyDBUserRepository(users_database)
    app.state.profile_repository = TinyDBProfileRepository(users_database)
    app.state.user_service = user_service or UserService(
        app.state.user_repository, app.state.profile_repository
    )
    app.state.supplier_service = supplier_service or SupplierService(
        TinyDBSupplierRepository(suppliers_database.table("suppliers"))
    )
    app.state.incident_service = incident_service or IncidentService()

    configured_origins = cors_origins
    if configured_origins is None:
        default_origins = "http://localhost:3000,http://127.0.0.1:3000"
        configured_origins = [
            origin.strip()
            for origin in os.getenv("TRACKFLOW_CORS_ORIGINS", default_origins).split(",")
            if origin.strip()
        ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=configured_origins,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )

    @app.get("/")
    async def health_check() -> dict[str, str]:
        """Report that the API process is responding."""
        return {"status": "ok"}

    # Versioned routes are the preferred contract; unprefixed mounts preserve clients.
    app.include_router(v1_router)
    app.include_router(supplier_router)
    app.include_router(user_router)
    app.include_router(incident_router, prefix="/api")

    return app


app = create_app()

# Compatibility aliases for internal consumers; new code should use app.state.
_users_database = app.state.users_database
user_repository = app.state.user_repository
profile_repository = app.state.profile_repository
user_service = app.state.user_service
