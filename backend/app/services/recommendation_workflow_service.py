import logging
import uuid
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.copilot_schemas import OfficerReviewRequest
from app.repositories.audit_repository import AuditRepository

logger = logging.getLogger(__name__)


class RecommendationWorkflowService:
    """Manages Procurement Officer review lifecycle: Accept, Reject, Modify, and Audit Trail."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.audit_repo = AuditRepository(session)

    async def process_officer_review(
        self,
        review_req: OfficerReviewRequest,
        officer_id: str
    ) -> Dict[str, Any]:
        """Records officer approval decision in immutable audit log."""
        action_name = f"RECOMMENDATION_{review_req.review_status}"

        await self.audit_repo.log_action(
            action=action_name,
            resource="compliance_profiles",
            resource_id=review_req.profile_id,
            user_id=officer_id,
            details={
                "profile_id": review_req.profile_id,
                "review_status": review_req.review_status,
                "officer_notes": review_req.officer_notes or "No notes provided.",
                "has_modified_recommendations": review_req.modified_recommendations is not None
            }
        )

        logger.info(f"Recorded officer review decision '{review_req.review_status}' for profile {review_req.profile_id}")

        return {
            "status": "SUCCESS",
            "profile_id": review_req.profile_id,
            "review_status": review_req.review_status,
            "message": f"Recommendation profile review successfully logged as {review_req.review_status}."
        }
