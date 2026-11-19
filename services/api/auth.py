"""Password verification and bearer-token authentication helpers."""

from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Annotated, Any

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pwdlib import PasswordHash

from services.api.users import User

JWT_SECRET = os.getenv("TRACKFLOW_JWT_SECRET")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = 30
password_hash = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check an untrusted password against its stored adaptive hash."""
    return password_hash.verify(plain_password, hashed_password)


def create_access_token(user: User) -> str:
    """Create a short-lived signed bearer token for a user."""
    if not JWT_SECRET:
        raise RuntimeError("TRACKFLOW_JWT_SECRET must be set to enable authentication.")
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MINUTES)
    return jwt.encode(
        {"sub": user.id, "exp": expires_at}, JWT_SECRET, algorithm=JWT_ALGORITHM
    )


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> User:
    """Decode the bearer token and load the current user from persistence."""
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
        user_id = payload.get("sub")
        if not isinstance(user_id, str):
            raise credentials_error
    except jwt.InvalidTokenError:
        raise credentials_error from None

    from services.api.main import user_service

    user = user_service.get_user_by_id(user_id)
    if user is None or not user.is_active:
        raise credentials_error
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
