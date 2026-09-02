import uuid
import math
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.standards import Standard, StandardStatus, CertificationRequirement
from app.repositories.standards_repository import StandardsRepository
from app.schemas.standards import StandardCreate, StandardUpdate, StandardFilterParams, StandardResponse
from app.schemas.common import PaginatedResponse


class StandardsService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.standards_repo = StandardsRepository(session)

    async def get_by_id(self, standard_id: uuid.UUID) -> StandardResponse:
        std = await self.standards_repo.get_by_id_with_details(standard_id)
        if not std:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Standard with ID {standard_id} not found."
            )
        return StandardResponse.model_validate(std)

    async def get_by_is_number(self, is_number: str) -> StandardResponse:
        std = await self.standards_repo.get_by_is_number(is_number)
        if not std:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Standard with IS Number '{is_number}' not found."
            )
        return StandardResponse.model_validate(std)

    async def get_by_sector(self, sector: str) -> List[StandardResponse]:
        items = await self.standards_repo.get_by_sector(sector)
        return [StandardResponse.model_validate(item) for item in items]

    async def list_standards(self, params: StandardFilterParams) -> PaginatedResponse[StandardResponse]:
        items, total = await self.standards_repo.search_and_filter(
            query=params.query,
            domain=params.domain,
            category=params.category,
            sector=params.sector,
            status=params.status,
            certification_requirement=params.certification_requirement,
            is_crs_mandated=params.is_crs_mandated,
            page=params.page,
            size=params.size
        )
        
        pages = math.ceil(total / params.size) if total > 0 else 0
        data_items = [StandardResponse.model_validate(item) for item in items]

        return PaginatedResponse(
            items=data_items,
            total=total,
            page=params.page,
            size=params.size,
            pages=pages
        )

    async def create_standard(self, req: StandardCreate) -> StandardResponse:
        existing = await self.standards_repo.get_by_is_number(req.is_number)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Standard with IS Number '{req.is_number}' already exists."
            )

        new_std = Standard(
            is_number=req.is_number,
            title=req.title,
            scope=req.scope,
            domain=req.domain,
            category=req.category,
            status=req.status,
            revision_date=req.revision_date,
            certification_requirement=req.certification_requirement,
            keywords=req.keywords or [],
            issuing_committee=req.issuing_committee,
            ic_code=req.ic_code
        )
        new_std = await self.standards_repo.create(new_std)
        std_details = await self.standards_repo.get_by_id_with_details(new_std.id)
        return StandardResponse.model_validate(std_details)

    async def update_standard(self, standard_id: uuid.UUID, req: StandardUpdate) -> StandardResponse:
        std = await self.standards_repo.get_by_id(standard_id)
        if not std:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Standard with ID {standard_id} not found."
            )

        update_data = req.model_dump(exclude_unset=True)
        updated_std = await self.standards_repo.update(standard_id, update_data)
        std_details = await self.standards_repo.get_by_id_with_details(updated_std.id)
        return StandardResponse.model_validate(std_details)

    async def delete_standard(self, standard_id: uuid.UUID) -> bool:
        std = await self.standards_repo.get_by_id(standard_id)
        if not std:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Standard with ID {standard_id} not found."
            )
        return await self.standards_repo.delete(standard_id)
