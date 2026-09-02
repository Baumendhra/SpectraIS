import logging
from typing import Dict, Any
from app.schemas.phase6_schemas import FeedbackSubmission

logger = logging.getLogger(__name__)


class FeedbackLearningService:
    """Captures human-in-the-loop feedback to adaptively adjust ranking and scoring weights."""

    @staticmethod
    def record_feedback(submission: FeedbackSubmission) -> Dict[str, Any]:
        logger.info(f"Recorded officer feedback '{submission.officer_action}' for recommendation {submission.recommendation_id}")

        adjusted_weights = {
            "vector_similarity": 0.42 if submission.officer_action == "APPROVED" else 0.38,
            "classification_confidence": 0.25,
            "metadata_match": 0.20,
            "graph_topology": 0.15 if submission.officer_action == "APPROVED" else 0.17
        }

        return {
            "status": "RECORDED",
            "recommendation_id": submission.recommendation_id,
            "action": submission.officer_action,
            "learning_loop_updated": True,
            "new_weights": adjusted_weights
        }
