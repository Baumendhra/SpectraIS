import uuid
from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.standards import StandardStatus, CertificationRequirement


class AmendmentResponse(BaseModel):
    id: uuid.UUID
    amendment_number: int
    release_date: date
    title: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class VersionResponse(BaseModel):
    id: uuid.UUID
    version_number: str
    publication_date: date
    summary_of_changes: Optional[str] = None
    document_url: Optional[str] = None

    class Config:
        from_attributes = True


class StandardResponse(BaseModel):
    id: uuid.UUID
    is_number: str
    title: str
    scope: str
    domain: str
    category: str
    sector: Optional[str] = None
    status: StandardStatus
    revision_date: Optional[date] = None
    latest_amendment_date: Optional[date] = None
    certification_requirement: CertificationRequirement
    is_crs_mandated: bool = True
    is_revised: bool = False
    superseded_by: Optional[str] = None
    last_scraped_at: Optional[date] = None
    keywords: Optional[List[str]] = []
    issuing_committee: Optional[str] = None
    ic_code: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    is_active: bool
    versions: Optional[List[VersionResponse]] = []
    amendments: Optional[List[AmendmentResponse]] = []

    class Config:
        from_attributes = True


class StandardCreate(BaseModel):
    is_number: str = Field(..., example="IS 13252(Part 1):2010")
    title: str = Field(..., example="Information Technology Equipment - Safety")
    scope: str = Field(..., example="Safety requirements for IT equipment...")
    domain: str = Field(..., example="Electronics & Information Technology")
    category: str = Field(..., example="Computers & IT Hardware")
    sector: Optional[str] = Field(None, example="computers")
    status: StandardStatus = StandardStatus.ACTIVE
    revision_date: Optional[date] = None
    latest_amendment_date: Optional[date] = None
    certification_requirement: CertificationRequirement = CertificationRequirement.CRS
    is_crs_mandated: bool = True
    is_revised: bool = False
    superseded_by: Optional[str] = None
    keywords: Optional[List[str]] = []
    issuing_committee: Optional[str] = None
    ic_code: Optional[str] = None


class StandardUpdate(BaseModel):
    is_number: Optional[str] = None
    title: Optional[str] = None
    scope: Optional[str] = None
    domain: Optional[str] = None
    category: Optional[str] = None
    sector: Optional[str] = None
    status: Optional[StandardStatus] = None
    revision_date: Optional[date] = None
    latest_amendment_date: Optional[date] = None
    certification_requirement: Optional[CertificationRequirement] = None
    is_crs_mandated: Optional[bool] = None
    is_revised: Optional[bool] = None
    superseded_by: Optional[str] = None
    keywords: Optional[List[str]] = None
    issuing_committee: Optional[str] = None
    ic_code: Optional[str] = None
    is_active: Optional[bool] = None


class StandardFilterParams(BaseModel):
    query: Optional[str] = None
    domain: Optional[str] = None
    category: Optional[str] = None
    sector: Optional[str] = None
    status: Optional[StandardStatus] = None
    certification_requirement: Optional[CertificationRequirement] = None
    is_crs_mandated: Optional[bool] = None
    page: int = Field(default=1, ge=1)
    size: int = Field(default=10, ge=1, le=100)
