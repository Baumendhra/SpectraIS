import uuid
from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.auth import User, Role, Organization, Permission
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, session: AsyncSession):
        super().__init__(User, session)

    async def get_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).options(
            selectinload(User.roles).selectinload(Role.permissions),
            selectinload(User.organization)
        ).where(User.email == email)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_by_id_with_relations(self, user_id: uuid.UUID) -> Optional[User]:
        stmt = select(User).options(
            selectinload(User.roles).selectinload(Role.permissions),
            selectinload(User.organization)
        ).where(User.id == user_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_roles_by_names(self, role_names: List[str]) -> List[Role]:
        stmt = select(Role).where(Role.name.in_(role_names))
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_role_by_name(self, role_name: str) -> Optional[Role]:
        stmt = select(Role).where(Role.name == role_name)
        result = await self.session.execute(stmt)
        return result.scalars().first()
