import uuid
from typing import List, Optional
from sqlalchemy import String, ForeignKey, Table, Column
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel
from app.core.database import Base


# Junction tables
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", UUID(as_uuid=True), ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True)
)

role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", UUID(as_uuid=True), ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", UUID(as_uuid=True), ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True)
)


class Organization(BaseModel):
    __tablename__ = "organizations"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    domain: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Relationships
    users: Mapped[List["User"]] = relationship("User", back_populates="organization", cascade="all, delete-orphan")


class Role(BaseModel):
    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    permissions: Mapped[List["Permission"]] = relationship("Permission", secondary=role_permissions, back_populates="roles")
    users: Mapped[List["User"]] = relationship("User", secondary=user_roles, back_populates="roles")


class Permission(BaseModel):
    __tablename__ = "permissions"

    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False) # e.g. standards:create
    resource: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. standards
    action: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. create, read, update, delete
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    roles: Mapped[List["Role"]] = relationship("Role", secondary=role_permissions, back_populates="permissions")


class User(BaseModel):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    designation: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    phone_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    is_verified: Mapped[bool] = mapped_column(default=True, nullable=False)
    
    organization_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True)
    
    # Relationships
    organization: Mapped[Optional["Organization"]] = relationship("Organization", back_populates="users")
    roles: Mapped[List["Role"]] = relationship("Role", secondary=user_roles, back_populates="users", lazy="selectin")
