// Core Domain Types for Synapse Organizational Memory

export type NodeType =
  | 'Person'
  | 'Team'
  | 'Project'
  | 'Meeting'
  | 'Document'
  | 'EmailThread'
  | 'Decision'
  | 'Problem'
  | 'Outcome'
  | 'Topic'
  | 'Customer';

export type EdgeType =
  | 'ATTENDED'
  | 'OWNS'
  | 'AUTHORED'
  | 'DECIDED'
  | 'CAUSED'
  | 'FAILED_DUE_TO'
  | 'RESOLVED_BY'
  | 'MENTIONS'
  | 'SUPERSEDES'
  | 'EXPERT_IN';

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  subTitle?: string;
  summary: string;
  createdDate: string;
  authorOrOwner?: string;
  tags?: string[];
  properties?: Record<string, any>;
  validFrom?: string;
  validTo?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: EdgeType;
  validFrom: string;
  validTo?: string; // If undefined, currently active
  sourceId: string;
  supportingTextSpan: string;
  extractionConfidence: number;
  aclAccessList: string[]; // e.g., ["eng-team", "execs", "all"]
}

export interface ProjectItem {
  id: string;
  code: string;
  name: string;
  status: 'Active' | 'At Risk' | 'On Track' | 'Completed' | 'Archived';
  healthScore: number; // 0 - 100
  owner: string;
  team: string;
  targetDate: string;
  description: string;
  architectureSummary: string;
  activeAlertCount: number;
  keyDecisions: Array<{
    id: string;
    decision: string;
    decidedBy: string;
    date: string;
    status: 'Active' | 'Superseded' | 'Under Review';
  }>;
  teamMembers: Array<{
    name: string;
    role: string;
    avatar: string;
    expertIn: string[];
  }>;
  timeline: Array<{
    date: string;
    title: string;
    type: 'meeting' | 'decision' | 'document' | 'alert';
    description: string;
  }>;
  relatedFailureRisks: Array<{
    historicalProject: string;
    failureReason: string;
    similarity: number;
    mitigationStrategy: string;
  }>;
  linkedEntityIds: string[];
}

export interface ForesightAlert {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium';
  similarityScore: number; // e.g. 0.89
  triggerItem: string;
  category: 'Failure Precedent' | 'Knowledge Silo' | 'Contradicting Decision' | 'Architectural Drift';
  createdAt: string;
  status: 'active' | 'investigating' | 'dismissed' | 'resolved';
  feedbackStatus: 'none' | 'useful' | 'not_useful';
  summary: string;
  evidenceChain: Array<{
    step: number;
    node: string;
    nodeType: NodeType;
    relation: string;
    targetNode: string;
    targetType: NodeType;
    citation: string;
    sourceDoc: string;
  }>;
  recommendedAction: string;
}

export interface ReviewQueueItem {
  id: string;
  type: 'EntityMerge' | 'AmbiguousRelation';
  confidence: number;
  timestamp: string;
  entityA: {
    name: string;
    type: NodeType;
    source: string;
    contextSnippet: string;
    attributes: Record<string, string>;
  };
  entityB: {
    name: string;
    type: NodeType;
    source: string;
    contextSnippet: string;
    attributes: Record<string, string>;
  };
  conflictFields?: string[];
  status: 'pending' | 'merged' | 'rejected';
}

export interface SourceConnector {
  id: string;
  name: string;
  type: 'google_gmail' | 'google_calendar' | 'google_drive';
  status: 'healthy' | 'syncing' | 'paused' | 'error';
  lastSyncTime: string;
  itemsProcessed: number;
  syncTokenOrHistoryId: string;
  errorCount: number;
  scopes: string[];
}

export interface WorkflowNode {
  id: string;
  label: string;
  type: 'trigger' | 'extractor' | 'resolver' | 'graph_write' | 'router' | 'retrieval' | 'filter' | 'synthesizer' | 'verifier';
  description: string;
  status: 'idle' | 'running' | 'success' | 'warning' | 'error';
  latencyMs?: number;
  config: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

export interface ExecutionTrace {
  id: string;
  nodeId: string;
  nodeName: string;
  status: 'completed' | 'interrupted' | 'failed';
  durationMs: number;
  timestamp: string;
  inputPayload: any;
  outputPayload: any;
  interruptedReason?: string;
}

export interface AgentWorkflow {
  id: string;
  name: string;
  graphType: 'Ingestion Graph' | 'Recall Graph' | 'Foresight Graph';
  description: string;
  status: 'draft' | 'ready' | 'running' | 'completed' | 'interrupted';
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  checkpointerState: {
    threadId: string;
    checkpointId: string;
    stepCount: number;
    pendingInterrupt: boolean;
    channelValues: Record<string, any>;
  };
  recentTraces: ExecutionTrace[];
}

export interface Citation {
  id: string;
  title: string;
  sourceType: 'email' | 'document' | 'calendar';
  author: string;
  timestamp: string;
  snippet: string;
  url?: string;
  aclGroup: string;
  matchScore: number;
}

export interface AskMessage {
  id: string;
  sender: 'user' | 'synapse';
  text: string;
  timestamp: string;
  citations?: Citation[];
  graphPaths?: Array<{
    nodes: string[];
    description: string;
  }>;
  temporalScope?: string;
  isStreaming?: boolean;
}

export interface UserSession {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  tenantName: string;
  tenantId: string;
  acls: string[];
}
