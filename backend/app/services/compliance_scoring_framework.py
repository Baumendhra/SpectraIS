import logging
from typing import List
from app.schemas.tender_analysis_schemas import ComplianceScoreBreakdown, GapAnalysisItem

logger = logging.getLogger(__name__)


class ComplianceScoringFramework:
    """Computes a transparent 0-100 overall tender compliance score across 5 weighted categories."""

    @staticmethod
    def calculate_score(gaps: List[GapAnalysisItem]) -> ComplianceScoreBreakdown:
        # Base Sub-scores
        standards_score = 100.0
        cert_score = 100.0
        testing_score = 100.0
        safety_score = 100.0
        doc_score = 100.0

        # Deductions based on Gap Severity
        for gap in gaps:
            deduction = 25.0 if gap.severity == "Critical" else (15.0 if gap.severity == "High" else 10.0)

            if gap.category == "Standard":
                standards_score = max(0.0, standards_score - deduction)
            elif gap.category == "Certification":
                cert_score = max(0.0, cert_score - deduction)
            elif gap.category == "Testing":
                testing_score = max(0.0, testing_score - deduction)
            elif gap.category == "Safety":
                safety_score = max(0.0, safety_score - deduction)
            elif gap.category == "Documentation":
                doc_score = max(0.0, doc_score - deduction)

        # Weighted Sum (0-100)
        overall = (
            (0.30 * standards_score) +
            (0.25 * cert_score) +
            (0.20 * testing_score) +
            (0.15 * safety_score) +
            (0.10 * doc_score)
        )
        overall = round(overall, 1)

        # Grade Assignment
        if overall >= 90.0:
            grade = "A+"
        elif overall >= 80.0:
            grade = "A"
        elif overall >= 70.0:
            grade = "B"
        elif overall >= 60.0:
            grade = "C"
        else:
            grade = "F"

        explainability = (
            f"Tender achieved a Compliance Score of {overall}/100 (Grade {grade}). "
            f"Standards Subscore: {standards_score:.0f}%, Certification: {cert_score:.0f}%, "
            f"Testing: {testing_score:.0f}%, Safety: {safety_score:.0f}%, Documentation: {doc_score:.0f}%. "
            f"Identified {len(gaps)} compliance gaps requiring mitigation."
        )

        return ComplianceScoreBreakdown(
            overall_score=overall,
            grade=grade,
            standards_score=round(standards_score, 1),
            certification_score=round(cert_score, 1),
            testing_score=round(testing_score, 1),
            safety_score=round(safety_score, 1),
            documentation_score=round(doc_score, 1),
            explainability=explainability
        )
