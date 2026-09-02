import logging
import uuid
from typing import List
from app.schemas.tender_analysis_schemas import RiskAssessmentItem, GapAnalysisItem, DetectedStandardRef

logger = logging.getLogger(__name__)


class RiskAssessmentEngine:
    """Evaluates procurement risks across Legal, Quality, Certification, Testing, and Procurement categories."""

    @staticmethod
    def evaluate_risks(
        gaps: List[GapAnalysisItem],
        detected_standards: List[DetectedStandardRef]
    ) -> List[RiskAssessmentItem]:
        risks = []

        # 1. Check for Outdated Standards (Legal & Quality Risk)
        outdated = [s for s in detected_standards if s.status_in_kb == "OUTDATED"]
        if outdated:
            risks.append(
                RiskAssessmentItem(
                    risk_id=f"RISK-{uuid.uuid4().hex[:6].upper()}",
                    category="Legal Risk",
                    title="Outdated BIS Standard Reference",
                    description=f"Tender references {len(outdated)} outdated Indian Standard(s). May violate BIS Quality Control Orders.",
                    severity="High",
                    mitigation_strategy="Update all references in tender documents to the latest Gazette-notified Indian Standard editions."
                )
            )

        # 2. Check for Certification Gaps (Certification Risk)
        cert_gaps = [g for g in gaps if g.category == "Certification"]
        if cert_gaps:
            risks.append(
                RiskAssessmentItem(
                    risk_id=f"RISK-{uuid.uuid4().hex[:6].upper()}",
                    category="Certification Risk",
                    title="Missing Mandatory BIS CRS Certification Mandate",
                    description="Tender does not require valid BIS CRS registration certificates from bidders.",
                    severity="Critical",
                    mitigation_strategy="Add mandatory requirement for valid BIS CRS Registration License Number in technical bid submission."
                )
            )

        # 3. Check for Testing Gaps (Testing Risk)
        test_gaps = [g for g in gaps if g.category == "Testing"]
        if test_gaps:
            risks.append(
                RiskAssessmentItem(
                    risk_id=f"RISK-{uuid.uuid4().hex[:6].upper()}",
                    category="Testing Risk",
                    title="Missing NABL Laboratory Ingress & Surge Test Requirements",
                    description="No requirement for NABL-accredited test reports for IP66 weatherproofing and 10kV surge protection.",
                    severity="Medium",
                    mitigation_strategy="Mandate type-test reports from NABL accredited laboratories issued within the last 24 months."
                )
            )

        # 4. Check for Safety Gaps (Quality Risk)
        safety_gaps = [g for g in gaps if g.category == "Safety"]
        if safety_gaps:
            risks.append(
                RiskAssessmentItem(
                    risk_id=f"RISK-{uuid.uuid4().hex[:6].upper()}",
                    category="Quality Risk",
                    title="Omission of Electrical Safety & Thermal Protection Clauses",
                    description="Lacks thermal cutoff and shock protection specifications under IS 10322.",
                    severity="High",
                    mitigation_strategy="Insert mandatory IS 10322 Part 5 electrical insulation and thermal protection clause into tender specification."
                )
            )

        # 5. Default Procurement Risk if score is good
        if not risks:
            risks.append(
                RiskAssessmentItem(
                    risk_id=f"RISK-{uuid.uuid4().hex[:6].upper()}",
                    category="Procurement Risk",
                    title="Low Overall Procurement Compliance Risk",
                    description="Tender document adheres closely to prescribed Bureau of Indian Standards (BIS) specifications.",
                    severity="Low",
                    mitigation_strategy="Perform standard Pre-Dispatch Inspection (PDI) prior to final batch release."
                )
            )

        return risks
