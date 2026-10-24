import json
from datetime import datetime
from backend.database import get_db_connection, init_db, log_audit_event
from backend.config import settings

def seed_database(force: bool = False):
    init_db()
    tenant_id = settings.DEFAULT_TENANT_ID

    with get_db_connection() as conn:
        # Check if already seeded and not force
        existing = conn.execute("SELECT COUNT(*) as cnt FROM projects WHERE tenant_id = ?", [tenant_id]).fetchone()
        if existing and existing["cnt"] > 0 and not force:
            print("[SEED] Database already contains records. Skipping re-seed.")
            return

        print(f"[SEED] Initializing seed data for tenant: {tenant_id}...")

        # 1. Tenants
        conn.execute("""
            INSERT OR REPLACE INTO tenants (id, name) VALUES (?, ?)
        """, (tenant_id, "Artisan Systems (Production)"))

        # 2. Users
        # Clean up old users and keep only demo users
        conn.execute("DELETE FROM users WHERE tenant_id = ?", [tenant_id])
        users = [
            {
                "id": "usr-jayanth",
                "name": "Jayanth",
                "role": "Co-Founder & CTO",
                "email": "jayanth@demo.synapse.ai",
                "avatar": "https://randomuser.me/api/portraits/men/32.jpg",
                "acls": ["all", "eng-all", "eng-leadership", "architecture-board", "confidential-postmortems"]
            },
            {
                "id": "usr-faisal",
                "name": "Faisal",
                "role": "Founder & CEO",
                "email": "faisal@demo.synapse.ai",
                "avatar": "https://randomuser.me/api/portraits/men/45.jpg",
                "acls": ["all", "eng-all", "sre-oncall", "architecture-board"]
            }
        ]
        for u in users:
            conn.execute("""
                INSERT OR REPLACE INTO users (id, name, role, email, avatar, tenant_id, acls_json)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (u["id"], u["name"], u["role"], u["email"], u["avatar"], tenant_id, json.dumps(u["acls"])))

        # 3. Documents
        documents = [
            {
                "id": "Doc-RFC419",
                "title": "Atlas Architecture RFC v2.3 (RFC-419)",
                "content": "Section 2.1: Consensus guarantees: Multi-datacenter Paxos/Raft election timeouts set to 300ms heartbeat interval. Quorum consensus configured between EU-West and US-East regions with active-active write routing.",
                "source_type": "document",
                "author": "Faisal (Co-Founder & CTO)",
                "created_at": "2026-08-12 10:00:00",
                "acl_group": "architecture-board"
            },
            {
                "id": "Doc-882",
                "title": "Post-Mortem: Incident 882 Analysis & Lessons Learned",
                "content": "Incident 882 Retrospective: A transatlantic cross-region network fiber cut severed communications between EU-West and US-East datacenters for 47 minutes. Due to lack of a tie-breaker witness quorum node, both clusters claimed majority leader election, resulting in dual-master concurrent write skew and 4.5 hours of customer data inconsistency.",
                "source_type": "document",
                "author": "Faisal (Co-Founder & CTO)",
                "created_at": "2024-11-15 14:30:00",
                "acl_group": "confidential-postmortems"
            },
            {
                "id": "Doc-STD01",
                "title": "Engineering Standard: Distributed State Storage",
                "content": "Guideline: All multi-region databases with strict zero-RPO requirements must designate an independent, non-colocated arbiter or witness zone to prevent split-brain partition hazard during transient network degradations.",
                "source_type": "document",
                "author": "Jayanth (Founder & CEO)",
                "created_at": "2025-01-20 09:15:00",
                "acl_group": "eng-all"
            }
        ]
        for d in documents:
            conn.execute("""
                INSERT OR REPLACE INTO documents (id, title, content, source_type, author, created_at, acl_group, tenant_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (d["id"], d["title"], d["content"], d["source_type"], d["author"], d["created_at"], d["acl_group"], tenant_id))

        # 4. Projects
        projects = [
            {
                "id": "proj-atlas",
                "code": "ATLAS-01",
                "name": "Project Atlas: Multi-Region Datastore Migration",
                "status": "At Risk",
                "health_score": 58,
                "owner": "Jayanth",
                "team": "Core Infrastructure",
                "target_date": "2026-12-15",
                "description": "Transitioning the primary transactional backbone to distributed active-active multi-region topology to guarantee sub-15ms cross-region consistency.",
                "architecture_summary": "Cross-region raft replication with distributed consensus layer, multi-master write routing, and automatic fallback failover.",
                "active_alert_count": 2,
                "key_decisions": [
                    {
                        "id": "dec-atlas-1",
                        "decision": "Adopt multi-master quorum consensus for EU-West and US-East regions",
                        "decidedBy": "Faisal",
                        "date": "2026-08-12",
                        "status": "Under Review"
                    },
                    {
                        "id": "dec-atlas-2",
                        "decision": "Deprecate legacy sync triggers in favor of change-data-capture Kafka event streams",
                        "decidedBy": "Jayanth",
                        "date": "2026-07-04",
                        "status": "Active"
                    },
                    {
                        "id": "dec-atlas-3",
                        "decision": "Use strict synchronous replication across three cloud availability zones",
                        "decidedBy": "Faisal",
                        "date": "2026-05-18",
                        "status": "Superseded"
                    }
                ],
                "team_members": [
                    {
                        "name": "Jayanth",
                        "role": "Tech Lead / Sponsor",
                        "avatar": "https://randomuser.me/api/portraits/men/32.jpg",
                        "expertIn": ["Distributed Consensus", "Failure Modes", "Database Internals"]
                    },
                    {
                        "name": "Faisal",
                        "role": "Principal Architect",
                        "avatar": "https://randomuser.me/api/portraits/men/45.jpg",
                        "expertIn": ["Raft Protocol", "Network Topologies", "Event Sourcing"]
                    }
                ],
                "timeline": [
                    {
                        "date": "2026-08-12",
                        "title": "RFC-419 Multi-Master Approved",
                        "type": "decision",
                        "description": "Consensus reached on adopting multi-region active-active topology."
                    },
                    {
                        "date": "2026-08-14",
                        "title": "Foresight Split-Brain Warning Raised",
                        "type": "alert",
                        "description": "Synapse flagged 89% structural similarity to Incident 882 outage."
                    }
                ],
                "related_risks": [
                    {
                        "historicalProject": "Project Titan (2024)",
                        "failureReason": "Asymmetric cross-region partition led to split-brain data corruption during peak traffic.",
                        "similarity": 0.89,
                        "mitigationStrategy": "Deploy an independent witness arbiter in third neutral region."
                    }
                ],
                "linked_entity_ids": ["node-atlas", "node-faisal", "node-jayanth", "Doc-RFC419"]
            },
            {
                "id": "proj-helix",
                "code": "HLX-02",
                "name": "Project Helix: Global L2 Memory Cache",
                "status": "On Track",
                "health_score": 88,
                "owner": "Faisal",
                "team": "Data Platform",
                "target_date": "2026-11-30",
                "description": "Unified edge caching tier built on tiered SSD and NVMe memory storage.",
                "architecture_summary": "Distributed consistent hashing ring with TTL lease invalidation.",
                "active_alert_count": 0,
                "key_decisions": [],
                "team_members": [],
                "timeline": [],
                "related_risks": [],
                "linked_entity_ids": ["node-helix", "node-faisal"]
            },
            {
                "id": "proj-horizon",
                "code": "HRZ-03",
                "name": "Project Horizon: Edge Inference Gateway",
                "status": "Active",
                "health_score": 92,
                "owner": "Faisal",
                "team": "Reliability Engineering",
                "target_date": "2027-02-15",
                "description": "Zero-latency model execution mesh deployed across 18 tier-1 POPs.",
                "architecture_summary": "WASM worker edge runtime with localized telemetry collectors.",
                "active_alert_count": 0,
                "key_decisions": [],
                "team_members": [],
                "timeline": [],
                "related_risks": [],
                "linked_entity_ids": ["node-horizon", "node-faisal"]
            }
        ]
        for p in projects:
            conn.execute("""
                INSERT OR REPLACE INTO projects (
                    id, code, name, status, health_score, owner, team, target_date, description, architecture_summary,
                    active_alert_count, key_decisions_json, team_members_json, timeline_json, related_risks_json, linked_entity_ids_json, tenant_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                p["id"], p["code"], p["name"], p["status"], p["health_score"], p["owner"], p["team"], p["target_date"],
                p["description"], p["architecture_summary"], p["active_alert_count"],
                json.dumps(p["key_decisions"]), json.dumps(p["team_members"]), json.dumps(p["timeline"]),
                json.dumps(p["related_risks"]), json.dumps(p["linked_entity_ids"]), tenant_id
            ))

        # 5. Graph Nodes
        nodes = [
            {"id": "node-jayanth", "label": "Jayanth", "type": "Person", "subTitle": "Founder & CEO", "summary": "Executive sponsor for infrastructure resilience and architecture standards.", "createdDate": "2023-01-15", "tags": ["leadership", "consensus"]},
            {"id": "node-faisal", "label": "Faisal", "type": "Person", "subTitle": "Co-Founder & CTO", "summary": "Core author of distributed consensus protocols and Project Atlas.", "createdDate": "2023-03-01", "tags": ["raft", "architecture"]},
            {"id": "node-atlas", "label": "Project Atlas", "type": "Project", "subTitle": "ATLAS-01", "summary": "Multi-region datastore migration to active-active quorum consensus.", "createdDate": "2026-05-01", "tags": ["infrastructure", "active"]},
            {"id": "node-titan", "label": "Project Titan (2024)", "type": "Project", "subTitle": "TTN-24", "summary": "Historical predecessor datastore decommissioned after major split-brain outage.", "createdDate": "2024-01-10", "tags": ["historical", "failure"]},
            {"id": "node-helix", "label": "Project Helix", "type": "Project", "subTitle": "HLX-02", "summary": "Global L2 cache layer with consistent hashing.", "createdDate": "2026-03-12", "tags": ["cache"]},
            {"id": "node-horizon", "label": "Project Horizon", "type": "Project", "subTitle": "HRZ-03", "summary": "Edge inference gateway across 18 regional points of presence.", "createdDate": "2026-06-20", "tags": ["edge"]},
            {"id": "node-dec-consensus", "label": "Adopt Multi-Master Consensus", "type": "Decision", "subTitle": "Decision dec-atlas-1", "summary": "Quorum consensus configured between EU-West and US-East datacenters.", "createdDate": "2026-08-12", "validFrom": "2026-08-12", "tags": ["consensus"]},
            {"id": "node-dec-sync", "label": "Synchronous 3-AZ Replication", "type": "Decision", "subTitle": "Decision dec-atlas-3", "summary": "Superseded decision from early architecture review.", "createdDate": "2026-05-18", "validFrom": "2026-05-18", "validTo": "2026-08-12", "tags": ["superseded"]},
            {"id": "node-prob-splitbrain", "label": "Cross-Region Split-Brain Partition", "type": "Problem", "subTitle": "Incident 882 Failure Mode", "summary": "Simultaneous leader election caused by network fiber degradation.", "createdDate": "2024-11-15", "tags": ["incident", "outage"]},
            {"id": "node-out-outage2024", "label": "4.5h Multi-Region Outage", "type": "Outcome", "subTitle": "Incident 882 Outcome", "summary": "Severe customer transactional write inconsistency across two regions.", "createdDate": "2024-11-15", "tags": ["outage", "postmortem"]},
            {"id": "node-top-raft", "label": "Raft Protocol & Election Quorum", "type": "Topic", "subTitle": "Domain Architecture", "summary": "Distributed consensus theory, heartbeat intervals, and quorum logic.", "createdDate": "2023-01-01", "tags": ["theory", "protocols"]}
        ]
        for n in nodes:
            conn.execute("""
                INSERT OR REPLACE INTO nodes (
                    id, label, type, sub_title, summary, created_date, author_owner, tags_json, properties_json, valid_from, valid_to, tenant_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                n["id"], n["label"], n["type"], n.get("subTitle"), n["summary"], n["createdDate"],
                n.get("authorOrOwner"), json.dumps(n.get("tags", [])), json.dumps({}),
                n.get("validFrom"), n.get("validTo"), tenant_id
            ))

        # 6. Graph Edges
        edges = [
            {"id": "edge-01", "source": "node-faisal", "target": "node-atlas", "label": "OWNS", "validFrom": "2026-05-01", "sourceId": "Doc-RFC419", "supportingTextSpan": "Faisal assigned as lead architect on Project Atlas.", "confidence": 0.99, "acls": ["all"]},
            {"id": "edge-02", "source": "node-faisal", "target": "node-dec-consensus", "label": "DECIDED", "validFrom": "2026-08-12", "sourceId": "Doc-RFC419", "supportingTextSpan": "Faisal authored decision to adopt multi-master quorum consensus.", "confidence": 0.98, "acls": ["all"]},
            {"id": "edge-03", "source": "node-atlas", "target": "node-dec-consensus", "label": "DECIDED", "validFrom": "2026-08-12", "sourceId": "Doc-RFC419", "supportingTextSpan": "Project Atlas adopted multi-master consensus in RFC-419.", "confidence": 0.98, "acls": ["all"]},
            {"id": "edge-04", "source": "node-dec-consensus", "target": "node-dec-sync", "label": "SUPERSEDES", "validFrom": "2026-08-12", "sourceId": "Doc-RFC419", "supportingTextSpan": "Decision dec-atlas-1 formally supersedes earlier 3-AZ synchronous design.", "confidence": 0.95, "acls": ["all"]},
            {"id": "edge-05", "source": "node-faisal", "target": "node-top-raft", "label": "EXPERT_IN", "validFrom": "2023-01-01", "sourceId": "Doc-RFC419", "supportingTextSpan": "Faisal recognized as subject matter expert on Raft protocols.", "confidence": 0.97, "acls": ["all"]},
            {"id": "edge-06", "source": "node-faisal", "target": "node-prob-splitbrain", "label": "RESOLVED_BY", "validFrom": "2024-11-15", "sourceId": "Doc-882", "supportingTextSpan": "Faisal led incident triage and root cause resolution for Incident 882.", "confidence": 0.99, "acls": ["confidential-postmortems"]},
            {"id": "edge-07", "source": "node-prob-splitbrain", "target": "node-out-outage2024", "label": "CAUSED", "validFrom": "2024-11-15", "sourceId": "Doc-882", "supportingTextSpan": "Asymmetric partition directly caused dual-leader elections and 4.5h data inconsistency.", "confidence": 0.99, "acls": ["confidential-postmortems"]},
            {"id": "edge-08", "source": "node-titan", "target": "node-prob-splitbrain", "label": "FAILED_DUE_TO", "validFrom": "2024-11-15", "sourceId": "Doc-882", "supportingTextSpan": "Project Titan suffered critical partition failure during network partition.", "confidence": 0.99, "acls": ["confidential-postmortems"]}
        ]
        for e in edges:
            conn.execute("""
                INSERT OR REPLACE INTO edges (
                    id, source, target, label, valid_from, valid_to, source_id, supporting_text_span, extraction_confidence, acl_access_list_json, tenant_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                e["id"], e["source"], e["target"], e["label"], e["validFrom"], None,
                e["sourceId"], e["supportingTextSpan"], e["confidence"], json.dumps(e["acls"]), tenant_id
            ))

        # 7. Foresight Alerts
        alerts = [
            {
                "id": "alert-precedent-01",
                "title": "Architectural Precedent: Cross-Region Split-Brain Risk Detected",
                "severity": "critical",
                "similarity_score": 0.89,
                "trigger_item": "ATLAS-01: Adopt multi-master quorum consensus for EU-West and US-East...",
                "category": "Failure Precedent",
                "created_at": "Aug 14, 2026 - 16:40",
                "status": "active",
                "feedback_status": "none",
                "summary": "Decision in ATLAS-01 ('Adopt multi-master quorum consensus') matches the exact root cause of historical Project Titan 4.5h outage (Incident 882) where network partition between EU-West and US-East caused simultaneous leader elections.",
                "evidence_chain": [
                    {"step": 1, "node": "Project Atlas", "nodeType": "Project", "relation": "DECIDED", "targetNode": "Adopt Multi-Master Consensus", "targetType": "Decision", "citation": "Atlas Architecture RFC v2.3", "sourceDoc": "Doc-RFC419"},
                    {"step": 2, "node": "Adopt Multi-Master Consensus", "nodeType": "Decision", "relation": "SIMILAR_TO", "targetNode": "Cross-Region Split-Brain Partition", "targetType": "Problem", "citation": "Post-Mortem: Incident 882 Analysis", "sourceDoc": "Doc-882"},
                    {"step": 3, "node": "Cross-Region Split-Brain Partition", "nodeType": "Problem", "relation": "CAUSED", "targetNode": "4.5h Multi-Region Outage", "targetType": "Outcome", "citation": "Incident 882 Root Cause Investigation", "sourceDoc": "Doc-882"}
                ],
                "recommended_action": "Mandate an odd-numbered quorum arbiter region (e.g., us-central1) or implement epoch fencing tokens before approving production rollout."
            },
            {
                "id": "alert-silo-02",
                "title": "Knowledge Silo: Single Point of Failure on Event Stream Failover",
                "severity": "high",
                "similarity_score": 0.84,
                "trigger_item": "Kafka partition runbooks solely maintained by Elena Rostova",
                "category": "Knowledge Silo",
                "created_at": "Aug 15, 2026 - 09:20",
                "status": "active",
                "feedback_status": "none",
                "summary": "Elena Rostova is the sole contributor and runbook author for Kafka asymmetric partition recovery, but has scheduled 4-week PTO during the migration window.",
                "evidence_chain": [
                    {"step": 1, "node": "Elena Rostova", "nodeType": "Person", "relation": "AUTHORED", "targetNode": "Post-Mortem: Incident 882 Analysis", "targetType": "Document", "citation": "Incident 882 Runbook", "sourceDoc": "Doc-882"},
                    {"step": 2, "node": "Elena Rostova", "nodeType": "Person", "relation": "EXPERT_IN", "targetNode": "Kafka SRE Partition Recovery", "targetType": "Topic", "citation": "SRE On-Call Schedule", "sourceDoc": "Cal-2026-PTO"}
                ],
                "recommended_action": "Pair Elena Rostova with Marcus Vance or Priya Sharma to shadow chaos-testing failover drills before leave begins."
            }
        ]
        for a in alerts:
            conn.execute("""
                INSERT OR REPLACE INTO foresight_alerts (
                    id, title, severity, similarity_score, trigger_item, category, created_at, status, feedback_status, summary, evidence_chain_json, recommended_action, tenant_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                a["id"], a["title"], a["severity"], a["similarity_score"], a["trigger_item"], a["category"],
                a["created_at"], a["status"], a["feedback_status"], a["summary"],
                json.dumps(a["evidence_chain"]), a["recommended_action"], tenant_id
            ))

        # 8. Review Queue
        review_items = [
            {
                "id": "rev-001",
                "type": "EntityMerge",
                "confidence": 0.76,
                "timestamp": "2026-08-16 11:20",
                "entityA": {
                    "name": "Rahul Sharma",
                    "type": "Person",
                    "source": "Google Workspace Directory",
                    "contextSnippet": "Staff Backend Engineer, Core Infrastructure team.",
                    "attributes": {"email": "rahul.sharma@artisansystems.ai", "team": "Core Infrastructure"}
                },
                "entityB": {
                    "name": "Rahul S.",
                    "type": "Person",
                    "source": "Slack #proj-atlas-war-room",
                    "contextSnippet": "Rahul S. posted: 'Running load tests against EU-West multi-master shard'.",
                    "attributes": {"handle": "@rahul.s", "channel": "proj-atlas"}
                },
                "conflictFields": ["email", "handle"],
                "status": "pending"
            }
        ]
        for r in review_items:
            conn.execute("""
                INSERT OR REPLACE INTO review_queue (
                    id, type, confidence, timestamp, entity_a_json, entity_b_json, conflict_fields_json, status, tenant_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                r["id"], r["type"], r["confidence"], r["timestamp"],
                json.dumps(r["entityA"]), json.dumps(r["entityB"]),
                json.dumps(r["conflictFields"]), r["status"], tenant_id
            ))

        # 9. Source Connectors
        connectors = [
            {
                "id": "conn-gmail",
                "name": "Google Workspace Gmail",
                "type": "google_gmail",
                "status": "healthy",
                "last_sync_time": "2026-08-16 14:05:00",
                "items_processed": 1420,
                "sync_token": "hist_0982341",
                "error_count": 0,
                "scopes": ["https://www.googleapis.com/auth/gmail.readonly"]
            },
            {
                "id": "conn-cal",
                "name": "Google Workspace Calendar",
                "type": "google_calendar",
                "status": "healthy",
                "last_sync_time": "2026-08-16 14:05:00",
                "items_processed": 430,
                "sync_token": "cal_sync_tok_881",
                "error_count": 0,
                "scopes": ["https://www.googleapis.com/auth/calendar.readonly"]
            },
            {
                "id": "conn-drive",
                "name": "Google Drive & Docs",
                "type": "google_drive",
                "status": "healthy",
                "last_sync_time": "2026-08-16 13:50:00",
                "items_processed": 680,
                "sync_token": "drive_token_551",
                "error_count": 0,
                "scopes": ["https://www.googleapis.com/auth/drive.readonly"]
            }
        ]
        for c in connectors:
            conn.execute("""
                INSERT OR REPLACE INTO source_connectors (
                    id, name, type, status, last_sync_time, items_processed, sync_token, error_count, scopes_json, tenant_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                c["id"], c["name"], c["type"], c["status"], c["last_sync_time"],
                c["items_processed"], c["sync_token"], c["error_count"],
                json.dumps(c["scopes"]), tenant_id
            ))

        # 10. Agent Workflows
        workflows = [
            {
                "id": "wf-ingestion",
                "name": "Document Ingestion & Knowledge Extraction Graph",
                "graph_type": "Ingestion Graph",
                "description": "Continuous normalization, chunking, entity extraction, relation mapping, and human-in-the-loop review queue routing.",
                "status": "ready",
                "nodes": [
                    {"id": "node-trigger", "label": "Source Ingestion Trigger", "type": "trigger", "description": "Detects changes via Gmail history or Google Drive webhook.", "status": "idle", "latencyMs": 12, "config": {}},
                    {"id": "node-extractor", "label": "Entity & Relation Extractor", "type": "extractor", "description": "Extracts typed entities, decisions, and outcomes.", "status": "idle", "latencyMs": 140, "config": {}},
                    {"id": "node-resolver", "label": "Entity Resolution & De-dupe", "type": "resolver", "description": "Resolves entity aliases against existing graph; routes doubtful cases to Review Queue.", "status": "idle", "latencyMs": 85, "config": {}},
                    {"id": "node-writer", "label": "Knowledge Graph Writer", "type": "graph_write", "description": "Persists nodes and edges with validity windows and ACL inheritance.", "status": "idle", "latencyMs": 35, "config": {}}
                ],
                "edges": [
                    {"id": "e-wf-1", "source": "node-trigger", "target": "node-extractor"},
                    {"id": "e-wf-2", "source": "node-extractor", "target": "node-resolver"},
                    {"id": "e-wf-3", "source": "node-resolver", "target": "node-writer"}
                ],
                "checkpointer_state": {
                    "threadId": "thread-ingest-prod-01",
                    "checkpointId": "ckpt-91823",
                    "stepCount": 4,
                    "pendingInterrupt": False,
                    "channelValues": {"currentDoc": "Doc-RFC419", "extractedCount": 7}
                }
            },
            {
                "id": "wf-recall",
                "name": "Recall & Grounded Q&A Graph",
                "graph_type": "Recall Graph",
                "description": "Hybrid semantic, BM25, and multi-hop graph retrieval with permission filters and verifiable citations.",
                "status": "ready",
                "nodes": [
                    {"id": "node-rec-query", "label": "Query Parser & ACL Router", "type": "router", "description": "Validates user permissions and generates hybrid search strategy.", "status": "idle", "latencyMs": 15, "config": {}},
                    {"id": "node-rec-retrieval", "label": "Hybrid Graph & Passage Retrieval", "type": "retrieval", "description": "Executes vector search and multi-hop Cypher queries.", "status": "idle", "latencyMs": 110, "config": {}},
                    {"id": "node-rec-synth", "label": "Evidence Grounded Synthesizer", "type": "synthesizer", "description": "Synthesizes answer strictly grounded in retrieved evidence.", "status": "idle", "latencyMs": 220, "config": {}}
                ],
                "edges": [
                    {"id": "e-rec-1", "source": "node-rec-query", "target": "node-rec-retrieval"},
                    {"id": "e-rec-2", "source": "node-rec-retrieval", "target": "node-rec-synth"}
                ],
                "checkpointer_state": {
                    "threadId": "thread-recall-prod-02",
                    "checkpointId": "ckpt-55412",
                    "stepCount": 3,
                    "pendingInterrupt": False,
                    "channelValues": {"lastQuery": "Who is the lead authority on Raft consensus?"}
                }
            },
            {
                "id": "wf-foresight",
                "name": "Foresight Risk Engine Graph",
                "graph_type": "Foresight Graph",
                "description": "Traverses historical incidents and failure precedents to detect architectural drift and knowledge silos.",
                "status": "ready",
                "nodes": [
                    {"id": "node-fs-scanner", "label": "Project & Decision Scanner", "type": "trigger", "description": "Scans newly submitted RFCs, architectural decisions, and project milestones.", "status": "idle", "latencyMs": 20, "config": {}},
                    {"id": "node-fs-matcher", "label": "Incident Precedent Matcher", "type": "extractor", "description": "Traverses graph for failure precedents, post-mortems, and silos.", "status": "idle", "latencyMs": 160, "config": {}},
                    {"id": "node-fs-eval", "label": "Causal Evidence Evaluator", "type": "verifier", "description": "Validates multi-hop causal chain and computes similarity score.", "status": "idle", "latencyMs": 95, "config": {}}
                ],
                "edges": [
                    {"id": "e-fs-1", "source": "node-fs-scanner", "target": "node-fs-matcher"},
                    {"id": "e-fs-2", "source": "node-fs-matcher", "target": "node-fs-eval"}
                ],
                "checkpointer_state": {
                    "threadId": "thread-foresight-prod-03",
                    "checkpointId": "ckpt-33019",
                    "stepCount": 3,
                    "pendingInterrupt": False,
                    "channelValues": {"activeSweepProject": "ATLAS-01", "alertsGenerated": 2}
                }
            }
        ]
        for w in workflows:
            conn.execute("""
                INSERT OR REPLACE INTO workflows (
                    id, name, graph_type, description, status, nodes_json, edges_json, checkpointer_state_json, tenant_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                w["id"], w["name"], w["graph_type"], w["description"], w["status"],
                json.dumps(w["nodes"]), json.dumps(w["edges"]),
                json.dumps(w["checkpointer_state"]), tenant_id
            ))

        log_audit_event(
            actor="SystemSeed",
            action="SEED_DATABASE",
            resource_type="Organization",
            resource_id=tenant_id,
            details="Seeded complete Artisan Systems demo organization with projects, graph, alerts, and workflows.",
            tenant_id=tenant_id,
            conn=conn
        )

    print("[SEED] Successfully seeded complete SYNAPSE dataset into SQLite!")

    if settings.has_neo4j:
        print("[SEED] Neo4j Aura detected. Seeding nodes and edges into Neo4j Aura Cloud...")
        try:
            from backend.graph.neo4j_client import Neo4jAuraClient
            from backend.models.domain import GraphNode, GraphEdge
            for n in nodes:
                Neo4jAuraClient.upsert_node(GraphNode(
                    id=n["id"], label=n["label"], type=n["type"], subTitle=n.get("subTitle"),
                    summary=n["summary"], createdDate=n["createdDate"], authorOrOwner=n.get("authorOrOwner"),
                    tags=n.get("tags", []), validFrom=n.get("validFrom"), validTo=n.get("validTo")
                ), tenant_id)
            for e in edges:
                Neo4jAuraClient.upsert_edge(GraphEdge(
                    id=e["id"], source=e["source"], target=e["target"], label=e["label"],
                    validFrom=e["validFrom"], sourceId=e["sourceId"], supportingTextSpan=e["supportingTextSpan"],
                    extractionConfidence=e["confidence"], aclAccessList=e["acls"]
                ), tenant_id)
            print("[SEED] Successfully synchronized graph with Neo4j Aura Cloud!")
        except Exception as ex:
            print(f"[SEED] Neo4j Aura sync warning: {ex}")

if __name__ == "__main__":
    seed_database(force=True)

