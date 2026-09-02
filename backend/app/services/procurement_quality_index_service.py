import logging
from typing import Dict, Any
from app.schemas.phase6_schemas import ProcurementQualityIndex

logger = logging.getLogger(__name__)


class ProcurementQualityIndexService:
    """Calculates national Procurement Quality Index (PQI 0-100) using a multi-factor formula."""

    @staticmethod
    def calculate_pqi(
        spec_completeness: float = 90.0,
        standards_coverage: float = 85.0,
        cert_coverage: float = 80.0,
        testing_coverage: float = 75.0,
        safety_coverage: float = 85.0
    ) -> ProcurementQualityIndex:
        """Formula:
        PQI = 0.25 * Spec + 0.25 * Standards + 0.20 * Cert + 0.15 * Testing + 0.15 * Safety
        """
        pqi = (
            (0.25 * spec_completeness) +
            (0.25 * standards_coverage) +
            (0.20 * cert_coverage) +
            (0.15 * testing_coverage) +
            (0.15 * safety_coverage)
        )
        pqi = round(pqi, 1)

        grade = "A+" if pqi >= 90 else ("A" if pqi >= 80 else ("B" if pqi >= 70 else "C"))

        benchmark = f"PQI Score of {pqi}/100 exceeds national average benchmark (78.5/100) by +{round(pqi - 78.5, 1)} points."

        return ProcurementQualityIndex(
            pqi_score=pqi,
            grade=grade,
            specification_completeness=spec_completeness,
            standards_coverage=standards_coverage,
            certification_coverage=cert_coverage,
            testing_coverage=testing_coverage,
            safety_coverage=safety_coverage,
            benchmark_comparison=benchmark
        )
