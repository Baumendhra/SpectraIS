import pytest
from app.services.chunking_service import BISChunkingService
from app.services.embedding_service import EmbeddingService
from app.services.hallucination_guard import HallucinationGuard


def test_bis_chunking_service():
    mock_parsed_doc = {
        "is_number": "IS 1363 : Part 1 : 2019",
        "title": "Hexagon Head Bolts",
        "sections": [
            {
                "section_type": "SCOPE",
                "content": "This standard specifies technical supply conditions for Product Grade C hexagon head bolts."
            },
            {
                "section_type": "REQUIREMENTS",
                "content": "Clause 4.1 All bolts shall be manufactured from high quality carbon steel with zinc coating."
            }
        ]
    }

    chunks = BISChunkingService.chunk_document(
        parsed_doc=mock_parsed_doc,
        domain="Mechanical Engineering & Fasteners",
        category="Fasteners & Industrial Hardware"
    )

    assert len(chunks) == 2
    assert chunks[0]["is_number"] == "IS 1363 : Part 1 : 2019"
    assert chunks[0]["section_type"] == "SCOPE"
    assert "hexagon head bolts" in chunks[0]["content"].lower()


def test_embedding_generation():
    sample_text = "Mandatory certification requirement under BIS IS 2062 structural steel."
    vector = EmbeddingService.generate_embedding(sample_text)

    assert len(vector) == 768
    # Verify unit length normalization
    norm = sum(x * x for x in vector)
    assert abs(norm - 1.0) < 1e-4
