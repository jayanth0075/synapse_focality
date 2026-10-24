import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  Search,
  AlertTriangle,
  ArrowRight,
  X,
} from 'lucide-react';
import { ProjectItem } from '../types';

interface ProjectsPageProps {
  projects: ProjectItem[];
  onSelectProject: (projectId: string) => void;
  onCreateProject: (newProject: Partial<ProjectItem>) => Promise<void>;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  onSelectProject,
  onCreateProject,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // New Project Form State
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newOwner, setNewOwner] = useState('Priya Sharma');

  const filteredProjects = projects.filter((p) => {
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim() || isSaving) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      await onCreateProject({
      code: newCode.toUpperCase(),
      name: newName,
      description: newDesc,
      owner: newOwner,
      status: 'Active',
      healthScore: 90,
      activeAlertCount: 0,
      keyDecisions: [],
      teamMembers: [
        {
          name: newOwner,
          role: 'Owner',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
          expertIn: ['Project Management'],
        },
      ],
      timeline: [
        {
          date: new Date().toISOString().split('T')[0],
          title: 'Project Workspace Initialized',
          type: 'document',
          description: 'Workspace created in Synapse.',
        },
      ],
      relatedFailureRisks: [],
      linkedEntityIds: [],
      });
      setIsModalOpen(false);
      setNewCode('');
      setNewName('');
      setNewDesc('');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not create project.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1360, margin: '0 auto', width: '100%' }}>
      {/* Header and Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 18,
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
            Project Workspaces
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Monitor organizational projects, architectural decisions, and proactive failure-precedent matching.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
          style={{ gap: 6 }}
        >
          <Plus size={14} />
          <span>New Workspace</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '6px 12px',
            gap: 8,
            flex: 1,
            minWidth: 260,
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search projects by name, code, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.825rem',
              width: '100%',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            gap: 4,
            padding: '3px',
            background: '#f1f5f9',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {(['ALL', 'At Risk', 'Active', 'On Track', 'Completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                fontSize: '0.78rem',
                fontWeight: statusFilter === status ? 600 : 500,
                padding: '4px 10px',
                borderRadius: 'var(--radius-xs)',
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === status ? '#ffffff' : 'transparent',
                color: statusFilter === status ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: statusFilter === status ? 'var(--shadow-xs)' : 'none',
                transition: 'all 0.12s ease',
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 16,
        }}
      >
        {filteredProjects.map((project) => {
          const isAtRisk = project.status === 'At Risk';
          return (
            <div
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className="enterprise-card enterprise-card-interactive"
              style={{
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: `3px solid ${
                  isAtRisk ? 'var(--status-danger)' : project.status === 'Completed' ? 'var(--status-success)' : 'var(--accent-blue)'
                }`,
              }}
            >
              <div>
                {/* Header Pills */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        fontWeight: 600,
                      }}
                    >
                      {project.code}
                    </span>
                    <span
                      className={`badge ${
                        isAtRisk ? 'badge-rose' : project.status === 'Completed' ? 'badge-emerald' : 'badge-cyan'
                      }`}
                      style={{ fontSize: '0.68rem' }}
                    >
                      {project.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Health:</span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        color: project.healthScore >= 80 ? 'var(--status-success)' : project.healthScore >= 60 ? 'var(--status-warning)' : 'var(--status-danger)',
                      }}
                    >
                      {project.healthScore}%
                    </span>
                  </div>
                </div>

                {/* Title and Description */}
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: 4,
                  }}
                >
                  {project.name}
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: 12 }}>
                  {project.description}
                </p>

                {/* Active Alerts Banner if present */}
                {project.activeAlertCount > 0 && (
                  <div
                    style={{
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--status-danger-bg)',
                      border: '1px solid var(--status-danger-border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <AlertTriangle size={13} color="var(--status-danger)" />
                    <span style={{ fontSize: '0.72rem', color: 'var(--status-danger-text)', fontWeight: 600 }}>
                      Foresight Alert: {project.activeAlertCount} failure pattern identified
                    </span>
                  </div>
                )}
              </div>

              {/* Footer Details */}
              <div
                style={{
                  paddingTop: 10,
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.78rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Lead:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {project.owner}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    color: 'var(--accent-blue)',
                    fontWeight: 600,
                  }}
                >
                  <span>Open Workspace</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Project Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="enterprise-card"
            style={{
              width: '100%',
              maxWidth: 480,
              padding: '24px 26px',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FolderGit2 size={18} color="var(--text-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Initialize Project Workspace
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {saveError && (
                <p role="alert" style={{ color: 'var(--status-danger)', fontSize: '0.8rem' }}>
                  {saveError}
                </p>
              )}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
                  Project Code / Identifier
                </label>
                <input
                  type="text"
                  placeholder="e.g. TITAN-05"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-xs)',
                    background: '#f8fafc',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.825rem',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
                  Project Full Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Titan Cold Storage Tiering Architecture"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-xs)',
                    background: '#f8fafc',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '0.825rem',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
                  Architectural Scope &amp; Target Goal
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the initiative, key technologies, and intended outcome..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-xs)',
                    background: '#f8fafc',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    resize: 'none',
                    fontSize: '0.825rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
