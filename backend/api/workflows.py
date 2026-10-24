import json
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from backend.services.workflow_service import get_workflows, run_workflow_step
from backend.models.domain import AgentWorkflow
from backend.database import get_db_connection
from backend.config import settings

router = APIRouter(prefix="/workflows", tags=["workflows"])

class RunStepRequest(BaseModel):
    node_id: Optional[str] = None

@router.get("", response_model=List[AgentWorkflow])
def list_workflows(tenant_id: str = settings.DEFAULT_TENANT_ID):
    return get_workflows(tenant_id)

@router.get("/traces")
def list_workflow_traces(limit: int = 50, tenant_id: str = settings.DEFAULT_TENANT_ID):
    with get_db_connection() as conn:
        rows = conn.execute("""
            SELECT * FROM execution_traces 
            WHERE tenant_id = ? 
            ORDER BY timestamp DESC 
            LIMIT ?
        """, (tenant_id, limit)).fetchall()
        return [dict(r) for r in rows]

@router.post("/{workflow_id}/run")
def trigger_workflow_step(workflow_id: str, body: Optional[RunStepRequest] = None, tenant_id: str = settings.DEFAULT_TENANT_ID):
    try:
        node_id = body.node_id if body else None
        return run_workflow_step(workflow_id=workflow_id, node_id=node_id, tenant_id=tenant_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
