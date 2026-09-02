import logging
import uuid
from typing import List, Dict, Any
from app.schemas.phase5_schemas import ImpactAnalysisResult, BISAmendmentUpdate

logger = logging.getLogger(__name__)


class AmendmentImpactAnalysisEngine:
    """Evaluates downstream impact of standard amendments on active tenders & compliance profiles."""

    @staticmethod
    def analyze_impact(notice: BISAmendmentUpdate) -> ImpactAnalysisResult:
        # Simulate scanning active tender repository
        affected_tenders = ["TND-89F12A", "TND-33C902"]
        affected_profiles_count = len(affected_tenders) * 3

        risk_level = "HIGH" if notice.amendment_number > 2 or "mandatory" in notice.summary_of_changes.lower() else "MEDIUM"

        action = (
            f"Amendment {notice.amendment_number} for {notice.is_number} impacts {len(affected_tenders)} active tenders. "
            f"Procurement officers must review technical clauses to incorporate updated parameters: '{notice.title}'."
        )

        impact_id = f"IMP-{uuid.uuid4().hex[:8].upper()}"

        return ImpactAnalysisResult(
            impact_id=impact_id,
            amendment_notice_id=notice.notice_id,
            is_number=notice.is_number,
            affected_profiles_count=affected_profiles_count,
            affected_tenders_count=len(affected_tenders),
            risk_level=risk_level,
            recommended_action=action,
            affected_tender_ids=affected_tenders
        )
