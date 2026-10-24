import {
  ProjectItem,
  GraphNode,
  GraphEdge,
  ForesightAlert,
  ReviewQueueItem,
  SourceConnector,
  AgentWorkflow,
  AskMessage,
  UserSession,
} from '../types';

const API_BASE = '/api';

export const apiClient = {
  // --- Admin & Overview ---
  async getOverview(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/overview`);
    if (!res.ok) throw new Error('Failed to fetch overview metrics');
    return res.json();
  },

  async getUsers(): Promise<UserSession[]> {
    const res = await fetch(`${API_BASE}/admin/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async getAuditLogs(limit = 50): Promise<any[]> {
    const res = await fetch(`${API_BASE}/admin/audit-logs?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  // --- Projects ---
  async getProjects(): Promise<ProjectItem[]> {
    const res = await fetch(`${API_BASE}/projects`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  async getProject(id: string): Promise<ProjectItem> {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch project ${id}`);
    return res.json();
  },

  async createProject(project: Partial<ProjectItem>): Promise<ProjectItem> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    if (!res.ok) throw new Error('Failed to create project');
    return res.json();
  },

  // --- Knowledge Graph ---
  async getNodes(type?: string, search?: string, asOfDate?: string): Promise<GraphNode[]> {
    const params = new URLSearchParams();
    if (type && type !== 'ALL') params.append('type', type);
    if (search) params.append('search', search);
    if (asOfDate) params.append('as_of_date', asOfDate);
    const res = await fetch(`${API_BASE}/graph/nodes?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch graph nodes');
    return res.json();
  },

  async getEdges(asOfDate?: string, userAcls?: string[]): Promise<GraphEdge[]> {
    const params = new URLSearchParams();
    if (asOfDate) params.append('as_of_date', asOfDate);
    if (userAcls) params.append('user_acls', userAcls.join(','));
    const res = await fetch(`${API_BASE}/graph/edges?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch graph edges');
    return res.json();
  },

  async getNodeDetail(id: string): Promise<GraphNode> {
    const res = await fetch(`${API_BASE}/graph/nodes/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch node ${id}`);
    return res.json();
  },

  async getNodeNeighborhood(id: string, depth = 1): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
    const res = await fetch(`${API_BASE}/graph/nodes/${id}/neighborhood?depth=${depth}`);
    if (!res.ok) throw new Error(`Failed to fetch neighborhood for node ${id}`);
    return res.json();
  },

  // --- Ask SYNAPSE (LangGraph Q&A) ---
  async askSynapse(query: string, userId = 'usr-jayanth'): Promise<AskMessage> {
    const res = await fetch(`${API_BASE}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, user_id: userId }),
    });
    if (!res.ok) throw new Error('Failed to query Ask Synapse');
    return res.json();
  },

  // --- Foresight Risk Analysis ---
  async getAlerts(status?: string): Promise<ForesightAlert[]> {
    const url = status ? `${API_BASE}/foresight/alerts?status=${status}` : `${API_BASE}/foresight/alerts`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch foresight alerts');
    return res.json();
  },

  async submitAlertFeedback(alertId: string, feedback: 'useful' | 'not_useful'): Promise<any> {
    const res = await fetch(`${API_BASE}/foresight/alerts/${alertId}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback }),
    });
    if (!res.ok) throw new Error('Failed to submit alert feedback');
    return res.json();
  },

  async dismissAlert(alertId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/foresight/alerts/${alertId}/dismiss`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to dismiss alert');
    return res.json();
  },

  async runForesightAnalysis(projectId?: string): Promise<any> {
    const url = projectId ? `${API_BASE}/foresight/run?project_id=${projectId}` : `${API_BASE}/foresight/run`;
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to run foresight analysis');
    return res.json();
  },

  // --- Sources & Review Queue ---
  async getConnectors(): Promise<SourceConnector[]> {
    const res = await fetch(`${API_BASE}/sources/connectors`);
    if (!res.ok) throw new Error('Failed to fetch connectors');
    return res.json();
  },

  async syncConnector(connectorId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/sources/connectors/${connectorId}/sync`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to sync connector');
    return res.json();
  },

  async getReviewQueue(): Promise<ReviewQueueItem[]> {
    const res = await fetch(`${API_BASE}/sources/review-queue`);
    if (!res.ok) throw new Error('Failed to fetch review queue');
    return res.json();
  },

  async resolveReview(reviewId: string, action: 'merged' | 'rejected'): Promise<any> {
    const res = await fetch(`${API_BASE}/sources/review-queue/${reviewId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) throw new Error('Failed to resolve review item');
    return res.json();
  },

  // --- Document Ingestion (LangGraph) ---
  async ingestDocument(data: {
    title: string;
    content: string;
    source_type?: string;
    author?: string;
    acl_group?: string;
    project_id?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/documents/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to ingest document');
    return res.json();
  },

  async uploadDocument(formData: FormData): Promise<any> {
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload document file');
    return res.json();
  },

  // --- Workflows (LangGraph Tracing) ---
  async getWorkflows(): Promise<AgentWorkflow[]> {
    const res = await fetch(`${API_BASE}/workflows`);
    if (!res.ok) throw new Error('Failed to fetch workflows');
    return res.json();
  },

  async runWorkflowStep(workflowId: string, nodeId?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/workflows/${workflowId}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ node_id: nodeId }),
    });
    if (!res.ok) throw new Error('Failed to run workflow step');
    return res.json();
  },
};
