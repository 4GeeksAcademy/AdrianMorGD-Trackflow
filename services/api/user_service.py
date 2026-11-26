"""Service operations for authentication users."""

from __future__ import annotations

from pwdlib import PasswordHash

from services.api.user_port import ProfileRepository, UserRepository
from services.api.users import (
    Profile,
    ProfileCreate,
    ProfileUpdate,
    User,
    UserCreate,
    UserResponse,
    UserUpdate,
)


class UserService:
    """Apply user-domain operations over the configured repository."""

    def __init__(
        self,
        repository: UserRepository,
        profile_repository: ProfileRepository,
        password_hasher: PasswordHash | None = None,
    ) -> None:
        self._repository = repository
        self._profile_repository = profile_repository
        self._password_hasher = password_hasher or PasswordHash.recommended()

    def create_user(self, user_data: UserCreate) -> UserResponse:
        """Hash password, create user and profile, and return safe response."""
        if self.get_user_by_email(user_data.email) is not None:
            raise ValueError("A user with this email already exists.")
        if len(user_data.password) < 8:
            raise ValueError("Password must contain at least 8 characters.")

        user = User(
            email=user_data.email,
            hashed_password=self._password_hasher.hash(user_data.password),
        )
        self._repository.create(user)
        profile_data = ProfileCreate(
            name=user_data.name,
            phone=user_data.phone,
            address=user_data.address,
        )
        profile = self._profile_repository.create(
            Profile(user_id=user.id, **profile_data.model_dump())
        )
        return self._to_response(user, profile)

    def get_user_by_id(self, user_id: str) -> User | None:
        """Get a user by ID."""
        return self._repository.get_by_id(user_id)

    def get_user_by_email(self, email: str) -> User | None:
        """Get a user by email."""
        return self._repository.get_by_email(email)

    def get_profile(self, user_id: str) -> Profile:
        """Get or create the profile linked to an authentication user."""
        return self._get_or_create_profile(user_id)

    def update_profile(
        self, user_id: str, profile_data: ProfileUpdate
    ) -> Profile:
        """Update only profile fields supplied by the authenticated owner."""
        profile = self._get_or_create_profile(user_id)
        changes = profile_data.model_dump(exclude_unset=True)
        updated_profile = Profile.model_validate(
            {**profile.model_dump(), **changes}
        )
        self._profile_repository.update(updated_profile)
        return updated_profile

    def update_user(self, user_id: str, user_data: UserUpdate) -> UserResponse | None:
        """Update the supplied user fields and return the updated user."""
        user = self.get_user_by_id(user_id)
        if user is None:
            return None

        changes = user_data.model_dump(exclude_unset=True, exclude_none=True)
        password = changes.pop("password", None)
        if password is not None:
            if len(password) < 8:
                raise ValueError("Password must contain at least 8 characters.")
            changes["hashed_password"] = self._password_hasher.hash(password)
        if changes.get("email") is not None:
            existing_user = self.get_user_by_email(changes["email"])
            if existing_user is not None and existing_user.id != user_id:
                raise ValueError("A user with this email already exists.")

        updated_user = User.model_validate({**user.model_dump(), **changes})
        self._repository.update(updated_user)
        profile = self._profile_repository.get_by_user_id(user_id)
        if profile is None:
            profile = self._profile_repository.create(Profile(user_id=user_id))
        return self._to_response(updated_user, profile)

    def list_users(self) -> list[UserResponse]:
        """Return all users with their separately stored profiles."""
        return [
            self._to_response(user, self._get_or_create_profile(user.id))
            for user in self._repository.get_all()
        ]

    def get_user_response_by_id(self, user_id: str) -> UserResponse | None:
        """Return one user and its profile without authentication secrets."""
        user = self.get_user_by_id(user_id)
        if user is None:
            return None
        return self._to_response(user, self._get_or_create_profile(user.id))

    def delete_user(self, user_id: str) -> bool:
        """Delete a user by ID and report whether it existed."""
        if self.get_user_by_id(user_id) is None:
            return False
        self._profile_repository.delete_by_user_id(user_id)
        return self._repository.delete(user_id)

    def _get_or_create_profile(self, user_id: str) -> Profile:
        return self._profile_repository.get_by_user_id(user_id) or self._profile_repository.create(
            Profile(user_id=user_id)
        )

    @staticmethod
    def _to_response(user: User, profile: Profile) -> UserResponse:
        return UserResponse(
            id=user.id,
            email=user.email,
            is_active=user.is_active,
            role=user.role,
            created_at=user.created_at,
            profile=profile,
        )
