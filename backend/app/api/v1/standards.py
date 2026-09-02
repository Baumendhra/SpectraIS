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

router = APIRouter(prefix="/standards", tags=["BIS Standards Repository"])


@router.get("", response_model=ResponseSchema[PaginatedResponse[StandardResponse]])
async def list_standards(
    query: Optional[str] = Query(None, description="Search query across IS number, title, and scope"),
    domain: Optional[str] = Query(None, description="Filter by domain"),
    category: Optional[str] = Query(None, description="Filter by category"),
    status_filter: Optional[StandardStatus] = Query(None, alias="status", description="Filter by standard status"),
    certification_requirement: Optional[CertificationRequirement] = Query(None, description="Filter by certification requirement"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List BIS standards with pagination, search, and filtering."""
    service = StandardsService(session)
    params = StandardFilterParams(
        query=query,
        domain=domain,
        category=category,
        status=status_filter,
        certification_requirement=certification_requirement,
        page=page,
        size=size
    )
    result = await service.list_standards(params)
    return ResponseSchema(data=result)


@router.get("/{standard_id}", response_model=ResponseSchema[StandardResponse])
async def get_standard_by_id(
    standard_id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch details of a single BIS Standard including versions and amendments."""
    service = StandardsService(session)
    result = await service.get_by_id(standard_id)
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
