import React from 'react';
import {
  Network,
  AlertTriangle,
  FolderGit2,
  ArrowRight,
  Sparkles,
  GitPullRequest,
  CheckCircle2,
  Activity,
  Layers,
} from 'lucide-react';
import { ProjectItem, ForesightAlert, GraphNode, UserSession } from '../types';
import { AppView } from '../components/Navigation';

interface DashboardPageProps {
  projects: ProjectItem[];
  alerts: ForesightAlert[];
  nodes: GraphNode[];
  currentUser: UserSession;
  onNavigate: (view: AppView, params?: Record<string, any>) => void;
  onSelectProject: (projectId: string) => void;
  onSelectNode: (nodeId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  projects,
  alerts,
  nodes,
  currentUser,
  onNavigate,
  onSelectProject,
  onSelectNode,
}) => {
  const criticalAlert = alerts.find((a) => a.severity === 'critical');
  const activeAlerts = alerts.filter((a) => a.status === 'active');

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1360, margin: '0 auto', width: '100%' }}>
      {/* 1. Page Header & Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.45rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            Overview
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Organizational knowledge graph state across communication and specification streams.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onNavigate('ask')}
            className="btn btn-primary"
            style={{ gap: 6 }}
          >
            <Sparkles size={14} />
            <span>Ask Synapse</span>
          </button>
          <button
            onClick={() => onNavigate('explorer')}
            className="btn btn-secondary"
            style={{ gap: 6 }}
          >
            <Network size={14} />
            <span>Knowledge Graph</span>
          </button>
        </div>
      </div>

      {/* 2. Critical Intelligence Risk Alert (Restrained Callout) */}
      {criticalAlert && (
        <div
          style={{
            marginBottom: 20,
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--status-danger-border)',
            borderLeft: '4px solid var(--status-danger)',
            background: 'var(--status-danger-bg)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 280 }}>
            <AlertTriangle size={18} color="var(--status-danger)" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <span
                  className="badge badge-rose"
                  style={{ fontSize: '0.68rem', padding: '1px 6px' }}
                >
                  Critical Precedent Alert &bull; {(criticalAlert.similarityScore * 100).toFixed(0)}% Match
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--status-danger-text)' }}>
                  {criticalAlert.createdAt}
                </span>
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--status-danger-text)' }}>
                {criticalAlert.title}
              </h3>
              <p
                style={{
                  fontSize: '0.825rem',
                  color: 'var(--status-danger-text)',
                  marginTop: 3,
                  lineHeight: 1.45,
                  opacity: 0.9,
                }}
              >
                {criticalAlert.summary}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('foresight')}
            className="btn btn-danger"
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              gap: 4,
              alignSelf: 'center',
            }}
          >
            <span>Inspect Causal Chain</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* 3. High-Value System Metrics (Compact, Structured Tiles) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
          marginBottom: 24,
        }}
      >
        <div className="enterprise-card" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Entity Nodes
            </span>
            <Network size={15} color="var(--accent-blue)" />
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              14,820
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
              <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>+412</span> ingested this week
            </div>
          </div>
        </div>

        <div className="enterprise-card" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Bi-Temporal Edges
            </span>
            <Layers size={15} color="#7c3aed" />
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              48,190
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Cross-referenced relationships
            </div>
          </div>
        </div>

        <div className="enterprise-card" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Risk Warnings
            </span>
            <AlertTriangle size={15} color="var(--status-danger)" />
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--status-danger)' }}>
              {activeAlerts.length}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
              1 Critical &bull; 1 High &bull; 1 Medium
            </div>
          </div>
        </div>

        <div className="enterprise-card" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Connected Feeds
            </span>
            <Activity size={15} color="var(--status-success)" />
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--status-success)' }}>
              3 Active
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Gmail, Calendar, Drive sync
            </div>
          </div>
        </div>
      </div>

      {/* 4. Structured Main Section: Projects List (Left) & Knowledge Updates (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 20 }}>
        {/* Left: Active Project Workspaces */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Active Project Workspaces
            </h2>
            <button
              onClick={() => onNavigate('projects')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', padding: '3px 8px' }}
            >
              All Projects ({projects.length}) &rarr;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {projects.map((proj) => {
              const isAtRisk = proj.status === 'At Risk';
              return (
                <div
                  key={proj.id}
                  onClick={() => onSelectProject(proj.id)}
                  className="enterprise-card enterprise-card-interactive"
                  style={{
                    padding: '14px 16px',
                    borderLeft: `3px solid ${
                      isAtRisk ? 'var(--status-danger)' : proj.status === 'Completed' ? 'var(--status-success)' : 'var(--accent-blue)'
                    }`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          {proj.code}
                        </span>
                        <span
                          className={`badge ${
                            isAtRisk ? 'badge-rose' : proj.status === 'Completed' ? 'badge-emerald' : 'badge-cyan'
                          }`}
                          style={{ fontSize: '0.65rem' }}
                        >
                          {proj.status}
                        </span>
                        {proj.activeAlertCount > 0 && (
                          <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
                            {proj.activeAlertCount} Warning{proj.activeAlertCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      <h3
                        style={{
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                        }}
                      >
                        {proj.name}
                      </h3>
                      <p
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          marginTop: 3,
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {proj.description}
                      </p>
                    </div>

                    {/* Health Score */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Health</span>
                      <span
                        style={{
                          fontSize: '1.15rem',
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                          color: proj.healthScore >= 80 ? 'var(--status-success)' : proj.healthScore >= 60 ? 'var(--status-warning)' : 'var(--status-danger)',
                        }}
                      >
                        {proj.healthScore}%
                      </span>
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 10,
                      paddingTop: 8,
                      borderTop: '1px solid var(--border-subtle)',
                      fontSize: '0.75rem',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>
                      Lead: <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{proj.owner}</strong>
                    </span>
                    <span style={{ color: 'var(--accent-blue)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      Open Workspace &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Recent Graph Memory Facts */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Graph Facts
            </h2>
            <button
              onClick={() => onNavigate('explorer')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', padding: '3px 8px' }}
            >
              Graph &rarr;
            </button>
          </div>

          <div className="enterprise-card" style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column' }}>
            {nodes.slice(0, 6).map((node, i) => (
              <div
                key={node.id}
                onClick={() => onSelectNode(node.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '10px 8px',
                  cursor: 'pointer',
                  borderBottom: i < 5 ? '1px solid var(--border-subtle)' : 'none',
                  transition: 'background-color 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span className={`badge badge-node-${node.type}`} style={{ fontSize: '0.62rem', marginTop: 1, flexShrink: 0 }}>
                  {node.type}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {node.label}
                  </p>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginTop: 2,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {node.summary}
                  </p>
                </div>
                <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', flexShrink: 0 }}>
                  {node.createdDate.substring(5)}
                </span>
              </div>
            ))}

            <div style={{ paddingTop: 8, paddingBottom: 4 }}>
              <button
                onClick={() => onNavigate('sources')}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', gap: 6, fontSize: '0.75rem' }}
              >
                <GitPullRequest size={13} color="var(--status-warning)" />
                <span>Review Ingestion Queue (2 Ambiguous Merges)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
