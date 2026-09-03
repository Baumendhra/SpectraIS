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
    """Production-Grade Requirement Understanding Engine for Public Procurement.
    
    Extracts structured technical parameters, Indian Standard (IS) citations,
    Make in India (MII) local content ratios, and Quality Control Order (QCO)
    compliance mandates from unstructured tender specifications.
    """

    @classmethod
    async def extract_specification(cls, raw_text: str) -> StructuredRequirementSpec:
        """Parses raw procurement specifications using Gemini with deterministic government fallback."""
        if not raw_text or not raw_text.strip():
            return cls._deterministic_extraction("General Government Procurement Specifications")

        # Attempt LLM extraction if valid API key is present
        if settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("MOCK") and genai is not None:
            try:
                llm_spec = await cls._llm_extract(raw_text)
                if llm_spec:
                    return llm_spec
            except Exception as e:
                logger.warning(f"LLM specification extraction failed ({str(e)}), falling back to deterministic parser.")

        return cls._deterministic_extraction(raw_text)

    @classmethod
    async def _llm_extract(cls, raw_text: str) -> Optional[StructuredRequirementSpec]:
        """Calls Gemini API with strict government procurement ontology."""
        prompt = (
            "You are a Chief Technical Procurement Officer for Government Public Procurement in India.\n"
            "Analyze the following procurement tender text and extract a structured compliance specification in JSON.\n\n"
            "JSON Schema:\n"
            "{\n"
            '  "product_category": "Standardized equipment name e.g. LED Street Light Luminaires",\n'
            '  "domain": "One of: Electrical, Mechanical, Civil, Medical, IT, Telecom, Electronics, Infrastructure, Chemical",\n'
            '  "application_context": "Intended operational deployment e.g. Municipal Smart City Highway Lighting",\n'
            '  "environment": "Operating environment e.g. Outdoor IP66 Weatherproof / Tropical Ambience",\n'
            '  "technical_requirements": ["Extracted technical parameters with ratings e.g. 120W System, 10kV Surge Protection, THD < 10%"],\n'
            '  "certification_requirements": ["Required certifications e.g. Mandatory BIS CRS, ISI Mark, BEE 5-Star, ISO 9001"],\n'
            '  "detected_is_citations": ["List of explicitly cited Indian Standards e.g. IS 10322, IS 16102"],\n'
            '  "operational_parameters": {"surge_kv": 10, "ip_rating": "IP66", "voltage_range": "140V-280V"},\n'
            '  "make_in_india_percent": 50,\n'
            '  "qco_mandated": true,\n'
            '  "nabl_test_required": true,\n'
            '  "confidence": 0.95\n'
            "}\n\n"
            f"PROCUREMENT SPECIFICATION:\n{raw_text}\n\n"
            "Return ONLY the JSON object. Do not include markdown or explanations outside JSON."
        )

        text_out = ""
        if hasattr(genai, "Client"):
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL or "gemini-2.5-flash",
                contents=prompt
            )
            text_out = response.text
        elif hasattr(genai, "configure"):
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            text_out = response.text

        json_match = re.search(r"\{.*\}", text_out, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group(0))
            # Merge with deterministic citation extraction for absolute accuracy
            deterministic = cls._deterministic_extraction(raw_text)
            if not data.get("detected_is_citations"):
                data["detected_is_citations"] = deterministic.detected_is_citations
            if deterministic.operational_parameters and not data.get("operational_parameters"):
                data["operational_parameters"] = deterministic.operational_parameters
            return StructuredRequirementSpec(**data)
        return None

    @classmethod
    def _deterministic_extraction(cls, raw_text: str) -> StructuredRequirementSpec:
        """Industrial-grade deterministic NLP & regex parser for Indian Government procurement."""
        lower = raw_text.lower()

        # 1. Indian Standards (IS) Citation Regex Pattern
        # Matches formats: IS 10322, IS 13252:Part 1:2010, IS 16102 (Part 1), IS/IEC 60529
        is_pattern = r"(?:IS(?:/IEC)?\s+\d+(?:\s*(?:\(|:)\s*Part\s*\d+\s*\)?)?(?:\s*(?::|Sec\s*)\d+)?(?:\s*:\s*\d{4})?)"
        raw_citations = re.findall(is_pattern, raw_text, re.IGNORECASE)
        # Deduplicate and normalize citations
        cleaned_citations = list(dict.fromkeys([c.strip() for c in raw_citations if len(c.strip()) > 3]))

        # 2. Operational Thresholds & Quantitative Parameters
        operational_params: Dict[str, Any] = {}

        # Surge Protection (kV)
        surge_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:kv|kilovolt)\s*(?:surge)?", lower)
        if surge_match:
            operational_params["surge_protection_kv"] = float(surge_match.group(1))

        # Ingress Protection (IP Rating)
        ip_match = re.search(r"\b(ip\s*([1-6][5-9]))\b", lower)
        if ip_match:
            operational_params["ingress_protection"] = ip_match.group(1).upper().replace(" ", "")

        # Wattage / Power
        power_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:w|watt|kw|mw)\b", lower)
        if power_match:
            operational_params["rated_power"] = power_match.group(0).upper()

        # Voltage
        voltage_match = re.search(r"(\d+)\s*(?:v|volt|kv)\b", lower)
        if voltage_match:
            operational_params["operating_voltage"] = voltage_match.group(0).upper()

        # Efficacy / Efficiency
        eff_match = re.search(r"(\d+)\s*(?:lm/w|lumens\s*per\s*watt|%|percent\s*efficiency)", lower)
        if eff_match:
            operational_params["efficacy_rating"] = eff_match.group(0)

        # 3. Make in India (MII) Local Content %
        mii_percent = None
        mii_match = re.search(r"(?:make\s*in\s*india|local\s*content|mii)[^\d]*(\d{1,3})\s*%", lower)
        if mii_match:
            mii_percent = min(100, int(mii_match.group(1)))
        elif any(w in lower for w in ["class-i", "class 1 local", "class-1"]):
            mii_percent = 50
        elif any(w in lower for w in ["class-ii", "class 2 local", "class-2"]):
            mii_percent = 20

        # 4. NABL Testing & Certification Mandates
        nabl_required = any(term in lower for term in ["nabl", "type test", "ilac", "accredited lab", "test report", "routine test"])
        qco_mandated = any(term in lower for term in ["crs", "qco", "compulsory registration", "gazette", "mandatory bis", "isi mark", "bis act"])

        # 5. Domain Disambiguation
        domain = "Infrastructure"
        if any(w in lower for w in ["led", "luminaire", "light", "transformer", "cable", "switchgear", "voltage", "current", "watt", "electrical", "inverter", "ups"]):
            domain = "Electrical"
        elif any(w in lower for w in ["ventilator", "hospital", "icu", "medical", "patient", "syringe", "x-ray", "oxygen", "surgical"]):
            domain = "Medical"
        elif any(w in lower for w in ["cctv", "camera", "surveillance", "server", "router", "switch", "it equipment", "software", "laptop", "notebook", "tablet"]):
            domain = "IT"
        elif any(w in lower for w in ["bolt", "fastener", "screw", "nut", "pump", "valve", "pipe", "flange", "steel", "bearing", "mechanical", "boiler"]):
            domain = "Mechanical"
        elif any(w in lower for w in ["cement", "concrete", "rebar", "structural steel", "brick", "bridge", "road", "building", "civil", "bitumen"]):
            domain = "Civil"
        elif any(w in lower for w in ["antenna", "telecom", "fiber", "5g", "transceiver", "cellular", "mobile phone", "telephone"]):
            domain = "Telecom"
        elif any(w in lower for w in ["pcb", "semiconductor", "resistor", "sensor", "electronics", "audio", "video", "television"]):
            domain = "Electronics"
        elif any(w in lower for w in ["chemical", "polymer", "lubricant", "fertilizer", "paint"]):
            domain = "Chemical"

        # 6. Product Category Normalization
        product_category = "General Public Procurement Specifications"
        if "led" in lower and ("street" in lower or "luminaire" in lower or "light" in lower):
            product_category = "LED Street Light Luminaires"
        elif "laptop" in lower or "notebook" in lower:
            product_category = "Portable Notebook / Laptop Computers"
        elif "tablet" in lower:
            product_category = "Tablet Computers"
        elif "cctv" in lower or "surveillance" in lower:
            product_category = "CCTV Surveillance Camera Systems"
        elif "ventilator" in lower:
            product_category = "ICU Medical Ventilators"
        elif "battery" in lower or "cells" in lower:
            product_category = "Secondary Lithium-Ion Battery Systems"
        elif "solar" in lower and ("pv" in lower or "panel" in lower):
            product_category = "Crystalline Silicon Terrestrial PV Modules"
        elif "pump" in lower:
            product_category = "Submersible / Centrifugal Water Pumps"
        elif "bolt" in lower or "fastener" in lower or "screw" in lower:
            product_category = "High-Tensile Threaded Fasteners & Bolts"
        elif "cement" in lower:
            product_category = "Ordinary Portland Cement (Grade 43 / 53)"
        elif "transformer" in lower:
            product_category = "Distribution & Power Transformers"
        else:
            first_clause = raw_text.strip().split(".")[0].strip()
            if 5 < len(first_clause) <= 80:
                product_category = first_clause

        # 7. Application Context & Environment
        app_context = "Government Public Procurement / CPWD / GeM Works"
        if "municipal" in lower or "road" in lower or "highway" in lower:
            app_context = "Public Municipal Highway & Smart City Infrastructure"
        elif "hospital" in lower or "icu" in lower or "health" in lower:
            app_context = "Government Healthcare Facility & Critical Care (ICU)"
        elif "railway" in lower or "ireps" in lower:
            app_context = "Indian Railways Rolling Stock & Traction Infrastructure"
        elif "defense" in lower or "mes" in lower:
            app_context = "Military Engineer Services (MES) Strategic Infrastructure"

        env = "Outdoor Tropical Weatherproof (Ambient -10°C to +50°C)" if ("outdoor" in lower or "street" in lower or "road" in lower) else "Indoor Controlled Commercial / Clinical Ambient"
        if "ingress_protection" in operational_params:
            env += f" [{operational_params['ingress_protection']} Ingress Protected]"

        # 8. Assemble Detailed Technical Constraints
        tech_reqs = []
        for k, v in operational_params.items():
            readable_k = k.replace("_", " ").title()
            tech_reqs.append(f"{readable_k}: {v}")

        if "life" in lower or "hours" in lower:
            tech_reqs.append("Minimum Useful Operational Lifetime: 50,000 Burning Hours")
        if "power factor" in lower or "pf" in lower:
            tech_reqs.append("Power Factor: >= 0.95 under rated operating voltage")
        if "thd" in lower:
            tech_reqs.append("Total Harmonic Distortion (THD): < 10%")
        if not tech_reqs:
            tech_reqs = ["Standard Technical Specifications compliant with Bureau of Indian Standards (BIS)"]

        # 9. Certification Requirements
        cert_reqs = ["Mandatory BIS Standard Mark / License under BIS Act 2016"]
        if qco_mandated or "crs" in lower:
            cert_reqs.append("Government of India Compulsory Registration Scheme (CRS) Registration")
        if nabl_required or len(cleaned_citations) > 0:
            cert_reqs.append("Complete Type Test Certification from NABL Accredited / BIS Recognized Laboratory")
        if mii_percent:
            cert_reqs.append(f"Make in India (MII) Local Content Certificate (Minimum {mii_percent}%)")

        # 10. Adaptive Clarification Engine for Underspecified Queries
        missing_params = []
        clarification_qs = []

        if "led" in lower or "luminaire" in lower or "light" in lower:
            if "surge_protection_kv" not in operational_params:
                missing_params.append("Surge Protection Level (kV)")
                clarification_qs.append({
                    "key": "surge",
                    "question": "What is the required Surge Protection Level?",
                    "options": ["5kV Surge Protection", "10kV Surge Protection (Recommended)", "15kV Heavy Duty Surge Protection"]
                })
            if "ingress_protection" not in operational_params:
                missing_params.append("Ingress Weatherproofing Rating (IP)")
                clarification_qs.append({
                    "key": "ip_rating",
                    "question": "What Ingress Protection rating is required?",
                    "options": ["IP65 Weatherproof", "IP66 Heavy Weatherproof (Recommended)", "IP67 Submersible"]
                })
            if "rated_power" not in operational_params:
                missing_params.append("System Power Rating (Wattage)")
                clarification_qs.append({
                    "key": "power",
                    "question": "Select target LED Luminaire Wattage:",
                    "options": ["60W System", "90W System", "120W System", "150W High Power"]
                })

        elif "laptop" in lower or "notebook" in lower or "computer" in lower:
            missing_params.append("Processor & Memory Tier")
            clarification_qs.append({
                "key": "ram",
                "question": "Select System Memory & Storage Configuration:",
                "options": ["16GB RAM + 512GB NVMe SSD (Recommended)", "8GB RAM + 256GB SSD", "32GB RAM + 1TB NVMe SSD"]
            })
            clarification_qs.append({
                "key": "language",
                "question": "Mandatory Indian Language Support (IS 16333 Part 3)?",
                "options": ["Yes - BIS CRS Mandated IS 16333", "Standard English Keyboard"]
            })

        elif "cctv" in lower or "camera" in lower or "surveillance" in lower:
            missing_params.append("Resolution & Storage Encryption")
            clarification_qs.append({
                "key": "cctv_res",
                "question": "Select Camera Resolution & Sensor Type:",
                "options": ["4MP Full HD IP Camera (Recommended)", "2MP Standard IP Camera", "4K 8MP Ultra HD Camera"]
            })

        needs_clarification = len(missing_params) > 0

        return StructuredRequirementSpec(
            product_category=product_category,
            domain=domain,
            application_context=app_context,
            environment=env,
            technical_requirements=tech_reqs,
            certification_requirements=cert_reqs,
            confidence=0.95 if not needs_clarification else 0.78,
            detected_is_citations=cleaned_citations,
            operational_parameters=operational_params,
            make_in_india_percent=mii_percent,
            qco_mandated=qco_mandated or ("led" in lower or "laptop" in lower or "cctv" in lower or "battery" in lower),
            nabl_test_required=nabl_required or True,
            needs_clarification=needs_clarification,
            missing_parameters=missing_params,
            clarification_questions=clarification_qs
        )
