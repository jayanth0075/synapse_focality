import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from backend.models.domain import AskQueryRequest, AskMessage
from backend.workflows.ask_graph import ask_workflow
from backend.database import get_db_connection
from backend.config import settings
import json

router = APIRouter(prefix="/ask", tags=["ask"])

@router.post("", response_model=AskMessage)
@router.post("/query", response_model=AskMessage)
def ask_synapse(req: AskQueryRequest):
    tenant_id = req.tenant_id or settings.DEFAULT_TENANT_ID
    user_id = req.user_id or "usr-priya"

    # Fetch user ACLs from database for security isolation
    with get_db_connection() as conn:
        user_row = conn.execute("SELECT acls_json FROM users WHERE id = ? AND tenant_id = ?", (user_id, tenant_id)).fetchone()
        user_acls = json.loads(user_row["acls_json"]) if user_row else ["all"]

    thread_id = f"thread-ask-{uuid.uuid4().hex[:8]}"
    initial_state = {
        "tenant_id": tenant_id,
        "user_id": user_id,
        "user_acls": user_acls,
        "query": req.query,
        "retrieved_chunks": [],
        "retrieved_citations": [],
        "graph_paths": [],
        "sufficiency": False,
        "answer": "",
        "temporal_scope": "",
        "step_traces": []
    }

    # Execute LangGraph workflow
    result = ask_workflow.invoke(
        initial_state,
        config={"configurable": {"thread_id": thread_id}}
    )

    return AskMessage(
        id=f"bot-{uuid.uuid4().hex[:8]}",
        sender="synapse",
        text=result["answer"],
        timestamp=datetime.now().strftime("%I:%M %p"),
        citations=result["retrieved_citations"],
        graphPaths=result["graph_paths"],
        temporalScope=result["temporal_scope"],
        isStreaming=False
    )
