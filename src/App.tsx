import React, { useState, useEffect } from 'react';
import { AppView, Navigation } from './components/Navigation';
import { TopHeader } from './components/TopHeader';
import { CitationDrawer } from './components/CitationDrawer';
import { CommandPaletteModal } from './components/CommandPaletteModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AskPage } from './pages/AskPage';
import { ExplorerPage } from './pages/ExplorerPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { EntitiesPage } from './pages/EntitiesPage';
import { EntityDetailPage } from './pages/EntityDetailPage';
import { ForesightPage } from './pages/ForesightPage';
import { SourcesPage } from './pages/SourcesPage';
import { WorkflowsPage } from './pages/WorkflowsPage';
import { AdminPage } from './pages/AdminPage';

// Data & Types
import {
  MOCK_PROJECTS,
  MOCK_GRAPH_NODES,
  MOCK_GRAPH_EDGES,
  MOCK_FORESIGHT_ALERTS,
  MOCK_REVIEW_QUEUE,
  MOCK_CONNECTORS,
  MOCK_AGENT_WORKFLOWS,
  CURRENT_USER,
} from './data/mockData';
import {
  UserSession,
  Citation,
  GraphNode,
  GraphEdge,
  ProjectItem,
  ForesightAlert,
  ReviewQueueItem,
  SourceConnector,
  AgentWorkflow,
} from './types';
import { apiClient } from './api/client';

