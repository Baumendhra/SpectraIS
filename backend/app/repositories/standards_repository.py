import uuid
from typing import List, Optional, Tuple
from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.standards import Standard, StandardStatus, CertificationRequirement
from app.repositories.base import BaseRepository


class StandardsRepository(BaseRepository[Standard]):
    def __init__(self, session: AsyncSession):
        super().__init__(Standard, session)

    async def get_by_is_number(self, is_number: str) -> Optional[Standard]:
        stmt = select(Standard).options(
            selectinload(Standard.versions),
            selectinload(Standard.amendments)
        ).where(Standard.is_number == is_number)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_by_id_with_details(self, standard_id: uuid.UUID) -> Optional[Standard]:
        stmt = select(Standard).options(
            selectinload(Standard.versions),
            selectinload(Standard.amendments)
        ).where(Standard.id == standard_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def search_and_filter(
        self,
        query: Optional[str] = None,
        domain: Optional[str] = None,
        category: Optional[str] = None,
        status: Optional[StandardStatus] = None,
        certification_requirement: Optional[CertificationRequirement] = None,
        page: int = 1,
        size: int = 10
    ) -> Tuple[List[Standard], int]:
        stmt = select(Standard).options(
            selectinload(Standard.versions),
            selectinload(Standard.amendments)
        )

        filters = []
        if query:
            search_pattern = f"%{query}%"
            filters.append(
                or_(
                    Standard.is_number.ilike(search_pattern),
                    Standard.title.ilike(search_pattern),
                    Standard.scope.ilike(search_pattern)
                )
            )

        if domain:
            filters.append(Standard.domain == domain)

        if category:
            filters.append(Standard.category == category)

        if status:
            filters.append(Standard.status == status)

        if certification_requirement:
            filters.append(Standard.certification_requirement == certification_requirement)

        if filters:
            stmt = stmt.where(*filters)

        # Count total matches
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_result = await self.session.execute(count_stmt)
        total = total_result.scalar() or 0

        # Apply pagination & sorting
        offset = (page - 1) * size
        stmt = stmt.order_by(Standard.created_at.desc()).offset(offset).limit(size)
        result = await self.session.execute(stmt)
        items = list(result.scalars().all())

        return items, total
