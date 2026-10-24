import React from 'react';
import { GraphCanvas } from '../components/GraphCanvas';
import { GraphNode, GraphEdge, Citation } from '../types';
import { Network, Layers, Sparkles, Filter, Info, ShieldCheck } from 'lucide-react';

interface ExplorerPageProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId?: string | null;
  onSelectNode: (node: GraphNode | null) => void;
  onSelectEdge?: (edge: GraphEdge | null) => void;
  onOpenCitation?: (citation: Citation) => void;
}

export const ExplorerPage: React.FC<ExplorerPageProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  onSelectEdge,
  onOpenCitation,
}) => {
  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 64px)', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
      {/* Full-bleed Cytoscape Canvas */}
      <GraphCanvas
        nodes={nodes}
        edges={edges}
        selectedNodeId={selectedNodeId}
        onSelectNode={onSelectNode}
        onSelectEdge={onSelectEdge}
      />

      {/* Bottom Floating Stats Badge */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          zIndex: 10,
          pointerEvents: 'none',
          background: 'var(--surface-primary)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0284c7' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Graph</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>
          <strong>{nodes.length}</strong> Nodes &bull; <strong>{edges.length}</strong> Bi-Temporal Edges
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <ShieldCheck size={13} color="#16a34a" />
          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Inherited ACL Active</span>
        </div>
      </div>
    </div>
  );
};
export default ExplorerPage;
