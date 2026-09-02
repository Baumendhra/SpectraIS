from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.auth import Organization
from app.repositories.base import BaseRepository


class OrganizationRepository(BaseRepository[Organization]):
    def __init__(self, session: AsyncSession):
        super().__init__(Organization, session)

    async def get_by_code(self, code: str) -> Optional[Organization]:
        stmt = select(Organization).where(Organization.code == code)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_by_name(self, name: str) -> Optional[Organization]:
        stmt = select(Organization).where(Organization.name == name)
        result = await self.session.execute(stmt)
        return result.scalars().first()
