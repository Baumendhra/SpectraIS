import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.guards import get_current_user, require_roles
from app.models.auth import User
from app.models.standards import StandardStatus, CertificationRequirement
from app.schemas.standards import (
    StandardCreate,
    StandardUpdate,
    StandardResponse,
    StandardFilterParams
)
from app.schemas.common import ResponseSchema, PaginatedResponse
from app.services.standards_service import StandardsService

from typing import List, Union
from app.services.standards_scheduler import StandardsSchedulerService
from app.core.guards import get_optional_current_user

router = APIRouter(prefix="/standards", tags=["BIS Standards Repository"])


@router.get("/search", response_model=ResponseSchema[PaginatedResponse[StandardResponse]])
async def search_standards(
    q: str = Query(..., description="Search query across IS number, title, scope, and keywords"),
    domain: Optional[str] = Query(None, description="Filter by domain"),
    category: Optional[str] = Query(None, description="Filter by category"),
    sector: Optional[str] = Query(None, description="Filter by sector (computers, electronics, laptops, phones, telecom)"),
    status_filter: Optional[StandardStatus] = Query(None, alias="status", description="Filter by standard status"),
    certification_requirement: Optional[CertificationRequirement] = Query(None, description="Filter by certification requirement"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    session: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Keyword & semantic search across BIS standards."""
    service = StandardsService(session)
    params = StandardFilterParams(
        query=q,
        domain=domain,
        category=category,
        sector=sector,
        status=status_filter,
        certification_requirement=certification_requirement,
        page=page,
        size=size
    )
    result = await service.list_standards(params)
    return ResponseSchema(data=result)


@router.get("/sector/{sector}", response_model=ResponseSchema[List[StandardResponse]])
async def get_standards_by_sector(
    sector: str,
    session: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Fetch standards filtered by sector (e.g. computers, electronics, laptops, phones, telecom)."""
    service = StandardsService(session)
    result = await service.get_by_sector(sector)
    return ResponseSchema(data=result)


@router.post("/refresh", response_model=ResponseSchema[dict])
async def trigger_standards_refresh(
    session: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Triggers the background scraper job to re-check live BIS sources and flag revised/superseded standards."""
    scheduler_service = StandardsSchedulerService(session)
    summary = await scheduler_service.ingest_and_flag_revisions()
    return ResponseSchema(message="BIS Standards refresh completed successfully.", data=summary)


@router.get("", response_model=ResponseSchema[PaginatedResponse[StandardResponse]])
async def list_standards(
    query: Optional[str] = Query(None, description="Search query across IS number, title, and scope"),
    domain: Optional[str] = Query(None, description="Filter by domain"),
    category: Optional[str] = Query(None, description="Filter by category"),
    sector: Optional[str] = Query(None, description="Filter by sector"),
    status_filter: Optional[StandardStatus] = Query(None, alias="status", description="Filter by standard status"),
    certification_requirement: Optional[CertificationRequirement] = Query(None, description="Filter by certification requirement"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    session: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """List BIS standards with pagination, search, and filtering."""
    service = StandardsService(session)
    params = StandardFilterParams(
        query=query,
        domain=domain,
        category=category,
        sector=sector,
        status=status_filter,
        certification_requirement=certification_requirement,
        page=page,
        size=size
    )
    result = await service.list_standards(params)
    return ResponseSchema(data=result)


@router.get("/{is_number_or_id}", response_model=ResponseSchema[StandardResponse])
async def get_standard(
    is_number_or_id: str,
    session: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Fetch details of a single BIS Standard by IS number (e.g., 'IS 13252', 'IS 616') or UUID."""
    service = StandardsService(session)
    try:
        uuid_obj = uuid.UUID(is_number_or_id)
        result = await service.get_by_id(uuid_obj)
    except ValueError:
        result = await service.get_by_is_number(is_number_or_id)
    return ResponseSchema(data=result)


@router.post(
    "",
    response_model=ResponseSchema[StandardResponse],
    status_code=status.HTTP_201_CREATED
)
async def create_standard(
    req: StandardCreate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "ORG_ADMIN", "PROCUREMENT_OFFICER"]))
):
    """Create a new BIS Standard entry."""
    service = StandardsService(session)
    result = await service.create_standard(req)
    return ResponseSchema(message="Standard created successfully.", data=result)


@router.put("/{standard_id}", response_model=ResponseSchema[StandardResponse])
async def update_standard(
    standard_id: uuid.UUID,
    req: StandardUpdate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "ORG_ADMIN"]))
):
    """Update an existing BIS Standard entry."""
    service = StandardsService(session)
    result = await service.update_standard(standard_id, req)
    return ResponseSchema(message="Standard updated successfully.", data=result)


@router.delete("/{standard_id}", response_model=ResponseSchema[bool])
async def delete_standard(
    standard_id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["SUPER_ADMIN"]))
):
    """Delete a BIS Standard entry (SUPER_ADMIN only)."""
    service = StandardsService(session)
    success = await service.delete_standard(standard_id)
    return ResponseSchema(message="Standard deleted successfully.", data=success)
