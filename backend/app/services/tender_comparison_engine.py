import logging
from typing import List
from app.schemas.tender_analysis_schemas import TenderComparisonResult, ComparisonRow, TenderUnderstandingProfile, GapAnalysisItem

logger = logging.getLogger(__name__)


class TenderComparisonEngine:
    """Builds side-by-side comparison matrix between Current Tender Specs vs Ideal BIS Compliance Profile."""

    @staticmethod
    def compare_tender(
        understanding: TenderUnderstandingProfile,
        gaps: List[GapAnalysisItem]
    ) -> TenderComparisonResult:
        rows = [
            ComparisonRow(
                parameter="BIS Standard Reference",
                tender_specification=f"References general IS specifications for {understanding.product_category}",
                ideal_bis_standard="IS 10322 : Part 5 / Sec 1 : 2012 (Latest Edition)",
                compliance_status="NON_COMPLIANT" if any(g.category == "Standard" for g in gaps) else "COMPLIANT",
                risk_indicator="HIGH" if any(g.category == "Standard" for g in gaps) else "LOW"
            ),
            ComparisonRow(
                parameter="Compulsory BIS CRS Registration",
                tender_specification="Unspecified / General Manufacturer Quality License",
                ideal_bis_standard="Mandatory Valid BIS CRS License Number & Self-Declaration Mark",
                compliance_status="MISSING" if any(g.category == "Certification" for g in gaps) else "COMPLIANT",
                risk_indicator="CRITICAL" if any(g.category == "Certification" for g in gaps) else "LOW"
            ),
            ComparisonRow(
                parameter="Ingress Protection (Weatherproofing)",
                tender_specification="Weatherproof / IP Rating unspecified",
                ideal_bis_standard="IP66 Minimum Ingress Protection under IS 12063 with NABL Test Report",
                compliance_status="PARTIAL" if any(g.category == "Testing" for g in gaps) else "COMPLIANT",
                risk_indicator="MEDIUM" if any(g.category == "Testing" for g in gaps) else "LOW"
            ),
            ComparisonRow(
                parameter="High Voltage Surge Protection",
                tender_specification="Standard internal surge suppressor",
                ideal_bis_standard="10kV High Voltage Surge Withstand Protection under IS 16102",
                compliance_status="PARTIAL" if any(g.category == "Testing" for g in gaps) else "COMPLIANT",
                risk_indicator="MEDIUM" if any(g.category == "Testing" for g in gaps) else "LOW"
            ),
            ComparisonRow(
                parameter="Electrical Shock & Thermal Protection",
                tender_specification="Standard insulation",
                ideal_bis_standard="Class II Double Insulation & Auto Thermal Cut-off Switch under IS 10322",
                compliance_status="NON_COMPLIANT" if any(g.category == "Safety" for g in gaps) else "COMPLIANT",
                risk_indicator="HIGH" if any(g.category == "Safety" for g in gaps) else "LOW"
            ),
            ComparisonRow(
                parameter="Pre-Dispatch Inspection (PDI)",
                tender_specification="Factory test certificate on delivery",
                ideal_bis_standard="Joint Pre-Dispatch Inspection (PDI) at Manufacturer Works by Auditor",
                compliance_status="MISSING" if any(g.category == "Documentation" for g in gaps) else "COMPLIANT",
                risk_indicator="MEDIUM" if any(g.category == "Documentation" for g in gaps) else "LOW"
            )
        ]

        return TenderComparisonResult(
            tender_title=understanding.title,
            product_category=understanding.product_category,
            domain=understanding.domain,
            comparison_matrix=rows,
            overall_gap_count=len(gaps)
        )
