"""TinyDB adapters implementing the user and profile persistence contracts."""

from tinydb import Query, TinyDB

from services.api.users import Profile, User


class TinyDBUserRepository:
    """Persist authentication identities in the users table."""

    def __init__(self, database: TinyDB, table_name: str = "users") -> None:
        self._table = database.table(table_name)

    def create(self, user: User) -> User:
        self._table.insert(user.model_dump(mode="json"))
        return user

    def get_by_id(self, user_id: str) -> User | None:
        document = self._table.get(Query().id == user_id)
        return User.model_validate(document) if document is not None else None

    def get_by_email(self, email: str) -> User | None:
        document = self._table.get(Query().email == email)
        return User.model_validate(document) if document is not None else None

    def get_all(self) -> list[User]:
        return [User.model_validate(document) for document in self._table.all()]

    def update(self, user: User) -> bool:
        updated_ids = self._table.update(
            user.model_dump(mode="json"), Query().id == user.id
        )
        return bool(updated_ids)

    def delete(self, user_id: str) -> bool:
        return bool(self._table.remove(Query().id == user_id))


class TinyDBProfileRepository:
    """Persist visible profile data separately in the profiles table."""

    def __init__(self, database: TinyDB, table_name: str = "profiles") -> None:
        self._table = database.table(table_name)

    def create(self, profile: Profile) -> Profile:
        self._table.insert(profile.model_dump(mode="json"))
        return profile

    def get_by_user_id(self, user_id: str) -> Profile | None:
        document = self._table.get(Query().user_id == user_id)
        return Profile.model_validate(document) if document is not None else None

    def update(self, profile: Profile) -> bool:
        updated_ids = self._table.update(
            profile.model_dump(mode="json"), Query().user_id == profile.user_id
        )
        return bool(updated_ids)

    def delete_by_user_id(self, user_id: str) -> bool:
        return bool(self._table.remove(Query().user_id == user_id))