import React, { useEffect, useState } from 'react';
import {
  GitPullRequest,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Calendar,
  FileText,
  Split,
  Merge,
  UploadCloud,
  Sparkles,
} from 'lucide-react';
import {
  ConnectorSyncResult,
  DocumentIngestionResult,
  IngestedDocument,
  SourceConnector,
  ReviewQueueItem,
} from '../types';
import { apiClient } from '../api/client';

interface SourcesPageProps {
  connectors: SourceConnector[];
  reviewQueue: ReviewQueueItem[];
  onResolveMerge: (reviewId: string, action: 'merged' | 'rejected') => Promise<void>;
  onDataChanged: () => Promise<void>;
}

export const SourcesPage: React.FC<SourcesPageProps> = ({
  connectors,
  reviewQueue,
  onResolveMerge,
  onDataChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'review' | 'connectors' | 'ingest'>('review');
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Ingestion Form State
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docAuthor, setDocAuthor] = useState('Priya Sharma');
  const [docAcl, setDocAcl] = useState('all');
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState<DocumentIngestionResult | null>(null);
  const [documents, setDocuments] = useState<IngestedDocument[]>([]);
  const [documentError, setDocumentError] = useState<string | null>(null);

  const refreshDocuments = async () => {
    try {
      setDocuments(await apiClient.getDocuments());
      setDocumentError(null);
    } catch (error) {
      setDocumentError(error instanceof Error ? error.message : 'Could not load documents.');
    }
  };

  useEffect(() => {
    void refreshDocuments();
  }, []);

  const pendingItems = reviewQueue.filter((item) => item.status === 'pending');

  const handleSyncTrigger = async (connectorId: string) => {
    setIsSyncing(connectorId);
    try {
      const res: ConnectorSyncResult = await apiClient.syncConnector(connectorId);
      await onDataChanged();
      await refreshDocuments();
      setSyncFeedback(res.message);
    } catch (error) {
      setSyncFeedback(error instanceof Error ? error.message : 'Connector sync failed.');
    } finally {
      setIsSyncing(null);
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  const handleResolveReview = async (reviewId: string, action: 'merged' | 'rejected') => {
    try {
      await onResolveMerge(reviewId, action);
    } catch (error) {
      setSyncFeedback(error instanceof Error ? error.message : 'Could not resolve review item.');
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  const handleRunIngestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) return;

    setIsIngesting(true);
    setIngestResult(null);
    try {
      const result = await apiClient.ingestDocument({
        title: docTitle,
        content: docContent,
        author: docAuthor,
        acl_group: docAcl,
        source_type: 'document',
      });
      setIngestResult(result);
      await onDataChanged();
      await refreshDocuments();
      setDocTitle('');
      setDocContent('');
    } catch (error) {
      setIngestResult({
        documentId: '',
        status: 'failed',
        persistedNodes: [],
        persistedEdges: [],
        ambiguousMerges: [],
        error: error instanceof Error ? error.message : 'Ingestion failed',
      });
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1360, margin: '0 auto', width: '100%' }}>
      {syncFeedback && (
        <div role="status" style={{ marginBottom: 12, color: 'var(--text-primary)', fontSize: '0.82rem' }}>
          {syncFeedback}
        </div>
      )}
      {/* Page Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1
              style={{
                fontSize: '1.45rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              Sources &amp; Review Queue
            </h1>
            {pendingItems.length > 0 && (
              <span className="badge badge-amber">{pendingItems.length} Ambiguous Merges</span>
            )}
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Deterministic Gmail, Calendar, and Drive fixtures feed the graph; sync is repeatable and does not connect to live Google accounts.
          </p>
        </div>

        {/* Tab switch */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            padding: '3px',
            background: '#f1f5f9',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <button
            onClick={() => setActiveTab('review')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              background: activeTab === 'review' ? '#ffffff' : 'transparent',
              color: activeTab === 'review' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'review' ? 600 : 500,
              fontSize: '0.78rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'review' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.12s ease',
            }}
          >
            <GitPullRequest size={13} />
            <span>Entity Review Queue ({pendingItems.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('connectors')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              background: activeTab === 'connectors' ? '#ffffff' : 'transparent',
              color: activeTab === 'connectors' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'connectors' ? 600 : 500,
              fontSize: '0.78rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'connectors' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.12s ease',
            }}
          >
            <RefreshCw size={13} />
            <span>Connected Feeds ({connectors.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('ingest')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              background: activeTab === 'ingest' ? '#ffffff' : 'transparent',
              color: activeTab === 'ingest' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'ingest' ? 600 : 500,
              fontSize: '0.78rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'ingest' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.12s ease',
            }}
          >
            <UploadCloud size={13} />
            <span>Ingest Document (LangGraph)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Human-in-the-Loop Entity Resolution Review Queue */}
      {activeTab === 'review' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {pendingItems.length === 0 ? (
            <div
              className="enterprise-card"
              style={{ padding: '36px 20px', textAlign: 'center' }}
            >
              <CheckCircle2 size={32} color="var(--status-success)" style={{ margin: '0 auto 8px' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Review Queue is Clear</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                All extracted entities have been resolved with high confidence into the knowledge graph.
              </p>
            </div>
          ) : (
            pendingItems.map((item) => (
              <div
                key={item.id}
                className="enterprise-card"
                style={{
                  padding: '20px 22px',
                  borderLeft: '4px solid var(--status-warning)',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="badge badge-amber" style={{ fontSize: '0.68rem' }}>
                      Verification Flag &bull; {(item.confidence * 100).toFixed(0)}% Match
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.timestamp}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => void handleResolveReview(item.id, 'merged')}
                      className="btn btn-sm btn-primary"
                      style={{ gap: 4, fontSize: '0.75rem' }}
                    >
                      <Merge size={13} />
                      <span>Approve Merge (Single Node)</span>
                    </button>
                    <button
                      onClick={() => void handleResolveReview(item.id, 'rejected')}
                      className="btn btn-sm btn-secondary"
                      style={{ gap: 4, fontSize: '0.75rem' }}
                    >
                      <Split size={13} />
                      <span>Keep Separate</span>
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Candidate Merge: "{item.entityA.name}" &amp; "{item.entityB.name}"
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.45 }}>
                  The extraction pipeline flagged this node commit because the similarity score ({(item.confidence * 100).toFixed(0)}%)
                  fell below the auto-merge threshold (85%). Verify whether these refer to the identical entity.
                </p>

                {/* Side-by-Side Candidate Comparison */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  {/* Entity A */}
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: '#f8fafc',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                        Candidate Extracted from Stream
                      </span>
                      <span className="badge badge-node-Person" style={{ fontSize: '0.65rem' }}>
                        {item.entityA.type}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.entityA.name}
                    </h4>

                    <div style={{ marginTop: 8, padding: 8, borderRadius: 'var(--radius-xs)', background: '#ffffff', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>Source Context Snippet:</span>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: 2, lineHeight: 1.35 }}>
                        "{item.entityA.contextSnippet}"
                      </p>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: 3 }}>
                        Source: {item.entityA.source}
                      </span>
                    </div>

                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {Object.entries(item.entityA.attributes).map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{k}:</span>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Entity B */}
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: '#f8fafc',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                        Existing Node in Knowledge Graph
                      </span>
                      <span className="badge badge-node-Person" style={{ fontSize: '0.65rem' }}>
                        {item.entityB.type}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#6b21a8' }}>
                      {item.entityB.name}
                    </h4>

                    <div style={{ marginTop: 8, padding: 8, borderRadius: 'var(--radius-xs)', background: '#ffffff', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>Source Context Snippet:</span>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: 2, lineHeight: 1.35 }}>
                        "{item.entityB.contextSnippet}"
                      </p>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: 3 }}>
                        Source: {item.entityB.source}
                      </span>
                    </div>

                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {Object.entries(item.entityB.attributes).map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{k}:</span>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Conflicting Fields Highlight */}
                {item.conflictFields && (
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--status-danger-bg)',
                      border: '1px solid var(--status-danger-border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <AlertTriangle size={13} color="var(--status-danger)" />
                    <span style={{ fontSize: '0.75rem', color: 'var(--status-danger-text)', fontWeight: 600 }}>
                      Conflict Detected: {item.conflictFields.join(' &bull; ')}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Google Workspace Ingestion Connectors */}
      {activeTab === 'connectors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {connectors.map((conn) => (
            <div
              key={conn.id}
              className="enterprise-card"
              style={{
                padding: '16px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 'var(--radius-sm)',
                    background: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {conn.type === 'google_gmail' ? (
                    <Mail size={18} color="var(--accent-blue)" />
                  ) : conn.type === 'google_calendar' ? (
                    <Calendar size={18} color="#7c3aed" />
                  ) : (
                    <FileText size={18} color="var(--status-success)" />
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{conn.name}</h3>
                    <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>{conn.status}</span>
                    <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>DEMO FIXTURE</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Last incremental sync: {conn.lastSyncTime} &bull; Processed items:{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>{conn.itemsProcessed.toLocaleString()}</strong>
                  </p>
                  <p style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)', marginTop: 1 }}>
                    Sync Cursor: {conn.syncTokenOrHistoryId}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => handleSyncTrigger(conn.id)}
                  disabled={isSyncing === conn.id}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: 6 }}
                >
                  <RefreshCw size={13} className={isSyncing === conn.id ? 'animate-spin' : ''} />
                  <span>{isSyncing === conn.id ? 'Syncing...' : 'Sync Fixture'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Document Ingestion Pipeline (LangGraph Workflow) */}
      {activeTab === 'ingest' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="enterprise-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-sm)',
                  background: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <UploadCloud size={16} color="#38bdf8" />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Ingest Organizational Material into Synapse Brain
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Invokes the LangGraph Ingestion Graph: Normalizes text, segments context, extracts entities &amp; relationships, checks for ambiguous entity merges, and persists knowledge.
                </p>
              </div>
            </div>

            <form onSubmit={handleRunIngestion} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                    DOCUMENT TITLE / RFC NAME
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RFC-425: Multi-Region Kafka Partition Recovery"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.85rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                    AUTHOR / OWNER
                  </label>
                  <input
                    type="text"
                    required
                    value={docAuthor}
                    onChange={(e) => setDocAuthor(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.85rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                    ACCESS CONTROL (ACL)
                  </label>
                  <select
                    value={docAcl}
                    onChange={(e) => setDocAcl(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.85rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value="all">Public (all employees)</option>
                    <option value="eng-all">Engineering All</option>
                    <option value="architecture-board">Architecture Board</option>
                    <option value="confidential-postmortems">Confidential Post-Mortems</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                  DOCUMENT CONTENT / POST-MORTEM BODY / DECISION LOG
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Paste RFC text, incident post-mortem analysis, meeting notes, or architecture specification here..."
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                    lineHeight: 1.5,
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="submit"
                  disabled={isIngesting || !docTitle.trim() || !docContent.trim()}
                  className="btn btn-primary"
                  style={{ gap: 8 }}
                >
                  {isIngesting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Running LangGraph Ingestion Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Ingest into Knowledge Graph</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Ingestion Result Box */}
            {ingestResult && (
              <div
                style={{
                  marginTop: 18,
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: ingestResult.error ? 'var(--status-danger-bg)' : '#f0fdf4',
                  border: `1px solid ${ingestResult.error ? 'var(--status-danger-border)' : '#bbf7d0'}`,
                }}
              >
                {ingestResult.error ? (
                  <div style={{ color: 'var(--status-danger)', fontSize: '0.825rem' }}>
                    <strong>Ingestion Error:</strong> {ingestResult.error}
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#166534', fontWeight: 700, fontSize: '0.85rem' }}>
                      <CheckCircle2 size={16} />
                      <span>LangGraph Ingestion Completed Successfully!</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#15803d', marginTop: 4 }}>
                      Document ID: <code>{ingestResult.documentId}</code> &bull; Extracted &amp; Persisted:{' '}
                      <strong>{ingestResult.persistedNodes?.length || 0} graph nodes</strong> and{' '}
                      <strong>{ingestResult.persistedEdges?.length || 0} edges</strong>.
                    </p>
                    {ingestResult.ambiguousMerges?.length > 0 && (
                      <p style={{ fontSize: '0.75rem', color: '#b45309', marginTop: 4 }}>
                        ⚠️ Flagged {ingestResult.ambiguousMerges.length} ambiguous entity merge to Human Review Queue.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="enterprise-card" style={{ padding: '20px 24px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
              Ingested documents ({documents.length})
            </h3>
            {documentError ? (
              <p role="alert" style={{ color: 'var(--status-danger)', fontSize: '0.8rem' }}>
                {documentError}
              </p>
            ) : documents.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No documents have been ingested yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {documents.map((document) => (
                  <div
                    key={document.id}
                    style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: '0.78rem' }}
                  >
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>{document.title}</strong>
                      <span style={{ color: 'var(--text-muted)' }}> &middot; {document.author} &middot; {document.sourceType}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{document.aclGroup}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default SourcesPage;
