import logging
from typing import Dict, Any
from app.schemas.phase7_schemas import CommandCenterMultiViewData

logger = logging.getLogger(__name__)


class NationalCommandCenterService:
    """Provides multi-level Strategic Command Center views: Ministry, State, National, Regulator."""

    @staticmethod
    def get_command_view(view_type: str = "NATIONAL") -> CommandCenterMultiViewData:
        view_upper = view_type.upper()

        if view_upper == "MINISTRY":
            title = "Central Ministry Procurement Intelligence Command"
            score = 88.5
            tenders = 4250
            high_risk = 8
            top_entities = [
                {"entity_name": "Ministry of Health & Family Welfare", "pqi_score": 91.2},
                {"entity_name": "Ministry of Power & Energy", "pqi_score": 88.4},
                {"entity_name": "Ministry of Housing & Urban Affairs", "pqi_score": 84.1}
            ]
        elif view_upper == "STATE":
            title = "State Government Procurement Compliance Command"
            score = 81.2
            tenders = 8900
            high_risk = 24
            top_entities = [
                {"entity_name": "Maharashtra PWD & Urban Development", "pqi_score": 86.0},
                {"entity_name": "Karnataka Public Infrastructure Board", "pqi_score": 84.5},
                {"entity_name": "Tamil Nadu e-Procurement Cell", "pqi_score": 82.8}
            ]
        elif view_upper == "REGULATOR":
            title = "BIS Quality Control & Regulatory Audit Command"
            score = 84.0
            tenders = 14200
            high_risk = 42
            top_entities = [
                {"entity_name": "Bureau of Indian Standards Quality Audit", "pqi_score": 95.0},
                {"entity_name": "Central Vigilance Commission Audit", "pqi_score": 92.0}
            ]
        else: # NATIONAL
            title = "National Procurement Operating System Command Center"
            score = 84.2
            tenders = 14200
            high_risk = 12
            top_entities = [
                {"entity_name": "Ministry of Health & Family Welfare", "pqi_score": 91.2},
                {"entity_name": "Maharashtra PWD", "pqi_score": 86.0},
                {"entity_name": "Smart City Infrastructure Division", "pqi_score": 85.5}
            ]

        heatmap = {
            "Maharashtra": 86.0,
            "Karnataka": 84.5,
            "Tamil Nadu": 82.8,
            "Gujarat": 85.2,
            "Delhi NCR": 89.1,
            "Uttar Pradesh": 79.4
        }

        return CommandCenterMultiViewData(
            view_type=view_upper,
            title=title,
            compliance_health_score=score,
            active_tenders_monitored=tenders,
            high_risk_alerts_count=high_risk,
            top_performing_entities=top_entities,
            regional_heatmap_data=heatmap
        )
