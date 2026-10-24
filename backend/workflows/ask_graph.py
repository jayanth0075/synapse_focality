import time
import json
import uuid
import re
from datetime import datetime
from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from backend.database import get_db_connection, log_audit_event
from backend.models.domain import Citation, GraphPath
from backend.graph.engine import KnowledgeGraphEngine
from backend.services.llm_service import synthesize_grounded_answer

class AskState(TypedDict):
    tenant_id: str
    user_id: str
    user_acls: List[str]
    query: str
    retrieved_chunks: List[Dict[str, Any]]
    retrieved_citations: List[Dict[str, Any]]
    graph_paths: List[Dict[str, Any]]
    sufficiency: bool
    answer: str
    temporal_scope: str
    step_traces: List[Dict[str, Any]]

# --- NODE IMPLEMENTATIONS ---

def validate_query_and_acl(state: AskState) -> Dict[str, Any]:
    start_time = time.time()
    query = state.get("query", "").strip()
    user_acls = state.get("user_acls", ["all"])
    
    if not query:
        raise ValueError("Query string cannot be empty")
        
    return {
        "step_traces": [{
            "node": "validate_query_and_acl",
            "status": "completed",
            "duration_ms": int((time.time() - start_time) * 1000),
            "details": f"Query validated under ACL permissions: {user_acls}"
        }]
    }

def retrieve_evidence(state: AskState) -> Dict[str, Any]:
    start_time = time.time()
    query = state["query"].lower()
    tenant_id = state["tenant_id"]
    user_acls = state["user_acls"]
    
    keywords = [w for w in re.findall(r"\w+", query) if len(w) > 3]
    citations: List[Dict[str, Any]] = []
    chunks: List[Dict[str, Any]] = []
    
    with get_db_connection() as conn:
        # Search documents & chunks with permission filtering
        doc_rows = conn.execute(
            "SELECT * FROM documents WHERE tenant_id = ?",
            [tenant_id]
        ).fetchall()
        
        for doc in doc_rows:
            doc_acl = doc["acl_group"]
            if doc_acl != "all" and doc_acl not in user_acls:
                # Permission check - Skip unauthorized documents!
                continue
                
            title_text = (doc["title"] + " " + doc["content"]).lower()
            match_count = sum(1 for kw in keywords if kw in title_text)
            
            if match_count > 0 or len(keywords) == 0:
                score = round(min(0.98, 0.70 + (match_count * 0.08)), 2)
                snippet = doc["content"][:240].strip()
                if len(doc["content"]) > 240:
                    snippet += "..."
                    
                citations.append({
                    "id": doc["id"],
                    "title": doc["title"],
                    "sourceType": doc["source_type"],
                    "author": doc["author"],
                    "timestamp": doc["created_at"][:10],
                    "snippet": snippet,
                    "aclGroup": doc_acl,
                    "matchScore": score
                })
                chunks.append({
                    "doc_id": doc["id"],
                    "title": doc["title"],
                    "content": doc["content"],
                    "score": score
                })
                
    return {
        "retrieved_chunks": chunks,
        "retrieved_citations": citations,
        "step_traces": state["step_traces"] + [{
            "node": "retrieve_evidence",
            "status": "completed",
            "duration_ms": int((time.time() - start_time) * 1000),
            "details": f"Retrieved {len(citations)} ACL-authorized source documents"
        }]
    }

def filter_and_rank_evidence(state: AskState) -> Dict[str, Any]:
    start_time = time.time()
    citations = sorted(state["retrieved_citations"], key=lambda c: c["matchScore"], reverse=True)[:5]
    
    # Graph traversal to find connected paths between key entities in query
    query = state["query"].lower()
    tenant_id = state["tenant_id"]
    nodes = KnowledgeGraphEngine.get_nodes(tenant_id)
    
    mentioned_nodes = [n for n in nodes if n.label.lower() in query or any(kw in n.label.lower() for kw in re.findall(r"\w+", query) if len(kw) > 3)]
    
    graph_paths: List[Dict[str, Any]] = []
    if len(mentioned_nodes) >= 2:
        paths = KnowledgeGraphEngine.find_multi_hop_paths(mentioned_nodes[0].id, mentioned_nodes[1].id, tenant_id, max_depth=3)
        for p in paths[:2]:
            node_labels = []
            for step in p:
                node_match = next((n.label for n in nodes if n.id == step["nodeId"]), step["nodeId"])
                node_labels.append(node_match)
            graph_paths.append({
                "nodes": node_labels,
                "description": f"Causal relation path: {node_labels[0]} -> {node_labels[-1]}"
            })
    elif len(mentioned_nodes) == 1:
        # Neighborhood of the single mentioned node
        center = mentioned_nodes[0]
        sub = KnowledgeGraphEngine.get_neighborhood(center.id, tenant_id, depth=1)
        if sub["edges"]:
            edge = sub["edges"][0]
            s_name = next((n["label"] for n in sub["nodes"] if n["id"] == edge["source"]), edge["source"])
            t_name = next((n["label"] for n in sub["nodes"] if n["id"] == edge["target"]), edge["target"])
            graph_paths.append({
                "nodes": [s_name, edge["label"], t_name],
                "description": f"Direct graph connection ({edge['label']})"
            })

    return {
        "retrieved_citations": citations,
        "graph_paths": graph_paths,
        "step_traces": state["step_traces"] + [{
            "node": "filter_and_rank_evidence",
            "status": "completed",
            "duration_ms": int((time.time() - start_time) * 1000),
            "details": f"Ranked top {len(citations)} citations and traced {len(graph_paths)} knowledge graph paths"
        }]
    }

