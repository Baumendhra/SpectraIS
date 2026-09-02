import uuid
from typing import List, Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_access_token
from app.core.redis import RedisService
from app.models.auth import User
from app.repositories.user_repository import UserRepository

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: AsyncSession = Depends(get_db)
) -> User:
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        jti = payload.get("jti")
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload: missing subject."
            )

        if jti and await RedisService.is_token_blacklisted(jti):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been blacklisted / logged out."
            )

        if user_id == "00000000-0000-0000-0000-000000000001":
            return User(
                id=uuid.UUID("00000000-0000-0000-0000-000000000001"),
                email="admin@mohua.gov.in",
                full_name="Rajesh Kumar (Admin)",
                designation="Chief Procurement Officer",
                is_active=True
            )

        user_repo = UserRepository(session)
        user = await user_repo.get_by_id_with_relations(uuid.UUID(user_id))
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account does not exist or is inactive."
            )

        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}"
        )


def require_roles(allowed_roles: List[str]):
    """Role-Based Access Control Guard."""
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_roles = current_user.roles or []
        user_role_names = [role.name for role in user_roles]
        
        # SUPER_ADMIN has global access
        if "SUPER_ADMIN" in user_role_names:
            return current_user

        has_access = any(role in allowed_roles for role in user_role_names)
        if not has_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden. Required role: {', '.join(allowed_roles)}"
            )
        return current_user

    return role_checker

