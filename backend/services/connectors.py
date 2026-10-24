import json
from datetime import datetime
from typing import List, Dict, Any
from backend.database import get_db_connection, log_audit_event
from backend.models.domain import SourceConnector
from backend.services.ingestion_service import IngestionService

FIXTURE_SYNC_TOKENS = {
    "google_gmail": "fixture-gmail-v1",
    "google_calendar": "fixture-calendar-v1",
    "google_drive": "fixture-drive-v1",
}

FIXTURE_DOCUMENTS = {
    "google_gmail": {
        "title": "Gmail Fixture: Atlas Partition Review",
        "content": (
            "Follow-up from the Atlas architecture review: Marcus Vance recommends "
            "an independent witness quorum before enabling cross-region writes. "
            "The Incident 882 post-mortem showed that two regions can both elect "
            "a leader during an asymmetric network partition."
        ),
        "source_type": "email",
        "author": "Marcus Vance",
        "acl_group": "eng-all",
    },
    "google_calendar": {
        "title": "Calendar Fixture: Atlas Architecture Review",
        "content": (
            "Architecture review action items: Priya Sharma will verify the "
            "witness-zone design, Elena Rostova will prepare a network-partition "
            "test, and the team will not approve active-active writes until "
            "fencing behavior is demonstrated."
        ),
        "source_type": "calendar",
        "author": "Priya Sharma",
        "acl_group": "architecture-board",
    },
    "google_drive": {
        "title": "Drive Fixture: RFC-419 Quorum Addendum",
        "content": (
            "RFC-419 addendum: Project Atlas uses Raft for consensus. A third, "
            "independent witness zone is required to prevent split brain when "
            "EU-West and US-East lose connectivity. Fencing tokens must reject "
            "writes from a superseded leader."
        ),
        "source_type": "document",
        "author": "Jayanth",
        "acl_group": "architecture-board",
    },
}

class GoogleWorkspaceService:
    @staticmethod
    def get_connectors(tenant_id: str) -> List[SourceConnector]:
        with get_db_connection() as conn:
            rows = conn.execute("SELECT * FROM source_connectors WHERE tenant_id = ?", [tenant_id]).fetchall()
            return [
                SourceConnector(
                    id=r["id"],
                    name=r["name"],
                    type=r["type"],
                    status=r["status"],
                    lastSyncTime=r["last_sync_time"],
                    itemsProcessed=r["items_processed"],
                    syncTokenOrHistoryId=r["sync_token"],
                    errorCount=r["error_count"],
                    scopes=json.loads(r["scopes_json"] or "[]")
                )
                for r in rows
            ]

    @staticmethod
    def sync_connector(connector_id: str, tenant_id: str) -> Dict[str, Any]:
        """Ingest one deterministic source fixture for this connector."""
        with get_db_connection() as conn:
            row = conn.execute(
                "SELECT * FROM source_connectors WHERE id = ? AND tenant_id = ?",
                (connector_id, tenant_id)
            ).fetchone()
            if not row:
                raise ValueError(f"Connector {connector_id} not found")

            connector_type = row["type"]
            fixture = FIXTURE_DOCUMENTS.get(connector_type)
            sync_token = FIXTURE_SYNC_TOKENS.get(connector_type)
            if fixture is None or sync_token is None:
                raise ValueError(f"Connector type {connector_type} has no configured fixture")
            already_synced = row["sync_token"] == sync_token

        new_items = 0
        if not already_synced:
            result = IngestionService.ingest_document(
                **fixture,
                tenant_id=tenant_id,
                use_llm=False,
            )
            if result.get("status") != "completed":
                raise RuntimeError(
                    f"Fixture ingestion failed for connector {connector_id}: "
                    f"{result.get('error') or result.get('status')}"
                )
            new_items = 1

        sync_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with get_db_connection() as conn:
            conn.execute(
                """
                UPDATE source_connectors
                SET last_sync_time = ?, items_processed = items_processed + ?,
                    sync_token = ?, status = 'healthy'
                WHERE id = ? AND tenant_id = ?
                """,
                (sync_time, new_items, sync_token, connector_id, tenant_id),
            )
            total_items = conn.execute(
                "SELECT items_processed FROM source_connectors WHERE id = ? AND tenant_id = ?",
                (connector_id, tenant_id),
            ).fetchone()["items_processed"]

        if new_items:
            log_audit_event(
                actor="FixtureSyncService",
                action="CONNECTOR_SYNC",
                resource_type="SourceConnector",
                resource_id=connector_id,
                details=f"Ingested fixture document '{fixture['title']}'.",
                tenant_id=tenant_id,
            )

        return {
            "connectorId": connector_id,
            "status": "healthy",
            "itemsProcessed": total_items,
            "newItems": new_items,
            "syncTime": sync_time,
            "fixtureMode": True,
            "message": (
                f"Ingested fixture document: {fixture['title']}"
                if new_items
                else "Fixture is already up to date."
            ),
        }
