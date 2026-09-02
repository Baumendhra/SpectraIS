import uuid
import re
from typing import List, Dict, Any
from app.models.rag import SectionType


class BISChunkingService:
    """Enterprise chunking engine for BIS Standards."""

    @staticmethod
    def chunk_document(
        parsed_doc: Dict[str, Any],
        domain: str = "General Engineering",
        category: str = "Standards Specifications",
        max_chunk_chars: int = 1000,
        overlap_chars: int = 150
    ) -> List[Dict[str, Any]]:
        is_number = parsed_doc.get("is_number", "UNKNOWN_IS")
        title = parsed_doc.get("title", "")
        sections = parsed_doc.get("sections", [])

        chunks = []

        for sec in sections:
            sec_type = sec.get("section_type", "REQUIREMENTS")
            content = sec.get("content", "")

            # Break content into smaller overlapping blocks
            paragraphs = re.split(r"\n\s*\n", content)
            current_chunk = ""
            clause_ref = "Clause 1.0"

            for para in paragraphs:
                para = para.strip()
                if not para:
                    continue

                # Detect clause number if present (e.g. 4.1.2 or Clause 5.3)
                clause_match = re.match(r"^(\d+(?:\.\d+)*)\s+", para)
                if clause_match:
                    clause_ref = f"Clause {clause_match.group(1)}"

                if len(current_chunk) + len(para) > max_chunk_chars:
                    if current_chunk:
                        chunk_id = str(uuid.uuid4())
                        chunks.append({
                            "chunk_id": chunk_id,
                            "is_number": is_number,
                            "title": title,
                            "domain": domain,
                            "category": category,
                            "section_type": sec_type,
                            "clause_ref": clause_ref,
                            "content": current_chunk.strip()
                        })
                        # Keep overlap
                        current_chunk = current_chunk[-overlap_chars:] + " " + para
                    else:
                        current_chunk = para
                else:
                    current_chunk += "\n\n" + para if current_chunk else para

            if current_chunk.strip():
                chunks.append({
                    "chunk_id": str(uuid.uuid4()),
                    "is_number": is_number,
                    "title": title,
                    "domain": domain,
                    "category": category,
                    "section_type": sec_type,
                    "clause_ref": clause_ref,
                    "content": current_chunk.strip()
                })

        return chunks
