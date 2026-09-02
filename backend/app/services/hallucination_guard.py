import re
from typing import List, Dict, Any, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.standards import Standard


class HallucinationGuard:
    """Strict Hallucination Prevention & Registry Validation Guardrail for BIS Compliance AI."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def validate_response(
        self,
        llm_response_text: str,
        retrieved_chunks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Validates LLM output against the official PostgreSQL BIS Standards registry."""
        # 1. Extract all IS Numbers mentioned in response
        cited_is_numbers = list(set(re.findall(r"IS\s+\d+(?:\s*:\s*Part\s*\d+)?(?:\s*:\s*\d{4})?", llm_response_text, re.IGNORECASE)))
        retrieved_is_numbers = set(chunk.get("is_number", "") for chunk in retrieved_chunks)

        if not cited_is_numbers:
            return {
                "is_valid": True,
                "hallucination_detected": False,
                "verified_citations": [],
                "unverified_citations": [],
                "clean_text": llm_response_text
            }

        # 2. Check each cited IS number against PostgreSQL registry
        verified_citations = []
        unverified_citations = []

        for is_num in cited_is_numbers:
            # Query official DB
            stmt = select(Standard).where(Standard.is_number.ilike(f"%{is_num.strip()}%"))
            result = await self.session.execute(stmt)
            match = result.scalars().first()

            if match:
                verified_citations.append(match.is_number)
            else:
                unverified_citations.append(is_num)

        # 3. Handle hallucinations
        hallucination_detected = len(unverified_citations) > 0
        clean_text = llm_response_text

        if hallucination_detected:
            # Redact or flag unverified IS numbers in output
            for unverified in unverified_citations:
                clean_text = clean_text.replace(
                    unverified,
                    f"[FLAGGED: UNVERIFIED STANDARD '{unverified}']"
                )
            clean_text += "\n\n> ⚠️ **Compliance Note**: Some cited standard references could not be verified in the official BIS database and were flagged."

        return {
            "is_valid": not hallucination_detected,
            "hallucination_detected": hallucination_detected,
            "verified_citations": verified_citations,
            "unverified_citations": unverified_citations,
            "clean_text": clean_text
        }
