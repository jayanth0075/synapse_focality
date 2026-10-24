import React, { useState } from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Network,
} from 'lucide-react';
import { ProjectItem, ForesightAlert } from '../types';

interface ProjectDetailPageProps {
  project: ProjectItem;
  alerts: ForesightAlert[];
  onBack: () => void;
  onExploreGraphWithNode: (nodeId: string) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  project,
  alerts,
  onBack,
  onExploreGraphWithNode,
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'decisions' | 'risks' | 'team' | 'timeline'>('architecture');

  const relatedAlerts = alerts.filter(
    (a) => a.triggerItem.includes(project.name) || a.triggerItem.includes(project.code) || a.title.includes(project.name)
  );

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1360, margin: '0 auto', width: '100%' }}>
      {/* Back button and Workspace header */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={onBack}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}
        >
          <ArrowLeft size={13} />
          <span>Back to Projects</span>
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 700 }}>
                {project.code}
              </span>
              <span
                className={`badge ${
                  project.status === 'At Risk'
                    ? 'badge-rose'
                    : project.status === 'Completed'
                    ? 'badge-emerald'
                    : 'badge-cyan'
                }`}
              >
                {project.status}
              </span>
              <span className="badge badge-primary">{project.team}</span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {project.name}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4, maxWidth: 880, lineHeight: 1.5 }}>
              {project.description}
            </p>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div
              className="enterprise-card"
              style={{
                padding: '10px 16px',
                textAlign: 'center',
                borderLeft: project.status === 'At Risk' ? '3px solid var(--status-danger)' : '1px solid var(--border-subtle)',
              }}
            >
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Health Score
              </span>
              <p
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: project.healthScore >= 80 ? 'var(--status-success)' : project.healthScore >= 60 ? 'var(--status-warning)' : 'var(--status-danger)',
                }}
              >
                {project.healthScore}%
              </p>
            </div>

            <div className="enterprise-card" style={{ padding: '10px 16px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Target Delivery
              </span>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: 2 }}>
                {project.targetDate}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Sub-tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: '3px',
          background: '#f1f5f9',
          borderRadius: 'var(--radius-sm)',
          marginBottom: 20,
          width: 'fit-content',
        }}
      >
        {[
          { id: 'architecture', label: 'Architecture & Spec' },
          { id: 'decisions', label: `Key Decisions (${project.keyDecisions.length})` },
          { id: 'risks', label: `Failure Precedents (${project.relatedFailureRisks.length})` },
          { id: 'team', label: `Expert Team (${project.teamMembers.length})` },
          { id: 'timeline', label: 'Audit Timeline' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              background: activeTab === tab.id ? '#ffffff' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab.id ? 600 : 500,
              fontSize: '0.78rem',
              cursor: 'pointer',
              boxShadow: activeTab === tab.id ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.12s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT 1: Architecture & Spec */}
      {activeTab === 'architecture' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.75fr 1fr', gap: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="enterprise-card" style={{ padding: '18px 20px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Layers size={15} color="var(--accent-blue)" />
                <span>Architecture Specification Summary</span>
              </h3>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {project.architectureSummary}
              </p>

              <div
                style={{
                  marginTop: 14,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-xs)',
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Primary Technical Owner
                </span>
                <p style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                  {project.owner} (VP of Engineering) &bull; Technical Sponsor
                </p>
              </div>
            </div>

            {/* Linked Graph Nodes */}
            <div className="enterprise-card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Network size={15} color="#7c3aed" />
                  <span>Linked Knowledge Graph Nodes</span>
                </h3>
                <button
                  onClick={() => onExploreGraphWithNode(project.linkedEntityIds[0] || 'node-pr1')}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: 4, fontSize: '0.75rem' }}
                >
                  <Network size={12} />
                  <span>Open in Graph Studio</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {project.linkedEntityIds.map((id) => (
                  <span
                    key={id}
                    className="badge badge-primary"
                    style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                  >
                    Entity: {id}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Foresight Risk Assessment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              className="enterprise-card"
              style={{
                padding: '18px 20px',
                borderLeft: project.activeAlertCount > 0 ? '3px solid var(--status-danger)' : '3px solid var(--status-success)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <AlertTriangle size={16} color={project.activeAlertCount > 0 ? 'var(--status-danger)' : 'var(--status-success)'} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Foresight Precedent Assessment
                </h3>
              </div>

              {relatedAlerts.length > 0 ? (
                <div>
                  <span className="badge badge-rose" style={{ marginBottom: 8 }}>
                    Critical Topology Match Detected
                  </span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginTop: 4 }}>
                    Synapse graph traversals flagged that this project's specification matches failure patterns from
                    <strong> 2024 Incident #882</strong>.
                  </p>
                  <button
                    onClick={() => setActiveTab('risks')}
                    className="btn btn-sm btn-danger"
                    style={{ marginTop: 12, width: '100%' }}
                  >
                    View Precedent Failure Analysis &rarr;
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--status-success)' }}>
                  <CheckCircle2 size={15} />
                  <span style={{ fontSize: '0.825rem', fontWeight: 500 }}>No active structural failure precedents found.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: Key Decisions Log */}
      {activeTab === 'decisions' && (
        <div className="enterprise-card" style={{ padding: '18px 20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Formal Architectural Decisions Log
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14 }}>
            Every decision recorded in meetings, emails, and RFCs is committed to Synapse with bi-temporal validity windows.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {project.keyDecisions.map((dec) => (
              <div
                key={dec.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-xs)',
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span
                      className={`badge ${
                        dec.status === 'Active'
                          ? 'badge-emerald'
                          : dec.status === 'Under Review'
                          ? 'badge-amber'
                          : 'badge-rose'
                      }`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {dec.status}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {dec.date}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{dec.decision}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Decided by: <strong>{dec.decidedBy}</strong>
                  </p>
                </div>

                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                  {dec.id}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: Failure Risk Analysis */}
      {activeTab === 'risks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {project.relatedFailureRisks.map((risk, idx) => (
            <div
              key={idx}
              className="enterprise-card"
              style={{
                padding: '18px 20px',
                borderLeft: '4px solid var(--status-danger)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={16} color="var(--status-danger)" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Historical Failure Match: {risk.historicalProject}
                  </h3>
                </div>
                <span className="badge badge-rose" style={{ fontSize: '0.75rem' }}>
                  {risk.similarity}% Topology Similarity
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-xs)', background: 'var(--status-danger-bg)', border: '1px solid var(--status-danger-border)' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--status-danger-text)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Failure Mechanism (Lessons Learned)
                  </span>
                  <p style={{ fontSize: '0.825rem', color: 'var(--status-danger-text)', marginTop: 2, lineHeight: 1.45 }}>
                    {risk.failureReason}
                  </p>
                </div>

                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-xs)', background: 'var(--status-success-bg)', border: '1px solid var(--status-success-border)' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--status-success-text)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Synapse Recommended Mitigation
                  </span>
                  <p style={{ fontSize: '0.825rem', color: 'var(--status-success-text)', marginTop: 2, lineHeight: 1.45 }}>
                    {risk.mitigationStrategy}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT 4: Team & Expert Network */}
      {activeTab === 'team' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 14,
          }}
        >
          {project.teamMembers.map((member, idx) => (
            <div key={idx} className="enterprise-card" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <img
                  src={member.avatar}
                  alt={member.name}
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>{member.name}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.role}</p>
                </div>
              </div>

              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Verified Domain Expertise
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                {member.expertIn.map((exp) => (
                  <span key={exp} className="badge badge-primary" style={{ fontSize: '0.68rem' }}>
                    {exp}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT 5: Timeline */}
      {activeTab === 'timeline' && (
        <div className="enterprise-card" style={{ padding: '18px 20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
            Chronological Evidence Timeline
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderLeft: '2px solid var(--border-subtle)', paddingLeft: 18, marginLeft: 6 }}>
            {project.timeline.map((event, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: -24,
                    top: 4,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: event.type === 'alert' ? 'var(--status-danger)' : 'var(--accent-blue)',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {event.date}
                  </span>
                  <span className="badge badge-primary" style={{ fontSize: '0.62rem' }}>
                    {event.type}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                  {event.title}
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
                  {event.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default ProjectDetailPage;
