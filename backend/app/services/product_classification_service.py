import logging
from typing import List, Dict, Any, Tuple
from app.schemas.copilot_schemas import DomainClassificationResult, StructuredRequirementSpec

logger = logging.getLogger(__name__)

VALID_DOMAINS = [
    "Electrical",
    "Mechanical",
    "Civil",
    "Medical",
    "IT",
    "Telecom",
    "Electronics",
    "Infrastructure"
]

DOMAIN_KEYWORDS: Dict[str, List[str]] = {
    "Electrical": ["led", "luminaire", "light", "transformer", "cable", "switchgear", "voltage", "current", "watt", "power", "electrical", "wiring", "insulation", "conductor"],
    "Mechanical": ["bolt", "fastener", "screw", "nut", "pump", "valve", "pipe", "flange", "steel", "gear", "bearing", "turbine", "engine", "mechanical", "boiler"],
    "Civil": ["cement", "concrete", "rebar", "structural steel", "brick", "bitumen", "bridge", "road", "building", "civil", "aggregate", "mortar"],
    "Medical": ["ventilator", "icu", "hospital", "medical", "patient monitor", "syringe", "x-ray", "oximeter", "stretcher", "surgical", "implants"],
    "IT": ["cctv", "camera", "surveillance", "server", "router", "switch", "firewall", "storage", "laptop", "desktop", "software", "ups", "cloud"],
    "Telecom": ["antenna", "transceiver", "fiber optic", "telecom", "5g", "radio", "cellular", "multiplexer", "satellite"],
    "Electronics": ["pcb", "semiconductor", "microcontroller", "resistor", "capacitor", "diode", "sensor", "display", "integrated circuit"],
    "Infrastructure": ["smart city", "waste management", "water treatment", "solar plant", "highway", "port", "airport", "urban transit"]
}


class ProductClassificationEngine:
    """Classifies procurement specifications into the 8 core engineering domains with confidence scoring."""

    @staticmethod
    def classify_requirement(spec: StructuredRequirementSpec) -> DomainClassificationResult:
        """Classifies structured spec using keyword frequency vector scoring and domain mapping."""
        search_text = f"{spec.product_category} {spec.domain} {spec.application_context} {spec.environment} {' '.join(spec.technical_requirements)}".lower()

        scores: Dict[str, float] = {d: 0.0 for d in VALID_DOMAINS}

        # 1. Base Domain match
        if spec.domain in VALID_DOMAINS:
            scores[spec.domain] += 5.0

        # 2. Keyword Frequency Scoring
        for domain, keywords in DOMAIN_KEYWORDS.items():
            for kw in keywords:
                if kw in search_text:
                    scores[domain] += 1.5

        # Sort domains by score
        sorted_domains = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        top_domain, top_score = sorted_domains[0]
        second_domain, second_score = sorted_domains[1]

        total_score = sum(scores.values()) + 0.01
        confidence = min(0.98, max(0.65, top_score / (total_score * 0.5 + 2.0)))

        secondary = [second_domain] if second_score > 1.5 else []

        reasoning = (
            f"Classified as '{top_domain}' based on strong domain keyword matches ({spec.product_category}) "
            f"with a confidence score of {confidence:.2f}."
        )

        return DomainClassificationResult(
            domain=top_domain,
            confidence_score=round(confidence, 3),
            reasoning=reasoning,
            secondary_domains=secondary
        )
