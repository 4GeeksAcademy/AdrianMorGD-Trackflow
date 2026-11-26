"""Password verification and bearer-token authentication helpers."""

from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Annotated, Any

import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from pwdlib import PasswordHash

from services.api.users import User

load_dotenv()

JWT_SECRET = os.getenv("TRACKFLOW_JWT_SECRET")
JWT_ALGORITHM = "HS256"
try:
    ACCESS_TOKEN_EXPIRES_MINUTES = int(
        os.getenv("ACCESS_TOKEN_EXPIRES_MINUTES", "30")
    )
except ValueError as exc:
    raise RuntimeError("ACCESS_TOKEN_EXPIRES_MINUTES must be a positive integer.") from exc

if ACCESS_TOKEN_EXPIRES_MINUTES <= 0:
    raise RuntimeError("ACCESS_TOKEN_EXPIRES_MINUTES must be a positive integer.")

password_hash = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check an untrusted password against its stored adaptive hash."""
    return password_hash.verify(plain_password, hashed_password)


def create_access_token(user: User) -> str:
    """Create a short-lived signed bearer token for a user."""
    if not JWT_SECRET:
        raise RuntimeError("TRACKFLOW_JWT_SECRET must be set to enable authentication.")
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRES_MINUTES
    )
    return jwt.encode(
        {"sub": user.id, "exp": expires_at}, JWT_SECRET, algorithm=JWT_ALGORITHM
    )


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)], request: Request
) -> User:
    """Validate the bearer JWT and load its active user from persistence."""
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not JWT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured.",
        )
    try:
        payload: dict[str, Any] = jwt.decode(
            token, JWT_SECRET, algorithms=[JWT_ALGORITHM]
        )
        if not isinstance(payload, dict):
            raise credentials_error
        user_id = payload.get("sub")
        if not isinstance(user_id, str):
            raise credentials_error
    except jwt.InvalidTokenError:
        raise credentials_error from None
    except (TypeError, ValueError):
        raise credentials_error from None

    try:
        user = request.app.state.user_service.get_user_by_id(user_id)
    except Exception:
        # Do not expose persistence details through an authentication endpoint.
        raise credentials_error from None
    if user is None or not user.is_active:
        raise credentials_error
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
