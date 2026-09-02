import uuid
from typing import Optional, List
from sqlalchemy import String, Text, ForeignKey, JSON, Enum as SQLEnum, Float, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel
import enum


class DocumentType(str, enum.Enum):
    PDF = "PDF"
    DOCX = "DOCX"
    TXT = "TXT"


class AnalysisStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class TenderDocument(BaseModel):
    __tablename__ = "tender_documents"

    tender_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenders.id", ondelete="CASCADE"), nullable=False, index=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[DocumentType] = mapped_column(SQLEnum(DocumentType), default=DocumentType.PDF, nullable=False)
    raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    char_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    page_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    sections_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)


class TenderGapRecord(BaseModel):
    __tablename__ = "tender_gap_records"

    tender_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenders.id", ondelete="CASCADE"), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False)  # Critical, High, Medium, Low
    missing_requirement: Mapped[str] = mapped_column(Text, nullable=False)
    recommended_clause: Mapped[str] = mapped_column(Text, nullable=False)


class TenderRiskRecord(BaseModel):
    __tablename__ = "tender_risk_records"

    tender_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenders.id", ondelete="CASCADE"), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False)  # Legal, Quality, Certification, Testing, Procurement
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False)
    mitigation_strategy: Mapped[str] = mapped_column(Text, nullable=False)
