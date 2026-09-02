"""initial schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-01 22:20:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Organizations
    op.create_table(
        'organizations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('code', sa.String(50), nullable=False, unique=True),
        sa.Column('domain', sa.String(255), nullable=True),
        sa.Column('address', sa.String(500), nullable=True),
        sa.Column('contact_email', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True)
    )
    op.create_index('ix_organizations_code', 'organizations', ['code'])

    # Roles
    op.create_table(
        'roles',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(50), nullable=False, unique=True),
        sa.Column('description', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True)
    )
    op.create_index('ix_roles_name', 'roles', ['name'])

    # Permissions
    op.create_table(
        'permissions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False, unique=True),
        sa.Column('resource', sa.String(50), nullable=False),
        sa.Column('action', sa.String(50), nullable=False),
        sa.Column('description', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True)
    )
    op.create_index('ix_permissions_name', 'permissions', ['name'])

    # Role Permissions Junction
    op.create_table(
        'role_permissions',
        sa.Column('role_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('roles.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('permission_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('permissions.id', ondelete='CASCADE'), primary_key=True)
    )

    # Users
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('designation', sa.String(100), nullable=True),
        sa.Column('phone_number', sa.String(20), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=False, default=True),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('organizations.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True)
    )
    op.create_index('ix_users_email', 'users', ['email'])

    # User Roles Junction
    op.create_table(
        'user_roles',
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('role_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('roles.id', ondelete='CASCADE'), primary_key=True)
    )

    # Standards
    op.create_table(
        'standards',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('is_number', sa.String(100), nullable=False, unique=True),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('scope', sa.Text(), nullable=False),
        sa.Column('domain', sa.String(100), nullable=False),
        sa.Column('category', sa.String(100), nullable=False),
        sa.Column('status', sa.Enum('ACTIVE', 'REVISED', 'WITHDRAWN', 'DRAFT', name='standardstatus'), nullable=False),
        sa.Column('revision_date', sa.Date(), nullable=True),
        sa.Column('certification_requirement', sa.Enum('MANDATORY', 'VOLUNTARY', 'REGULATED', name='certificationrequirement'), nullable=False),
        sa.Column('keywords', sa.JSON(), nullable=True),
        sa.Column('issuing_committee', sa.String(255), nullable=True),
        sa.Column('ic_code', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True)
    )
    op.create_index('ix_standards_is_number', 'standards', ['is_number'])
    op.create_index('ix_standards_title', 'standards', ['title'])
    op.create_index('ix_standards_domain', 'standards', ['domain'])
    op.create_index('ix_standards_category', 'standards', ['category'])

    # Standard Versions
    op.create_table(
        'standard_versions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('standard_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('standards.id', ondelete='CASCADE'), nullable=False),
        sa.Column('version_number', sa.String(50), nullable=False),
        sa.Column('publication_date', sa.Date(), nullable=False),
        sa.Column('summary_of_changes', sa.Text(), nullable=True),
        sa.Column('document_url', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True)
    )

    # Amendments
    op.create_table(
        'amendments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('standard_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('standards.id', ondelete='CASCADE'), nullable=False),
        sa.Column('amendment_number', sa.Integer(), nullable=False),
        sa.Column('release_date', sa.Date(), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True)
    )

    # Product Categories
    op.create_table(
        'product_categories',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False, unique=True),
        sa.Column('code', sa.String(50), nullable=False, unique=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True)
    )

    # Products
    op.create_table(
        'products',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('hs_code', sa.String(20), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('product_categories.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True)
    )

    # Standard Products Junction
    op.create_table(
        'standard_products',
        sa.Column('standard_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('standards.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('product_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('products.id', ondelete='CASCADE'), primary_key=True)
    )

    # Tenders
    op.create_table(
        'tenders',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('reference_number', sa.String(100), nullable=False, unique=True),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('department', sa.String(255), nullable=False),
        sa.Column('estimated_value', sa.Numeric(15, 2), nullable=True),
        sa.Column('status', sa.Enum('DRAFT', 'PUBLISHED', 'UNDER_REVIEW', 'COMPLIANT', 'NON_COMPLIANT', 'ARCHIVED', name='tenderstatus'), nullable=False),
        sa.Column('document_url', sa.String(500), nullable=True),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_by_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True)
    )

    # Compliance Profiles
    op.create_table(
        'compliance_profiles',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('tender_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('tenders.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('overall_score', sa.Float(), nullable=False, default=0.0),
        sa.Column('compliant_count', sa.Integer(), nullable=False, default=0),
        sa.Column('non_compliant_count', sa.Integer(), nullable=False, default=0),
        sa.Column('partial_compliant_count', sa.Integer(), nullable=False, default=0),
        sa.Column('summary_report', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True)
    )

    # Recommendations
    op.create_table(
        'recommendations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('compliance_profile_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('compliance_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('standard_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('standards.id', ondelete='SET NULL'), nullable=True),
        sa.Column('clause_reference', sa.String(100), nullable=False),
        sa.Column('finding', sa.Text(), nullable=False),
        sa.Column('risk_level', sa.Enum('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', name='risklevel'), nullable=False),
        sa.Column('suggested_action', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True)
    )

    # Audit Logs
    op.create_table(
        'audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('resource', sa.String(100), nullable=False),
        sa.Column('resource_id', sa.String(100), nullable=True),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.String(255), nullable=True),
        sa.Column('details', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True)
    )

    # Notifications
    op.create_table(
        'notifications',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('notification_type', sa.String(50), nullable=False, default='INFO'),
        sa.Column('is_read', sa.Boolean(), nullable=False, default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True)
    )


def downgrade() -> None:
    op.drop_table('notifications')
    op.drop_table('audit_logs')
    op.drop_table('recommendations')
    op.drop_table('compliance_profiles')
    op.drop_table('tenders')
    op.drop_table('standard_products')
    op.drop_table('products')
    op.drop_table('product_categories')
    op.drop_table('amendments')
    op.drop_table('standard_versions')
    op.drop_table('standards')
    op.drop_table('user_roles')
    op.drop_table('users')
    op.drop_table('role_permissions')
    op.drop_table('permissions')
    op.drop_table('roles')
    op.drop_table('organizations')
    op.execute('DROP TYPE standardstatus')
    op.execute('DROP TYPE certificationrequirement')
    op.execute('DROP TYPE tenderstatus')
    op.execute('DROP TYPE risklevel')
