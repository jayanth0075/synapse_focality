import React from 'react';
import {
  Bell,
  Search,
  Shield,
} from 'lucide-react';
import { UserSession, ForesightAlert } from '../types';
import { DEMO_PERSONAS } from '../data/mockData';
import { AppView } from './Navigation';

interface TopHeaderProps {
  currentView: AppView;
  currentUser: UserSession;
  onSelectUser: (user: UserSession) => void;
  onNavigate: (view: AppView, params?: Record<string, any>) => void;
  alerts: ForesightAlert[];
  onOpenQuickSearch: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentView,
  currentUser,
  onSelectUser,
  onNavigate,
  alerts,
  onOpenQuickSearch,
}) => {
  const getBreadcrumb = (view: AppView) => {
    switch (view) {
      case 'dashboard':
        return 'Overview';
      case 'ask':
        return 'Ask Synapse';
      case 'explorer':
        return 'Knowledge Graph';
      case 'projects':
      case 'project-detail':
        return 'Projects';
      case 'entities':
      case 'entity-detail':
        return 'People & Entities';
      case 'foresight':
        return 'Alerts';
      case 'sources':
        return 'Sources & Review';
      case 'workflows':
        return 'Workflows';
      case 'admin':
        return 'Settings';
      default:
        return 'Overview';
    }
  };

  const activeAlertsCount = alerts.filter((a) => a.status === 'active').length;

  return (
    <header
      style={{
        height: 54,
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
        zIndex: 40,
      }}
    >
      {/* Left: Breadcrumbs & System Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.825rem' }}>
          <button
            onClick={() => onNavigate('dashboard')}
            title="Go to Overview"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 500,
              padding: '2px 4px',
              borderRadius: 'var(--radius-xs)',
              fontSize: 'inherit',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            SYNAPSE
          </button>
          <span style={{ color: 'var(--border-strong)', fontSize: '0.75rem' }}>/</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {getBreadcrumb(currentView)}
          </span>
        </div>

        {/* Live Ingestion Heartbeat Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '2px 8px',
            borderRadius: 'var(--radius-xs)',
            background: 'var(--status-success-bg)',
            border: '1px solid var(--status-success-border)',
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              backgroundColor: 'var(--status-success)',
            }}
          />
          <span style={{ fontSize: '0.68rem', color: 'var(--status-success-text)', fontWeight: 600 }}>
            Sync Engine Active
          </span>
        </div>
      </div>

      {/* Right: Search, Alert Notification, Role Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Quick Search Bar */}
        <button
          onClick={onOpenQuickSearch}
          style={{
            padding: '5px 12px',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            background: '#f8fafc',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            transition: 'background-color 0.12s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f8fafc';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Search size={13} color="var(--text-muted)" />
            <span>Search graph, decisions, people...</span>
          </div>
          <kbd
            style={{
              fontSize: '0.65rem',
              padding: '1px 5px',
              borderRadius: 'var(--radius-xs)',
              background: '#ffffff',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Foresight Alert Bell */}
        <button
          onClick={() => onNavigate('foresight')}
          style={{
            position: 'relative',
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: activeAlertsCount > 0 ? 'var(--status-danger)' : 'var(--text-muted)',
          }}
          title="Foresight Risk Alerts"
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
        >
          <Bell size={15} />
          {activeAlertsCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 3,
                right: 3,
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'var(--status-danger)',
              }}
            />
          )}
        </button>

        {/* Persona Switcher (Demonstrating Permission Filtering) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            background: '#ffffff',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Shield size={12} color="var(--status-warning)" />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>ACL:</span>
          <select
            value={currentUser.id}
            onChange={(e) => {
              const found = DEMO_PERSONAS.find((p) => p.id === e.target.value);
              if (found) onSelectUser(found);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.75rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {DEMO_PERSONAS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.role.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};
export default TopHeader;
