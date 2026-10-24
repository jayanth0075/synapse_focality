import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api"

results = []

def test_endpoint(method: str, path: str, payload=None, expected_status=200):
    url = f"{BASE_URL}{path}"
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    headers = {"Content-Type": "application/json"} if data else {}
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            status = response.getcode()
            body = response.read().decode("utf-8")
            parsed = json.loads(body) if body else {}
            passed = (status == expected_status)
            results.append({
                "method": method,
                "path": path,
                "status": status,
                "passed": passed,
                "error": None
            })
            return parsed
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        results.append({
            "method": method,
            "path": path,
            "status": e.code,
            "passed": (e.code == expected_status),
            "error": f"HTTPError {e.code}: {body[:150]}"
        })
        return None
    except Exception as e:
        results.append({
            "method": method,
            "path": path,
            "status": 0,
            "passed": False,
            "error": str(e)
        })
        return None

print("=== STARTING COMPLETE ENDPOINT AUDIT ===")

# 1. Admin
test_endpoint("GET", "/admin/overview")
test_endpoint("GET", "/admin/tenants")
test_endpoint("GET", "/admin/audit-logs")

# 2. Projects
projects = test_endpoint("GET", "/projects")
test_endpoint("POST", "/projects", {
    "name": "Project Quantum Nexus",
    "description": "Distributed quantum-safe ledger protocol",
    "status": "In Planning",
    "techStack": ["Rust", "Raft", "gRPC"],
    "decisions": ["Deploy Raft quorum with 5 nodes across multi-region VPC"],
    "risks": ["Asymmetric network partition latency spike"]
})
test_endpoint("GET", "/projects/proj-atlas")
test_endpoint("POST", "/projects/proj-atlas/evaluate")

# 3. Knowledge Graph
nodes = test_endpoint("GET", "/graph/nodes")
edges = test_endpoint("GET", "/graph/edges")
test_endpoint("GET", "/graph/stats")
test_endpoint("GET", "/graph/neo4j-status")
if nodes and len(nodes) > 0:
    first_node_id = nodes[0]["id"]
    test_endpoint("GET", f"/graph/neighborhood/{first_node_id}")
    if len(nodes) > 1:
        test_endpoint("GET", f"/graph/paths?source={nodes[0]['id']}&target={nodes[1]['id']}")

# 4. Ask Synapse (LangGraph RAG Query)
test_endpoint("POST", "/ask/query", {
    "query": "Why did we choose Raft over Paxos?",
    "userId": "usr-alex-chen",
    "userAcls": ["core-infra", "all"],
    "tenantId": "tenant-artisan-corp-01"
})

# 5. Foresight (LangGraph Precedent Matching)
alerts = test_endpoint("GET", "/foresight/alerts")
test_endpoint("POST", "/foresight/evaluate", {
    "projectName": "Project Titan",
    "proposals": ["Deploy Raft consensus across 2 data centers without arbiter"],
    "tenantId": "tenant-artisan-corp-01"
})
if alerts and len(alerts) > 0:
    alert_id = alerts[0]["id"]
    test_endpoint("POST", f"/foresight/alerts/{alert_id}/acknowledge")
    test_endpoint("POST", f"/foresight/alerts/{alert_id}/resolve")

# 6. Sources & Review Queue
sources = test_endpoint("GET", "/sources")
test_endpoint("POST", "/sources/src-slack-eng/sync")
review_items = test_endpoint("GET", "/sources/review-queue")
if review_items and len(review_items) > 0:
    rev_id = review_items[0]["id"]
    test_endpoint("POST", f"/sources/review-queue/{rev_id}/approve")

# 7. Workflows & Execution Traces
workflows = test_endpoint("GET", "/workflows")
test_endpoint("GET", "/workflows/traces")
test_endpoint("POST", "/workflows/wf-ingestion/run")

# 8. Documents & Ingestion
docs = test_endpoint("GET", "/documents")
test_endpoint("POST", "/documents/ingest", {
    "title": "RFC 808: Zero-Trust Mesh Telemetry Gateway",
    "content": "Core Infrastructure team evaluated Envoy proxies versus eBPF sidecars. Priya Sharma approved eBPF for zero-trust mesh routing to mitigate memory leaks.",
    "sourceType": "markdown",
    "author": "Priya Sharma",
    "aclGroup": "all"
})

print("\n=== ENDPOINT AUDIT RESULTS ===")
passed_count = sum(1 for r in results if r["passed"])
failed_count = sum(1 for r in results if not r["passed"])

for r in results:
    status_sym = "[PASS]" if r["passed"] else "[FAIL]"
    err_str = f" - Error: {r['error']}" if r["error"] else ""
    print(f"{status_sym} {r['method']:<5} {r['path']:<45} Status: {r['status']}{err_str}")

print(f"\nTotal: {len(results)} | Passed: {passed_count} | Failed: {failed_count}")
if failed_count > 0:
    sys.exit(1)
