import React, { useState } from 'react';
import {
  Search,
  Network,
} from 'lucide-react';
import { GraphNode, NodeType } from '../types';

interface EntitiesPageProps {
  nodes: GraphNode[];
  onSelectNodeDetail: (nodeId: string) => void;
  onExploreInGraph: (nodeId: string) => void;
}

export const EntitiesPage: React.FC<EntitiesPageProps> = ({
  nodes,
  onSelectNodeDetail,
  onExploreInGraph,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const entityTypes: NodeType[] = [
    'Person',
    'Project',
    'Decision',
    'Problem',
    'Outcome',
    'Document',
    'Meeting',
    'Topic',
  ];

  const filteredNodes = nodes.filter((n) => {
    const matchType = activeFilter === 'ALL' || n.type === activeFilter;
    const matchSearch =
      !search ||
      n.label.toLowerCase().includes(search.toLowerCase()) ||
      n.summary.toLowerCase().includes(search.toLowerCase()) ||
      (n.tags && n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));
    return matchType && matchSearch;
  });

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1360, margin: '0 auto', width: '100%' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Entities &amp; Experts Directory
        </h1>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: 2 }}>
          Explore verified persons, documented decisions, historical problem post-mortems, and core architectural topics.
        </p>
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
            placeholder="Search entities by name, tag, or topic..."
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
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setActiveFilter('ALL')}
            style={{
              fontSize: '0.78rem',
              fontWeight: activeFilter === 'ALL' ? 600 : 500,
              padding: '4px 10px',
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              cursor: 'pointer',
              background: activeFilter === 'ALL' ? '#ffffff' : 'transparent',
              color: activeFilter === 'ALL' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeFilter === 'ALL' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.12s ease',
            }}
          >
            All Types ({nodes.length})
          </button>
          {entityTypes.map((type) => {
            const count = nodes.filter((n) => n.type === type).length;
            if (count === 0) return null;
            return (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                style={{
                  fontSize: '0.78rem',
                  fontWeight: activeFilter === type ? 600 : 500,
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-xs)',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeFilter === type ? '#ffffff' : 'transparent',
                  color: activeFilter === type ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: activeFilter === type ? 'var(--shadow-xs)' : 'none',
                  transition: 'all 0.12s ease',
                }}
              >
                {type} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Entity Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 14,
        }}
      >
        {filteredNodes.map((node) => (
          <div
            key={node.id}
            onClick={() => onSelectNodeDetail(node.id)}
            className="enterprise-card enterprise-card-interactive"
            style={{
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span className={`badge badge-node-${node.type}`} style={{ fontSize: '0.68rem' }}>
                  {node.type}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {node.id}
                </span>
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                {node.label}
              </h3>
              {node.subTitle && (
                <p style={{ fontSize: '0.78rem', color: 'var(--accent-blue)', fontWeight: 600, marginBottom: 6 }}>
                  {node.subTitle}
                </p>
              )}
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: 12 }}>
                {node.summary}
              </p>
            </div>

            <div>
              {node.tags && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                  {node.tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-xs)',
                        background: '#f1f5f9',
                        color: 'var(--text-secondary)',
                        fontSize: '0.68rem',
                        fontWeight: 500,
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 8,
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Recorded: {node.createdDate}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExploreInGraph(node.id);
                    }}
                    className="btn btn-sm btn-secondary"
                    title="View in Graph Studio"
                    style={{ padding: '3px 7px' }}
                  >
                    <Network size={12} />
                  </button>
                  <button className="btn btn-sm btn-primary" style={{ padding: '3px 10px', fontSize: '0.75rem' }}>
                    Profile &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default EntitiesPage;
