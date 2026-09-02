import uuid
from typing import Optional, List
from sqlalchemy import String, Text, ForeignKey, JSON, Enum as SQLEnum, Float, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel
import enum


class GovSystemName(str, enum.Enum):
    GEM = "GeM"
    CPPP = "CPPP"
    NIC = "NIC_eProcurement"
    BIS = "BIS_Portal"
    MCA = "MCA"
    UDYAM = "Udyam"


class GovIntegrationAdapter(BaseModel):
    __tablename__ = "gov_integration_adapters"

    system_name: Mapped[GovSystemName] = mapped_column(SQLEnum(GovSystemName), unique=True, nullable=False)
    api_endpoint: Mapped[str] = mapped_column(String(500), nullable=False)
    auth_type: Mapped[str] = mapped_column(String(50), default="OAuth2", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    rate_limit_per_min: Mapped[int] = mapped_column(Integer, default=120, nullable=False)
    last_sync_status: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)


class BISAmendmentNotice(BaseModel):
    __tablename__ = "bis_amendment_notices"

    notice_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    is_number: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    amendment_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    release_date: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    summary_of_changes: Mapped[str] = mapped_column(Text, nullable=False)
    affected_domains: Mapped[dict] = mapped_column(JSON, nullable=False)


class AmendmentImpactRecord(BaseModel):
    __tablename__ = "amendment_impact_records"

    amendment_notice_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("bis_amendment_notices.id", ondelete="CASCADE"), nullable=False, index=True)
    is_number: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    affected_profiles_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    affected_tenders_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(20), default="HIGH", nullable=False)
    recommended_action: Mapped[str] = mapped_column(Text, nullable=False)


class UserSubscription(BaseModel):
    __tablename__ = "user_subscriptions"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    subscribed_domains: Mapped[dict] = mapped_column(JSON, nullable=False)
    subscribed_is_numbers: Mapped[dict] = mapped_column(JSON, nullable=False)
    email_alerts: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    in_app_alerts: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    frequency: Mapped[str] = mapped_column(String(20), default="REALTIME", nullable=False)


class EncryptedAuditRecord(BaseModel):
    __tablename__ = "encrypted_audit_records"

    action: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    resource: Mapped[str] = mapped_column(String(100), nullable=False)
    user_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    checksum_sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    payload_json: Mapped[dict] = mapped_column(JSON, nullable=False)
