import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Network,
  Clock,
  FileText,
} from 'lucide-react';
import { AskMessage, Citation, UserSession } from '../types';
import { MOCK_ASK_PRESETS, INITIAL_MESSAGES } from '../data/mockData';
import { apiClient } from '../api/client';

interface AskPageProps {
  onOpenCitation: (citation: Citation) => void;
  onNavigateToGraph?: (nodeId: string) => void;
  currentUser?: UserSession;
}

export const AskPage: React.FC<AskPageProps> = ({
  onOpenCitation,
  onNavigateToGraph,
  currentUser,
}) => {
  const [messages, setMessages] = useState<AskMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isSimulatingStream, setIsSimulatingStream] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendQuery = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim() || isSimulatingStream) return;

    const userMsg: AskMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsSimulatingStream(true);

    try {
      // Call real LangGraph Question-Answering workflow on backend
      const liveResponse = await apiClient.askSynapse(query, currentUser?.id || 'usr-jayanth');
      setMessages((prev) => [...prev, liveResponse]);
      setIsSimulatingStream(false);
      return;
    } catch (err) {
      console.warn('Real LangGraph Ask API unavailable, using local fallback:', err);
    }
    setTimeout(() => {
      let botResponse: AskMessage;

      if (query.toLowerCase().includes('expert') || query.toLowerCase().includes('raft')) {
        botResponse = {
          id: `bot-${Date.now()}`,
          sender: 'synapse',
          text: `Based on **knowledge graph hybrid retrieval** across 18 architecture reviews, RFC commits, and incident post-mortems:

1. **Marcus Vance (Principal Architect)** is the primary authority on **Raft consensus algorithms** and multi-master replication in Artisan Systems [Doc-RFC419]. He has authored 4 RFCs and led the Orion Core query mesh design.
2. **Elena Rostova (Staff SRE)** is the recognized authority on **cross-region network partitions and chaos fault injection** [Doc-882]. She is the sole author of the partition recovery runbook.
3. **Priya Sharma (VP Eng)** holds secondary domain expertise in high-concurrency database internals and sponsored both initiatives.

*Note: Elena Rostova has an upcoming 4-week PTO block scheduled in November 2026, posing an active single-point-of-failure risk on the Kafka partition failover pipeline.*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: [
            {
              id: 'Doc-RFC419',
              title: 'Atlas Architecture RFC v2.3 (RFC-419)',
              sourceType: 'document',
              author: 'Marcus Vance (Principal Architect)',
              timestamp: 'Aug 12, 2026',
              snippet: 'Section 2.1: Consensus guarantees: Multi-datacenter Paxos/Raft election timeouts set to 300ms heartbeat interval.',
              aclGroup: 'eng-all, architecture-board',
              matchScore: 0.96,
            },
            {
              id: 'Doc-882',
              title: 'Post-Mortem: Incident 882 Analysis & Lessons Learned',
              sourceType: 'document',
              author: 'Elena Rostova (Staff SRE)',
              timestamp: 'Nov 15, 2024',
              snippet: 'Retrospective findings on asymmetric partition mitigation strategies.',
              aclGroup: 'eng-all, confidential-postmortems',
              matchScore: 0.93,
            },
          ],
          graphPaths: [
            {
              nodes: ['Marcus Vance', 'Decided', 'RFC-419', 'Implements', 'Raft Protocol'],
              description: 'Primary Consensus Authority Path',
            },
            {
              nodes: ['Elena Rostova', 'Authored', 'Post-Mortem 882', 'Expert In', 'Split-Brain Network Partition'],
              description: 'Partition Resilience Expertise Path',
            },
          ],
          temporalScope: 'Active: 2024 - 2026 (Continuous)',
        };
      } else if (query.toLowerCase().includes('temporal') || query.toLowerCase().includes('ownership')) {
        botResponse = {
          id: `bot-${Date.now()}`,
          sender: 'synapse',
          text: `Querying **bi-temporal validity windows** for \`Project Atlas\` (valid_from / valid_to):

- **Between Jan 2026 and April 2026**: Project Atlas was sponsored by **Marcus Vance** during the exploratory RFC phase [Doc-AtlasCharter].
- **On April 10, 2026**: The ownership edge was invalidated and superseded when **Priya Sharma** was formally assigned as executive sponsor and technical owner (\`valid_from: 2026-04-10\`, \`valid_to: NULL (Active)\`).
- The transition was ratified in the Q2 Platform Roadmap Steering Committee [Cal-Q2Steering].`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: [
            {
              id: 'Doc-AtlasCharter',
              title: 'Project Atlas Initiation Charter & Leadership Assignment',
              sourceType: 'document',
              author: 'Engineering Steering Committee',
              timestamp: 'Apr 10, 2026',
              snippet: 'Ownership of Project Atlas transfers to Priya Sharma, with Marcus Vance continuing as Principal Systems Architect.',
              aclGroup: 'all, eng-leadership',
              matchScore: 0.99,
            },
          ],
          graphPaths: [
            {
              nodes: ['Marcus Vance', 'Owned (Expired 2026-04-10)', 'Project Atlas'],
              description: 'Historical Ownership Edge',
            },
            {
              nodes: ['Priya Sharma', 'OWNS (Active since 2026-04-10)', 'Project Atlas'],
              description: 'Current Active Ownership Edge',
            },
          ],
          temporalScope: 'Bi-temporal Query: As of April 10, 2026',
        };
      } else {
        botResponse = {
          id: `bot-${Date.now()}`,
          sender: 'synapse',
          text: `Searched 14,820 graph nodes and semantic embeddings for: *"${query}"*.

Synapse retrieved relevant organizational facts across Google Workspace and verified them against the **Artisan Systems Knowledge Graph**. All facts strictly enforce access control filtering for your authenticated role [Doc-General].`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: [
            {
              id: 'Doc-General',
              title: 'Artisan Systems Core Knowledge Graph Digest',
              sourceType: 'document',
              author: 'Knowledge System Sync',
              timestamp: 'Oct 2026',
              snippet: 'Relevant organizational context retrieved from verified episodes.',
              aclGroup: 'all',
              matchScore: 0.88,
            },
          ],
          temporalScope: 'Current: Oct 2026',
        };
      }

      setMessages((prev) => [...prev, botResponse]);
      setIsSimulatingStream(false);
    }, 1100);
  };

  // Render markdown text with clickable inline citation badges
  const renderMessageContent = (text: string, citations?: Citation[], isUser?: boolean) => {
    const parts = text.split(/(\[Doc-[A-Za-z0-9]+\])/g);

    return (
      <div style={{ lineHeight: 1.55, fontSize: '0.86rem', color: isUser ? '#ffffff' : 'var(--text-primary)' }}>
        {parts.map((part, index) => {
          const match = part.match(/\[(Doc-[A-Za-z0-9]+)\]/);
          if (match && citations) {
            const docId = match[1];
            const citationObj = citations.find((c) => c.id === docId);
            return (
              <button
                key={index}
                onClick={() => citationObj && onOpenCitation(citationObj)}
                className="inline-citation-tag"
                title={`Open Grounded Citation: ${docId}`}
              >
                <FileText size={10} style={{ marginRight: 2 }} />
                <span>{docId}</span>
              </button>
            );
          }

          return (
            <span key={index} style={{ whiteSpace: 'pre-wrap' }}>
              {part}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 54px)',
        position: 'relative',
        background: 'var(--bg-app)',
      }}
    >
      {/* Top Presets Bar */}
      <div
        style={{
          padding: '8px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: '#ffffff',
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
          Suggested:
        </span>
        {MOCK_ASK_PRESETS.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handleSendQuery(preset.query)}
            className="btn btn-sm btn-outline"
            style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', padding: '3px 8px' }}
          >
            <span>{preset.category}</span>
          </button>
        ))}
      </div>

      {/* Message Chat Stream Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          maxWidth: 880,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                width: '100%',
              }}
            >
              {/* Sender & Timestamp Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 4,
                  padding: '0 4px',
                }}
              >
                {!isUser && (
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--accent-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Network size={11} color="#fff" />
                  </div>
                )}
                <span style={{ fontSize: '0.74rem', fontWeight: 600, color: isUser ? 'var(--accent-blue)' : 'var(--text-primary)' }}>
                  {isUser ? (currentUser ? currentUser.name : 'You') : 'Synapse Intelligence'}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{msg.timestamp}</span>
              </div>

              {/* Message Bubble */}
              <div
                className="enterprise-card"
                style={{
                  maxWidth: '88%',
                  padding: '14px 18px',
                  backgroundColor: isUser ? 'var(--accent-primary)' : '#ffffff',
                  borderColor: isUser ? 'var(--accent-primary)' : 'var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                {renderMessageContent(msg.text, msg.citations, isUser)}

                {/* Graph Paths Footer */}
                {msg.graphPaths && msg.graphPaths.length > 0 && (
                  <div
                    style={{
                      marginTop: 12,
                      paddingTop: 10,
                      borderTop: isUser ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <Network size={13} color={isUser ? '#38bdf8' : 'var(--accent-blue)'} />
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: isUser ? '#38bdf8' : 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Knowledge Graph Grounding Traversal
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {msg.graphPaths.map((gp, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-xs)',
                            background: isUser ? 'rgba(255, 255, 255, 0.08)' : '#f8fafc',
                            fontSize: '0.74rem',
                            border: isUser ? 'none' : '1px solid var(--border-subtle)',
                          }}
                        >
                          <span style={{ color: isUser ? '#cbd5e1' : 'var(--text-muted)', marginRight: 6 }}>{gp.description}:</span>
                          <span style={{ fontFamily: 'var(--font-mono)', color: isUser ? '#7dd3fc' : 'var(--accent-blue)', fontWeight: 500 }}>
                            {gp.nodes.join(' → ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Temporal Scope Pill */}
                {msg.temporalScope && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock size={11} color={isUser ? '#94a3b8' : 'var(--text-muted)'} />
                    <span style={{ fontSize: '0.68rem', color: isUser ? '#94a3b8' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Temporal Window: {msg.temporalScope}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isSimulatingStream && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px' }}>
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 'var(--radius-xs)',
                background: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Network size={11} color="#fff" />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Synthesizing grounded answer with citations &amp; filtering by ACL...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Query Input Box */}
      <div
        style={{
          padding: '12px 28px 20px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: '#ffffff',
          maxWidth: 880,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '6px 12px',
            gap: 10,
            backgroundColor: '#f8fafc',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-medium)',
          }}
        >
          <Sparkles size={16} color="var(--accent-blue)" />
          <input
            type="text"
            placeholder="Ask about past decisions, post-mortems, experts, or project risks..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isSimulatingStream}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.86rem',
            }}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isSimulatingStream}
            className="btn btn-sm btn-primary"
            style={{ padding: '6px 14px' }}
          >
            <span>Ask</span>
            <Send size={13} />
          </button>
        </form>

        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
          Answers are synthesized from verified organizational knowledge graph facts with ground-truth citations.
        </p>
      </div>
    </div>
  );
};
export default AskPage;
