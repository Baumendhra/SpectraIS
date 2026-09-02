import logging
import uuid
from typing import List, Dict, Any
from app.schemas.tender_analysis_schemas import GapAnalysisItem, TenderUnderstandingProfile, DetectedStandardRef

logger = logging.getLogger(__name__)


class GapAnalysisEngine:
    """Compares Tender Specification vs Expected BIS Compliance Profile to identify gaps."""

    @staticmethod
    def analyze_gaps(
        understanding: TenderUnderstandingProfile,
        detected_standards: List[DetectedStandardRef]
    ) -> List[GapAnalysisItem]:
        gaps = []

        # 1. Outdated Standards Check
        outdated = [s for s in detected_standards if s.status_in_kb == "OUTDATED"]
        for s in outdated:
            gaps.append(
                GapAnalysisItem(
                    gap_id=f"GAP-{uuid.uuid4().hex[:6].upper()}",
                    category="Standard",
                    description=f"Tender references outdated standard '{s.is_number}'.",
                    impact="Legal vulnerability & non-conformance with current BIS Quality Control Orders (QCO).",
                    severity="High",
                    missing_requirement=f"Current valid standard {s.recommended_version or 'latest IS edition'}",
                    recommended_clause=f"Replace '{s.is_number}' with '{s.recommended_version}' across tender specification clauses."
                )
            )

        # 2. Missing Mandatory CRS Certification Check
        raw_tech_text = f"{understanding.scope_of_work} {' '.join(understanding.technical_requirements)}".lower()
        if "crs" not in raw_tech_text and "compulsory registration" not in raw_tech_text:
            gaps.append(
                GapAnalysisItem(
                    gap_id=f"GAP-{uuid.uuid4().hex[:6].upper()}",
                    category="Certification",
                    description="Tender lacks explicit BIS Compulsory Registration Scheme (CRS) mandatory license requirement.",
                    impact="Risk of receiving uncertified gray-market or non-compliant imported hardware.",
                    severity="Critical",
                    missing_requirement="Mandatory BIS CRS Registration Certificate & License Mark",
                    recommended_clause="The bidder must possess a valid BIS CRS Registration License for all supplied items under Ministry rules."
                )
            )

        # 3. Missing Environmental / Ingress Testing Check
        if "ip66" not in raw_tech_text and "testing" not in raw_tech_text:
            gaps.append(
                GapAnalysisItem(
                    gap_id=f"GAP-{uuid.uuid4().hex[:6].upper()}",
                    category="Testing",
                    description="Tender specification lacks mandatory NABL-accredited Ingress Protection (IP66/IP67) test report requirements.",
                    impact="Early equipment failure due to dust and water ingress in harsh outdoor environments.",
                    severity="Medium",
                    missing_requirement="NABL Accredited IP66 Ingress Protection & 10kV Surge Protection Test Report",
                    recommended_clause="All luminaires must undergo type testing at a NABL-accredited laboratory for IP66 and 10kV surge protection."
                )
            )

        # 4. Missing Safety & Thermal Protection Check
        if "thermal" not in raw_tech_text and "shock" not in raw_tech_text:
            gaps.append(
                GapAnalysisItem(
                    gap_id=f"GAP-{uuid.uuid4().hex[:6].upper()}",
                    category="Safety",
                    description="Tender lacks electrical shock protection and thermal cutoff safety specifications.",
                    impact="Fire hazards and electrical shock risks during operation and maintenance.",
                    severity="High",
                    missing_requirement="Thermal Cut-off & Electrical Insulation Class II Protection under IS 10322",
                    recommended_clause="Luminaires must feature auto-resetting thermal cut-off switches and Class II electrical insulation."
                )
            )

        # 5. Missing Pre-Dispatch Factory Audit Check
        if "pre-dispatch" not in raw_tech_text and "factory audit" not in raw_tech_text:
            gaps.append(
                GapAnalysisItem(
                    gap_id=f"GAP-{uuid.uuid4().hex[:6].upper()}",
                    category="Documentation",
                    description="Tender omits mandatory Pre-Dispatch Inspection (PDI) and Factory Acceptance Test (FAT) clauses.",
                    impact="Delivery of defective batches without pre-dispatch quality verification.",
                    severity="Medium",
                    missing_requirement="Pre-Dispatch Inspection (PDI) Certificate & Joint Factory Inspection",
                    recommended_clause="Material shall be dispatched only after issuing a clean Joint Pre-Dispatch Inspection (PDI) Certificate."
                )
            )

        return gaps
