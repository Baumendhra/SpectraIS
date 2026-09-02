import uuid
from typing import Optional, List
from sqlalchemy import String, Text, ForeignKey, JSON, Enum as SQLEnum, Float, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class DataFabricRecord(BaseModel):
    __tablename__ = "data_fabric_records"

    source_system: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    records_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    data_lineage: Mapped[str] = mapped_column(Text, nullable=False)
    metadata_json: Mapped[dict] = mapped_column(JSON, nullable=False)


class DigitalTwinSnapshot(BaseModel):
    __tablename__ = "digital_twin_snapshots"

    snapshot_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    entities_modeled_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    compliance_index: Mapped[float] = mapped_column(Float, default=85.0, nullable=False)
    snapshot_json: Mapped[dict] = mapped_column(JSON, nullable=False)


class MarketplaceExtension(BaseModel):
    __tablename__ = "marketplace_extensions"

    plugin_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    provider: Mapped[str] = mapped_column(String(255), nullable=False)
    version: Mapped[str] = mapped_column(String(50), nullable=False)
    is_installed: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
