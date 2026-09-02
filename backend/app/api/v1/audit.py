from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.guards import require_roles
from app.models.auth import User
from app.repositories.audit_repository import AuditRepository
from app.schemas.common import ResponseSchema

router = APIRouter(prefix="/audit-logs", tags=["Audit & Compliance Logs"])


@router.get("", response_model=ResponseSchema[List[dict]])
async def get_audit_logs(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "AUDITOR"]))
):
    """Retrieve audit and compliance logs (AUDITOR / SUPER_ADMIN)."""
    repo = AuditRepository(session)
    logs = await repo.get_recent_logs(limit=50)
    data = [
        {
            "id": str(log.id),
            "user_id": str(log.user_id) if log.user_id else None,
            "action": log.action,
            "resource": log.resource,
            "resource_id": log.resource_id,
            "created_at": log.created_at.isoformat(),
            "details": log.details
        }
        for log in logs
    ]
    return ResponseSchema(data=data)
