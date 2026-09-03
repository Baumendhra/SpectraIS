import pytest
import asyncio
from app.core.database import AsyncSessionLocal
from app.services.requirement_understanding_service import RequirementUnderstandingEngine
from app.services.product_classification_service import ProductClassificationEngine
from app.services.recommendation_engine import StandardsRecommendationEngine


@pytest.mark.asyncio
async def test_requirement_understanding_engine():
    tender_text = (
        "Procurement of 120W LED Street Light Luminaires for municipal highway lighting. "
        "Must have minimum 10kV surge protection, IP66 weatherproof ingress protection rating, "
        "and conform strictly to IS 10322 (Part 5/Sec 3) and IS 16102. "
        "Bidder must be Class-I local supplier with at least 50% Make in India local content. "
        "Type test reports from NABL accredited lab mandatory under Ministry QCO."
    )

    spec = await RequirementUnderstandingEngine.extract_specification(tender_text)

    # 1. Product category and domain
    assert spec.product_category == "LED Street Light Luminaires"
    assert spec.domain == "Electrical"

    # 2. IS Citations extraction
    assert len(spec.detected_is_citations) >= 2
    assert any("10322" in c for c in spec.detected_is_citations)
    assert any("16102" in c for c in spec.detected_is_citations)

    # 3. Operational thresholds
    assert spec.operational_parameters.get("surge_protection_kv") == 10.0
    assert spec.operational_parameters.get("ingress_protection") == "IP66"

    # 4. Government mandates
    assert spec.make_in_india_percent == 50
    assert spec.qco_mandated is True
    assert spec.nabl_test_required is True


def test_product_classification_engine():
    # Test 1: LED Street Lights
    dummy_led_spec = RequirementUnderstandingEngine._deterministic_extraction(
        "Need procurement of LED street lights with 10kV surge protection per IS 10322"
    )
    classification = ProductClassificationEngine.classify_requirement(dummy_led_spec)

    assert classification.domain == "Electrical"
    assert "ETD 23" in (classification.sectional_committee or "")
    assert "8539" in (classification.suggested_hsn or "")
    assert classification.confidence_score >= 0.75

    # Test 2: Government Laptops
    dummy_laptop_spec = RequirementUnderstandingEngine._deterministic_extraction(
        "Supply of Core i7 Laptops and Notebook computers with 16GB RAM under CRS IS 13252"
    )
    it_classification = ProductClassificationEngine.classify_requirement(dummy_laptop_spec)

    assert it_classification.domain == "IT"
    assert "LITD 14" in (it_classification.sectional_committee or "")
    assert "8471" in (it_classification.suggested_hsn or "")


@pytest.mark.asyncio
async def test_standards_recommendation_engine_pipeline():
    tender_text = (
        "Procurement of Portable Laptop computers and Notebooks for government administration. "
        "Must be certified under Compulsory Registration Scheme (CRS) as per IS 13252(Part 1):2010. "
        "Complete safety type test certificate from NABL laboratory required."
    )

    async with AsyncSessionLocal() as session:
        engine = StandardsRecommendationEngine(session)
        profile = await engine.generate_recommendation_profile(tender_text)

        # Assertions
        assert profile.profile_id.startswith("PROF-")
        assert profile.domain in ["IT", "Electronics"]
        assert len(profile.recommendations) > 0

        # Check that IS 13252 was matched and grounded
        is_numbers = [r.is_number for r in profile.recommendations]
        assert any("13252" in is_num for is_num in is_numbers)

        # Check Government BOQ clauses and NABL schedule
        first_rec = profile.recommendations[0]
        assert first_rec.tender_boq_clause is not None
        assert "General Financial Rules (GFR) 2017" in first_rec.tender_boq_clause
        assert len(first_rec.nabl_testing_schedule) >= 3

        # Check QCO status and legal disclaimer
        assert profile.qco_enforced is True
        assert profile.statutory_disclaimer is not None
        assert "Bureau of Indian Standards Act 2016" in profile.statutory_disclaimer
