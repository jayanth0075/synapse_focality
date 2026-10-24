import re
import uuid
import json
import time
from datetime import datetime
from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from backend.database import get_db_connection, log_audit_event
from backend.models.domain import GraphNode, GraphEdge, NodeType, EdgeType
from backend.graph.engine import KnowledgeGraphEngine
from backend.services.llm_service import extract_entities_llm

class IngestionState(TypedDict):
    tenant_id: str
    document_id: str
    title: str
    content: str
    source_type: str
    author: str
    acl_group: str
    project_id: Optional[str]
    normalized_chunks: List[str]
    extracted_entities: List[Dict[str, Any]]
    extracted_relations: List[Dict[str, Any]]
    ambiguous_merges: List[Dict[str, Any]]
    persisted_node_ids: List[str]
    persisted_edge_ids: List[str]
    status: str
    error: Optional[str]
    step_traces: List[Dict[str, Any]]

# --- NODE IMPLEMENTATIONS ---

def validate_source_and_tenant(state: IngestionState) -> Dict[str, Any]:
    start_time = time.time()
    tenant_id = state.get("tenant_id", "tenant-artisan-corp-01")
    content = state.get("content", "").strip()
    
    if not content:
        return {
            "status": "failed",
            "error": "Document content cannot be empty",
            "step_traces": [{
                "node": "validate_source_and_tenant",
                "status": "failed",
                "duration_ms": int((time.time() - start_time) * 1000),
                "details": "Empty content provided"
            }]
        }
    
    return {
        "status": "validated",
        "step_traces": [{
            "node": "validate_source_and_tenant",
            "status": "completed",
            "duration_ms": int((time.time() - start_time) * 1000),
            "details": f"Source validated for tenant {tenant_id}, length {len(content)} chars"
        }]
    }

def normalize_and_segment(state: IngestionState) -> Dict[str, Any]:
    start_time = time.time()
    content = state["content"]
    
    # Text normalization & paragraph/sentence chunking
    cleaned = re.sub(r"\r\n", "\n", content)
    paragraphs = [p.strip() for p in cleaned.split("\n\n") if p.strip()]
    
    chunks: List[str] = []
    current_chunk = ""
    for p in paragraphs:
        if len(current_chunk) + len(p) < 600:
            current_chunk += ("\n\n" if current_chunk else "") + p
        else:
            if current_chunk:
                chunks.append(current_chunk)
            current_chunk = p
    if current_chunk:
        chunks.append(current_chunk)
    
    if not chunks:
        chunks = [content]
        
    return {
        "normalized_chunks": chunks,
        "step_traces": state["step_traces"] + [{
            "node": "normalize_and_segment",
            "status": "completed",
            "duration_ms": int((time.time() - start_time) * 1000),
            "details": f"Generated {len(chunks)} bounded context segments"
        }]
    }

