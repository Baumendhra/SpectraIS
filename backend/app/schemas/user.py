import uuid
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    designation: Optional[str] = None
    phone_number: Optional[str] = None
    organization_id: Optional[uuid.UUID] = None
    is_active: bool
    is_verified: bool
    roles: List[str]
    created_at: datetime

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str
    designation: Optional[str] = None
    phone_number: Optional[str] = None
    organization_id: Optional[uuid.UUID] = None
    role_names: List[str] = ["PROCUREMENT_OFFICER"]


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    designation: Optional[str] = None
    phone_number: Optional[str] = None
    is_active: Optional[bool] = None
    role_names: Optional[List[str]] = None
