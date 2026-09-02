import uuid
from typing import List, Optional
from sqlalchemy import String, Text, Numeric, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel
import enum


class TenderStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    UNDER_REVIEW = "UNDER_REVIEW"
    COMPLIANT = "COMPLIANT"
    NON_COMPLIANT = "NON_COMPLIANT"
    ARCHIVED = "ARCHIVED"


class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class Tender(BaseModel):
    __tablename__ = "tenders"

    reference_number: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(500), index=True, nullable=False)
    department: Mapped[str] = mapped_column(String(255), nullable=False)
    estimated_value: Mapped[Optional[float]] = mapped_column(Numeric(15, 2), nullable=True)
    status: Mapped[TenderStatus] = mapped_column(SQLEnum(TenderStatus), default=TenderStatus.DRAFT, nullable=False)
    document_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    created_by_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    compliance_profile: Mapped[Optional["ComplianceProfile"]] = relationship("ComplianceProfile", back_populates="tender", uselist=False, cascade="all, delete-orphan")


class ComplianceProfile(BaseModel):
    __tablename__ = "compliance_profiles"

    tender_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenders.id", ondelete="CASCADE"), unique=True, nullable=False)
    overall_score: Mapped[float] = mapped_column(default=0.0, nullable=False)
    compliant_count: Mapped[int] = mapped_column(default=0, nullable=False)
    non_compliant_count: Mapped[int] = mapped_column(default=0, nullable=False)
    partial_compliant_count: Mapped[int] = mapped_column(default=0, nullable=False)
    summary_report: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    tender: Mapped["Tender"] = relationship("Tender", back_populates="compliance_profile")
    recommendations: Mapped[List["Recommendation"]] = relationship("Recommendation", back_populates="compliance_profile", cascade="all, delete-orphan")


class Recommendation(BaseModel):
    __tablename__ = "recommendations"

    compliance_profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("compliance_profiles.id", ondelete="CASCADE"), nullable=False)
    standard_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("standards.id", ondelete="SET NULL"), nullable=True)
    
    clause_reference: Mapped[str] = mapped_column(String(100), nullable=False)
    finding: Mapped[str] = mapped_column(Text, nullable=False)
    risk_level: Mapped[RiskLevel] = mapped_column(SQLEnum(RiskLevel), default=RiskLevel.MEDIUM, nullable=False)
    suggested_action: Mapped[str] = mapped_column(Text, nullable=False)

    compliance_profile: Mapped["ComplianceProfile"] = relationship("ComplianceProfile", back_populates="recommendations")