def extract_entities_and_relations(state: IngestionState) -> Dict[str, Any]:
    start_time = time.time()
    chunks = state["normalized_chunks"]
    title = state["title"]
    author = state["author"]
    doc_id = state["document_id"]
    
    entities: List[Dict[str, Any]] = []
    relations: List[Dict[str, Any]] = []
    
    # Primary Document Node
    doc_node_id = f"node-{doc_id}"
    entities.append({
        "id": doc_node_id,
        "label": title,
        "type": "Document",
        "subTitle": f"Authored by {author}",
        "summary": chunks[0][:200] if chunks else title,
        "createdDate": datetime.now().strftime("%Y-%m-%d"),
        "authorOrOwner": author,
        "tags": [state["source_type"], "ingested"],
        "properties": {"source_type": state["source_type"], "document_id": doc_id}
    })
    
    # Author Person Node
    author_node_id = f"node-person-{re.sub(r'[^a-zA-Z0-9]', '', author.lower())}"
    entities.append({
        "id": author_node_id,
        "label": author,
        "type": "Person",
        "subTitle": "Document Author",
        "summary": f"Team member and contributor: {author}",
        "createdDate": datetime.now().strftime("%Y-%m-%d"),
        "tags": ["team", "author"]
    })
    
    relations.append({
        "id": f"edge-{uuid.uuid4().hex[:8]}",
        "source": author_node_id,
        "target": doc_node_id,
        "label": "AUTHORED",
        "sourceId": doc_id,
        "supportingTextSpan": f"Document authored by {author}",
        "confidence": 0.99
    })
    
    # 1. Attempt LLM-powered Semantic Extraction if API Key is available
    llm_extracted = extract_entities_llm(state["content"], title, author)
    if llm_extracted:
        for ent in llm_extracted.get("entities", []):
            ent_label = ent.get("label", "").strip()
            ent_type = ent.get("type", "Topic")
            if not ent_label:
                continue
            ent_id = f"node-{ent_type.lower()}-{re.sub(r'[^a-zA-Z0-9]', '', ent_label.lower())}"
            if not any(e["id"] == ent_id for e in entities):
                entities.append({
                    "id": ent_id,
                    "label": ent_label,
                    "type": ent_type,
                    "subTitle": f"Extracted via LLM from {title}",
                    "summary": ent.get("summary", ent_label),
                    "createdDate": datetime.now().strftime("%Y-%m-%d"),
                    "authorOrOwner": author,
                    "tags": ["llm-extracted", ent_type.lower()]
                })
                relations.append({
                    "id": f"edge-{uuid.uuid4().hex[:8]}",
                    "source": doc_node_id,
                    "target": ent_id,
                    "label": "MENTIONS",
                    "sourceId": doc_id,
                    "supportingTextSpan": f"Extracted from {title}",
                    "confidence": ent.get("confidence", 0.95)
                })
        for rel in llm_extracted.get("relations", []):
            if rel.get("source") and rel.get("target") and rel.get("label"):
                relations.append({
                    "id": f"edge-{uuid.uuid4().hex[:8]}",
                    "source": rel["source"],
                    "target": rel["target"],
                    "label": rel["label"],
                    "sourceId": doc_id,
                    "supportingTextSpan": rel.get("supportingText", f"LLM relation from {title}"),
                    "confidence": rel.get("confidence", 0.92)
                })

    # 2. Rule & Pattern-based Named Entity Recognition (NER) for Technical Architecture and Governance
    patterns = [
        (r"\b(Project [A-Z][a-z]+|Atlas|Titan|Helix|Horizon)\b", "Project"),
        (r"\b(Raft|Paxos|Kafka|Consensus|Postgres|Cassandra|Redis|gRPC)\b", "Topic"),
        (r"\b(Split-Brain|Outage|Partition|Latency spike|Incident \d+|Memory leak)\b", "Problem"),
        (r"\b(Adopt|Deprecate|Migrate|Decision to [a-zA-Z\s]+|Approved)\b", "Decision"),
        (r"\b(SRE Team|Core Infrastructure|Security Team|Platform Team)\b", "Team"),
    ]
    
    for chunk in chunks:
        for pattern, ent_type in patterns:
            for match in re.finditer(pattern, chunk, re.IGNORECASE):
                val = match.group(0).strip()
                ent_id = f"node-{ent_type.lower()}-{re.sub(r'[^a-zA-Z0-9]', '', val.lower())}"
                
                # Deduplicate within current extraction
                if not any(e["id"] == ent_id for e in entities):
                    entities.append({
                        "id": ent_id,
                        "label": val,
                        "type": ent_type,
                        "subTitle": f"Extracted from {title}",
                        "summary": chunk[:180],
                        "createdDate": datetime.now().strftime("%Y-%m-%d"),
                        "authorOrOwner": author,
                        "tags": ["extracted", ent_type.lower()]
                    })
                    
                    # Link to Document
                    relations.append({
                        "id": f"edge-{uuid.uuid4().hex[:8]}",
                        "source": doc_node_id,
                        "target": ent_id,
                        "label": "MENTIONS",
                        "sourceId": doc_id,
                        "supportingTextSpan": chunk[max(0, match.start()-40):min(len(chunk), match.end()+40)],
                        "confidence": 0.92
                    })
    
    # Project linkage if supplied
    if state.get("project_id"):
        proj_node_id = f"node-proj-{state['project_id'].replace('proj-', '')}"
        relations.append({
            "id": f"edge-{uuid.uuid4().hex[:8]}",
            "source": doc_node_id,
            "target": proj_node_id,
            "label": "MENTIONS",
            "sourceId": doc_id,
            "supportingTextSpan": f"Document associated with project {state['project_id']}",
            "confidence": 0.98
        })

    return {
        "extracted_entities": entities,
        "extracted_relations": relations,
        "step_traces": state["step_traces"] + [{
            "node": "extract_entities_and_relations",
            "status": "completed",
            "duration_ms": int((time.time() - start_time) * 1000),
            "details": f"Extracted {len(entities)} candidate entities and {len(relations)} relationships"
        }]
    }

