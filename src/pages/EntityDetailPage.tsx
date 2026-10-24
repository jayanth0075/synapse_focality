import React from 'react';
import {
  ArrowLeft,
  Network,
  MessageSquare,
} from 'lucide-react';
import { GraphNode, GraphEdge } from '../types';

interface EntityDetailPageProps {
  node: GraphNode;
  edges: GraphEdge[];
  allNodes: GraphNode[];
  onBack: () => void;
  onExploreInGraph: (nodeId: string) => void;
  onAskAboutEntity: (query: string) => void;
}

export const EntityDetailPage: React.FC<EntityDetailPageProps> = ({
  node,
  edges,
  allNodes,
  onBack,
  onExploreInGraph,
  onAskAboutEntity,
}) => {
  // Find connected edges
  const connectedEdges = edges.filter((e) => e.source === node.id || e.target === node.id);

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1360, margin: '0 auto', width: '100%' }}>
      {/* Back button */}
      <div style={{ marginBottom: 18 }}>
        <button
          onClick={onBack}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}
        >
          <ArrowLeft size={13} />
          <span>Back to Directory</span>
        </button>

        {/* Profile Header Card */}
        <div
          className="enterprise-card"
          style={{
            padding: '22px 24px',
            borderLeft: '4px solid var(--accent-blue)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span className={`badge badge-node-${node.type}`} style={{ fontSize: '0.7rem' }}>
                  {node.type}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                  ID: {node.id}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Created: {node.createdDate}
                </span>
              </div>

              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {node.label}
              </h1>

              {node.subTitle && (
                <p style={{ fontSize: '0.9rem', color: 'var(--accent-blue)', fontWeight: 600, marginTop: 2 }}>
                  {node.subTitle}
                </p>
              )}

              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: 8, maxWidth: 840, lineHeight: 1.55 }}>
                {node.summary}
              </p>

              {node.tags && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 12 }}>
                  {node.tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-xs)',
                        background: '#f1f5f9',
                        color: 'var(--text-secondary)',
                        fontSize: '0.7rem',
                        fontWeight: 500,
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => onExploreInGraph(node.id)}
                className="btn btn-primary btn-sm"
                style={{ gap: 6, padding: '7px 12px' }}
              >
                <Network size={14} />
                <span>Locate in Graph Studio</span>
              </button>
              <button
                onClick={() => onAskAboutEntity(`Tell me everything about ${node.label} and related decisions or risks`)}
                className="btn btn-secondary btn-sm"
                style={{ gap: 6, padding: '7px 12px' }}
              >
                <MessageSquare size={14} />
                <span>Ask Synapse Q&amp;A</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Graph Relationships */}
      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Connected Relationships in Synapse ({connectedEdges.length})
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Bi-temporal validity windows tracked continuously
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {connectedEdges.map((edge) => {
            const isSource = edge.source === node.id;
            const otherNodeId = isSource ? edge.target : edge.source;
            const otherNode = allNodes.find((n) => n.id === otherNodeId);

            return (
              <div
                key={edge.id}
                className="enterprise-card"
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>
                    {isSource ? `→ ${edge.label}` : `← ${edge.label}`}
                  </span>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {otherNode ? otherNode.label : otherNodeId}
                      </span>
                      {otherNode && (
                        <span className={`badge badge-node-${otherNode.type}`} style={{ fontSize: '0.62rem' }}>
                          {otherNode.type}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2, fontStyle: 'italic' }}>
                      "{edge.supportingTextSpan}"
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 14 }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                    Valid: {edge.validFrom} &rarr; {edge.validTo || 'Present'}
                  </span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.62rem', marginTop: 2 }}>
                    {(edge.extractionConfidence * 100).toFixed(0)}% Confident
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default EntityDetailPage;
