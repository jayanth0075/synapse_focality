import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Network,
  FolderGit2,
  Users,
  AlertOctagon,
  GitPullRequest,
  Cpu,
  ShieldCheck,
  LogOut,
  Globe,
} from 'lucide-react';
import { UserSession } from '../types';

export type AppView =
  | 'landing'
  | 'login'
  | 'dashboard'
  | 'ask'
  | 'explorer'
  | 'projects'
  | 'project-detail'
  | 'entities'
  | 'entity-detail'
  | 'foresight'
  | 'sources'
  | 'workflows'
  | 'admin';

interface NavigationProps {
  currentView: AppView;
  onNavigate: (view: AppView, params?: Record<string, any>) => void;
  currentUser: UserSession;
  activeAlertCount: number;
  pendingReviewCount: number;
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onNavigate,
  currentUser,
  activeAlertCount,
  pendingReviewCount,
  onLogout,
}) => {
  const navSections = [
    {
      title: 'WORKSPACE',
      items: [
        {
          id: 'dashboard' as AppView,
          label: 'Overview',
          icon: <LayoutDashboard size={16} />,
          badge: null,
        },
        {
          id: 'ask' as AppView,
          label: 'Ask Synapse',
          icon: <MessageSquare size={16} />,
          badge: null,
        },
        {
          id: 'explorer' as AppView,
          label: 'Knowledge Graph',
          icon: <Network size={16} />,
          badge: null,
        },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        {
          id: 'projects' as AppView,
          label: 'Projects',
          icon: <FolderGit2 size={16} />,
          badge: null,
        },
        {
          id: 'entities' as AppView,
          label: 'People & Entities',
          icon: <Users size={16} />,
          badge: null,
        },
        {
          id: 'foresight' as AppView,
          label: 'Alerts',
          icon: <AlertOctagon size={16} />,
          badge: activeAlertCount > 0 ? `${activeAlertCount}` : null,
          badgeColor: 'badge-rose',
        },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        {
          id: 'sources' as AppView,
          label: 'Sources & Review',
          icon: <GitPullRequest size={16} />,
          badge: pendingReviewCount > 0 ? `${pendingReviewCount}` : null,
          badgeColor: 'badge-amber',
        },
        {
          id: 'workflows' as AppView,
          label: 'Workflows',
          icon: <Cpu size={16} />,
          badge: null,
        },
        {
          id: 'admin' as AppView,
          label: 'Settings',
          icon: <ShieldCheck size={16} />,
          badge: null,
        },
      ],
    },
  ];

  return (
    <aside
      style={{
        width: 240,
        height: '100vh',
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 50,
      }}
    >
      <div>
        {/* Brand Header */}
        <div
          onClick={() => onNavigate('dashboard')}
          title="SYNAPSE Overview"
          style={{
            padding: '16px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-xs)',
              flexShrink: 0,
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ffffff' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.025em', color: '#0f172a' }}>
              SYNAPSE
            </span>
            <span
              style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                padding: '1px 5px',
                borderRadius: 'var(--radius-xs)',
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #e2e8f0',
              }}
            >
              v2.0
            </span>
          </div>
        </div>

        {/* Tenant Organization Indicator */}
        <div style={{ padding: '12px 14px 6px 14px' }}>
          <div
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#16a34a',
                flexShrink: 0,
              }}
            />
            <div style={{ overflow: 'hidden' }}>
              <p
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {currentUser.tenantName}
              </p>
            </div>
          </div>
        </div>

        {/* Semantic Navigation Link Groups */}
        <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {navSections.map((section) => (
            <div key={section.title}>
              <div
                style={{
                  padding: '4px 10px 4px 10px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.06em',
                }}
              >
                {section.title}
              </div>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {section.items.map((item) => {
                  const isActive =
                    currentView === item.id ||
                    (item.id === 'projects' && currentView === 'project-detail') ||
                    (item.id === 'entities' && currentView === 'entity-detail');

                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        background: isActive ? '#f1f5f9' : 'transparent',
                        color: isActive ? '#0f172a' : '#475569',
                        fontWeight: isActive ? 600 : 500,
                        fontSize: '0.825rem',
                        cursor: 'pointer',
                        transition: 'background-color 0.12s ease, color 0.12s ease',
                        textAlign: 'left',
                        width: '100%',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                          e.currentTarget.style.color = '#0f172a';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#475569';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: isActive ? '#0f172a' : '#64748b' }}>{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`badge ${item.badgeColor || 'badge-primary'}`}
                          style={{
                            fontSize: '0.65rem',
                            padding: '1px 5px',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* User Session Footer */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-subtle)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 8px',
            borderRadius: 'var(--radius-sm)',
            background: '#f8fafc',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1px solid #cbd5e1',
                flexShrink: 0,
              }}
            />
            <div style={{ overflow: 'hidden' }}>
              <p
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {currentUser.name}
              </p>
              <p style={{ fontSize: '0.68rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                {currentUser.role}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <button
              onClick={() => {
                window.location.hash = 'landing';
                onNavigate('landing');
              }}
              title="Public Landing Page (#landing)"
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: 4,
                borderRadius: 'var(--radius-xs)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.12s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
            >
              <Globe size={15} />
            </button>
            <button
              onClick={onLogout}
              title="Sign Out"
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: 4,
                borderRadius: 'var(--radius-xs)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.12s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Navigation;
