import uuid
from datetime import date
from typing import List, Optional
from sqlalchemy import String, Text, Date, ForeignKey, Table, Column, JSON, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel
from app.core.database import Base
import enum


class StandardStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    REVISED = "REVISED"
    WITHDRAWN = "WITHDRAWN"
    DRAFT = "DRAFT"


class CertificationRequirement(str, enum.Enum):
    MANDATORY = "MANDATORY"
    VOLUNTARY = "VOLUNTARY"
    REGULATED = "REGULATED"


# Standard to Product junction table
standard_products = Table(
    "standard_products",
    Base.metadata,
    Column("standard_id", UUID(as_uuid=True), ForeignKey("standards.id", ondelete="CASCADE"), primary_key=True),
    Column("product_id", UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), primary_key=True)
)


class ProductCategory(BaseModel):
    __tablename__ = "product_categories"

    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    products: Mapped[List["Product"]] = relationship("Product", back_populates="category")


class Product(BaseModel):
    __tablename__ = "products"

    name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    hs_code: Mapped[Optional[str]] = mapped_column(String(20), index=True, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("product_categories.id", ondelete="SET NULL"))

    category: Mapped[Optional["ProductCategory"]] = relationship("ProductCategory", back_populates="products")
    standards: Mapped[List["Standard"]] = relationship("Standard", secondary=standard_products, back_populates="products")


class Standard(BaseModel):
    __tablename__ = "standards"

    is_number: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False) # e.g. IS 1363 : Part 1 : 2019
    title: Mapped[str] = mapped_column(String(500), index=True, nullable=False)
    scope: Mapped[str] = mapped_column(Text, nullable=False)
    domain: Mapped[str] = mapped_column(String(100), index=True, nullable=False) # e.g. Civil, Electronics, Heavy Machinery
    category: Mapped[str] = mapped_column(String(100), index=True, nullable=False) # e.g. Fasteners, Safety Equipment, Cables
    status: Mapped[StandardStatus] = mapped_column(SQLEnum(StandardStatus), default=StandardStatus.ACTIVE, nullable=False)
    revision_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    certification_requirement: Mapped[CertificationRequirement] = mapped_column(
        SQLEnum(CertificationRequirement), default=CertificationRequirement.MANDATORY, nullable=False
    )
    keywords: Mapped[Optional[list[str]]] = mapped_column(JSON, nullable=True)
    issuing_committee: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    ic_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Relationships
    versions: Mapped[List["StandardVersion"]] = relationship("StandardVersion", back_populates="standard", cascade="all, delete-orphan")
    amendments: Mapped[List["Amendment"]] = relationship("Amendment", back_populates="standard", cascade="all, delete-orphan")
    products: Mapped[List["Product"]] = relationship("Product", secondary=standard_products, back_populates="standards")


class StandardVersion(BaseModel):
    __tablename__ = "standard_versions"

    standard_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("standards.id", ondelete="CASCADE"), nullable=False)
    version_number: Mapped[str] = mapped_column(String(50), nullable=False)
    publication_date: Mapped[date] = mapped_column(Date, nullable=False)
    summary_of_changes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    document_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    standard: Mapped["Standard"] = relationship("Standard", back_populates="versions")


class Amendment(BaseModel):
    __tablename__ = "amendments"

    standard_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("standards.id", ondelete="CASCADE"), nullable=False)
    amendment_number: Mapped[int] = mapped_column(nullable=False)
    release_date: Mapped[date] = mapped_column(Date, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    standard: Mapped["Standard"] = relationship("Standard", back_populates="amendments")
