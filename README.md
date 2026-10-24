# SYNAPSE — Enterprise Organizational Memory Agent & Knowledge Graph

Demo-ready organizational intelligence platform by Artisan Systems, with seeded data, deterministic mock connectors, and optional LLM-backed extraction.

SYNAPSE processes demo fixtures and user-provided communications (emails, calendars, documents, RFCs, and incident post-mortems), maps that activity into an active temporal knowledge graph, and provides:
1. **Remember**: Document ingestion, chunking, entity extraction, relation mapping, and human-in-the-loop entity resolution.
2. **Recall**: Permission-aware hybrid Q&A strictly grounded in verified citations with graph traversal paths.
3. **Foresee (Foresight)**: Proactive risk detection that compares in-flight decisions against historical failure precedents and knowledge silos.

---

## Architecture Overview

```mermaid
flowchart TD
    subgraph Frontend["React 18 + TypeScript + Vite + Cytoscape.js"]
        UI_Dash["Overview Dashboard"]
        UI_Ask["Ask Synapse (Grounded Q&A)"]
        UI_Graph["Knowledge Graph Explorer"]
        UI_Foresight["Foresight Risk Alerts"]
        UI_Sources["Ingestion &amp; Review Queue"]
        UI_Workflows["LangGraph Workflow Traces"]
    end

    subgraph Backend["FastAPI REST &amp; SSE Gateway (Port 8000)"]
        API_Projects["/api/projects"]
        API_Graph["/api/graph"]
        API_Ask["/api/ask"]
        API_Foresight["/api/foresight"]
        API_Sources["/api/sources"]
        API_Workflows["/api/workflows"]
        API_Docs["/api/documents"]
        API_Admin["/api/admin"]
    end

    subgraph Workflows["LangGraph State Machine Engine"]
        LG_Ingest["Ingestion Graph<br/>(Extract -&gt; Resolve -&gt; Persist)"]
        LG_Ask["Recall Graph<br/>(ACL Check -&gt; Retrieve -&gt; Ground)"]
        LG_Foresight["Foresight Graph<br/>(Scan -&gt; Traverse Precedents -&gt; Score)"]
    end

    subgraph Storage["Persistent Organizational Memory"]
        DB_SQLite["SQLite ACID WAL DB (synapse.db)"]
        DB_Graph["Temporal Knowledge Graph Engine"]
        DB_Audit["Security &amp; Audit Trail"]
    end

    Frontend <--> Backend
    Backend <--> Workflows
    Workflows <--> Storage
    Backend <--> Storage
```

---

## Quickstart Guide

### 1. Prerequisites
- Python 3.12+
- Node.js 18+ and `npm`

### 2. Install Dependencies
```powershell
python -m pip install -r requirements.txt
npm ci
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 4. Run Backend & Seed Database
From the project root:
```powershell
# The backend initializes and seeds the database automatically at startup.
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### 5. Run Frontend
In a separate terminal:
```powershell
# Start Vite development server (Port 3000)
npm run dev
```

Open `http://localhost:3000/#dashboard` in your browser.

## Deploy to Railway

The repository includes a Dockerfile that builds the React frontend and serves it with the FastAPI backend as one Railway service. The Railway configuration sets `/health` as the health check.

1. In Railway, create a project from this GitHub repository and deploy the `main` branch.
2. Add a Railway Volume to the service and set its mount path to `/data`.
3. Add the variable `SYNAPSE_DB_PATH=/data/synapse.db` so SQLite data survives deploys and restarts.
4. Optionally set `OPENAI_API_KEY` or `GEMINI_API_KEY` to enable the corresponding LLM provider. Neo4j is optional; set `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`, and `NEO4J_DATABASE` together to enable it.
5. Generate a public domain in the service's Networking settings. Railway supplies `PORT` automatically.

The app seeds its demo tenant on first startup. SQLite is intended for a single service replica; do not scale this service to multiple replicas while using the local database. This project currently has no authentication layer, so treat a publicly accessible deployment as a demo and do not upload confidential documents.

---

## Deterministic Mock Connectors

