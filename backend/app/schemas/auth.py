import uuid
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2, max_length=100)
    organization_name: str = Field(..., min_length=2, max_length=200)
    designation: Optional[str] = None
    role_name: str = Field(default="PROCUREMENT_OFFICER")


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirmRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class RoleSchema(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class UserAuthResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    designation: Optional[str] = None
    organization_id: Optional[uuid.UUID] = None
    organization_name: Optional[str] = None
    roles: List[str]
    is_active: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserAuthResponse
