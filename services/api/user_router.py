"""HTTP routes for authentication users and their profiles."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response

from services.api.auth import CurrentUser, create_access_token, verify_password
from services.api.user_service import UserService
from services.api.users import (
    AuthenticatedUserResponse,
    Profile,
    ProfileUpdate,
    UserCreate,
    UserLogin,
    UserResponse,
    UserRole,
    UserUpdate,
)

router = APIRouter()


def get_user_service(request: Request) -> UserService:
    """Resolve user use cases from the composed FastAPI application."""
    return request.app.state.user_service


UserServiceDependency = Annotated[UserService, Depends(get_user_service)]


@router.post("/auth/login")
@router.post("/auth/token", include_in_schema=False)
async def issue_access_token(
    credentials: UserLogin,
    user_service: UserServiceDependency,
) -> dict[str, str]:
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


@router.get("/auth/me", response_model=AuthenticatedUserResponse)
async def get_authenticated_user(
    current_user: CurrentUser,
    user_service: UserServiceDependency,
) -> AuthenticatedUserResponse:
    """Return the authenticated user's email, role, and linked profile."""
    return AuthenticatedUserResponse(
        email=current_user.email,
        role=current_user.role,
        profile=user_service.get_profile(current_user.id),
    )


@router.get("/profiles/me", response_model=Profile)
async def get_my_profile(
    current_user: CurrentUser,
    user_service: UserServiceDependency,
) -> Profile:
    """Return the profile linked to the authenticated user."""
    return user_service.get_profile(current_user.id)


@router.put("/profiles/me", response_model=Profile)
async def update_my_profile(
    profile_data: ProfileUpdate,
    current_user: CurrentUser,
    user_service: UserServiceDependency,
) -> Profile:
    """Update only the profile linked to the authenticated user."""
    return user_service.update_profile(current_user.id, profile_data)


@router.post("/users", response_model=UserResponse, status_code=201)
async def create_user(
    user_data: UserCreate,
    user_service: UserServiceDependency,
) -> UserResponse:
    """Register a user and optional profile; registrations use the user role."""
    try:
        return user_service.create_user(user_data)
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    current_user: CurrentUser,
    user_service: UserServiceDependency,
) -> list[UserResponse]:
    """List users; administrator access only."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Administrator role required.")
    return user_service.list_users()


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: CurrentUser,
    user_service: UserServiceDependency,
) -> UserResponse:
    """Get a user by ID; only the user or an administrator may access it."""
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to access this user.")
    user = user_service.get_user_response_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user: CurrentUser,
    user_service: UserServiceDependency,
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


@router.delete("/users/{user_id}", status_code=204)
async def delete_user(
    user_id: str,
    current_user: CurrentUser,
    user_service: UserServiceDependency,
) -> Response:
    """Delete a user and linked profile; only self or administrator may do so."""
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to delete this user.")
    if not user_service.delete_user(user_id):
        raise HTTPException(status_code=404, detail="User not found.")
    return Response(status_code=204)