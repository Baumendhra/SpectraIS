import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.guards import get_current_user, require_roles
from app.models.auth import User, Organization
from app.repositories.organization_repository import OrganizationRepository
from app.schemas.organization import OrganizationResponse, OrganizationCreate, OrganizationUpdate
from app.schemas.common import ResponseSchema

router = APIRouter(prefix="/organizations", tags=["Organizations Management"])


@router.get("", response_model=ResponseSchema[List[OrganizationResponse]])
async def list_organizations(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "ORG_ADMIN"]))
):
    """List all organizations."""
    repo = OrganizationRepository(session)
    orgs = await repo.get_all()
    resp = [OrganizationResponse.model_validate(o) for o in orgs]
    return ResponseSchema(data=resp)


@router.post("", response_model=ResponseSchema[OrganizationResponse], status_code=status.HTTP_201_CREATED)
async def create_organization(
    req: OrganizationCreate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["SUPER_ADMIN"]))
):
    """Create a new organization (SUPER_ADMIN only)."""
    repo = OrganizationRepository(session)
    existing = await repo.get_by_code(req.code)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Organization code already exists.")
    
    org = Organization(
        name=req.name,
        code=req.code,
        domain=req.domain,
        address=req.address,
        contact_email=req.contact_email
    )
    org = await repo.create(org)
    return ResponseSchema(message="Organization created successfully.", data=OrganizationResponse.model_validate(org))
