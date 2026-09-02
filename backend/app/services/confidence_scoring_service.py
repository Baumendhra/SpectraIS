import logging
from typing import List, Dict, Any
from app.schemas.copilot_schemas import ConfidenceScoreDetails, StructuredRequirementSpec, DomainClassificationResult

logger = logging.getLogger(__name__)


class ConfidenceScoringEngine:
    """Computes multi-factor confidence scores for procurement recommendations."""

    @staticmethod
    def calculate_confidence(
        spec: StructuredRequirementSpec,
        classification: DomainClassificationResult,
        retrieved_chunks: List[Dict[str, Any]]
    ) -> ConfidenceScoreDetails:
        """Formula:
        Score = 0.40 * Vector Similarity + 0.25 * Classification Confidence + 0.20 * Metadata Match + 0.15 * Graph Topology
        """
        # 1. Vector Similarity Score
        if retrieved_chunks:
            scores = [c.get("score", 0.75) for c in retrieved_chunks]
            vector_score = min(1.0, max(0.5, sum(scores) / len(scores)))
        else:
            vector_score = 0.50

        # 2. Classification Confidence
        class_score = classification.confidence_score

        # 3. Metadata Match Score
        domain_matches = sum(1 for c in retrieved_chunks if c.get("domain", "").lower() == spec.domain.lower())
        metadata_score = min(1.0, (domain_matches / max(1, len(retrieved_chunks))) + 0.3)

        # 4. Graph Topology Score
        graph_matches = sum(1 for c in retrieved_chunks if c.get("source") == "knowledge_graph")
        graph_score = 0.85 if graph_matches > 0 else 0.70

        # Weighted Sum Calculation
        numeric_score = (
            (0.40 * vector_score) +
            (0.25 * class_score) +
            (0.20 * metadata_score) +
            (0.15 * graph_score)
        )
        numeric_score = round(numeric_score, 3)

        # Bucket Mapping
        if numeric_score >= 0.82:
            overall_confidence = "High"
        elif numeric_score >= 0.65:
            overall_confidence = "Medium"
        else:
            overall_confidence = "Low"

        breakdown = {
            "vector_similarity_weight": 0.40,
            "vector_similarity_score": round(vector_score, 3),
            "classification_confidence_weight": 0.25,
            "classification_confidence_score": round(class_score, 3),
            "metadata_match_weight": 0.20,
            "metadata_match_score": round(metadata_score, 3),
            "graph_topology_weight": 0.15,
            "graph_topology_score": round(graph_score, 3)
        }

        return ConfidenceScoreDetails(
            overall_confidence=overall_confidence,
            numeric_score=numeric_score,
            vector_similarity_score=round(vector_score, 3),
            classification_confidence=round(class_score, 3),
            metadata_match_score=round(metadata_score, 3),
            graph_topology_score=round(graph_score, 3),
            scoring_breakdown=breakdown
        )