def resolve_entities_and_queue(state: IngestionState) -> Dict[str, Any]:
    start_time = time.time()
    tenant_id = state["tenant_id"]
    entities = state["extracted_entities"]
    ambiguous_merges: List[Dict[str, Any]] = []
    
    with get_db_connection() as conn:
        for ent in entities:
            # Check for near matches (e.g. similar names with slight variance)
            existing = conn.execute(
                "SELECT * FROM nodes WHERE tenant_id = ? AND type = ? AND label LIKE ?",
                (tenant_id, ent["type"], f"%{ent['label'][:4]}%")
            ).fetchall()
            
            for ex in existing:
                if ex["id"] != ent["id"] and ex["label"].lower() != ent["label"].lower():
                    # Ambiguous entity resolution detected (e.g. "Rahul S." vs "Rahul Sharma")
                    review_item = {
                        "id": f"rev-{uuid.uuid4().hex[:8]}",
                        "type": "EntityMerge",
                        "confidence": 0.72,
                        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
                        "entityA": {
                            "name": ex["label"],
                            "type": ex["type"],
                            "source": "Existing Graph Node",
                            "contextSnippet": ex["summary"],
                            "attributes": {"id": ex["id"]}
                        },
                        "entityB": {
                            "name": ent["label"],
                            "type": ent["type"],
                            "source": f"Document: {state['title']}",
                            "contextSnippet": ent["summary"],
                            "attributes": {"id": ent["id"]}
                        },
                        "conflictFields": ["label", "source"],
                        "status": "pending",
                        "tenant_id": tenant_id
                    }
                    ambiguous_merges.append(review_item)
                    
                    # Persist to review queue
                    conn.execute("""
                        INSERT OR IGNORE INTO review_queue (id, type, confidence, timestamp, entity_a_json, entity_b_json, conflict_fields_json, status, tenant_id)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        review_item["id"],
                        review_item["type"],
                        review_item["confidence"],
                        review_item["timestamp"],
                        json.dumps(review_item["entityA"]),
                        json.dumps(review_item["entityB"]),
                        json.dumps(review_item["conflictFields"]),
                        review_item["status"],
                        tenant_id
                    ))

    return {
        "ambiguous_merges": ambiguous_merges,
        "step_traces": state["step_traces"] + [{
            "node": "resolve_entities_and_queue",
            "status": "completed",
            "duration_ms": int((time.time() - start_time) * 1000),
            "details": f"Entity resolution completed. Flagged {len(ambiguous_merges)} ambiguous items to human review queue."
        }]
    }

def persist_knowledge_and_chunks(state: IngestionState) -> Dict[str, Any]:
    start_time = time.time()
    tenant_id = state["tenant_id"]
    doc_id = state["document_id"]
    
    persisted_nodes: List[str] = []
    persisted_edges: List[str] = []
    
    with get_db_connection() as conn:
        # 1. Persist Raw Document
        conn.execute("""
            INSERT OR REPLACE INTO documents (id, title, content, source_type, author, created_at, acl_group, tenant_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            doc_id,
            state["title"],
            state["content"],
            state["source_type"],
            state["author"],
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            state["acl_group"],
            tenant_id
        ))
        
        # 2. Persist Document Chunks
        for idx, chunk in enumerate(state["normalized_chunks"]):
            conn.execute("""
                INSERT OR REPLACE INTO document_chunks (id, document_id, chunk_index, content, embedding_json, acl_group, tenant_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                f"chunk-{doc_id}-{idx}",
                doc_id,
                idx,
                chunk,
                json.dumps([]),
                state["acl_group"],
                tenant_id
            ))
            
    # 3. Persist Extracted Graph Nodes & Edges
    for ent in state["extracted_entities"]:
        node = GraphNode(
            id=ent["id"],
            label=ent["label"],
            type=ent["type"],
            subTitle=ent.get("subTitle"),
            summary=ent["summary"],
            createdDate=ent["createdDate"],
            authorOrOwner=ent.get("authorOrOwner"),
            tags=ent.get("tags", []),
            properties=ent.get("properties", {}),
            validFrom=datetime.now().strftime("%Y-%m-%d"),
            validTo=None
        )
        KnowledgeGraphEngine.upsert_node(node, tenant_id)
        persisted_nodes.append(node.id)
        
    for rel in state["extracted_relations"]:
        edge = GraphEdge(
            id=rel["id"],
            source=rel["source"],
            target=rel["target"],
            label=rel["label"],
            validFrom=datetime.now().strftime("%Y-%m-%d"),
            validTo=None,
            sourceId=rel["sourceId"],
            supportingTextSpan=rel["supportingTextSpan"],
            extractionConfidence=rel.get("confidence", 0.95),
            aclAccessList=[state["acl_group"]] if state["acl_group"] != "all" else ["all"]
        )
        KnowledgeGraphEngine.upsert_edge(edge, tenant_id)
        persisted_edges.append(edge.id)

    log_audit_event(
        actor=state["author"],
        action="DOCUMENT_INGESTED",
        resource_type="Document",
        resource_id=doc_id,
        details=f"Ingested '{state['title']}' -> {len(persisted_nodes)} nodes, {len(persisted_edges)} edges",
        tenant_id=tenant_id
    )

    return {
        "persisted_node_ids": persisted_nodes,
        "persisted_edge_ids": persisted_edges,
        "status": "completed",
        "step_traces": state["step_traces"] + [{
            "node": "persist_knowledge_and_chunks",
            "status": "completed",
            "duration_ms": int((time.time() - start_time) * 1000),
            "details": f"Persisted document {doc_id}, {len(state['normalized_chunks'])} chunks, {len(persisted_nodes)} graph nodes, {len(persisted_edges)} edges"
        }]
    }

# --- LANGGRAPH COMPILED WORKFLOW ---

def create_ingestion_graph():
    builder = StateGraph(IngestionState)
    builder.add_node("validate_source_and_tenant", validate_source_and_tenant)
    builder.add_node("normalize_and_segment", normalize_and_segment)
    builder.add_node("extract_entities_and_relations", extract_entities_and_relations)
    builder.add_node("resolve_entities_and_queue", resolve_entities_and_queue)
    builder.add_node("persist_knowledge_and_chunks", persist_knowledge_and_chunks)

    builder.add_edge(START, "validate_source_and_tenant")
    builder.add_edge("validate_source_and_tenant", "normalize_and_segment")
    builder.add_edge("normalize_and_segment", "extract_entities_and_relations")
    builder.add_edge("extract_entities_and_relations", "resolve_entities_and_queue")
    builder.add_edge("resolve_entities_and_queue", "persist_knowledge_and_chunks")
    builder.add_edge("persist_knowledge_and_chunks", END)

    memory = MemorySaver()
    return builder.compile(checkpointer=memory)

ingestion_workflow = create_ingestion_graph()
