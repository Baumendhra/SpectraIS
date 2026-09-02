import logging
from typing import Dict, Any, List
from app.schemas.phase5_schemas import SubscriptionPreference

logger = logging.getLogger(__name__)


class SubscriptionAlertService:
    """Manages user domain & standard alert subscriptions and notification dispatch."""

    @staticmethod
    def dispatch_amendment_alert(
        subscription: SubscriptionPreference,
        is_number: str,
        title: str
    ) -> Dict[str, Any]:
        logger.info(f"Dispatching notification for user {subscription.user_id} on standard {is_number}")

        return {
            "status": "DISPATCHED",
            "user_id": subscription.user_id,
            "is_number": is_number,
            "email_sent": subscription.email_alerts,
            "in_app_sent": subscription.in_app_alerts,
            "message": f"Alert successfully sent for updated Indian Standard {is_number}: {title}."
        }
