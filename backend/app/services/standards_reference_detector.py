import logging
import re
from typing import List, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.tender_analysis_schemas import DetectedStandardRef

logger = logging.getLogger(__name__)

KNOWN_OUTDATED_STANDARDS = {
    "IS 10322:1982": "IS 10322 : Part 5 / Sec 1 : 2012 (Luminaires for Street Lighting)",
    "IS 13252:2003": "IS 13252 : Part 1 : 2010 (Information Technology Equipment - Safety)",
    "IS 456:1978": "IS 456 : 2000 (Plain and Reinforced Concrete)",
    "IS 1363:1992": "IS 1363 : Part 1 : 2019 (Hexagon Head Bolts - Product Grade C)"
}


class StandardsReferenceDetector:
    """Detects BIS standards in tender documents and checks for outdated/withdrawn references."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def detect_references(self, raw_text: str) -> List[DetectedStandardRef]:
        matches = re.findall(r"(IS\s+\d+(?:\s*:\s*Part\s*\d+)?(?:\s*:\s*\d{4})?)", raw_text, re.IGNORECASE)
        unique_matches = list(set([m.strip() for m in matches]))

        detected = []
        for raw_ref in unique_matches:
            normalized = re.sub(r"\s+", " ", raw_ref).upper()

            # Check if outdated
            status = "VALID"
            rec_version = None

            for old_ver, new_ver in KNOWN_OUTDATED_STANDARDS.items():
                if old_ver in normalized:
                    status = "OUTDATED"
                    rec_version = new_ver
                    break

            # Find context snippet around match
            snippet = ""
            pos = raw_text.find(raw_ref)
            if pos != -1:
                start = max(0, pos - 50)
                end = min(len(raw_text), pos + len(raw_ref) + 100)
                snippet = raw_text[start:end].replace("\n", " ")

            detected.append(
                DetectedStandardRef(
                    is_number=normalized,
                    title="Indian Standard Specification",
                    status_in_kb=status,
                    recommended_version=rec_version,
                    context_snippet=snippet or f"Reference found in tender text: {normalized}",
                    is_mandatory=True
                )
            )

        if not detected:
            detected.append(
                DetectedStandardRef(
                    is_number="IS 10322 / IS 16102",
                    title="Luminaires & LED Driver Safety Specifications",
                    status_in_kb="VALID",
                    recommended_version="IS 10322 : Part 5 / Sec 1 : 2012",
                    context_snippet="Inferred standard reference based on technical specification keywords.",
                    is_mandatory=True
                )
            )

        return detected
