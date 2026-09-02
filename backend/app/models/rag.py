import uuid
from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy import String, Text, ForeignKey, Enum as SQLEnum, Integer, Float, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel
import enum


class RelationType(str, enum.Enum):
    AMENDS = "AMENDS"
    REPLACES = "REPLACES"
    REFERENCES = "REFERENCES"
    REPEALS = "REPEALS"
    COMPLEMENTS = "COMPLEMENTS"


class IngestionStatus(str, enum.Enum):
    PENDING = "PENDING"
    PARSING = "PARSING"
    CHUNKING = "CHUNKING"
    EMBEDDING = "EMBEDDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class SectionType(str, enum.Enum):
    SCOPE = "SCOPE"
    DEFINITIONS = "DEFINITIONS"
    REQUIREMENTS = "REQUIREMENTS"
    TESTING = "TESTING"
    COMPLIANCE = "COMPLIANCE"
    CERTIFICATION = "CERTIFICATION"
    ANNEXURES = "ANNEXURES"


class StandardRelation(BaseModel):
    """Knowledge Graph edge representation between two BIS standards."""
    __tablename__ = "standard_relations"

    source_standard_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("standards.id", ondelete="CASCADE"), nullable=False, index=True)
    target_standard_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("standards.id", ondelete="CASCADE"), nullable=False, index=True)
    relation_type: Mapped[RelationType] = mapped_column(SQLEnum(RelationType), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class ComplianceRequirement(BaseModel):
    """Granular technical compliance requirement extracted from a standard clause."""
    __tablename__ = "compliance_requirements"

    standard_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("standards.id", ondelete="CASCADE"), nullable=False, index=True)
    clause_number: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    parameter_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    threshold_value: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)


class TestMethod(BaseModel):
    """Test procedure & parameter limits prescribed in a standard."""
    __tablename__ = "test_methods"

    standard_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("standards.id", ondelete="CASCADE"), nullable=False, index=True)
    test_name: Mapped[str] = mapped_column(String(255), nullable=False)
    clause_reference: Mapped[str] = mapped_column(String(50), nullable=False)
    procedure_summary: Mapped[str] = mapped_column(Text, nullable=False)
    sample_requirements: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class IngestionJob(BaseModel):
    """Tracks document ingestion & embedding status."""
    __tablename__ = "ingestion_jobs"

    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    is_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[IngestionStatus] = mapped_column(SQLEnum(IngestionStatus), default=IngestionStatus.PENDING, nullable=False)
    chunks_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    vectors_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
