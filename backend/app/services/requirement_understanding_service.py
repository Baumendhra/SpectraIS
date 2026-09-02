import logging
import json
import re
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.schemas.copilot_schemas import StructuredRequirementSpec

genai: Any = None
try:
    from google import genai  # type: ignore
except (ImportError, ModuleNotFoundError):
    try:
        import google.generativeai as genai  # type: ignore
    except (ImportError, ModuleNotFoundError):
        genai = None

logger = logging.getLogger(__name__)


class RequirementUnderstandingEngine:
    """Converts unstructured procurement text/specifications into structured profiles."""

    @staticmethod
    async def extract_specification(raw_text: str) -> StructuredRequirementSpec:
        """Parses raw text and extracts structured procurement parameters."""
        if not raw_text or not raw_text.strip():
            return RequirementUnderstandingEngine._fallback_extraction("General Equipment")

        if settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("MOCK") and genai is not None:
            try:
                system_prompt = (
                    "You are a Principal AI Procurement Architect for Government Procurement.\n"
                    "Extract structured requirements from the user's procurement text into JSON.\n"
                    "JSON Structure:\n"
                    "{\n"
                    '  "product_category": "Extracted main product e.g. LED Street Lights",\n'
                    '  "domain": "One of: Electrical, Mechanical, Civil, Medical, IT, Telecom, Electronics, Infrastructure",\n'
                    '  "application_context": "Intended usage e.g. Municipal road lighting",\n'
                    '  "environment": "Operating environment e.g. Outdoor IP66 or Indoor ICU",\n'
                    '  "technical_requirements": ["list of technical constraints e.g. Wattage 120W, Surge 10kV"],\n'
                    '  "certification_requirements": ["list of required certifications e.g. BIS CRS, ISO 9001"],\n'
                    '  "confidence": 0.95\n'
                    "}\n"
                    "Return ONLY valid JSON."
                )

                prompt = f"{system_prompt}\n\nPROCUREMENT INPUT: {raw_text}"
                
                if hasattr(genai, "Client"):
                    client = genai.Client(api_key=settings.GEMINI_API_KEY)
                    response = client.models.generate_content(
                        model="gemini-2.5-flash",
                        contents=prompt
                    )
                    text_out = response.text
                elif hasattr(genai, "configure"):
                    genai.configure(api_key=settings.GEMINI_API_KEY)
                    model = genai.GenerativeModel("gemini-1.5-flash")
                    response = model.generate_content(prompt)
                    text_out = response.text
                else:
                    text_out = ""

                json_match = re.search(r"\{.*\}", text_out, re.DOTALL)
                if json_match:
                    parsed = json.loads(json_match.group(0))
                    return StructuredRequirementSpec(**parsed)

            except Exception as e:
                logger.warning(f"LLM specification extraction failed ({str(e)}), using rule-based parsing.")

        return RequirementUnderstandingEngine._fallback_extraction(raw_text)

    @staticmethod
    def _fallback_extraction(raw_text: str) -> StructuredRequirementSpec:
        """Rule-based heuristic extraction fallback when LLM API is unavailable."""
        lower_text = raw_text.lower()

        # Domain Heuristics
        domain = "Infrastructure"
        if any(w in lower_text for w in ["led", "light", "transformer", "cable", "switchgear", "voltage", "current", "electrical"]):
            domain = "Electrical"
        elif any(w in lower_text for w in ["ventilator", "hospital", "icu", "medical", "patient", "syringe", "x-ray"]):
            domain = "Medical"
        elif any(w in lower_text for w in ["cctv", "camera", "surveillance", "server", "router", "switch", "it", "software"]):
            domain = "IT"
        elif any(w in lower_text for w in ["bolt", "fastener", "pump", "valve", "pipe", "steel", "flange", "mechanical"]):
            domain = "Mechanical"
        elif any(w in lower_text for w in ["cement", "concrete", "bridge", "road", "building", "civil", "structure"]):
            domain = "Civil"
        elif any(w in lower_text for w in ["antenna", "telecom", "fiber", "5g", "transceiver"]):
            domain = "Telecom"
        elif any(w in lower_text for w in ["pcb", "semiconductor", "resistor", "sensor", "electronics"]):
            domain = "Electronics"

        # Product Category Extraction
        product_category = raw_text.strip().split(".")[0][:60]
        if "led" in lower_text and "street" in lower_text:
            product_category = "LED Street Lights"
        elif "ventilator" in lower_text:
            product_category = "ICU Medical Ventilator"
        elif "cctv" in lower_text or "camera" in lower_text:
            product_category = "CCTV Surveillance Camera"

        # Application & Environment
        app_context = "Government Public Infrastructure & Procurement"
        if "municipal" in lower_text or "road" in lower_text:
            app_context = "Municipal Road Infrastructure & Public Lighting"
        elif "icu" in lower_text or "hospital" in lower_text:
            app_context = "Critical Healthcare & Intensive Care Unit (ICU)"
        elif "smart city" in lower_text or "surveillance" in lower_text:
            app_context = "Smart City Urban Surveillance Network"

        env = "Outdoor Outdoor Weatherproof / IP65+" if "street" in lower_text or "surveillance" in lower_text else "Indoor Clinical / Controlled Environment"

        # Technical Requirements Extraction
        tech_reqs = []
        if "surge" in lower_text or "10kv" in lower_text:
            tech_reqs.append("Surge Protection minimum 10kV")
        if "ip" in lower_text or "weatherproof" in lower_text:
            tech_reqs.append("Minimum IP66 Ingress Protection Rating")
        if "life" in lower_text or "hours" in lower_text:
            tech_reqs.append("Minimum Operational Life 50,000 Hours")
        if not tech_reqs:
            tech_reqs = ["Standard Technical Specifications under Bureau of Indian Standards (BIS)"]

        cert_reqs = ["Mandatory BIS Certification / License Mark", "NABL Accredited Test Laboratory Report"]

        return StructuredRequirementSpec(
            product_category=product_category,
            domain=domain,
            application_context=app_context,
            environment=env,
            technical_requirements=tech_reqs,
            certification_requirements=cert_reqs,
            confidence=0.88
        )
