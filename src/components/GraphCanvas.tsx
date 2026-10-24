import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core, EventObject } from 'cytoscape';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Search,
  Filter,
  Layers,
  Clock,
  Shield,
  ExternalLink,
  X,
  FileText,
  Calendar,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { GraphNode, GraphEdge, NodeType } from '../types';

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId?: string | null;
  onSelectNode?: (node: GraphNode | null) => void;
  onSelectEdge?: (edge: GraphEdge | null) => void;
}

const TYPE_COLORS: Record<NodeType, string> = {
  Person: '#2563eb',
  Project: '#7c3aed',
  Decision: '#d97706',
  Problem: '#e11d48',
  Outcome: '#ea580c',
  Document: '#0d9488',
  Meeting: '#0284c7',
  Topic: '#6d28d9',
  Team: '#4f46e5',
  EmailThread: '#0891b2',
  Customer: '#059669',
};

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  onSelectEdge,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutName, setLayoutName] = useState<'cose' | 'concentric' | 'breadthfirst'>('cose');
  const [timeFilterYear, setTimeFilterYear] = useState<number>(2026);
  const [inspectedElement, setInspectedElement] = useState<{
    type: 'node' | 'edge';
    data: any;
  } | null>(null);

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    // Filter elements
    const filteredNodes = nodes.filter((n) => {
      const matchType = activeTypeFilter === 'ALL' || n.type === activeTypeFilter;
      const matchSearch =
        !searchQuery ||
        n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    });

    const nodeIds = new Set(filteredNodes.map((n) => n.id));

    const filteredEdges = edges.filter((e) => {
      return nodeIds.has(e.source) && nodeIds.has(e.target);
    });

    const cyElements = [
      ...filteredNodes.map((n) => ({
        data: {
          id: n.id,
          label: n.label,
          type: n.type,
          color: TYPE_COLORS[n.type] || '#64748b',
          raw: n,
        },
      })),
      ...filteredEdges.map((e) => ({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          raw: e,
        },
      })),
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements: cyElements,
      boxSelectionEnabled: false,
      autounselectify: false,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            'label': 'data(label)',
            'color': '#0d0d10',
            'font-family': 'Plus Jakarta Sans, sans-serif',
            'font-size': '11px',
            'font-weight': 600,
            'text-valign': 'bottom',
            'text-margin-y': 7,
            'text-background-color': '#ffffff',
            'text-background-opacity': 0.95,
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            'width': 34,
            'height': 34,
            'border-width': 2.5,
            'border-color': '#ffffff',
            'transition-property': 'background-color, border-color, width, height',
            'transition-duration': 0.2,
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 3.5,
            'border-color': '#0d0d10',
            'width': 44,
            'height': 44,
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 1.8,
            'line-color': '#cbd5e1',
            'target-arrow-color': '#94a3b8',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-family': 'JetBrains Mono, monospace',
            'font-size': '9px',
            'color': '#475569',
            'text-background-color': '#ffffff',
            'text-background-opacity': 0.95,
            'text-background-padding': '2px',
            'text-background-shape': 'roundrectangle',
            'arrow-scale': 0.85,
          },
        },
        {
          selector: 'edge:selected',
          style: {
            'width': 3,
            'line-color': '#0d0d10',
            'target-arrow-color': '#0d0d10',
            'color': '#ffffff',
            'text-background-color': '#0d0d10',
          },
        },
      ],
      layout: {
        name: layoutName,
        animate: true,
        animationDuration: 600,
        padding: 50,
      } as any,
    });

    cy.on('tap', 'node', (evt: EventObject) => {
      const nodeData = evt.target.data();
      setInspectedElement({ type: 'node', data: nodeData.raw });
      if (onSelectNode) onSelectNode(nodeData.raw);
    });

    cy.on('tap', 'edge', (evt: EventObject) => {
      const edgeData = evt.target.data();
      setInspectedElement({ type: 'edge', data: edgeData.raw });
      if (onSelectEdge) onSelectEdge(edgeData.raw);
    });

    cy.on('tap', (evt: EventObject) => {
      if (evt.target === cy) {
        setInspectedElement(null);
        if (onSelectNode) onSelectNode(null);
        if (onSelectEdge) onSelectEdge(null);
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [nodes, edges, activeTypeFilter, searchQuery, layoutName, timeFilterYear]);

  // Center on node if selected externally
  useEffect(() => {
    if (selectedNodeId && cyRef.current) {
      const target = cyRef.current.$id(selectedNodeId);
      if (target.length > 0) {
        cyRef.current.animate({
          center: { eles: target },
          zoom: 1.4,
          duration: 500,
        });
        target.select();
      }
    }
  }, [selectedNodeId]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit(undefined, 40);
  const handleResetLayout = () => {
    cyRef.current?.layout({ name: layoutName, animate: true, animationDuration: 500 } as any).run();
  };

  const nodeTypes: NodeType[] = [
    'Person',
    'Project',
    'Decision',
    'Problem',
    'Outcome',
    'Document',
    'Meeting',
    'Topic',
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Cytoscape Canvas Target */}
      <div ref={containerRef} className="cytoscape-container" />

      {/* Top Floating Controls Bar */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 24,
          right: inspectedElement ? 410 : 24,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
          zIndex: 10,
          pointerEvents: 'none',
          transition: 'right 0.25s ease',
        }}
      >
        {/* Search Input */}
        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            padding: '6px 12px',
            gap: 8,
            minWidth: 260,
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--surface-primary)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search entities, decisions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.82rem',
              width: '100%',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Entity Type Filter Chips */}
        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 6px',
            overflowX: 'auto',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--surface-primary)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <button
            onClick={() => setActiveTypeFilter('ALL')}
            className={`btn btn-sm ${activeTypeFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '3px 8px', fontSize: '0.72rem', borderRadius: 'var(--radius-xs)' }}
          >
            All ({nodes.length})
          </button>
          {nodeTypes.map((type) => {
            const count = nodes.filter((n) => n.type === type).length;
            if (count === 0) return null;
            const isSelected = activeTypeFilter === type;
            return (
              <button
                key={type}
                onClick={() => setActiveTypeFilter(type)}
                className="btn btn-sm"
                style={{
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  borderRadius: 'var(--radius-xs)',
                  background: isSelected ? 'var(--text-primary)' : 'var(--surface-muted)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: TYPE_COLORS[type],
                    display: 'inline-block',
                    marginRight: 4,
                  }}
                />
                {type} ({count})
              </button>
            );
          })}
        </div>

        {/* Time-Travel Validity Slider */}
        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--surface-primary)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Clock size={14} color="#0284c7" />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Validity:</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-primary)' }}>
            {timeFilterYear}
          </span>
          <input
            type="range"
            min="2024"
            max="2026"
            step="1"
            value={timeFilterYear}
            onChange={(e) => setTimeFilterYear(parseInt(e.target.value, 10))}
            style={{ width: 75, accentColor: '#0f172a', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Right/Bottom Canvas Action Controls */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          display: 'flex',
          gap: 6,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', gap: 3, padding: 3, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <button
            onClick={handleZoomIn}
            className="btn btn-sm btn-secondary"
            title="Zoom In"
            style={{ padding: '5px 8px', borderRadius: 'var(--radius-xs)' }}
          >
            <ZoomIn size={15} />
          </button>
          <button
            onClick={handleZoomOut}
            className="btn btn-sm btn-secondary"
            title="Zoom Out"
            style={{ padding: '5px 8px', borderRadius: 'var(--radius-xs)' }}
          >
            <ZoomOut size={15} />
          </button>
          <button
            onClick={handleFit}
            className="btn btn-sm btn-secondary"
            title="Fit to Screen"
            style={{ padding: '5px 8px', borderRadius: 'var(--radius-xs)' }}
          >
            <Maximize2 size={15} />
          </button>
          <button
            onClick={handleResetLayout}
            className="btn btn-sm btn-secondary"
            title="Re-layout Graph"
            style={{ padding: '5px 8px', borderRadius: 'var(--radius-xs)' }}
          >
            <RefreshCw size={15} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 3, padding: 3, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          {(['cose', 'concentric', 'breadthfirst'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLayoutName(l)}
              className={`btn btn-sm ${layoutName === l ? 'btn-primary' : 'btn-outline'}`}
              style={{ textTransform: 'capitalize', fontSize: '0.72rem', padding: '4px 10px', borderRadius: 'var(--radius-xs)' }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Slide-in Element Inspector Drawer */}
      {inspectedElement && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            bottom: 16,
            width: 380,
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: 20,
            border: '1px solid var(--border-subtle)',
            background: 'var(--surface-primary)',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <span
                className={`badge ${
                  inspectedElement.type === 'node'
                    ? `badge-node-${inspectedElement.data.type}`
                    : 'badge-primary'
                }`}
                style={{ marginBottom: 6 }}
              >
                {inspectedElement.type === 'node' ? inspectedElement.data.type : `Edge: ${inspectedElement.data.label}`}
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {inspectedElement.type === 'node' ? inspectedElement.data.label : `${inspectedElement.data.label} Relation`}
              </h3>
              {inspectedElement.data.subTitle && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{inspectedElement.data.subTitle}</p>
              )}
            </div>
            <button
              onClick={() => setInspectedElement(null)}
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

          {/* Node / Edge Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {inspectedElement.type === 'node' ? (
              <>
                <div style={{ padding: 12, borderRadius: 'var(--radius-sm)', background: 'var(--surface-muted)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
                    Summary
                  </span>
                  <p style={{ fontSize: '0.85rem', marginTop: 4, lineHeight: 1.5, color: 'var(--text-primary)' }}>
                    {inspectedElement.data.summary}
                  </p>
                </div>

                {inspectedElement.data.tags && (
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
                      Tags
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                      {inspectedElement.data.tags.map((tag: string) => (
                        <span key={tag} className="badge badge-primary" style={{ fontSize: '0.68rem' }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, padding: 10, borderRadius: 'var(--radius-xs)', background: 'var(--surface-muted)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>Graph Node ID</span>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#0284c7', marginTop: 2 }}>
                      {inspectedElement.data.id}
                    </p>
                  </div>
                  <div style={{ flex: 1, padding: 10, borderRadius: 'var(--radius-xs)', background: 'var(--surface-muted)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>First Recorded</span>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', marginTop: 2 }}>
                      {inspectedElement.data.createdDate}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Edge Provenance Inspection */}
                <div style={{ padding: 12, borderRadius: 'var(--radius-sm)', background: '#f8fafc', border: '1px solid var(--border-subtle)', borderLeft: '3px solid #0284c7' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <FileText size={14} color="#0284c7" />
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      SUPPORTING PROVENANCE SPAN
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: '#1e293b', lineHeight: 1.5 }}>
                    "{inspectedElement.data.supportingTextSpan}"
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 'var(--radius-xs)', background: 'var(--surface-muted)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Source Episode ID</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {inspectedElement.data.sourceId}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 'var(--radius-xs)', background: 'var(--surface-muted)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Extraction Confidence</span>
                    <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
                      {(inspectedElement.data.extractionConfidence * 100).toFixed(0)}% Verified
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 'var(--radius-xs)', background: 'var(--surface-muted)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Bi-temporal Validity</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: '#0284c7' }}>
                      {inspectedElement.data.validFrom} &rarr; {inspectedElement.data.validTo || 'Present (Active)'}
                    </span>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Shield size={13} color="#d97706" />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
                      Inherited Source ACL Permissions
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {inspectedElement.data.aclAccessList?.map((acl: string) => (
                      <span key={acl} className="badge badge-amber" style={{ fontSize: '0.68rem' }}>
                        {acl}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default GraphCanvas;
