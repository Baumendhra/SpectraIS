import logging
from typing import List, Dict, Any
from app.schemas.phase7_schemas import NationalKnowledgeGraphNode

logger = logging.getLogger(__name__)

GRAPH_NODES = [
    {"node_id": "NODE-STD-10322", "node_type": "Standard", "name": "IS 10322 : Part 5 / Sec 1 : 2012", "connected_edges_count": 142, "properties": {"domain": "Electrical", "status": "ACTIVE"}},
    {"node_id": "NODE-PROD-LED", "node_type": "Product", "name": "LED Outdoor Street Luminaires", "connected_edges_count": 89, "properties": {"hs_code": "85395000", "category": "Lighting"}},
    {"node_id": "NODE-SUPP-SURYA", "node_type": "Supplier", "name": "Surya Luminaires Pvt Ltd", "connected_edges_count": 34, "properties": {"crs_status": "VALID", "pqi_rating": "96.5"}},
    {"node_id": "NODE-ORG-PWD", "node_type": "Organization", "name": "Public Works Department (PWD)", "connected_edges_count": 512, "properties": {"state": "Maharashtra", "tenders_count": 630}},
    {"node_id": "NODE-TND-89F12A", "node_type": "Tender", "name": "LED Street Light Procurement", "connected_edges_count": 18, "properties": {"score": 72.5, "status": "COMPLETED"}},
    {"node_id": "NODE-CERT-CRS", "node_type": "Certification", "name": "BIS Compulsory Registration Scheme (CRS)", "connected_edges_count": 1250, "properties": {"issuing_body": "BIS"}},
    {"node_id": "NODE-AMD-AZ3", "node_type": "Amendment", "name": "Amendment 3 to IS 10322", "connected_edges_count": 14, "properties": {"date": "2026-08-15"}},
    {"node_id": "NODE-RSK-OUTDATED", "node_type": "Risk", "name": "Outdated Standard Reference Risk", "connected_edges_count": 45, "properties": {"severity": "HIGH"}}
]


class NationalKnowledgeGraphService:
    """Queries the National Procurement Knowledge Graph 2.0 (8 Node Types)."""

    @staticmethod
    def get_nodes() -> List[NationalKnowledgeGraphNode]:
        return [NationalKnowledgeGraphNode(**n) for n in GRAPH_NODES]
