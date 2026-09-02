import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.guards import get_current_user, require_roles
from app.models.auth import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserResponse, UserCreate, UserUpdate
from app.schemas.common import ResponseSchema

router = APIRouter(prefix="/users", tags=["Users Management"])


@router.get("", response_model=ResponseSchema[List[UserResponse]])
async def list_users(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "ORG_ADMIN"]))
):
    """List all users (Admin only)."""
    repo = UserRepository(session)
    users = await repo.get_all()
    user_responses = []
    for u in users:
        u_det = await repo.get_by_id_with_relations(u.id)
        if u_det:
            roles = [r.name for r in u_det.roles]
            resp = UserResponse(
                id=u_det.id,
                email=u_det.email,
                full_name=u_det.full_name,
                designation=u_det.designation,
                phone_number=u_det.phone_number,
                organization_id=u_det.organization_id,
                is_active=u_det.is_active,
                is_verified=u_det.is_verified,
                roles=roles,
                created_at=u_det.created_at
            )
            user_responses.append(resp)
    return ResponseSchema(data=user_responses)


@router.get("/{user_id}", response_model=ResponseSchema[UserResponse])
async def get_user_by_id(
    user_id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch user details."""
    repo = UserRepository(session)
    user = await repo.get_by_id_with_relations(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    roles = [r.name for r in user.roles]
    resp = UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        designation=user.designation,
        phone_number=user.phone_number,
        organization_id=user.organization_id,
        is_active=user.is_active,
        is_verified=user.is_verified,
        roles=roles,
        created_at=user.created_at
    )
    return ResponseSchema(data=resp)
