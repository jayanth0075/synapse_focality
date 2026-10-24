from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from backend.graph.engine import KnowledgeGraphEngine
from backend.graph.neo4j_client import Neo4jAuraClient
from backend.models.domain import GraphNode, GraphEdge
from backend.config import settings

router = APIRouter(prefix="/graph", tags=["graph"])

@router.get("/nodes", response_model=List[GraphNode])
def get_graph_nodes(
    type: Optional[str] = None,
    search: Optional[str] = None,
    as_of_date: Optional[str] = None,
    tenant_id: str = settings.DEFAULT_TENANT_ID
):
    return KnowledgeGraphEngine.get_nodes(tenant_id=tenant_id, node_type=type, search=search, as_of_date=as_of_date)

@router.get("/edges", response_model=List[GraphEdge])
def get_graph_edges(
    as_of_date: Optional[str] = None,
    user_acls: Optional[str] = None,
    tenant_id: str = settings.DEFAULT_TENANT_ID
):
    acls_list = user_acls.split(",") if user_acls else ["all"]
    return KnowledgeGraphEngine.get_edges(tenant_id=tenant_id, as_of_date=as_of_date, user_acls=acls_list)

@router.get("/stats")
def get_graph_stats(tenant_id: str = settings.DEFAULT_TENANT_ID):
    nodes = KnowledgeGraphEngine.get_nodes(tenant_id=tenant_id)
    edges = KnowledgeGraphEngine.get_edges(tenant_id=tenant_id)
    type_counts = {}
    for n in nodes:
        type_counts[n.type] = type_counts.get(n.type, 0) + 1
    return {
        "nodeCount": len(nodes),
        "edgeCount": len(edges),
        "typeDistribution": type_counts,
        "neo4j": Neo4jAuraClient.verify_connectivity()
    }

@router.get("/neo4j-status")
@router.get("/neo4j/status")
def get_neo4j_status():
    return Neo4jAuraClient.verify_connectivity()

@router.get("/nodes/{node_id}", response_model=GraphNode)
def get_node(node_id: str, tenant_id: str = settings.DEFAULT_TENANT_ID):
    node = KnowledgeGraphEngine.get_node_by_id(node_id=node_id, tenant_id=tenant_id)
    if not node:
        raise HTTPException(status_code=404, detail="Graph node not found")
    return node

@router.get("/nodes/{node_id}/neighborhood")
@router.get("/neighborhood/{node_id}")
def get_node_neighborhood(
    node_id: str,
    depth: int = Query(default=1, ge=1, le=3),
    tenant_id: str = settings.DEFAULT_TENANT_ID
):
    return KnowledgeGraphEngine.get_neighborhood(node_id=node_id, tenant_id=tenant_id, depth=depth)

@router.get("/paths")
def get_multi_hop_paths(
    start_id: Optional[str] = None,
    end_id: Optional[str] = None,
    source: Optional[str] = None,
    target: Optional[str] = None,
    max_depth: int = Query(default=3, ge=1, le=4),
    tenant_id: str = settings.DEFAULT_TENANT_ID
):
    actual_start = start_id or source
    actual_end = end_id or target
    if not actual_start or not actual_end:
        raise HTTPException(status_code=422, detail="Both source/start_id and target/end_id parameters are required")
    paths = KnowledgeGraphEngine.find_multi_hop_paths(actual_start, actual_end, tenant_id, max_depth)
    return {"paths": paths}

@router.post("/node", response_model=GraphNode)
def upsert_node(node: GraphNode, tenant_id: str = settings.DEFAULT_TENANT_ID):
    KnowledgeGraphEngine.upsert_node(node, tenant_id=tenant_id)
    return node

@router.post("/edge", response_model=GraphEdge)
def upsert_edge(edge: GraphEdge, tenant_id: str = settings.DEFAULT_TENANT_ID):
    KnowledgeGraphEngine.upsert_edge(edge, tenant_id=tenant_id)
    return edge
