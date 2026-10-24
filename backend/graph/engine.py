import json
from typing import List, Dict, Any, Optional, Set, Tuple
from backend.database import get_db_connection
from backend.models.domain import GraphNode, GraphEdge, NodeType, EdgeType
from backend.config import settings
from backend.graph.neo4j_client import Neo4jAuraClient

def is_temporally_valid(valid_from: Optional[str], valid_to: Optional[str], target_date: Optional[str] = None) -> bool:
    """Check if a node or edge is active at target_date (YYYY-MM-DD). If no target_date, checks if current (validTo is None or in future)."""
    if not target_date:
        return True
    if valid_from and valid_from > target_date:
        return False
    if valid_to and valid_to < target_date:
        return False
    return True

class KnowledgeGraphEngine:
    @staticmethod
    def get_nodes(
        tenant_id: str,
        node_type: Optional[str] = None,
        search: Optional[str] = None,
        as_of_date: Optional[str] = None
    ) -> List[GraphNode]:
        if settings.has_neo4j:
            try:
                neo_nodes = Neo4jAuraClient.get_nodes(tenant_id, node_type, search, as_of_date)
                if neo_nodes is not None and len(neo_nodes) > 0:
                    return neo_nodes
            except Exception as e:
                print(f"[Neo4j Aura Query Fallback to SQLite]: {e}")

        with get_db_connection() as conn:
            query = "SELECT * FROM nodes WHERE tenant_id = ?"
            params: List[Any] = [tenant_id]

            if node_type and node_type != "ALL":
                query += " AND type = ?"
                params.append(node_type)

            if search:
                query += " AND (label LIKE ? OR summary LIKE ? OR sub_title LIKE ?)"
                term = f"%{search}%"
                params.extend([term, term, term])

            rows = conn.execute(query, params).fetchall()
            nodes: List[GraphNode] = []
            for r in rows:
                if as_of_date and not is_temporally_valid(r["valid_from"], r["valid_to"], as_of_date):
                    continue
                nodes.append(GraphNode(
                    id=r["id"],
                    label=r["label"],
                    type=r["type"],
                    subTitle=r["sub_title"],
                    summary=r["summary"],
                    createdDate=r["created_date"],
                    authorOrOwner=r["author_owner"],
                    tags=json.loads(r["tags_json"] or "[]"),
                    properties=json.loads(r["properties_json"] or "{}"),
                    validFrom=r["valid_from"],
                    validTo=r["valid_to"]
                ))
            return nodes

    @staticmethod
    def get_edges(tenant_id: str, as_of_date: Optional[str] = None, user_acls: Optional[List[str]] = None) -> List[GraphEdge]:
        with get_db_connection() as conn:
            query = "SELECT * FROM edges WHERE tenant_id = ?"
            rows = conn.execute(query, [tenant_id]).fetchall()
            edges: List[GraphEdge] = []
            user_acl_set = set(user_acls or ["all"])
            
            for r in rows:
                if as_of_date and not is_temporally_valid(r["valid_from"], r["valid_to"], as_of_date):
                    continue
                
                edge_acls = json.loads(r["acl_access_list_json"] or '["all"]')
                # ACL Permission boundary check
                if "all" not in edge_acls and not user_acl_set.intersection(edge_acls):
                    continue

                edges.append(GraphEdge(
                    id=r["id"],
                    source=r["source"],
                    target=r["target"],
                    label=r["label"],
                    validFrom=r["valid_from"],
                    validTo=r["valid_to"],
                    sourceId=r["source_id"],
                    supportingTextSpan=r["supporting_text_span"],
                    extractionConfidence=r["extraction_confidence"],
                    aclAccessList=edge_acls
                ))
            return edges

    @staticmethod
    def get_node_by_id(node_id: str, tenant_id: str) -> Optional[GraphNode]:
        with get_db_connection() as conn:
            row = conn.execute(
                "SELECT * FROM nodes WHERE id = ? AND tenant_id = ?",
                (node_id, tenant_id)
            ).fetchone()
            if not row:
                return None
            return GraphNode(
                id=row["id"],
                label=row["label"],
                type=row["type"],
                subTitle=row["sub_title"],
                summary=row["summary"],
                createdDate=row["created_date"],
                authorOrOwner=row["author_owner"],
                tags=json.loads(row["tags_json"] or "[]"),
                properties=json.loads(row["properties_json"] or "{}"),
                validFrom=row["valid_from"],
                validTo=row["valid_to"]
            )

    @staticmethod
    def get_neighborhood(node_id: str, tenant_id: str, depth: int = 1) -> Dict[str, Any]:
        """Returns the ego-network for a node up to `depth` hops."""
        with get_db_connection() as conn:
            visited_nodes: Set[str] = {node_id}
            frontier: Set[str] = {node_id}
            matched_edges: List[GraphEdge] = []

            for _ in range(depth):
                if not frontier:
                    break
                next_frontier: Set[str] = set()
                placeholders = ",".join(["?"] * len(frontier))
                query = f"""
                    SELECT * FROM edges 
                    WHERE tenant_id = ? AND (source IN ({placeholders}) OR target IN ({placeholders}))
                """
                params = [tenant_id] + list(frontier) + list(frontier)
                edge_rows = conn.execute(query, params).fetchall()

                for er in edge_rows:
                    e = GraphEdge(
                        id=er["id"],
                        source=er["source"],
                        target=er["target"],
                        label=er["label"],
                        validFrom=er["valid_from"],
                        validTo=er["valid_to"],
                        sourceId=er["source_id"],
                        supportingTextSpan=er["supporting_text_span"],
                        extractionConfidence=er["extraction_confidence"],
                        aclAccessList=json.loads(er["acl_access_list_json"] or '["all"]')
                    )
                    if e.id not in [x.id for x in matched_edges]:
                        matched_edges.append(e)

                    other_node = e.target if e.source in frontier else e.source
                    if other_node not in visited_nodes:
                        visited_nodes.add(other_node)
                        next_frontier.add(other_node)
                frontier = next_frontier

            # Fetch node details for all visited nodes
            all_node_ids = list(visited_nodes)
            placeholders = ",".join(["?"] * len(all_node_ids))
            node_rows = conn.execute(
                f"SELECT * FROM nodes WHERE tenant_id = ? AND id IN ({placeholders})",
                [tenant_id] + all_node_ids
            ).fetchall()

            nodes = [
                GraphNode(
                    id=nr["id"],
                    label=nr["label"],
                    type=nr["type"],
                    subTitle=nr["sub_title"],
                    summary=nr["summary"],
                    createdDate=nr["created_date"],
                    authorOrOwner=nr["author_owner"],
                    tags=json.loads(nr["tags_json"] or "[]"),
                    properties=json.loads(nr["properties_json"] or "{}"),
                    validFrom=nr["valid_from"],
                    validTo=nr["valid_to"]
                )
                for nr in node_rows
            ]

            return {"nodes": [n.model_dump() for n in nodes], "edges": [e.model_dump() for e in matched_edges]}

    @staticmethod
    def find_multi_hop_paths(
        start_id: str,
        end_id: str,
        tenant_id: str,
        max_depth: int = 3
    ) -> List[List[Dict[str, Any]]]:
        """Breadth-first search for multi-hop paths between two nodes."""
        with get_db_connection() as conn:
            edges = conn.execute("SELECT source, target, label FROM edges WHERE tenant_id = ?", [tenant_id]).fetchall()
            
            adj: Dict[str, List[Tuple[str, str]]] = {}
            for e in edges:
                s, t, l = e["source"], e["target"], e["label"]
                adj.setdefault(s, []).append((t, l))
                adj.setdefault(t, []).append((s, f"REV_{l}"))

            paths: List[List[Tuple[str, str]]] = []
            queue: List[List[Tuple[str, str]]] = [[(start_id, "START")]]
            
            while queue and len(paths) < 5:
                curr_path = queue.pop(0)
                curr_node = curr_path[-1][0]
                
                if curr_node == end_id and len(curr_path) > 1:
                    paths.append(curr_path)
                    continue
                    
                if len(curr_path) <= max_depth:
                    for neighbor, edge_label in adj.get(curr_node, []):
                        if not any(n == neighbor for n, _ in curr_path):
                            queue.append(curr_path + [(neighbor, edge_label)])

            result = []
            for p in paths:
                chain = []
                for node_id, edge_lbl in p:
                    chain.append({"nodeId": node_id, "relation": edge_lbl})
                result.append(chain)
            return result

    @staticmethod
    def upsert_node(node: GraphNode, tenant_id: str):
        with get_db_connection() as conn:
            conn.execute("""
                INSERT INTO nodes (id, label, type, sub_title, summary, created_date, author_owner, tags_json, properties_json, valid_from, valid_to, tenant_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    label = excluded.label,
                    type = excluded.type,
                    sub_title = excluded.sub_title,
                    summary = excluded.summary,
                    created_date = excluded.created_date,
                    author_owner = excluded.author_owner,
                    tags_json = excluded.tags_json,
                    properties_json = excluded.properties_json,
                    valid_from = excluded.valid_from,
                    valid_to = excluded.valid_to;
            """, (
                node.id,
                node.label,
                node.type,
                node.subTitle,
                node.summary,
                node.createdDate,
                node.authorOrOwner,
                json.dumps(node.tags or []),
                json.dumps(node.properties or {}),
                node.validFrom,
                node.validTo,
                tenant_id
            ))

        if settings.has_neo4j:
            try:
                Neo4jAuraClient.upsert_node(node, tenant_id)
            except Exception as e:
                print(f"[Neo4j Aura Sync Node Error]: {e}")

    @staticmethod
    def upsert_edge(edge: GraphEdge, tenant_id: str):
        with get_db_connection() as conn:
            conn.execute("""
                INSERT INTO edges (id, source, target, label, valid_from, valid_to, source_id, supporting_text_span, extraction_confidence, acl_access_list_json, tenant_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    source = excluded.source,
                    target = excluded.target,
                    label = excluded.label,
                    valid_from = excluded.valid_from,
                    valid_to = excluded.valid_to,
                    source_id = excluded.source_id,
                    supporting_text_span = excluded.supporting_text_span,
                    extraction_confidence = excluded.extraction_confidence,
                    acl_access_list_json = excluded.acl_access_list_json;
            """, (
                edge.id,
                edge.source,
                edge.target,
                edge.label,
                edge.validFrom,
                edge.validTo,
                edge.sourceId,
                edge.supportingTextSpan,
                edge.extractionConfidence,
                json.dumps(edge.aclAccessList or ["all"]),
                tenant_id
            ))

        if settings.has_neo4j:
            try:
                Neo4jAuraClient.upsert_edge(edge, tenant_id)
            except Exception as e:
                print(f"[Neo4j Aura Sync Edge Error]: {e}")

