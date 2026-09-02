import logging
from typing import List
from app.schemas.phase7_schemas import MarketplacePlugin

logger = logging.getLogger(__name__)

MARKETPLACE_PLUGINS = [
    {"plugin_id": "PLG-BIS-AUTO", "name": "BIS Gazette Auto-Scraper Plugin", "category": "Integration", "provider": "SpectraIS Core Team", "version": "2.1.0", "rating": 4.9, "is_installed": True},
    {"plugin_id": "PLG-GEM-SYNC", "name": "GeM Direct API Connector", "category": "Integration", "provider": "Government e-Marketplace Team", "version": "1.8.4", "rating": 4.8, "is_installed": True},
    {"plugin_id": "PLG-NABL-VERIFY", "name": "NABL Lab Test Report Verification Plugin", "category": "Verification", "provider": "NABL Technical Council", "version": "1.2.0", "rating": 4.9, "is_installed": True},
    {"plugin_id": "PLG-ISO-MAPPER", "name": "ISO ↔ BIS International Standard Cross-Mapper", "category": "Compliance", "provider": "Global Standards Institute", "version": "3.0.1", "rating": 4.7, "is_installed": False}
]


class ProcurementMarketplaceService:
    """Developer API Marketplace & Third-Party Extension Platform."""

    @staticmethod
    def get_plugins() -> List[MarketplacePlugin]:
        return [MarketplacePlugin(**p) for p in MARKETPLACE_PLUGINS]
