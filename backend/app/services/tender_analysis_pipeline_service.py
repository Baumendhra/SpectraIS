import logging
import uuid
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.tender_analysis_schemas import TenderAnalysisSummary
from app.services.document_intelligence_service import DocumentIntelligencePipeline
from app.services.tender_understanding_service import TenderUnderstandingEngine
from app.services.standards_reference_detector import StandardsReferenceDetector
from app.services.gap_analysis_engine import GapAnalysisEngine
from app.services.compliance_scoring_framework import ComplianceScoringFramework
from app.services.risk_assessment_engine import RiskAssessmentEngine
from app.services.clause_recommendation_engine import ClauseRecommendationEngine
from app.services.tender_comparison_engine import TenderComparisonEngine
from app.repositories.audit_repository import AuditRepository

logger = logging.getLogger(__name__)


class TenderAnalysisPipelineService:
    """Master Pipeline Service executing full Tender Compliance Analysis."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.standards_detector = StandardsReferenceDetector(session)
        self.audit_repo = AuditRepository(session)

    async def analyze_tender_document(
        self,
        filename: str,
        file_bytes: bytes,
        user_id: Optional[str] = None
    ) -> TenderAnalysisSummary:
        tender_id = f"TND-{uuid.uuid4().hex[:8].upper()}"
        ref_num = f"REF-{uuid.uuid4().hex[:6].upper()}"

        logger.info(f"Starting tender analysis for file '{filename}' (ID: {tender_id})")

        # 1. Document Extraction
        doc_summary = DocumentIntelligencePipeline.process_document(filename, file_bytes)

        # 2. Tender Understanding
        understanding = await TenderUnderstandingEngine.analyze_tender(doc_summary)

        # 3. Standards Reference Detection
        detected_standards = await self.standards_detector.detect_references(doc_summary["raw_text"])

        # 4. Gap Analysis Engine
        gaps = GapAnalysisEngine.analyze_gaps(understanding, detected_standards)

        # 5. Transparent Compliance Scoring
        score_breakdown = ComplianceScoringFramework.calculate_score(gaps)

        # 6. Risk Assessment Engine
        risks = RiskAssessmentEngine.evaluate_risks(gaps, detected_standards)

        # 7. Ready-to-Use Clause Generator
        clauses = ClauseRecommendationEngine.generate_clauses(understanding)

        # 8. Tender Comparison & Heatmap Engine
        comparison = TenderComparisonEngine.compare_tender(understanding, gaps)

        # 9. Log Audit Trail
        if user_id:
            await self.audit_repo.log_action(
                action="TENDER_ANALYZED",
                resource="tenders",
                resource_id=tender_id,
                user_id=user_id,
                details={
                    "filename": filename,
                    "overall_score": score_breakdown.overall_score,
                    "gap_count": len(gaps),
                    "risk_count": len(risks)
                }
            )

        logger.info(f"Completed analysis for {tender_id}: Score {score_breakdown.overall_score}/100")

        return TenderAnalysisSummary(
            tender_id=tender_id,
            reference_number=ref_num,
            title=understanding.title,
            department=understanding.department,
            status="COMPLETED",
            overall_score=score_breakdown,
            understanding=understanding,
            detected_standards=detected_standards,
            gaps=gaps,
            risks=risks,
            recommended_clauses=clauses,
            comparison=comparison
        )
