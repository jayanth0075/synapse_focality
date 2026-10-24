import React from 'react';
import { X, Shield, FileText, Mail, Calendar, CheckCircle } from 'lucide-react';
import { Citation } from '../types';

interface CitationDrawerProps {
  citation: Citation | null;
  onClose: () => void;
}

export const CitationDrawer: React.FC<CitationDrawerProps> = ({ citation, onClose }) => {
  if (!citation) return null;

  const getSourceIcon = (type: Citation['sourceType']) => {
    switch (type) {
      case 'email':
        return <Mail size={16} color="#0284c7" />;
      case 'calendar':
        return <Calendar size={16} color="#7c3aed" />;
      default:
        return <FileText size={16} color="#10b981" />;
    }
  };

  return (
    <div className={`citation-drawer ${citation ? 'open' : ''}`} style={{ background: '#ffffff', borderLeft: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)' }}>
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              padding: 8,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-muted)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {getSourceIcon(citation.sourceType)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
                {citation.id}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {(citation.matchScore * 100).toFixed(0)}% Retrieval Relevance
              </span>
            </div>
            <h3
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginTop: 4,
                lineHeight: 1.35,
              }}
            >
              {citation.title}
            </h3>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'var(--surface-muted)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            width: 26,
            height: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Body Content */}
      <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Supporting Span Highlight */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Ground Truth Supporting Text Span
            </span>
          </div>
          <div
            style={{
              padding: 14,
              borderRadius: 'var(--radius-sm)',
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderLeft: '3px solid #0284c7',
              lineHeight: 1.6,
            }}
          >
            <p style={{ fontSize: '0.85rem', color: '#1e293b', fontStyle: 'italic', margin: 0 }}>
              "{citation.snippet}"
            </p>
          </div>
        </div>

        {/* Source Metadata Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '9px 12px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--surface-muted)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Author / Recorded By</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {citation.author}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '9px 12px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--surface-muted)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Source Episode Date</span>
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              {citation.timestamp}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '9px 12px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--surface-muted)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Source Type</span>
            <span style={{ fontSize: '0.8rem', textTransform: 'capitalize', color: 'var(--text-primary)', fontWeight: 600 }}>
              Google Workspace ({citation.sourceType})
            </span>
          </div>
        </div>

        {/* Security & Access Control */}
        <div
          style={{
            padding: 14,
            borderRadius: 'var(--radius-sm)',
            background: '#fffbeb',
            border: '1px solid #fef3c7',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Shield size={13} color="#d97706" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>
              Enterprise Access Control (Inherited ACL)
            </span>
          </div>
          <p style={{ fontSize: '0.76rem', color: '#78350f', marginBottom: 8, lineHeight: 1.45 }}>
            This memory fact inherits the security descriptor of its origin. Only users belonging to the authorized
            directory groups can query this fact:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {citation.aclGroup.split(',').map((group) => (
              <span key={group.trim()} className="badge badge-amber" style={{ fontSize: '0.68rem' }}>
                {group.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Audit Verification */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
          }}
        >
          <CheckCircle size={15} color="#16a34a" />
          <span style={{ fontSize: '0.76rem', color: '#166534', fontWeight: 600 }}>
            Verified in Postgres ground-truth audit store.
          </span>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--surface-muted)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '6px 14px' }}>
          Close Inspector
        </button>
      </div>
    </div>
  );
};