The Gmail, Calendar, and Drive connector cards use local fixture records, not live Google accounts or OAuth. Syncing a connector passes its fixture through the same LangGraph ingestion and SQLite persistence path as an uploaded document. Each connector fixture is ingested once; subsequent syncs report that it is already current. Use the Sources page's **Ingest Document** tab to add your own sample RFCs, meeting notes, or post-mortems.

`GET /api/documents` lists ingested-document metadata without returning document contents. The persisted chunks and graph records are available to Ask SYNAPSE and the workflow screens. LLM credentials are optional; fixture sync uses deterministic extraction and does not call an external LLM.

## Running the Automated Test Suite

Run the end-to-end integration and workflow test suite:
```powershell
python -m unittest backend/tests/test_backend.py -v
```

The suite uses a temporary SQLite database and disables Neo4j synchronization, so it does not modify `data_storage/synapse.db` or a configured Neo4j instance.

All 12 automated tests verify:
1. `test_00_application_imports`: The FastAPI application and API routers import successfully.
2. `test_01_uses_isolated_database`: The suite uses its temporary SQLite database.
3. `test_02_seed_data_idempotency`: Multi-run database seed stability.
4. `test_03_graph_engine_neighborhood_and_paths`: Ego-network and multi-hop path traversal.
5. `test_04_temporal_validity`: Time-window queries (`validFrom`, `validTo`) filtering superseded decisions.
6. `test_05_langgraph_ingestion_workflow`: Document chunking, NER extraction, and knowledge persistence.
7. `test_06_langgraph_ask_workflow`: Grounded Q&A with verifiable citations and traversal paths.
8. `test_07_langgraph_foresight_workflow`: Precedent causal chains and risk alert scoring.
9. `test_08_mock_connector_sync_ingests_fixture_once`: Fixture ingestion, metadata listing, and repeat-sync idempotence.
10. `test_09_unknown_connector_returns_not_found`: Invalid connector identifiers return 404.
11. `test_10_create_project_maps_decision_fields`: Project creation persists decisions in the API's supported schema.
12. `test_11_llm_relationship_alias_is_normalized`: LLM relationship labels are normalized to supported graph-edge types.

---

## 12 Verified Capabilities

| # | Capability | Status | Implementation Details |
|---|---|---|---|
| 1 | **Upload / Ingest Documents** | Verified | Live ingestion tab on Sources page via `/api/documents/ingest` and `/api/documents/upload`. |
| 2 | **Process & Persist Metadata** | Verified | Document normalization, text segmentation, chunking in SQLite `documents` and `document_chunks`. |
| 3 | **Extract Entities & Relations** | Verified | Rule-based and semantic NER extracting `Person`, `Project`, `Decision`, `Problem`, `Outcome`, `Topic`, `Team`. |
| 4 | **Store & Query Temporal Info** | Verified | `validFrom` and `validTo` tracking, bi-temporal point-in-time graph queries. |
| 5 | **Interactive Knowledge Graph** | Verified | Cytoscape.js rendering real nodes and edges, ego-network neighborhood queries, type filtering. |
| 6 | **Ask SYNAPSE Grounded Answers** | Verified | LangGraph `ask_workflow` returning citations (`[Doc-RFC419]`, `[Doc-882]`) and graph paths. |
| 7 | **Real LangGraph Workflows** | Verified | Three compiled `StateGraph` workflows with typed states, checkpointers, and step-level traces. |
| 8 | **Foresight Precedent Alerts** | Verified | LangGraph `foresight_workflow` detecting split-brain risks and knowledge silos with similarity scores. |
| 9 | **Navigate Causal Evidence Chains** | Verified | Multi-hop proofs connecting decisions to historical post-mortems and raw source files. |
| 10 | **Persistent State & History** | Verified | SQLite ACID storage with WAL mode, foreign keys, indexes, and full audit logs. |
| 11 | **Execution Progress & Traces** | Verified | Real step latencies, checkpointer state (threadId, stepCount), and trace logging. |
| 12 | **Repeatable Demo Mode** | Verified | `seed_database(force=False)` seeds Artisan Systems' Project Atlas & Incident 882 scenario idempotently. |
