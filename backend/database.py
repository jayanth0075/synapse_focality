import sqlite3
import json
import os
from contextlib import contextmanager
from typing import Generator, Any, List, Dict, Optional
from backend.config import settings

def get_db_path() -> str:
    db_path = settings.DATABASE_PATH
    os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
    return db_path

@contextmanager
def get_db_connection() -> Generator[sqlite3.Connection, None, None]:
    conn = sqlite3.connect(get_db_path(), timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    with get_db_connection() as conn:
        cursor = conn.cursor()

        # Tenants
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS tenants (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # Users
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            email TEXT NOT NULL,
            avatar TEXT,
            tenant_id TEXT NOT NULL,
            acls_json TEXT NOT NULL DEFAULT '["all"]'
        );
        """)

        # Projects
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            code TEXT NOT NULL,
            name TEXT NOT NULL,
            status TEXT NOT NULL,
            health_score INTEGER NOT NULL,
            owner TEXT NOT NULL,
            team TEXT NOT NULL,
            target_date TEXT NOT NULL,
            description TEXT NOT NULL,
            architecture_summary TEXT NOT NULL,
            active_alert_count INTEGER DEFAULT 0,
            key_decisions_json TEXT DEFAULT '[]',
            team_members_json TEXT DEFAULT '[]',
            timeline_json TEXT DEFAULT '[]',
            related_risks_json TEXT DEFAULT '[]',
            linked_entity_ids_json TEXT DEFAULT '[]',
            tenant_id TEXT NOT NULL
        );
        """)

        # Graph Nodes
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS nodes (
            id TEXT PRIMARY KEY,
            label TEXT NOT NULL,
            type TEXT NOT NULL,
            sub_title TEXT,
            summary TEXT NOT NULL,
            created_date TEXT NOT NULL,
            author_owner TEXT,
            tags_json TEXT DEFAULT '[]',
            properties_json TEXT DEFAULT '{}',
            valid_from TEXT,
            valid_to TEXT,
            tenant_id TEXT NOT NULL
        );
        """)

        # Graph Edges
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS edges (
            id TEXT PRIMARY KEY,
            source TEXT NOT NULL,
            target TEXT NOT NULL,
            label TEXT NOT NULL,
            valid_from TEXT NOT NULL,
            valid_to TEXT,
            source_id TEXT NOT NULL,
            supporting_text_span TEXT NOT NULL,
            extraction_confidence REAL DEFAULT 0.95,
            acl_access_list_json TEXT DEFAULT '["all"]',
            tenant_id TEXT NOT NULL
        );
        """)

        # Foresight Alerts
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS foresight_alerts (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            severity TEXT NOT NULL,
            similarity_score REAL NOT NULL,
            trigger_item TEXT NOT NULL,
            category TEXT NOT NULL,
            created_at TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'active',
            feedback_status TEXT NOT NULL DEFAULT 'none',
            summary TEXT NOT NULL,
            evidence_chain_json TEXT DEFAULT '[]',
            recommended_action TEXT NOT NULL,
            tenant_id TEXT NOT NULL
        );
        """)

        # Review Queue
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS review_queue (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            confidence REAL NOT NULL,
            timestamp TEXT NOT NULL,
            entity_a_json TEXT NOT NULL,
            entity_b_json TEXT NOT NULL,
            conflict_fields_json TEXT DEFAULT '[]',
            status TEXT NOT NULL DEFAULT 'pending',
            tenant_id TEXT NOT NULL
        );
        """)

        # Source Connectors
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS source_connectors (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            status TEXT NOT NULL,
            last_sync_time TEXT NOT NULL,
            items_processed INTEGER DEFAULT 0,
            sync_token TEXT DEFAULT '',
            error_count INTEGER DEFAULT 0,
            scopes_json TEXT DEFAULT '[]',
            tenant_id TEXT NOT NULL
        );
        """)

        # Ingested Documents
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            source_type TEXT NOT NULL,
            author TEXT NOT NULL,
            created_at TEXT NOT NULL,
            acl_group TEXT NOT NULL DEFAULT 'all',
            tenant_id TEXT NOT NULL
        );
        """)

        # Document Chunks
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS document_chunks (
            id TEXT PRIMARY KEY,
            document_id TEXT NOT NULL,
            chunk_index INTEGER NOT NULL,
            content TEXT NOT NULL,
            embedding_json TEXT DEFAULT '[]',
            acl_group TEXT NOT NULL DEFAULT 'all',
            tenant_id TEXT NOT NULL,
            FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE
        );
        """)

        # Agent Workflows
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS workflows (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            graph_type TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'ready',
            nodes_json TEXT DEFAULT '[]',
            edges_json TEXT DEFAULT '[]',
            checkpointer_state_json TEXT DEFAULT '{}',
            tenant_id TEXT NOT NULL
        );
        """)

        # Execution Traces
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS execution_traces (
            id TEXT PRIMARY KEY,
            workflow_id TEXT NOT NULL,
            node_id TEXT NOT NULL,
            node_name TEXT NOT NULL,
            status TEXT NOT NULL,
            duration_ms INTEGER NOT NULL,
            timestamp TEXT NOT NULL,
            input_payload_json TEXT DEFAULT '{}',
            output_payload_json TEXT DEFAULT '{}',
            interrupted_reason TEXT,
            tenant_id TEXT NOT NULL
        );
        """)

        # Audit Logs
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            actor TEXT NOT NULL,
            action TEXT NOT NULL,
            resource_type TEXT NOT NULL,
            resource_id TEXT NOT NULL,
            details TEXT,
            tenant_id TEXT NOT NULL
        );
        """)

        # Create helpful indexes
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_nodes_type ON nodes(type);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_nodes_tenant ON nodes(tenant_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_edges_tenant ON edges(tenant_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_alerts_tenant ON foresight_alerts(tenant_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_docs_tenant ON documents(tenant_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_chunks_tenant ON document_chunks(tenant_id);")

def log_audit_event(
    actor: str,
    action: str,
    resource_type: str,
    resource_id: str,
    details: str = "",
    tenant_id: str = settings.DEFAULT_TENANT_ID,
    conn: Optional[sqlite3.Connection] = None
):
    import uuid
    from datetime import datetime

    def _execute(target_conn):
        target_conn.execute("""
            INSERT INTO audit_logs (id, timestamp, actor, action, resource_type, resource_id, details, tenant_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"aud-{uuid.uuid4().hex[:8]}",
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            actor,
            action,
            resource_type,
            resource_id,
            details,
            tenant_id
        ))

    if conn is not None:
        _execute(conn)
    else:
        with get_db_connection() as new_conn:
            _execute(new_conn)

