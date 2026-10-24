import json
import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from backend.database import get_db_connection, log_audit_event
from backend.models.domain import ForesightAlert, FeedbackRequest
from backend.workflows.foresight_graph import foresight_workflow
from backend.config import settings

router = APIRouter(prefix="/foresight", tags=["foresight"])

def row_to_alert(r) -> ForesightAlert:
    return ForesightAlert(
        id=r["id"],
        title=r["title"],
        severity=r["severity"],
        similarityScore=r["similarity_score"],
        triggerItem=r["trigger_item"],
        category=r["category"],
        createdAt=r["created_at"],
        status=r["status"],
        feedbackStatus=r["feedback_status"],
        summary=r["summary"],
        evidenceChain=json.loads(r["evidence_chain_json"] or "[]"),
        recommendedAction=r["recommended_action"]
    )

@router.get("/alerts", response_model=List[ForesightAlert])
def list_alerts(status: Optional[str] = None, tenant_id: str = settings.DEFAULT_TENANT_ID):
    with get_db_connection() as conn:
        query = "SELECT * FROM foresight_alerts WHERE tenant_id = ?"
        params = [tenant_id]
        if status:
            query += " AND status = ?"
            params.append(status)
        rows = conn.execute(query, params).fetchall()
        return [row_to_alert(r) for r in rows]

@router.post("/alerts/{alert_id}/feedback")
def submit_alert_feedback(alert_id: str, body: FeedbackRequest, tenant_id: str = settings.DEFAULT_TENANT_ID):
    with get_db_connection() as conn:
        row = conn.execute("SELECT * FROM foresight_alerts WHERE id = ? AND tenant_id = ?", (alert_id, tenant_id)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Alert not found")
        conn.execute("UPDATE foresight_alerts SET feedback_status = ? WHERE id = ? AND tenant_id = ?", (body.feedback, alert_id, tenant_id))

    log_audit_event(
        actor="Operator",
        action="ALERT_FEEDBACK",
        resource_type="ForesightAlert",
        resource_id=alert_id,
        details=f"Feedback set to: {body.feedback}. Weight calibrated for precedent.",
        tenant_id=tenant_id
    )
    return {"status": "success", "alertId": alert_id, "feedback": body.feedback}

@router.post("/alerts/{alert_id}/dismiss")
def dismiss_alert(alert_id: str, tenant_id: str = settings.DEFAULT_TENANT_ID):
    with get_db_connection() as conn:
        row = conn.execute("SELECT * FROM foresight_alerts WHERE id = ? AND tenant_id = ?", (alert_id, tenant_id)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Alert not found")
        conn.execute("UPDATE foresight_alerts SET status = 'dismissed' WHERE id = ? AND tenant_id = ?", (alert_id, tenant_id))

    log_audit_event(
        actor="Operator",
        action="DISMISS_ALERT",
        resource_type="ForesightAlert",
        resource_id=alert_id,
        details="Dismissed alert from active feed.",
        tenant_id=tenant_id
    )
    return {"status": "success", "alertId": alert_id, "newStatus": "dismissed"}

@router.post("/alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str, tenant_id: str = settings.DEFAULT_TENANT_ID):
    with get_db_connection() as conn:
        row = conn.execute("SELECT * FROM foresight_alerts WHERE id = ? AND tenant_id = ?", (alert_id, tenant_id)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Alert not found")
        conn.execute("UPDATE foresight_alerts SET status = 'acknowledged' WHERE id = ? AND tenant_id = ?", (alert_id, tenant_id))

    log_audit_event(
        actor="Operator",
        action="ACKNOWLEDGE_ALERT",
        resource_type="ForesightAlert",
        resource_id=alert_id,
        details="Acknowledged foresight alert precedent.",
        tenant_id=tenant_id
    )
    return {"status": "success", "alertId": alert_id, "newStatus": "acknowledged"}

@router.post("/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: str, tenant_id: str = settings.DEFAULT_TENANT_ID):
    with get_db_connection() as conn:
        row = conn.execute("SELECT * FROM foresight_alerts WHERE id = ? AND tenant_id = ?", (alert_id, tenant_id)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Alert not found")
        conn.execute("UPDATE foresight_alerts SET status = 'resolved' WHERE id = ? AND tenant_id = ?", (alert_id, tenant_id))

    log_audit_event(
        actor="Operator",
        action="RESOLVE_ALERT",
        resource_type="ForesightAlert",
        resource_id=alert_id,
        details="Resolved foresight alert precedent risk.",
        tenant_id=tenant_id
    )
    return {"status": "success", "alertId": alert_id, "newStatus": "resolved"}

@router.post("/run")
@router.post("/evaluate")
def trigger_foresight_analysis(body: Optional[dict] = None, project_id: Optional[str] = None, tenant_id: str = settings.DEFAULT_TENANT_ID):
    """Triggers real LangGraph foresight workflow analysis across projects and historical graph."""
    actual_project_id = project_id or (body.get("projectId") or body.get("projectName") if body else None)
    actual_tenant = (body.get("tenantId") if body else None) or tenant_id

    thread_id = f"thread-fs-{uuid.uuid4().hex[:8]}"
    initial_state = {
        "tenant_id": actual_tenant,
        "project_id": actual_project_id,
        "candidate_decisions": [],
        "matched_precedents": [],
        "generated_alerts": [],
        "persisted_alert_ids": [],
        "step_traces": []
    }

    result = foresight_workflow.invoke(
        initial_state,
        config={"configurable": {"thread_id": thread_id}}
    )

    return {
        "status": "completed",
        "alertsGenerated": len(result.get("persisted_alert_ids", [])),
        "alertIds": result.get("persisted_alert_ids", []),
        "traces": result.get("step_traces", [])
    }
