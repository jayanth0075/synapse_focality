import json
import uuid
from typing import Any, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from backend.database import get_db_connection, log_audit_event
from backend.models.domain import ProjectItem
from backend.config import settings

router = APIRouter(prefix="/projects", tags=["projects"])

def row_to_project(r) -> ProjectItem:
    return ProjectItem(
        id=r["id"],
        code=r["code"],
        name=r["name"],
        status=r["status"],
        healthScore=r["health_score"],
        owner=r["owner"],
        team=r["team"],
        targetDate=r["target_date"],
        description=r["description"],
        architectureSummary=r["architecture_summary"],
        activeAlertCount=r["active_alert_count"],
        keyDecisions=json.loads(r["key_decisions_json"] or "[]"),
        teamMembers=json.loads(r["team_members_json"] or "[]"),
        timeline=json.loads(r["timeline_json"] or "[]"),
        relatedFailureRisks=json.loads(r["related_risks_json"] or "[]"),
        linkedEntityIds=json.loads(r["linked_entity_ids_json"] or "[]")
    )

@router.get("", response_model=List[ProjectItem])
def list_projects(tenant_id: str = settings.DEFAULT_TENANT_ID):
    with get_db_connection() as conn:
        rows = conn.execute("SELECT * FROM projects WHERE tenant_id = ? ORDER BY health_score ASC", [tenant_id]).fetchall()
        return [row_to_project(r) for r in rows]

@router.get("/{project_id}", response_model=ProjectItem)
def get_project(project_id: str, tenant_id: str = settings.DEFAULT_TENANT_ID):
    with get_db_connection() as conn:
        row = conn.execute("SELECT * FROM projects WHERE id = ? AND tenant_id = ?", (project_id, tenant_id)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Project not found")
        return row_to_project(row)

class CreateProjectPayload(BaseModel):
    id: Optional[str] = None
    code: Optional[str] = None
    name: str
    status: Optional[str] = "In Planning"
    healthScore: Optional[int] = 85
    owner: Optional[str] = "Priya Sharma"
    team: Optional[str] = "Core Platform"
    targetDate: Optional[str] = "Q4 2026"
    description: Optional[str] = ""
    architectureSummary: Optional[str] = ""
    activeAlertCount: Optional[int] = 0
    keyDecisions: Optional[List[Any]] = []
    teamMembers: Optional[List[Any]] = []
    timeline: Optional[List[Any]] = []
    relatedFailureRisks: Optional[List[Any]] = []
    linkedEntityIds: Optional[List[str]] = []
    techStack: Optional[List[str]] = []
    decisions: Optional[List[str]] = []
    risks: Optional[List[str]] = []

@router.post("", response_model=ProjectItem)
def create_project(payload: CreateProjectPayload, tenant_id: str = settings.DEFAULT_TENANT_ID):
    proj_id = payload.id or f"proj-{uuid.uuid4().hex[:6]}"
    words = payload.name.split()
    code = payload.code or (words[-1].upper() if words else "PROJ")
    
    # Map decisions if passed as string list
    key_decisions = []
    for d in (payload.decisions or []):
        key_decisions.append({
            "id": f"dec-{uuid.uuid4().hex[:6]}",
            "title": str(d),
            "date": "2026-10-24",
            "status": "Proposed",
            "rationale": "Strategic architecture proposal",
            "author": payload.owner or "Priya Sharma"
        })
    for d in (payload.keyDecisions or []):
        key_decisions.append(d if isinstance(d, dict) else d.model_dump())

    proj_item = ProjectItem(
        id=proj_id,
        code=code,
        name=payload.name,
        status=payload.status or "In Planning",
        healthScore=payload.healthScore or 85,
        owner=payload.owner or "Priya Sharma",
        team=payload.team or "Core Platform",
        targetDate=payload.targetDate or "Q4 2026",
        description=payload.description or "",
        architectureSummary=payload.architectureSummary or "",
        activeAlertCount=payload.activeAlertCount or 0,
        keyDecisions=key_decisions,
        teamMembers=[m if isinstance(m, dict) else m.model_dump() for m in (payload.teamMembers or [])],
        timeline=[t if isinstance(t, dict) else t.model_dump() for t in (payload.timeline or [])],
        relatedFailureRisks=[r if isinstance(r, dict) else r.model_dump() for r in (payload.relatedFailureRisks or [])],
        linkedEntityIds=payload.linkedEntityIds or []
    )

    with get_db_connection() as conn:
        conn.execute("""
            INSERT INTO projects (
                id, code, name, status, health_score, owner, team, target_date, description, architecture_summary,
                active_alert_count, key_decisions_json, team_members_json, timeline_json, related_risks_json, linked_entity_ids_json, tenant_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            proj_item.id, proj_item.code, proj_item.name, proj_item.status, proj_item.healthScore, proj_item.owner,
            proj_item.team, proj_item.targetDate, proj_item.description, proj_item.architectureSummary,
            proj_item.activeAlertCount, json.dumps([d.model_dump() for d in proj_item.keyDecisions]),
            json.dumps([m.model_dump() for m in proj_item.teamMembers]),
            json.dumps([t.model_dump() for t in proj_item.timeline]),
            json.dumps([r.model_dump() for r in proj_item.relatedFailureRisks]),
            json.dumps(proj_item.linkedEntityIds), tenant_id
        ))

    log_audit_event(
        actor=proj_item.owner,
        action="CREATE_PROJECT",
        resource_type="Project",
        resource_id=proj_item.id,
        details=f"Created workspace for {proj_item.code}: {proj_item.name}",
        tenant_id=tenant_id
    )
    return proj_item

@router.post("/{project_id}/evaluate")
def evaluate_project_foresight(project_id: str, tenant_id: str = settings.DEFAULT_TENANT_ID):
    from backend.workflows.foresight_graph import foresight_workflow
    thread_id = f"thread-eval-{uuid.uuid4().hex[:8]}"
    initial_state = {
        "tenant_id": tenant_id,
        "project_id": project_id,
        "candidate_decisions": [],
        "matched_precedents": [],
        "generated_alerts": [],
        "persisted_alert_ids": [],
        "step_traces": []
    }
    result = foresight_workflow.invoke(initial_state, config={"configurable": {"thread_id": thread_id}})
    return {
        "status": "completed",
        "projectId": project_id,
        "alertsGenerated": len(result.get("persisted_alert_ids", [])),
        "alertIds": result.get("persisted_alert_ids", []),
        "traces": result.get("step_traces", [])
    }
