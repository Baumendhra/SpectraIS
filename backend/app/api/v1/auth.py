from fastapi import APIRouter, Depends, HTTPException, status, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.guards import get_current_user
from app.core.security import decode_access_token
from app.models.auth import User
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    RefreshTokenRequest,
    TokenResponse,
    UserAuthResponse
)
from app.schemas.common import ResponseSchema
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()


@router.post("/register", response_model=ResponseSchema[TokenResponse], status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, session: AsyncSession = Depends(get_db)):
    """Register a new user and organization."""
    service = AuthService(session)
    token_resp = await service.register(req)
    return ResponseSchema(
        message="User successfully registered.",
        data=token_resp
    )


@router.post("/login", response_model=ResponseSchema[TokenResponse])
async def login(req: LoginRequest, session: AsyncSession = Depends(get_db)):
    """Authenticate user credentials and receive JWT access/refresh tokens."""
    service = AuthService(session)
    token_resp = await service.login(req)
    return ResponseSchema(
        message="Login successful.",
        data=token_resp
    )


@router.post("/refresh", response_model=ResponseSchema[TokenResponse])
async def refresh_token(req: RefreshTokenRequest, session: AsyncSession = Depends(get_db)):
    """Obtain a new access token using a valid refresh token (with sliding rotation)."""
    service = AuthService(session)
    token_resp = await service.refresh_tokens(req.refresh_token)
    return ResponseSchema(
        message="Token refreshed successfully.",
        data=token_resp
    )


@router.post("/logout", response_model=ResponseSchema[None])
async def logout(
    credentials: HTTPAuthorizationCredentials = Security(security),
    session: AsyncSession = Depends(get_db)
):
    """Revoke active JWT token."""
    payload = decode_access_token(credentials.credentials)
    service = AuthService(session)
    await service.logout(payload)
    return ResponseSchema(message="Successfully logged out.")


@router.get("/me", response_model=ResponseSchema[UserAuthResponse])
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Fetch profile details of the authenticated user."""
    role_names = [r.name for r in current_user.roles] if current_user.roles else ["PROCUREMENT_OFFICER"]
    user_auth = UserAuthResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        designation=current_user.designation,
        organization_id=current_user.organization_id,
        organization_name=current_user.organization.name if current_user.organization else None,
        roles=role_names,
        is_active=current_user.is_active
    )
    return ResponseSchema(data=user_auth)
