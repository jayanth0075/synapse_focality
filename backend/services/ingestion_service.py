import uuid
from typing import Dict, Any, Optional
from backend.workflows.ingestion_graph import ingestion_workflow
from backend.config import settings

class IngestionService:
    @staticmethod
    def ingest_document(
        title: str,
        content: str,
        source_type: str = "document",
        author: str = "Priya Sharma",
        acl_group: str = "all",
        project_id: Optional[str] = None,
        tenant_id: str = settings.DEFAULT_TENANT_ID,
        use_llm: bool = True,
    ) -> Dict[str, Any]:
        doc_id = f"doc-{uuid.uuid4().hex[:8]}"
        initial_state = {
            "tenant_id": tenant_id,
            "document_id": doc_id,
            "title": title,
            "content": content,
            "source_type": source_type,
            "author": author,
            "acl_group": acl_group,
            "project_id": project_id,
            "use_llm": use_llm,
            "normalized_chunks": [],
            "extracted_entities": [],
            "extracted_relations": [],
            "ambiguous_merges": [],
            "persisted_node_ids": [],
            "persisted_edge_ids": [],
            "status": "pending",
            "error": None,
            "step_traces": []
        }

        # Execute through actual LangGraph workflow
        result = ingestion_workflow.invoke(
            initial_state,
            config={"configurable": {"thread_id": f"thread-ingest-{doc_id}"}}
        )

        return {
            "documentId": doc_id,
            "status": result.get("status", "completed"),
            "persistedNodes": result.get("persisted_node_ids", []),
            "persistedEdges": result.get("persisted_edge_ids", []),
            "ambiguousMerges": result.get("ambiguous_merges", []),
            "stepTraces": result.get("step_traces", []),
            "error": result.get("error")
        }
