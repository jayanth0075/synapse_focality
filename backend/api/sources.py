import json
from typing import List, Literal
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from backend.services.connectors import GoogleWorkspaceService
from backend.database import get_db_connection, log_audit_event
from backend.models.domain import SourceConnector, ReviewQueueItem
from backend.config import settings

router = APIRouter(prefix="/sources", tags=["sources"])

class ResolveMergeRequest(BaseModel):
    action: Literal["merged", "rejected"]

@router.get("", response_model=List[SourceConnector])
@router.get("/connectors", response_model=List[SourceConnector])
def list_connectors(tenant_id: str = settings.DEFAULT_TENANT_ID):
    return GoogleWorkspaceService.get_connectors(tenant_id)

@router.post("/{connector_id}/sync")
@router.post("/connectors/{connector_id}/sync")
def sync_connector(connector_id: str, tenant_id: str = settings.DEFAULT_TENANT_ID):
    return GoogleWorkspaceService.sync_connector(connector_id, tenant_id)

@router.get("/review-queue", response_model=List[ReviewQueueItem])
def list_review_queue(tenant_id: str = settings.DEFAULT_TENANT_ID):
    with get_db_connection() as conn:
        rows = conn.execute("SELECT * FROM review_queue WHERE tenant_id = ? ORDER BY timestamp DESC", [tenant_id]).fetchall()
        return [
            ReviewQueueItem(
                id=r["id"],
                type=r["type"],
                confidence=r["confidence"],
                timestamp=r["timestamp"],
                entityA=json.loads(r["entity_a_json"]),
                entityB=json.loads(r["entity_b_json"]),
                conflictFields=json.loads(r["conflict_fields_json"] or "[]"),
                status=r["status"]
            )
            for r in rows
        ]

@router.post("/review-queue/{review_id}/approve")
def approve_review_item(review_id: str, tenant_id: str = settings.DEFAULT_TENANT_ID):
    return resolve_review_item(review_id, ResolveMergeRequest(action="merged"), tenant_id)

@router.post("/review-queue/{review_id}/reject")
def reject_review_item(review_id: str, tenant_id: str = settings.DEFAULT_TENANT_ID):
    return resolve_review_item(review_id, ResolveMergeRequest(action="rejected"), tenant_id)

@router.post("/review-queue/{review_id}/resolve")
def resolve_review_item(review_id: str, body: ResolveMergeRequest, tenant_id: str = settings.DEFAULT_TENANT_ID):
    with get_db_connection() as conn:
        row = conn.execute("SELECT * FROM review_queue WHERE id = ? AND tenant_id = ?", (review_id, tenant_id)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Review item not found")
        
        conn.execute("UPDATE review_queue SET status = ? WHERE id = ? AND tenant_id = ?", (body.action, review_id, tenant_id))

    log_audit_event(
        actor="HumanReviewer",
        action=f"ENTITY_MERGE_{body.action.upper()}",
        resource_type="ReviewQueue",
        resource_id=review_id,
        details=f"Entity resolution resolved as: {body.action}",
        tenant_id=tenant_id
    )

    return {"status": "success", "reviewId": review_id, "resolution": body.action}