export const App: React.FC = () => {
  // Navigation View State: Opens directly into the primary workspace (Dashboard / Overview)
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [currentUser, setCurrentUser] = useState<UserSession>(CURRENT_USER);

  // Data States
  const [projects, setProjects] = useState<ProjectItem[]>(MOCK_PROJECTS);
  const [nodes, setNodes] = useState<GraphNode[]>(MOCK_GRAPH_NODES);
  const [edges, setEdges] = useState<GraphEdge[]>(MOCK_GRAPH_EDGES);
  const [alerts, setAlerts] = useState<ForesightAlert[]>(MOCK_FORESIGHT_ALERTS);
  const [reviewQueue, setReviewQueue] = useState<ReviewQueueItem[]>(MOCK_REVIEW_QUEUE);
  const [connectors, setConnectors] = useState<SourceConnector[]>(MOCK_CONNECTORS);
  const [workflows, setWorkflows] = useState<AgentWorkflow[]>(MOCK_AGENT_WORKFLOWS);

  // Selected Items State
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj-atlas');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Load live data from real FastAPI backend
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const [
          projsRes,
          nodesRes,
          edgesRes,
          alertsRes,
          reviewsRes,
          connsRes,
          wfsRes
        ] = await Promise.allSettled([
          apiClient.getProjects(),
          apiClient.getNodes(),
          apiClient.getEdges(undefined, currentUser.acls),
          apiClient.getAlerts(),
          apiClient.getReviewQueue(),
          apiClient.getConnectors(),
          apiClient.getWorkflows()
        ]);

        if (projsRes.status === 'fulfilled' && projsRes.value.length > 0) {
          setProjects(projsRes.value);
        }
        if (nodesRes.status === 'fulfilled' && nodesRes.value.length > 0) {
          setNodes(nodesRes.value);
        }
        if (edgesRes.status === 'fulfilled' && edgesRes.value.length > 0) {
          setEdges(edgesRes.value);
        }
        if (alertsRes.status === 'fulfilled' && alertsRes.value.length > 0) {
          setAlerts(alertsRes.value);
        }
        if (reviewsRes.status === 'fulfilled' && reviewsRes.value.length > 0) {
          setReviewQueue(reviewsRes.value);
        }
        if (connsRes.status === 'fulfilled' && connsRes.value.length > 0) {
          setConnectors(connsRes.value);
        }
        if (wfsRes.status === 'fulfilled' && wfsRes.value.length > 0) {
          setWorkflows(wfsRes.value);
        }
      } catch (e) {
        console.warn('Backend API connecting in background:', e);
      }
    };

    fetchLiveData();
  }, [currentUser]);

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Hash-based routing sync for public entry points (#landing, #login, #dashboard)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase().replace('#', '');
      if (hash === 'landing') {
        setCurrentView('landing');
      } else if (hash === 'login') {
        setCurrentView('login');
      } else if (hash === 'dashboard' || hash === 'overview') {
        setCurrentView('dashboard');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Navigation Handler
  const handleNavigate = (view: AppView, params?: Record<string, any>) => {
    if (params?.projectId) setSelectedProjectId(params.projectId);
    if (params?.nodeId) setSelectedNodeId(params.nodeId);
    setCurrentView(view);
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentView('project-detail');
  };

  const handleCreateProject = async (newProjData: Partial<ProjectItem>) => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      code: newProjData.code || 'PRJ-NEW',
      name: newProjData.name || 'New Project',
      status: newProjData.status || 'Active',
      healthScore: newProjData.healthScore || 90,
      owner: newProjData.owner || currentUser.name,
      team: 'Engineering',
      targetDate: '2027-01-01',
      description: newProjData.description || '',
      architectureSummary: newProjData.architectureSummary || 'Architecture proposal in draft state.',
      activeAlertCount: 0,
      keyDecisions: [],
      teamMembers: [
        {
          name: currentUser.name,
          role: 'Owner',
          avatar: currentUser.avatar,
          expertIn: ['Architecture', 'Systems'],
        },
      ],
      timeline: [
        {
          date: new Date().toISOString().split('T')[0],
          title: 'Workspace Initialized',
          type: 'document',
          description: 'Project workspace created in Synapse.',
        },
      ],
      relatedFailureRisks: [],
      linkedEntityIds: [],
    };
    try {
      const saved = await apiClient.createProject(newProj);
      setProjects((prev) => [saved, ...prev]);
    } catch {
      setProjects((prev) => [newProj, ...prev]);
    }
    setSelectedProjectId(newProj.id);
    setCurrentView('project-detail');
  };

  const handleSelectNodeDetail = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setCurrentView('entity-detail');
  };

  const handleExploreInGraph = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setCurrentView('explorer');
  };

  const handleUpdateAlertFeedback = async (alertId: string, feedback: 'useful' | 'not_useful') => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, feedbackStatus: feedback } : a))
    );
    try {
      await apiClient.submitAlertFeedback(alertId, feedback);
    } catch (err) {
      console.error('Failed to submit feedback to backend:', err);
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'dismissed' } : a))
    );
    try {
      await apiClient.dismissAlert(alertId);
    } catch (err) {
      console.error('Failed to dismiss alert in backend:', err);
    }
  };

  const handleResolveMerge = async (reviewId: string, action: 'merged' | 'rejected') => {
    setReviewQueue((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: action } : r))
    );
    try {
      await apiClient.resolveReview(reviewId, action);
    } catch (err) {
      console.error('Failed to resolve merge in backend:', err);
    }
  };

  // Dedicated Views: Landing Page (accessible if explicitly needed, but not on persistent nav)
  if (currentView === 'landing') {
    return (
      <LandingPage
        onEnterApp={() => {
          window.location.hash = 'dashboard';
          setCurrentView('dashboard');
        }}
        onGoToLogin={() => {
          window.location.hash = 'login';
          setCurrentView('login');
        }}
        onExploreGraph={() => {
          window.location.hash = 'explorer';
          setCurrentView('explorer');
        }}
      />
    );
  }

  // Dedicated Views: Login Page (enters directly into the workspace on submit)
  if (currentView === 'login') {
    return (
      <LoginPage
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          window.location.hash = 'dashboard';
          setCurrentView('dashboard');
        }}
        onBackToLanding={() => {
          window.location.hash = 'landing';
          setCurrentView('landing');
        }}
      />
    );
  }

  const currentProject =
    projects.find((p) => p.id === selectedProjectId) || projects[0];
  const currentNode =
    nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Navigation
        currentView={currentView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        activeAlertCount={alerts.filter((a) => a.status === 'active').length}
        pendingReviewCount={reviewQueue.filter((r) => r.status === 'pending').length}
        onLogout={() => setCurrentView('login')}
      />

      {/* Main Workspace Area */}
      <div className="main-content">
        {/* Top Header */}
        <TopHeader
          currentView={currentView}
          currentUser={currentUser}
          onSelectUser={(u) => setCurrentUser(u)}
          onNavigate={handleNavigate}
          alerts={alerts}
          onOpenQuickSearch={() => setIsCommandPaletteOpen(true)}
        />

        {/* View Router */}
        <main style={{ flex: 1 }}>
          {currentView === 'dashboard' && (
            <DashboardPage
              projects={projects}
              alerts={alerts}
              nodes={nodes}
              currentUser={currentUser}
              onNavigate={handleNavigate}
              onSelectProject={handleSelectProject}
              onSelectNode={handleSelectNodeDetail}
            />
          )}

          {currentView === 'ask' && (
            <AskPage
              onOpenCitation={(citation) => setActiveCitation(citation)}
              onNavigateToGraph={handleExploreInGraph}
              currentUser={currentUser}
            />
          )}

          {currentView === 'explorer' && (
            <ExplorerPage
              nodes={nodes}
              edges={edges}
              selectedNodeId={selectedNodeId}
              onSelectNode={(node) => setSelectedNodeId(node?.id || null)}
              onOpenCitation={(citation) => setActiveCitation(citation)}
            />
          )}

          {currentView === 'projects' && (
            <ProjectsPage
              projects={projects}
              onSelectProject={handleSelectProject}
              onCreateProject={handleCreateProject}
            />
          )}

          {currentView === 'project-detail' && currentProject && (
            <ProjectDetailPage
              project={currentProject}
              alerts={alerts}
              onBack={() => setCurrentView('projects')}
              onExploreGraphWithNode={handleExploreInGraph}
            />
          )}

          {currentView === 'entities' && (
            <EntitiesPage
              nodes={nodes}
              onSelectNodeDetail={handleSelectNodeDetail}
              onExploreInGraph={handleExploreInGraph}
            />
          )}

          {currentView === 'entity-detail' && currentNode && (
            <EntityDetailPage
              node={currentNode}
              edges={edges}
              allNodes={nodes}
              onBack={() => setCurrentView('entities')}
              onExploreInGraph={handleExploreInGraph}
              onAskAboutEntity={(query) => {
                handleNavigate('ask');
              }}
            />
          )}

          {currentView === 'foresight' && (
            <ForesightPage
              alerts={alerts}
              onUpdateAlertFeedback={handleUpdateAlertFeedback}
              onDismissAlert={handleDismissAlert}
              onExploreEvidenceNode={handleExploreInGraph}
            />
          )}

          {currentView === 'sources' && (
            <SourcesPage
              connectors={connectors}
              reviewQueue={reviewQueue}
              onResolveMerge={handleResolveMerge}
            />
          )}

          {currentView === 'workflows' && (
            <WorkflowsPage workflows={workflows} />
          )}

          {currentView === 'admin' && (
            <AdminPage currentUser={currentUser} />
          )}
        </main>
      </div>

      {/* Slide-out Ground-Truth Citation Drawer */}
      <CitationDrawer
        citation={activeCitation}
        onClose={() => setActiveCitation(null)}
      />

      {/* Global Cmd+K Search Palette */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        nodes={nodes}
        projects={projects}
        alerts={alerts}
        onSelectProject={handleSelectProject}
        onSelectNode={handleSelectNodeDetail}
        onSelectAlert={(alertId) => {
          handleNavigate('foresight');
        }}
        onNavigateToLanding={() => {
          window.location.hash = 'landing';
          setCurrentView('landing');
        }}
      />
    </div>
  );
};
export default App;
