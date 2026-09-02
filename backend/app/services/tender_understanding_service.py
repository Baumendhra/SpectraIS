import logging
import json
import re
from typing import Dict, Any, Optional
from app.core.config import settings
from app.schemas.tender_analysis_schemas import TenderUnderstandingProfile

genai: Any = None
try:
    from google import genai  # type: ignore
except (ImportError, ModuleNotFoundError):
    try:
        import google.generativeai as genai  # type: ignore
    except (ImportError, ModuleNotFoundError):
        genai = None

logger = logging.getLogger(__name__)


class TenderUnderstandingEngine:
    """Extracts high-level tender understanding profile from document intelligence output."""

    @staticmethod
    async def analyze_tender(doc_summary: Dict[str, Any]) -> TenderUnderstandingProfile:
        raw_text = doc_summary.get("raw_text", "")
        filename = doc_summary.get("filename", "Tender Document")

        if settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("MOCK") and genai is not None:
            try:
                prompt = (
                    "Analyze the following procurement tender text and output a structured JSON summary.\n"
                    "JSON Format:\n"
                    "{\n"
                    '  "title": "Tender Title",\n'
                    '  "department": "Issuing Ministry or Municipal Department",\n'
                    '  "product_category": "Target product category e.g. LED Street Lights",\n'
                    '  "domain": "One of: Electrical, Mechanical, Civil, Medical, IT, Telecom, Electronics, Infrastructure",\n'
                    '  "scope_of_work": "Brief summary of scope",\n'
                    '  "technical_requirements": ["list of technical requirements"],\n'
                    '  "compliance_requirements": ["list of statutory/compliance requirements"],\n'
                    '  "certification_requirements": ["list of required certifications e.g. BIS CRS"],\n'
                    '  "testing_requirements": ["list of required laboratory tests"]\n'
                    "}\n\n"
                    f"TENDER TEXT EXCERPT:\n{raw_text[:4000]}\n"
                )

                if hasattr(genai, "Client"):
                    client = genai.Client(api_key=settings.GEMINI_API_KEY)
                    res = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
                    out_text = res.text
                elif hasattr(genai, "configure"):
                    genai.configure(api_key=settings.GEMINI_API_KEY)
                    model = genai.GenerativeModel("gemini-1.5-flash")
                    res = model.generate_content(prompt)
                    out_text = res.text
                else:
                    out_text = ""

                match = re.search(r"\{.*\}", out_text, re.DOTALL)
                if match:
                    parsed = json.loads(match.group(0))
                    return TenderUnderstandingProfile(**parsed)
            except Exception as e:
                logger.warning(f"LLM tender understanding failed ({str(e)}), using rule fallback.")

        return TenderUnderstandingEngine._fallback_understanding(filename, raw_text)

    @staticmethod
    def _fallback_understanding(filename: str, text: str) -> TenderUnderstandingProfile:
        lower_text = text.lower()

        domain = "Infrastructure"
        if any(w in lower_text for w in ["led", "light", "transformer", "cable", "electrical", "voltage"]):
            domain = "Electrical"
        elif any(w in lower_text for w in ["ventilator", "hospital", "icu", "medical", "patient"]):
            domain = "Medical"
        elif any(w in lower_text for w in ["cctv", "camera", "surveillance", "server", "it"]):
            domain = "IT"
        elif any(w in lower_text for w in ["bolt", "steel", "fastener", "mechanical", "pump"]):
            domain = "Mechanical"
        elif any(w in lower_text for w in ["cement", "concrete", "road", "civil", "building"]):
            domain = "Civil"

        title = filename.replace(".pdf", "").replace(".docx", "").replace("_", " ").title()
        if "led" in lower_text or "street" in lower_text:
            product_category = "LED Street Luminaires & Poles"
        elif "ventilator" in lower_text:
            product_category = "ICU Medical Ventilators"
        elif "cctv" in lower_text:
            product_category = "CCTV Surveillance System"
        else:
            product_category = "Procurement Hardware & Equipment"

        return TenderUnderstandingProfile(
            title=f"Procurement Specification for {product_category}",
            department="Municipal Corporation & Public Works Department",
            product_category=product_category,
            domain=domain,
            scope_of_work=f"Supply, installation, testing, and commissioning of {product_category} as per prescribed BIS specifications.",
            technical_requirements=[
                "Minimum operating lifetime 50,000 hours",
                "High efficiency power driver with >90% power factor",
                "Ingress Protection rating minimum IP66"
            ],
            compliance_requirements=[
                "Mandatory BIS Certification / CRS License Mark",
                "Compliance with Public Procurement (Make in India) Order"
            ],
            certification_requirements=[
                "BIS License Certificate under Compulsory Registration Scheme (CRS)",
                "ISO 9001 Quality Management Systems Certification"
            ],
            testing_requirements=[
                "Type test report from NABL accredited laboratory",
                "Surge protection test up to 10kV as per IS 16102 / IS 10322"
            ]
        )
