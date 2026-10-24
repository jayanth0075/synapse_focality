import React, { useState } from 'react';
import {
  Cpu,
  Play,
  Layers,
  ArrowRight,
  AlertTriangle,
  Database,
  Sparkles,
} from 'lucide-react';
import { AgentWorkflow } from '../types';
import { apiClient } from '../api/client';

interface WorkflowsPageProps {
  workflows: AgentWorkflow[];
  onRunComplete: () => Promise<void>;
}

export const WorkflowsPage: React.FC<WorkflowsPageProps> = ({ workflows, onRunComplete }) => {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(workflows[0]?.id || 'wf-ingestion');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(workflows[0]?.nodes[2]?.id || null);
  const [isSimulatingRun, setIsSimulatingRun] = useState(false);
  const [runFeedback, setRunFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'canvas' | 'traces' | 'checkpointer'>('canvas');

  const activeWorkflow = workflows.find((w) => w.id === selectedWorkflowId) || workflows[0];
  const selectedNode = activeWorkflow?.nodes.find((n) => n.id === selectedNodeId) || activeWorkflow?.nodes[0];

  const handleSimulateStep = async () => {
    setIsSimulatingRun(true);
    try {
      const result = await apiClient.runWorkflowStep(selectedWorkflowId, selectedNodeId || undefined);
      await onRunComplete();
      setRunFeedback(`Executed ${result.nodeName} in ${result.durationMs}ms.`);
    } catch (error) {
      setRunFeedback(error instanceof Error ? error.message : 'Workflow step failed.');
    } finally {
      setIsSimulatingRun(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 54px)', overflow: 'hidden', background: 'var(--bg-app)' }}>
      {/* Top Workflow Switcher Bar */}
      <div
        style={{
          padding: '10px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Cpu size={16} color="#ffffff" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <select
                value={selectedWorkflowId}
                onChange={(e) => {
                  setSelectedWorkflowId(e.target.value);
                  const nextWf = workflows.find((w) => w.id === e.target.value);
                  if (nextWf) setSelectedNodeId(nextWf.nodes[0]?.id || null);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer',
                  letterSpacing: '-0.015em',
                }}
              >
                {workflows.map((wf) => (
                  <option key={wf.id} value={wf.id}>
                    {wf.name}
                  </option>
                ))}
              </select>
              <span
                className={`badge ${
                  activeWorkflow.status === 'running'
                    ? 'badge-primary'
                    : activeWorkflow.status === 'completed'
                    ? 'badge-emerald'
                    : 'badge-cyan'
                }`}
                style={{ fontSize: '0.65rem' }}
              >
                {activeWorkflow.status.toUpperCase()}
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              {activeWorkflow.description}
            </p>
          </div>
        </div>

        {/* Action Controls & Tab Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 2, padding: '3px', background: '#f1f5f9', borderRadius: 'var(--radius-sm)' }}>
            <button
              onClick={() => setActiveTab('canvas')}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-xs)',
                border: 'none',
                background: activeTab === 'canvas' ? '#ffffff' : 'transparent',
                color: activeTab === 'canvas' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'canvas' ? 600 : 500,
                fontSize: '0.75rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'canvas' ? 'var(--shadow-xs)' : 'none',
                transition: 'all 0.12s ease',
              }}
            >
              Canvas
            </button>
            <button
              onClick={() => setActiveTab('traces')}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-xs)',
                border: 'none',
                background: activeTab === 'traces' ? '#ffffff' : 'transparent',
                color: activeTab === 'traces' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'traces' ? 600 : 500,
                fontSize: '0.75rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'traces' ? 'var(--shadow-xs)' : 'none',
                transition: 'all 0.12s ease',
              }}
            >
              Traces ({activeWorkflow.recentTraces.length})
            </button>
            <button
              onClick={() => setActiveTab('checkpointer')}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-xs)',
                border: 'none',
                background: activeTab === 'checkpointer' ? '#ffffff' : 'transparent',
                color: activeTab === 'checkpointer' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'checkpointer' ? 600 : 500,
                fontSize: '0.75rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'checkpointer' ? 'var(--shadow-xs)' : 'none',
                transition: 'all 0.12s ease',
              }}
            >
              Checkpointer
            </button>
          </div>

          <button
            onClick={handleSimulateStep}
            disabled={isSimulatingRun}
            className="btn btn-sm btn-primary"
            style={{ gap: 5 }}
          >
            <Play size={12} />
            <span>{isSimulatingRun ? 'Executing...' : 'Simulate Run Step'}</span>
          </button>
          {runFeedback && (
            <span role="status" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              {runFeedback}
            </span>
          )}
        </div>
      </div>

      {/* Main Workspace Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left / Center Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* TAB 1: Visual Interactive Node/Edge Graph Canvas */}
          {activeTab === 'canvas' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Layers size={14} color="var(--accent-blue)" />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    State Execution Pipeline &bull; Click any node to inspect configuration and intermediate channel states
                  </span>
                </div>
                <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                  {activeWorkflow.nodes.length} Nodes &bull; {activeWorkflow.edges.length} Transitions
                </span>
              </div>

              {/* Node Pipeline Diagram */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  overflowX: 'auto',
                  padding: '30px 10px',
                  justifyContent: 'flex-start',
                }}
              >
                {activeWorkflow.nodes.map((node, index) => {
                  const isSelected = selectedNode?.id === node.id;

                  return (
                    <React.Fragment key={node.id}>
                      {/* Node Box */}
                      <div
                        onClick={() => setSelectedNodeId(node.id)}
                        className="enterprise-card enterprise-card-interactive"
                        style={{
                          width: 200,
                          padding: 14,
                          border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                          background: '#ffffff',
                          flexShrink: 0,
                          position: 'relative',
                        }}
                      >
                        {/* Status Dot */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span
                            className="badge badge-primary"
                            style={{ fontSize: '0.62rem', textTransform: 'uppercase' }}
                          >
                            {node.type}
                          </span>

                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: '50%',
                              backgroundColor:
                                node.status === 'success'
                                  ? 'var(--status-success)'
                                  : node.status === 'warning'
                                  ? 'var(--status-warning)'
                                  : node.status === 'running'
                                  ? 'var(--accent-blue)'
                                  : 'var(--text-muted)',
                            }}
                          />
                        </div>

                        <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                          {node.label}
                        </h4>

                        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4, minHeight: 28 }}>
                          {node.description}
                        </p>

                        <div
                          style={{
                            marginTop: 10,
                            paddingTop: 6,
                            borderTop: '1px solid var(--border-subtle)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.68rem',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          <span>Latency</span>
                          <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{node.latencyMs || 45}ms</span>
                        </div>
                      </div>

                      {/* Directed Arrow Transition */}
                      {index < activeWorkflow.nodes.length - 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                          <ArrowRight size={16} color="var(--border-strong)" />
                          {activeWorkflow.edges[index]?.condition && (
                            <span
                              style={{
                                fontSize: '0.62rem',
                                color: 'var(--status-warning)',
                                fontFamily: 'var(--font-mono)',
                                marginTop: 2,
                                fontWeight: 600,
                              }}
                            >
                              condition
                            </span>
                          )}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Execution Traces */}
          {activeTab === 'traces' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Execution Step History &amp; Traces</h3>
              {activeWorkflow.recentTraces.length === 0 ? (
                <div
                  className="enterprise-card"
                  style={{ padding: 28, textAlign: 'center' }}
                >
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>No recent traces recorded yet.</p>
                </div>
              ) : (
                activeWorkflow.recentTraces.map((trace) => (
                  <div
                    key={trace.id}
                    className="enterprise-card"
                    style={{
                      padding: '14px 16px',
                      borderLeft: `3px solid ${trace.status === 'interrupted' ? 'var(--status-warning)' : 'var(--status-success)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{trace.nodeName}</span>
                        <span
                          className={`badge ${trace.status === 'interrupted' ? 'badge-amber' : 'badge-emerald'}`}
                          style={{ fontSize: '0.65rem' }}
                        >
                          {trace.status}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {trace.durationMs}ms &bull; {trace.timestamp}
                      </span>
                    </div>

                    {trace.interruptedReason && (
                      <div
                        style={{
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-xs)',
                          background: 'var(--status-warning-bg)',
                          border: '1px solid var(--status-warning-border)',
                          color: 'var(--status-warning-text)',
                          fontSize: '0.78rem',
                          marginBottom: 8,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <AlertTriangle size={13} color="var(--status-warning)" />
                          <span>{trace.interruptedReason}</span>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div style={{ padding: 10, borderRadius: 'var(--radius-xs)', background: '#f8fafc', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Input Payload:</span>
                        <pre style={{ color: 'var(--accent-blue)', marginTop: 2, whiteSpace: 'pre-wrap' }}>{JSON.stringify(trace.inputPayload, null, 2)}</pre>
                      </div>
                      <div style={{ padding: 10, borderRadius: 'var(--radius-xs)', background: '#f8fafc', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Output Payload:</span>
                        <pre style={{ color: 'var(--status-success-text)', marginTop: 2, whiteSpace: 'pre-wrap' }}>{JSON.stringify(trace.outputPayload, null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Postgres Checkpointer State */}
          {activeTab === 'checkpointer' && (
            <div
              className="enterprise-card"
              style={{ padding: '20px 22px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Database size={18} color="var(--accent-blue)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  State Checkpointer &amp; Snapshot History
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div style={{ padding: 10, borderRadius: 'var(--radius-xs)', background: '#f8fafc', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Thread ID</span>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.825rem', color: 'var(--accent-blue)', fontWeight: 700, marginTop: 1 }}>
                    {activeWorkflow.checkpointerState.threadId}
                  </p>
                </div>

                <div style={{ padding: 10, borderRadius: 'var(--radius-xs)', background: '#f8fafc', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Checkpoint Hash</span>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.825rem', color: 'var(--text-primary)', marginTop: 1 }}>
                    {activeWorkflow.checkpointerState.checkpointId}
                  </p>
                </div>
              </div>

              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Active Channel Values (Graph State)
              </span>
              <div
                style={{
                  marginTop: 6,
                  padding: 12,
                  borderRadius: 'var(--radius-xs)',
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  color: '#334155',
                }}
              >
                <pre style={{ margin: 0 }}>{JSON.stringify(activeWorkflow.checkpointerState.channelValues, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Right Contextual Configuration & Node Details Panel */}
        {selectedNode && (
          <aside
            style={{
              width: 320,
              backgroundColor: '#ffffff',
              borderLeft: '1px solid var(--border-subtle)',
              padding: 20,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div>
              <span className="badge badge-primary" style={{ marginBottom: 6, fontSize: '0.65rem' }}>
                Node Inspector
              </span>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {selectedNode.label}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.45 }}>
                {selectedNode.description}
              </p>
            </div>

            {/* Editable Node Configuration Parameters */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-blue)', fontWeight: 700, textTransform: 'uppercase' }}>
                Execution Parameters
              </span>

              {Object.entries(selectedNode.config).map(([key, val]) => (
                <div key={key}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 3 }}>
                    {key}
                  </label>
                  <input
                    type="text"
                    defaultValue={String(val)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-xs)',
                      background: '#f8fafc',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      outline: 'none',
                    }}
                  />
                </div>
              ))}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
              <button onClick={handleSimulateStep} className="btn btn-primary" style={{ width: '100%', gap: 6, padding: '8px' }}>
                <Sparkles size={14} />
                <span>Save Node Parameters</span>
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
export default WorkflowsPage;
