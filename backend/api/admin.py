import json
from typing import List, Dict, Any
from fastapi import APIRouter
from backend.database import get_db_connection
from backend.models.domain import UserSession
from backend.config import settings

from backend.graph.neo4j_client import Neo4jAuraClient

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/overview")
def get_overview_metrics(tenant_id: str = settings.DEFAULT_TENANT_ID) -> Dict[str, Any]:
    with get_db_connection() as conn:
        project_count = conn.execute("SELECT COUNT(*) as cnt FROM projects WHERE tenant_id = ?", [tenant_id]).fetchone()["cnt"]
        node_count = conn.execute("SELECT COUNT(*) as cnt FROM nodes WHERE tenant_id = ?", [tenant_id]).fetchone()["cnt"]
        edge_count = conn.execute("SELECT COUNT(*) as cnt FROM edges WHERE tenant_id = ?", [tenant_id]).fetchone()["cnt"]
        alert_count = conn.execute("SELECT COUNT(*) as cnt FROM foresight_alerts WHERE tenant_id = ? AND status = 'active'", [tenant_id]).fetchone()["cnt"]
        review_count = conn.execute("SELECT COUNT(*) as cnt FROM review_queue WHERE tenant_id = ? AND status = 'pending'", [tenant_id]).fetchone()["cnt"]
        doc_count = conn.execute("SELECT COUNT(*) as cnt FROM documents WHERE tenant_id = ?", [tenant_id]).fetchone()["cnt"]

        neo4j_info = Neo4jAuraClient.verify_connectivity()

        return {
            "projectCount": project_count,
            "nodeCount": node_count,
            "edgeCount": edge_count,
            "activeAlertCount": alert_count,
            "pendingReviewCount": review_count,
            "documentCount": doc_count,
            "systemStatus": "healthy",
            "langGraphEngine": "online",
            "temporalGraphEngine": "online",
            "databaseTier": "SQLite (ACID / WAL Mode)",
            "graphDbTier": "Neo4j Aura Cloud" if neo4j_info["connected"] else "Neo4j Aura (Configurable)",
            "neo4jStatus": neo4j_info
        }

@router.get("/neo4j/status")
def get_neo4j_status():
    return Neo4jAuraClient.verify_connectivity()


@router.get("/users", response_model=List[UserSession])
def list_users(tenant_id: str = settings.DEFAULT_TENANT_ID):
    with get_db_connection() as conn:
        rows = conn.execute("SELECT * FROM users WHERE tenant_id = ?", [tenant_id]).fetchall()
        return [
            UserSession(
                id=r["id"],
                name=r["name"],
                role=r["role"],
                email=r["email"],
                avatar=r["avatar"],
                tenantName="Artisan Systems (Production)",
                tenantId=r["tenant_id"],
                acls=json.loads(r["acls_json"] or '["all"]')
            )
            for r in rows
        ]

@router.get("/tenants")
def list_tenants():
    with get_db_connection() as conn:
        rows = conn.execute("SELECT * FROM tenants").fetchall()
        return [dict(r) for r in rows]

@router.post("/reset-seed")
def reset_seed():
    from backend.services.seed_data import seed_database
    seed_database(force=True)
    return {"status": "success", "message": "Database successfully reset and re-seeded"}

@router.get("/audit-logs")
def list_audit_logs(limit: int = 50, tenant_id: str = settings.DEFAULT_TENANT_ID):
    with get_db_connection() as conn:
        rows = conn.execute("SELECT * FROM audit_logs WHERE tenant_id = ? ORDER BY timestamp DESC LIMIT ?", (tenant_id, limit)).fetchall()
        return [dict(r) for r in rows]
