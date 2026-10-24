import tempfile
import unittest
from pathlib import Path
from backend.services.seed_data import seed_database
from backend.database import get_db_connection
from backend.graph.engine import KnowledgeGraphEngine
from backend.services.ingestion_service import IngestionService
from backend.workflows.ask_graph import ask_workflow
from backend.workflows.foresight_graph import foresight_workflow
from backend.config import settings

class TestSynapseBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls._original_database_path = settings.DATABASE_PATH
        cls._original_neo4j_uri = settings.NEO4J_URI
        cls._original_neo4j_password = settings.NEO4J_PASSWORD
        cls._test_data_dir = tempfile.TemporaryDirectory()
        settings.DATABASE_PATH = str(Path(cls._test_data_dir.name) / "synapse_test.db")
        settings.NEO4J_URI = ""
        settings.NEO4J_PASSWORD = ""
        cls.addClassCleanup(setattr, settings, "DATABASE_PATH", cls._original_database_path)
        cls.addClassCleanup(setattr, settings, "NEO4J_URI", cls._original_neo4j_uri)
        cls.addClassCleanup(setattr, settings, "NEO4J_PASSWORD", cls._original_neo4j_password)
        cls.addClassCleanup(cls._test_data_dir.cleanup)
        seed_database(force=True)

    def test_00_uses_isolated_database(self):
        self.assertEqual(
            Path(settings.DATABASE_PATH).parent,
            Path(self._test_data_dir.name),
        )

    def test_01_seed_data_idempotency(self):
        with get_db_connection() as conn:
            proj_count = conn.execute("SELECT COUNT(*) as cnt FROM projects WHERE tenant_id = ?", [settings.DEFAULT_TENANT_ID]).fetchone()["cnt"]
            self.assertGreaterEqual(proj_count, 3)

            node_count = conn.execute("SELECT COUNT(*) as cnt FROM nodes WHERE tenant_id = ?", [settings.DEFAULT_TENANT_ID]).fetchone()["cnt"]
            self.assertGreaterEqual(node_count, 8)

            edge_count = conn.execute("SELECT COUNT(*) as cnt FROM edges WHERE tenant_id = ?", [settings.DEFAULT_TENANT_ID]).fetchone()["cnt"]
            self.assertGreaterEqual(edge_count, 6)

        # Re-run seed to test idempotency
        seed_database(force=False)
        with get_db_connection() as conn:
            recheck_count = conn.execute("SELECT COUNT(*) as cnt FROM projects WHERE tenant_id = ?", [settings.DEFAULT_TENANT_ID]).fetchone()["cnt"]
            self.assertEqual(proj_count, recheck_count)

    def test_02_graph_engine_neighborhood_and_paths(self):
        # Ego network for Project Atlas
        neighborhood = KnowledgeGraphEngine.get_neighborhood("node-atlas", settings.DEFAULT_TENANT_ID, depth=1)
        self.assertTrue(len(neighborhood["nodes"]) > 0)
        self.assertTrue(len(neighborhood["edges"]) > 0)

        # Multi-hop path between Marcus Vance and 4.5h Outage
        paths = KnowledgeGraphEngine.find_multi_hop_paths("node-marcus", "node-out-outage2024", settings.DEFAULT_TENANT_ID, max_depth=3)
        self.assertIsInstance(paths, list)

    def test_03_temporal_validity(self):
        # Querying with as_of_date '2026-06-01' should show superseded 3-AZ decision as active
        nodes_past = KnowledgeGraphEngine.get_nodes(settings.DEFAULT_TENANT_ID, as_of_date="2026-06-01")
        dec_sync_past = next((n for n in nodes_past if n.id == "node-dec-sync"), None)
        self.assertIsNotNone(dec_sync_past)

        # Querying with as_of_date '2026-09-01' should not show superseded 3-AZ decision
        nodes_future = KnowledgeGraphEngine.get_nodes(settings.DEFAULT_TENANT_ID, as_of_date="2026-09-01")
        dec_sync_future = next((n for n in nodes_future if n.id == "node-dec-sync"), None)
        self.assertIsNone(dec_sync_future)

    def test_04_langgraph_ingestion_workflow(self):
        # Ingest test architectural doc through LangGraph
        result = IngestionService.ingest_document(
            title="RFC-520: Zero-Trust Telemetry Mesh",
            content="Project Atlas is adopting a zero-trust telemetry mesh. Elena Rostova and Marcus Vance will implement Raft protocol heartbeats to monitor Kafka partition latency and prevent Split-Brain degradation.",
            source_type="document",
            author="Priya Sharma",
            acl_group="all",
            project_id="proj-atlas",
            tenant_id=settings.DEFAULT_TENANT_ID
        )
        self.assertEqual(result["status"], "completed")
        self.assertTrue(len(result["persistedNodes"]) > 0)
        self.assertTrue(len(result["persistedEdges"]) > 0)

    def test_05_langgraph_ask_workflow(self):
        # Ask question answerable by seeded citations
        state = {
            "tenant_id": settings.DEFAULT_TENANT_ID,
            "user_id": "usr-priya",
            "user_acls": ["all", "eng-all", "architecture-board", "confidential-postmortems"],
            "query": "Who is the lead authority on Raft consensus?",
            "retrieved_chunks": [],
            "retrieved_citations": [],
            "graph_paths": [],
            "sufficiency": False,
            "answer": "",
            "temporal_scope": "",
            "step_traces": []
        }
        res = ask_workflow.invoke(state, config={"configurable": {"thread_id": "test-ask-01"}})
        self.assertTrue(res["sufficiency"])
        self.assertIn("Marcus Vance", res["answer"])
        self.assertTrue(len(res["retrieved_citations"]) > 0)
        citation_ids = [c["id"] for c in res["retrieved_citations"]]
        self.assertTrue("Doc-RFC419" in citation_ids)

    def test_06_langgraph_foresight_workflow(self):
        state = {
            "tenant_id": settings.DEFAULT_TENANT_ID,
            "project_id": "proj-atlas",
            "candidate_decisions": [],
            "matched_precedents": [],
            "generated_alerts": [],
            "persisted_alert_ids": [],
            "step_traces": []
        }
        res = foresight_workflow.invoke(state, config={"configurable": {"thread_id": "test-fs-01"}})
        self.assertTrue(len(res["persisted_alert_ids"]) > 0)
        self.assertTrue(len(res["generated_alerts"]) > 0)
        first_alert = res["generated_alerts"][0]
        self.assertIn("Precedent", first_alert["title"])
        self.assertTrue(len(first_alert["evidenceChain"]) >= 2)

if __name__ == "__main__":
    unittest.main()
