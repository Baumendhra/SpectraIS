import pytest
from app.schemas.copilot_schemas import StructuredRequirementSpec
from app.services.requirement_understanding_service import RequirementUnderstandingEngine
from app.services.product_classification_service import ProductClassificationEngine
from app.services.confidence_scoring_service import ConfidenceScoringEngine
from app.services.compliance_profile_builder import ComplianceProfileBuilder
from app.services.evaluation_service import EvaluationFramework


@pytest.mark.asyncio
async def test_requirement_understanding():
    text = "Procurement of LED street lights for municipal highway lighting with 10kV surge protection."
    spec = await RequirementUnderstandingEngine.extract_specification(text)
    
    assert "LED" in spec.product_category or "Luminaire" in spec.product_category or "Street" in spec.product_category
    assert spec.domain in ["Electrical", "Infrastructure"]
    assert spec.confidence > 0.5


def test_product_classification():
    spec = StructuredRequirementSpec(
        product_category="ICU Medical Ventilator",
        domain="Medical",
        application_context="Intensive Care Unit Patient Support",
        environment="Indoor Clinical",
        technical_requirements=["Oxygen Sensor", "PEEP Control"],
        certification_requirements=["BIS CRS License"],
        confidence=0.9
    )
    result = ProductClassificationEngine.classify_requirement(spec)
    
    assert result.domain == "Medical"
    assert result.confidence_score >= 0.65


def test_confidence_scoring_and_profile_builder():
    spec = StructuredRequirementSpec(
        product_category="CCTV Camera System",
        domain="IT",
        application_context="Smart City Surveillance",
        environment="Outdoor IP66",
        technical_requirements=["1080p Resolution", "Night Vision IR"],
        certification_requirements=["IS 13252 Compliance"],
        confidence=0.9
    )
    classification = ProductClassificationEngine.classify_requirement(spec)
    
    chunks = [
        {
            "id": "chunk-1",
            "is_number": "IS 13252 : Part 1 : 2010",
            "title": "Information Technology Equipment - Safety",
            "clause_ref": "Clause 4.2",
            "section_type": "REQUIREMENTS",
            "content": "Mandatory safety requirements for electronic IT equipment.",
            "domain": "IT",
            "score": 0.89,
            "source": "vector"
        }
    ]
    
    confidence = ConfidenceScoringEngine.calculate_confidence(spec, classification, chunks)
    assert confidence.overall_confidence in ["High", "Medium", "Low"]
    assert confidence.numeric_score > 0.5
    
    profile = ComplianceProfileBuilder.build_profile(spec, classification, confidence, chunks)
    assert profile.product_category == "CCTV Camera System"
    assert len(profile.recommendations) == 1
    assert profile.recommendations[0].is_number == "IS 13252 : Part 1 : 2010"


def test_evaluation_framework():
    summary = EvaluationFramework.run_benchmark_eval()
    assert summary.total_samples > 0
    assert summary.precision >= 0.8
    assert summary.hallucination_rate == 0.0
    assert summary.passed_benchmark is True
