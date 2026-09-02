import logging
import re
from typing import Dict, Any, List
from app.services.pdf_parser import BISDocumentParser
from app.services.docx_parser import DOCXDocumentParser

logger = logging.getLogger(__name__)


class DocumentIntelligencePipeline:
    """Document Intelligence Engine for parsing, sectioning, and extracting tender text."""

    @staticmethod
    def process_document(filename: str, file_bytes: bytes) -> Dict[str, Any]:
        lower_name = filename.lower()

        if lower_name.endswith(".pdf"):
            parsed = BISDocumentParser.parse_pdf(file_bytes)
            raw_text = parsed["raw_text"]
            page_count = parsed.get("page_count", 1)
        elif lower_name.endswith(".docx"):
            parsed = DOCXDocumentParser.parse_docx(file_bytes)
            raw_text = parsed["raw_text"]
            page_count = parsed.get("page_count", 1)
        else:
            parsed = DOCXDocumentParser.parse_txt(file_bytes)
            raw_text = parsed["raw_text"]
            page_count = parsed.get("page_count", 1)

        sections = DocumentIntelligencePipeline._classify_sections(raw_text)

        return {
            "filename": filename,
            "char_count": len(raw_text),
            "page_count": page_count,
            "raw_text": raw_text,
            "sections": sections
        }

    @staticmethod
    def _classify_sections(full_text: str) -> List[Dict[str, Any]]:
        sections = []

        patterns = {
            "TECHNICAL_SPECIFICATIONS": r"(?:TECHNICAL SPECIFICATIONS|SCOPE OF WORK|PRODUCT SPECIFICATION)(.*?)(?=QUALIFICATION|ELIGIBILITY|COMPLIANCE|FINANCIAL|$)",
            "QUALIFICATION_CRITERIA": r"(?:QUALIFICATION|ELIGIBILITY CRITERIA|BIDDER QUALIFICATION)(.*?)(?=COMPLIANCE|TESTING|PAYMENT|$)",
            "COMPLIANCE_CLAUSES": r"(?:COMPLIANCE|STANDARDS|STATUTORY REQUIREMENTS)(.*?)(?=TESTING|SAFETY|INSPECTION|$)",
            "TESTING_MANDATES": r"(?:TESTING|TEST REPORTS|LABORATORY|SAMPLING)(.*?)(?=SAFETY|INSPECTION|WARRANTY|$)",
            "SAFETY_REQUIREMENTS": r"(?:SAFETY|PROTECTION|FIRE|HAZARD)(.*?)(?=WARRANTY|PENALTY|DELIVERY|$)"
        }

        for sec_name, pattern in patterns.items():
            match = re.search(pattern, full_text, re.DOTALL | re.IGNORECASE)
            if match:
                content = match.group(1).strip()
                if len(content) > 30:
                    sections.append({
                        "section_name": sec_name,
                        "content": content[:3000]
                    })

        if not sections:
            sections.append({
                "section_name": "TECHNICAL_SPECIFICATIONS",
                "content": full_text[:4000]
            })

        return sections
