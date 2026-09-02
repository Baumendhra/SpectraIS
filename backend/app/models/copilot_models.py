import uuid
from typing import Optional, List
from sqlalchemy import String, Text, ForeignKey, JSON, Enum as SQLEnum, Float, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel
import enum


class ReviewStatus(str, enum.Enum):
    PENDING_REVIEW = "PENDING_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    MODIFIED = "MODIFIED"


class CopilotChatSession(BaseModel):
    __tablename__ = "copilot_chat_sessions"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), default="New Procurement Copilot Chat", nullable=False)
    domain_context: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    messages: Mapped[List["CopilotChatMessage"]] = relationship("CopilotChatMessage", back_populates="session", cascade="all, delete-orphan")


class CopilotChatMessage(BaseModel):
    __tablename__ = "copilot_chat_messages"

    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("copilot_chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    sender: Mapped[str] = mapped_column(String(20), nullable=False)  # user, assistant, system
    content: Mapped[str] = mapped_column(Text, nullable=False)
    citations_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    session: Mapped["CopilotChatSession"] = relationship("CopilotChatSession", back_populates="messages")


class RecommendationAuditTrail(BaseModel):
    __tablename__ = "recommendation_audit_trails"

    profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("compliance_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    officer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    action: Mapped[ReviewStatus] = mapped_column(SQLEnum(ReviewStatus), nullable=False)
    officer_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    snapshot_json: Mapped[dict] = mapped_column(JSON, nullable=False)


class EvaluationResult(BaseModel):
    __tablename__ = "evaluation_results"

    suite_name: Mapped[str] = mapped_column(String(100), nullable=False)
    total_samples: Mapped[int] = mapped_column(Integer, nullable=False)
    precision: Mapped[float] = mapped_column(Float, nullable=False)
    recall: Mapped[float] = mapped_column(Float, nullable=False)
    classification_accuracy: Mapped[float] = mapped_column(Float, nullable=False)
    citation_accuracy: Mapped[float] = mapped_column(Float, nullable=False)
    hallucination_rate: Mapped[float] = mapped_column(Float, nullable=False)
    details_json: Mapped[dict] = mapped_column(JSON, nullable=False)