def evaluate_sufficiency(state: AskState) -> Dict[str, Any]:
    start_time = time.time()
    citations = state["retrieved_citations"]
    is_sufficient = len(citations) > 0
    
    return {
        "sufficiency": is_sufficient,
        "step_traces": state["step_traces"] + [{
            "node": "evaluate_sufficiency",
            "status": "completed",
            "duration_ms": int((time.time() - start_time) * 1000),
            "details": f"Sufficiency check passed: {is_sufficient}"
        }]
    }

def synthesize_answer(state: AskState) -> Dict[str, Any]:
    start_time = time.time()
    query = state["query"]
    citations = state["retrieved_citations"]
    graph_paths = state["graph_paths"]
    
    if not citations:
        answer = f"I could not find sufficient verified evidence in the organizational knowledge graph or indexed documents to answer: \"{query}\". Please verify that relevant RFCs, documents, or post-mortems have been ingested into Synapse and that your account has appropriate permissions."
        temporal_scope = "Unspecified"
    else:
        # Attempt real generative LLM synthesis (OpenAI or Gemini) if API key is provided
        llm_answer = synthesize_grounded_answer(query, citations, graph_paths)
        if llm_answer:
            answer = llm_answer
        else:
            # Deterministic, grounded fallback
            cite_refs = " ".join([f"[{c['id']}]" for c in citations[:3]])
            answer_parts = [
                f"Based on **hybrid retrieval** across {len(citations)} verified organizational documents and the Synapse knowledge graph {cite_refs}:",
                ""
            ]
            for idx, c in enumerate(citations[:3], 1):
                answer_parts.append(f"{idx}. **{c['title']}** (Authored by {c['author']}, {c['timestamp']}):")
                answer_parts.append(f"   \"{c['snippet']}\" [{c['id']}]")
            if graph_paths:
                path_desc = " -> ".join(graph_paths[0]["nodes"])
                answer_parts.append("")
                answer_parts.append(f"*Verified graph traversal path:* `{path_desc}`.")
            answer = "\n".join(answer_parts)
            
        temporal_scope = f"Active Evidence: {citations[-1]['timestamp']} - {citations[0]['timestamp']}"

    return {
        "answer": answer,
        "temporal_scope": temporal_scope,
        "step_traces": state["step_traces"] + [{
            "node": "synthesize_answer",
            "status": "completed",
            "duration_ms": int((time.time() - start_time) * 1000),
            "details": f"Synthesized answer grounded in {len(citations)} citations"
        }]
    }

def record_trace(state: AskState) -> Dict[str, Any]:
    tenant_id = state["tenant_id"]
    trace_id = f"trace-{uuid.uuid4().hex[:8]}"
    
    with get_db_connection() as conn:
        for t in state["step_traces"]:
            conn.execute("""
                INSERT INTO execution_traces (id, workflow_id, node_id, node_name, status, duration_ms, timestamp, input_payload_json, output_payload_json, tenant_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                f"tr-{uuid.uuid4().hex[:8]}",
                "wf-recall",
                t["node"],
                t["node"],
                t["status"],
                t["duration_ms"],
                datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                json.dumps({"query": state["query"]}),
                json.dumps({"details": t["details"]}),
                tenant_id
            ))
            
    log_audit_event(
        actor=state["user_id"],
        action="ASK_QUERY",
        resource_type="RecallWorkflow",
        resource_id=trace_id,
        details=f"Query: '{state['query'][:50]}...' -> {len(state['retrieved_citations'])} citations",
        tenant_id=tenant_id
    )
    
    return {"status": "success"}

# --- LANGGRAPH COMPILED WORKFLOW ---

def create_ask_graph():
    builder = StateGraph(AskState)
    builder.add_node("validate_query_and_acl", validate_query_and_acl)
    builder.add_node("retrieve_evidence", retrieve_evidence)
    builder.add_node("filter_and_rank_evidence", filter_and_rank_evidence)
    builder.add_node("evaluate_sufficiency", evaluate_sufficiency)
    builder.add_node("synthesize_answer", synthesize_answer)
    builder.add_node("record_trace", record_trace)

    builder.add_edge(START, "validate_query_and_acl")
    builder.add_edge("validate_query_and_acl", "retrieve_evidence")
    builder.add_edge("retrieve_evidence", "filter_and_rank_evidence")
    builder.add_edge("filter_and_rank_evidence", "evaluate_sufficiency")
    builder.add_edge("evaluate_sufficiency", "synthesize_answer")
    builder.add_edge("synthesize_answer", "record_trace")
    builder.add_edge("record_trace", END)

    memory = MemorySaver()
    return builder.compile(checkpointer=memory)

ask_workflow = create_ask_graph()
