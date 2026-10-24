import json
from typing import List, Dict, Any, Optional
import neo4j
from neo4j import GraphDatabase
import os
from backend.config import settings, load_env_variables
from backend.models.domain import GraphNode, GraphEdge

class Neo4jAuraClient:
    _driver: Optional[neo4j.Driver] = None

    @classmethod
    def get_driver(cls) -> Optional[neo4j.Driver]:
        load_env_variables()
        uri = os.getenv("NEO4J_URI") or settings.NEO4J_URI
        username = os.getenv("NEO4J_USERNAME") or settings.NEO4J_USERNAME
        password = os.getenv("NEO4J_PASSWORD") or settings.NEO4J_PASSWORD
        
        if not (uri and password):
            return None
            
        if cls._driver is None:
            try:
                cls._driver = GraphDatabase.driver(
                    uri,
                    auth=(username, password)
                )
            except Exception as e:
                print(f"[Neo4j Aura] Driver initialization failed: {e}")
                return None
        return cls._driver

    @classmethod
    def verify_connectivity(cls) -> Dict[str, Any]:
        driver = cls.get_driver()
        if not driver:
            return {
                "connected": False,
                "status": "Awaiting Neo4j Aura Credentials (NEO4J_URI, NEO4J_PASSWORD)",
                "database": settings.NEO4J_DATABASE
            }
        try:
            driver.verify_connectivity()
            with driver.session(database=settings.NEO4J_DATABASE) as session:
                res = session.run("MATCH (n:Entity) RETURN count(n) as node_count").single()
                count = res["node_count"] if res else 0
            return {
                "connected": True,
                "status": "Online (Neo4j Aura Cloud)",
                "nodeCount": count,
                "uri": settings.NEO4J_URI.split("@")[-1]
            }
        except Exception as e:
            return {
                "connected": False,
                "status": f"Connection Error: {str(e)}",
                "uri": settings.NEO4J_URI.split("@")[-1] if settings.NEO4J_URI else ""
            }

    @classmethod
    def upsert_node(cls, node: GraphNode, tenant_id: str):
        driver = cls.get_driver()
        if not driver:
            return
        
        # Cypher query with dynamic label and parameterized attributes
        cypher = f"""
        MERGE (n:Entity {{id: $id, tenant_id: $tenant_id}})
        SET n:{node.type},
            n.label = $label,
            n.subTitle = $subTitle,
            n.summary = $summary,
            n.createdDate = $createdDate,
            n.authorOrOwner = $authorOrOwner,
            n.tags = $tags,
            n.validFrom = $validFrom,
            n.validTo = $validTo
        """
        params = {
            "id": node.id,
            "tenant_id": tenant_id,
            "label": node.label,
            "subTitle": node.subTitle or "",
            "summary": node.summary,
            "createdDate": node.createdDate,
            "authorOrOwner": node.authorOrOwner or "",
            "tags": node.tags or [],
            "validFrom": node.validFrom or "",
            "validTo": node.validTo or ""
        }
        with driver.session(database=settings.NEO4J_DATABASE) as session:
            session.run(cypher, params)

    @classmethod
    def upsert_edge(cls, edge: GraphEdge, tenant_id: str):
        driver = cls.get_driver()
        if not driver:
            return
        
        cypher = f"""
        MATCH (s:Entity {{id: $source, tenant_id: $tenant_id}})
        MATCH (t:Entity {{id: $target, tenant_id: $tenant_id}})
        MERGE (s)-[r:{edge.label} {{id: $id}}]->(t)
        SET r.validFrom = $validFrom,
            r.validTo = $validTo,
            r.sourceId = $sourceId,
            r.supportingTextSpan = $supportingTextSpan,
            r.extractionConfidence = $extractionConfidence,
            r.aclAccessList = $aclAccessList
        """
        params = {
            "id": edge.id,
            "source": edge.source,
            "target": edge.target,
            "tenant_id": tenant_id,
            "validFrom": edge.validFrom,
            "validTo": edge.validTo or "",
            "sourceId": edge.sourceId,
            "supportingTextSpan": edge.supportingTextSpan,
            "extractionConfidence": edge.extractionConfidence,
            "aclAccessList": edge.aclAccessList or ["all"]
        }
        with driver.session(database=settings.NEO4J_DATABASE) as session:
            session.run(cypher, params)

    @classmethod
    def get_nodes(
        cls,
        tenant_id: str,
        node_type: Optional[str] = None,
        search: Optional[str] = None,
        as_of_date: Optional[str] = None
    ) -> Optional[List[GraphNode]]:
        driver = cls.get_driver()
        if not driver:
            return None
        
        where_clauses = ["n.tenant_id = $tenant_id"]
        params: Dict[str, Any] = {"tenant_id": tenant_id}

        if node_type and node_type != "ALL":
            where_clauses.append(f"n:{node_type}")

        if search:
            where_clauses.append("(toLower(n.label) CONTAINS toLower($search) OR toLower(n.summary) CONTAINS toLower($search))")
            params["search"] = search

        if as_of_date:
            where_clauses.append("(n.validFrom = '' OR n.validFrom <= $as_of_date)")
            where_clauses.append("(n.validTo = '' OR n.validTo >= $as_of_date)")
            params["as_of_date"] = as_of_date

        cypher = f"MATCH (n:Entity) WHERE {' AND '.join(where_clauses)} RETURN n"
        
        try:
            with driver.session(database=settings.NEO4J_DATABASE) as session:
                records = session.run(cypher, params)
                nodes = []
                for record in records:
                    props = record["n"]
                    nodes.append(GraphNode(
                        id=props["id"],
                        label=props.get("label", ""),
                        type=props.get("type", "Topic"),
                        subTitle=props.get("subTitle"),
                        summary=props.get("summary", ""),
                        createdDate=props.get("createdDate", ""),
                        authorOrOwner=props.get("authorOrOwner"),
                        tags=props.get("tags", []),
                        validFrom=props.get("validFrom") or None,
                        validTo=props.get("validTo") or None
                    ))
                return nodes
        except Exception as e:
            print(f"[Neo4j Query Error]: {e}")
            return None

    @classmethod
    def get_neighborhood(cls, node_id: str, tenant_id: str, depth: int = 1) -> Optional[Dict[str, Any]]:
        driver = cls.get_driver()
        if not driver:
            return None
        
        cypher = f"""
        MATCH (center:Entity {{id: $node_id, tenant_id: $tenant_id}})
        OPTIONAL MATCH (center)-[r*1..{depth}]-(neighbor:Entity {{tenant_id: $tenant_id}})
        RETURN center, collect(DISTINCT neighbor) as neighbors, collect(DISTINCT r) as rels
        """
        try:
            with driver.session(database=settings.NEO4J_DATABASE) as session:
                record = session.run(cypher, {"node_id": node_id, "tenant_id": tenant_id}).single()
                if not record or not record["center"]:
                    return None
                
                # Transform to frontend format
                center_props = record["center"]
                nodes_dict = {
                    center_props["id"]: GraphNode(
                        id=center_props["id"],
                        label=center_props.get("label", ""),
                        type=center_props.get("type", "Topic"),
                        subTitle=center_props.get("subTitle"),
                        summary=center_props.get("summary", ""),
                        createdDate=center_props.get("createdDate", "")
                    ).model_dump()
                }

                for n in record["neighbors"]:
                    nodes_dict[n["id"]] = GraphNode(
                        id=n["id"],
                        label=n.get("label", ""),
                        type=n.get("type", "Topic"),
                        subTitle=n.get("subTitle"),
                        summary=n.get("summary", ""),
                        createdDate=n.get("createdDate", "")
                    ).model_dump()

                return {
                    "nodes": list(nodes_dict.values()),
                    "edges": []
                }
        except Exception as e:
            print(f"[Neo4j Neighborhood Error]: {e}")
            return None
