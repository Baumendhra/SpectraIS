import re
import io
from typing import Dict, Any, List, Optional
from pypdf import PdfReader
import logging

logger = logging.getLogger(__name__)


class BISDocumentParser:
    """Production-grade parser for Bureau of Indian Standards (BIS) documents."""

    @staticmethod
    def parse_pdf(file_bytes: bytes) -> Dict[str, Any]:
        """Parses a raw PDF file and extracts metadata, sections, and clause structure."""
        reader = PdfReader(io.BytesIO(file_bytes))
        extracted_text = ""
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            extracted_text += f"\n--- Page {i+1} ---\n" + page_text

        # Regex patterns for metadata detection
        is_number_match = re.search(r"(IS\s+\d+(?:\s*:\s*Part\s*\d+)?(?:\s*:\s*\d{4})?)", extracted_text, re.IGNORECASE)
        is_number = is_number_match.group(1).strip() if is_number_match else "UNKNOWN_IS_NUMBER"

        title_match = re.search(r"Indian Standard\s*\n+([^\n]+)", extracted_text, re.IGNORECASE)
        title = title_match.group(1).strip() if title_match else "Extracted BIS Standard Specification"

        # Extract sections using heading matching
        sections = BISDocumentParser._extract_sections(extracted_text)

        return {
            "is_number": is_number,
            "title": title,
            "raw_text": extracted_text,
            "page_count": len(reader.pages),
            "sections": sections
        }

    @staticmethod
    def _extract_sections(full_text: str) -> List[Dict[str, Any]]:
        """Splits full text into logical sections based on BIS standard formatting rules."""
        section_patterns = {
            "SCOPE": r"(?:1\s+SCOPE|SCOPE)(.*?)(?=2\s+NORMATIVE|2\s+REFERENCES|3\s+TERMINOLOGY|3\s+DEFINITIONS|$)",
            "DEFINITIONS": r"(?:3\s+TERMINOLOGY|3\s+DEFINITIONS)(.*?)(?=4\s+REQUIREMENTS|4\s+MATERIALS|$)",
            "REQUIREMENTS": r"(?:4\s+REQUIREMENTS|4\s+MANUFACTURE|4\s+TECHNICAL)(.*?)(?=5\s+TESTING|5\s+SAMPLING|6\s+MARKING|$)",
            "TESTING": r"(?:5\s+TESTING|5\s+TEST\s+METHODS|SAMPLING)(.*?)(?=6\s+MARKING|7\s+PACKAGING|ANNEX|$)",
            "CERTIFICATION": r"(?:6\s+MARKING|BIS\s+CERTIFICATION|7\s+CERTIFICATION)(.*?)(?=ANNEX|ANNEXURE|$)",
            "ANNEXURES": r"(?:ANNEX|ANNEXURE)(.*)"
        }

        sections = []
        for sec_type, pattern in section_patterns.items():
            match = re.search(pattern, full_text, re.DOTALL | re.IGNORECASE)
            if match:
                content = match.group(1).strip()
                if len(content) > 20:
                    sections.append({
                        "section_type": sec_type,
                        "content": content
                    })

        # Fallback if specific section headings not found
        if not sections:
            sections.append({
                "section_type": "REQUIREMENTS",
                "content": full_text[:4000]
            })

        return sections
