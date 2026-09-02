import uuid
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class OrganizationResponse(BaseModel):
    id: uuid.UUID
    name: str
    code: str
    domain: Optional[str] = None
    address: Optional[str] = None
    contact_email: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class OrganizationCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    code: str = Field(..., min_length=2, max_length=50)
    domain: Optional[str] = None
    address: Optional[str] = None
    contact_email: EmailStr


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    address: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
