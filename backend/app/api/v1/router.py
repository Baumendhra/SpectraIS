from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.standards import router as standards_router
from app.api.v1.users import router as users_router
from app.api.v1.organizations import router as orgs_router
from app.api.v1.audit import router as audit_router
from app.api.v1.health import router as health_router
from app.api.v1.copilot import router as copilot_router, rag_router
from app.api.v1.copilot_v2 import router as copilot_v2_router
from app.api.v1.tenders_v2 import router as tenders_v2_router
from app.api.v1.phase5_router import router as phase5_router
from app.api.v1.phase6_router import router as phase6_router
from app.api.v1.phase7_router import router as phase7_router
from app.api.v1.ingestion import router as ingestion_router
from app.api.v1.knowledge_graph import router as graph_router

api_v1_router = APIRouter()

api_v1_router.include_router(health_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(standards_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(orgs_router)
api_v1_router.include_router(audit_router)
api_v1_router.include_router(copilot_router)
api_v1_router.include_router(rag_router)
api_v1_router.include_router(copilot_v2_router)
api_v1_router.include_router(tenders_v2_router)
api_v1_router.include_router(phase5_router)
api_v1_router.include_router(phase6_router)
api_v1_router.include_router(phase7_router)
api_v1_router.include_router(ingestion_router)
api_v1_router.include_router(graph_router)
