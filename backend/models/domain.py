from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

NodeType = Literal[
    "Person",
    "Team",
    "Project",
    "Meeting",
    "Document",
    "EmailThread",
    "Decision",
    "Problem",
    "Outcome",
    "Topic",
    "Customer",
]

EdgeType = Literal[
    "ATTENDED",
    "OWNS",
    "AUTHORED",
    "DECIDED",
    "CAUSED",
    "FAILED_DUE_TO",
    "RESOLVED_BY",
    "MENTIONS",
    "SUPERSEDES",
    "EXPERT_IN",
]

class GraphNode(BaseModel):
    id: str
    label: str
    type: NodeType
    subTitle: Optional[str] = None
    summary: str
    createdDate: str
    authorOrOwner: Optional[str] = None
    tags: Optional[List[str]] = Field(default_factory=list)
    properties: Optional[Dict[str, Any]] = Field(default_factory=dict)
    validFrom: Optional[str] = None
    validTo: Optional[str] = None

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: EdgeType
    validFrom: str
    validTo: Optional[str] = None
    sourceId: str
    supportingTextSpan: str
    extractionConfidence: float = 0.95
    aclAccessList: List[str] = Field(default_factory=lambda: ["all"])

class KeyDecision(BaseModel):
    id: str
    decision: str
    decidedBy: str
    date: str
    status: Literal["Active", "Superseded", "Under Review"]

class TeamMember(BaseModel):
    name: str
    role: str
    avatar: str
    expertIn: List[str] = Field(default_factory=list)

class TimelineItem(BaseModel):
    date: str
    title: str
    type: Literal["meeting", "decision", "document", "alert"]
    description: str

class FailureRisk(BaseModel):
    historicalProject: str
    failureReason: str
    similarity: float
    mitigationStrategy: str

class ProjectItem(BaseModel):
    id: str
    code: str
    name: str
    status: Literal["Active", "At Risk", "On Track", "Completed", "Archived"]
    healthScore: int
    owner: str
    team: str
    targetDate: str
    description: str
    architectureSummary: str
    activeAlertCount: int = 0
    keyDecisions: List[KeyDecision] = Field(default_factory=list)
    teamMembers: List[TeamMember] = Field(default_factory=list)
    timeline: List[TimelineItem] = Field(default_factory=list)
    relatedFailureRisks: List[FailureRisk] = Field(default_factory=list)
    linkedEntityIds: List[str] = Field(default_factory=list)

class EvidenceChainStep(BaseModel):
    step: int
    node: str
    nodeType: NodeType
    relation: str
    targetNode: str
    targetType: NodeType
    citation: str
    sourceDoc: str

class ForesightAlert(BaseModel):
    id: str
    title: str
    severity: Literal["critical", "high", "medium"]
    similarityScore: float
    triggerItem: str
    category: Literal[
        "Failure Precedent",
        "Knowledge Silo",
        "Contradicting Decision",
        "Architectural Drift",
    ]
    createdAt: str
    status: Literal["active", "investigating", "dismissed", "resolved"] = "active"
    feedbackStatus: Literal["none", "useful", "not_useful"] = "none"
    summary: str
    evidenceChain: List[EvidenceChainStep] = Field(default_factory=list)
    recommendedAction: str

class EntityReviewSide(BaseModel):
    name: str
    type: NodeType
    source: str
    contextSnippet: str
    attributes: Dict[str, str] = Field(default_factory=dict)

class ReviewQueueItem(BaseModel):
    id: str
    type: Literal["EntityMerge", "AmbiguousRelation"]
    confidence: float
    timestamp: str
    entityA: EntityReviewSide
    entityB: EntityReviewSide
    conflictFields: Optional[List[str]] = Field(default_factory=list)
    status: Literal["pending", "merged", "rejected"] = "pending"

class SourceConnector(BaseModel):
    id: str
    name: str
    type: Literal["google_gmail", "google_calendar", "google_drive"]
    status: Literal["healthy", "syncing", "paused", "error"]
    lastSyncTime: str
    itemsProcessed: int = 0
    syncTokenOrHistoryId: str = ""
    errorCount: int = 0
    scopes: List[str] = Field(default_factory=list)

class WorkflowNode(BaseModel):
    id: str
    label: str
    type: Literal[
        "trigger",
        "extractor",
        "resolver",
        "graph_write",
        "router",
        "retrieval",
        "filter",
        "synthesizer",
        "verifier",
    ]
    description: str
    status: Literal["idle", "running", "success", "warning", "error"] = "idle"
    latencyMs: Optional[int] = 0
    config: Dict[str, Any] = Field(default_factory=dict)

class WorkflowEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    condition: Optional[str] = None

class ExecutionTrace(BaseModel):
    id: str
    nodeId: str
    nodeName: str
    status: Literal["completed", "interrupted", "failed"]
    durationMs: int
    timestamp: str
    inputPayload: Any = None
    outputPayload: Any = None
    interruptedReason: Optional[str] = None

class AgentWorkflow(BaseModel):
    id: str
    name: str
    graphType: Literal["Ingestion Graph", "Recall Graph", "Foresight Graph"]
    description: str
    status: Literal["draft", "ready", "running", "completed", "interrupted"] = "ready"
    nodes: List[WorkflowNode] = Field(default_factory=list)
    edges: List[WorkflowEdge] = Field(default_factory=list)
    checkpointerState: Dict[str, Any] = Field(default_factory=dict)
    recentTraces: List[ExecutionTrace] = Field(default_factory=list)

class Citation(BaseModel):
    id: str
    title: str
    sourceType: Literal["email", "document", "calendar"]
    author: str
    timestamp: str
    snippet: str
    url: Optional[str] = None
    aclGroup: str = "all"
    matchScore: float = 0.95

class GraphPath(BaseModel):
    nodes: List[str]
    description: str

class AskMessage(BaseModel):
    id: str
    sender: Literal["user", "synapse"]
    text: str
    timestamp: str
    citations: Optional[List[Citation]] = None
    graphPaths: Optional[List[GraphPath]] = None
    temporalScope: Optional[str] = None
    isStreaming: Optional[bool] = False

class UserSession(BaseModel):
    id: str
    name: str
    role: str
    email: str
    avatar: str
    tenantName: str
    tenantId: str
    acls: List[str] = Field(default_factory=list)

class AskQueryRequest(BaseModel):
    query: str
    user_id: Optional[str] = "usr-priya"
    tenant_id: Optional[str] = "tenant-artisan-corp-01"

class FeedbackRequest(BaseModel):
    feedback: Literal["useful", "not_useful"]

class IngestDocumentRequest(BaseModel):
    title: str
    content: str
    source_type: Literal["document", "email", "calendar"] = "document"
    author: str = "Priya Sharma"
    acl_group: str = "all"
    project_id: Optional[str] = None
