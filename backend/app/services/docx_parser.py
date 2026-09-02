import logging
import io
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class DOCXDocumentParser:
    """Parses Word (.docx) and plain text (.txt) tender documents."""

    @staticmethod
    def parse_docx(file_bytes: bytes) -> Dict[str, Any]:
        extracted_text = ""
        try:
            import docx  # type: ignore
            doc = docx.Document(io.BytesIO(file_bytes))
            extracted_text = "\n".join([p.text for p in doc.paragraphs if p.text])
        except Exception as e:
            logger.warning(f"python-docx parse failed ({str(e)}), falling back to raw string decoding.")
            extracted_text = file_bytes.decode("utf-8", errors="ignore")

        return {
            "raw_text": extracted_text,
            "char_count": len(extracted_text),
            "page_count": max(1, len(extracted_text) // 2000)
        }

    @staticmethod
    def parse_txt(file_bytes: bytes) -> Dict[str, Any]:
        text = file_bytes.decode("utf-8", errors="ignore")
        return {
            "raw_text": text,
            "char_count": len(text),
            "page_count": max(1, len(text) // 2000)
        }
