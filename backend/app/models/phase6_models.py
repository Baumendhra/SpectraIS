import uuid
from typing import Optional, List
from sqlalchemy import String, Text, ForeignKey, JSON, Enum as SQLEnum, Float, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class SupplierRecord(BaseModel):
    __tablename__ = "supplier_records"

    company_name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    bis_crs_license_number: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    license_status: Mapped[str] = mapped_column(String(50), default="VALID", nullable=False)
    compliance_score: Mapped[float] = mapped_column(Float, default=95.0, nullable=False)
    risk_score: Mapped[float] = mapped_column(Float, default=5.0, nullable=False)
    categories_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    past_tenders_supplied: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class ProcurementQualityRecord(BaseModel):
    __tablename__ = "procurement_quality_records"

    tender_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenders.id", ondelete="CASCADE"), nullable=False, index=True)
    pqi_score: Mapped[float] = mapped_column(Float, nullable=False)
    grade: Mapped[str] = mapped_column(String(10), nullable=False)
    details_json: Mapped[dict] = mapped_column(JSON, nullable=False)


class FeedbackRecord(BaseModel):
    __tablename__ = "feedback_records"

    recommendation_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    officer_action: Mapped[str] = mapped_column(String(50), nullable=False)
    feedback_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    weight_adjustments_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
