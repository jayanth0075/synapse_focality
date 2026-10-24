import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  Trash2,
  Server,
} from 'lucide-react';
import { UserSession } from '../types';
import { apiClient } from '../api/client';

interface AdminPageProps {
  currentUser: UserSession;
}

export const AdminPage: React.FC<AdminPageProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'security' | 'acl' | 'metering' | 'audit'>('security');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const logs = await apiClient.getAuditLogs(30);
        if (logs && logs.length > 0) {
          setAuditLogs(logs.map(l => ({
            id: l.id,
            timestamp: l.timestamp,
            actor: l.actor,
            action: l.action,
            target: `${l.resource_type}: ${l.resource_id}`,
            status: 'LOGGED',
            aclMatched: 'tenant-enforced'
          })));
        }
      } catch {
        // Fallback to initial seed logs
      }
    };
    fetchLogs();
  }, [activeTab]);

  const mockAuditLogs = [
    {
      id: 'aud-991',
      timestamp: '2026-10-22 18:41:02 UTC',
      actor: 'priya.sharma@artisansystems.ai',
      action: 'GRAPH_HYBRID_QUERY',
      target: 'Incident #882 Split-Brain Outage',
      status: 'ALLOWED',
      aclMatched: 'confidential-postmortems',
    },
    {
      id: 'aud-992',
      timestamp: '2026-10-22 18:34:15 UTC',
      actor: 'marcus.vance@artisansystems.ai',
      action: 'COMMIT_DECISION_NODE',
      target: 'RFC-419 Multi-Master Consensus',
      status: 'COMMITTED',
      aclMatched: 'architecture-board',
    },
    {
      id: 'aud-993',
      timestamp: '2026-10-22 17:12:44 UTC',
      actor: 'worker-ingestion-01',
      action: 'WORKFLOW_INTERRUPT_TRIGGER',
      target: 'Entity Rahul S. -> Rahul Sharma',
      status: 'QUEUED_FOR_REVIEW',
      aclMatched: 'eng-internal',
    },
    {
      id: 'aud-994',
      timestamp: '2026-10-22 16:02:11 UTC',
      actor: 'elena.rostova@artisansystems.ai',
      action: 'FORESIGHT_FEEDBACK_SUBMISSION',
      target: 'Alert #002 (Knowledge Silo)',
      status: 'THRESHOLD_UPDATED',
      aclMatched: 'all',
    },
  ];

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1360, margin: '0 auto', width: '100%' }}>
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
              Settings &amp; Security Administration
            </h1>
            <span className="badge badge-emerald">SOC2 Type II Ready</span>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Multi-tenant data isolation, source ACL inheritance enforcement, and customer residency guarantees.
          </p>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', gap: 4, padding: '3px', background: '#f1f5f9', borderRadius: 'var(--radius-sm)' }}>
          <button
            onClick={() => setActiveTab('security')}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              background: activeTab === 'security' ? '#ffffff' : 'transparent',
              color: activeTab === 'security' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'security' ? 600 : 500,
              fontSize: '0.78rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'security' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.12s ease',
            }}
          >
            Tenancy &amp; Residency
          </button>
          <button
            onClick={() => setActiveTab('acl')}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              background: activeTab === 'acl' ? '#ffffff' : 'transparent',
              color: activeTab === 'acl' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'acl' ? 600 : 500,
              fontSize: '0.78rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'acl' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.12s ease',
            }}
          >
            ACL Matrix
          </button>
          <button
            onClick={() => setActiveTab('metering')}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              background: activeTab === 'metering' ? '#ffffff' : 'transparent',
              color: activeTab === 'metering' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'metering' ? 600 : 500,
              fontSize: '0.78rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'metering' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.12s ease',
            }}
          >
            Usage Metering
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              background: activeTab === 'audit' ? '#ffffff' : 'transparent',
              color: activeTab === 'audit' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'audit' ? 600 : 500,
              fontSize: '0.78rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'audit' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.12s ease',
            }}
          >
            Audit Trail
          </button>
        </div>
      </div>

      {/* TAB 1: Security & Data Residency */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 14,
            }}
          >
            <div className="enterprise-card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Server size={18} color="var(--accent-blue)" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Tenant Data Isolation</h3>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                Every knowledge graph node and audit row is segregated with tenant identifier:
                <code style={{ color: 'var(--accent-blue)', display: 'block', marginTop: 4, fontFamily: 'var(--font-mono)', background: '#f0f9ff', padding: '3px 6px', borderRadius: 'var(--radius-xs)' }}>
                  {currentUser.tenantId}
                </code>
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={14} color="var(--status-success)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--status-success-text)', fontWeight: 600 }}>Enforced at query &amp; storage boundary</span>
              </div>
            </div>

            <div className="enterprise-card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <ShieldCheck size={18} color="var(--status-success)" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Data Residency Guarantee</h3>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                100% of customer prompts, extraction embeddings, and observability traces stay inside customer
                virtual private cloud (VPC).
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={14} color="var(--status-success)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--status-success-text)', fontWeight: 600 }}>Zero external model telemetry egress</span>
              </div>
            </div>

            <div className="enterprise-card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Lock size={18} color="#7c3aed" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Encryption Standards</h3>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                AES-256 GCM encryption at rest on knowledge store &amp; vector tables. TLS 1.3 encryption in transit.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={14} color="var(--status-success)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--status-success-text)', fontWeight: 600 }}>Customer-managed KMS keys supported</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Data Deletion */}
          <div
            className="enterprise-card"
            style={{
              padding: '18px 20px',
              borderLeft: '4px solid var(--status-danger)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--status-danger-text)' }}>
                  GDPR / CCPA Cryptographic Data Deletion Path
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--status-danger-text)', marginTop: 2 }}>
                  Atomically purge all graph nodes, episodic chunks, and vector embeddings belonging to an employee or tenant.
                </p>
              </div>
              <button
                className="btn btn-sm btn-danger"
                style={{ gap: 4 }}
              >
                <Trash2 size={13} />
                <span>Configure Deletion Policy</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACL Permission Matrix */}
      {activeTab === 'acl' && (
        <div className="enterprise-card" style={{ padding: '18px 20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Inherited Source ACL Groups Matrix
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14 }}>
            In Synapse, facts extracted from private emails or restricted docs inherit their source access permissions.
            Users lacking the matching ACL can never retrieve or foresee facts from those sources.
          </p>

          <table className="enterprise-table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Group Identifier</th>
                <th style={{ width: '54%' }}>Inheritance Scope &amp; Access Description</th>
                <th style={{ width: '24%', textAlign: 'right' }}>Assigned Members</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  group: 'all',
                  desc: 'Company-wide general access (public channels, open RFCs)',
                  members: 'All 340 employees',
                  color: 'badge-primary',
                },
                {
                  group: 'eng-all',
                  desc: 'Engineering organization technical specifications and repos',
                  members: '180 engineers',
                  color: 'badge-cyan',
                },
                {
                  group: 'eng-leadership',
                  desc: 'Steering committee minutes, promotions, and strategic roadmaps',
                  members: '12 directors & leads',
                  color: 'badge-node-Topic',
                },
                {
                  group: 'architecture-board',
                  desc: 'Core consensus RFCs, vendor evaluations, and system redesigns',
                  members: '8 architects',
                  color: 'badge-amber',
                },
                {
                  group: 'confidential-postmortems',
                  desc: 'Financial SLA compensation reports & high-severity outage retrospectives',
                  members: '6 designated incident commanders',
                  color: 'badge-rose',
                },
              ].map((acl) => (
                <tr key={acl.group}>
                  <td>
                    <span className={`badge ${acl.color}`} style={{ fontSize: '0.72rem' }}>
                      {acl.group}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{acl.desc}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {acl.members}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: Usage Metering */}
      {activeTab === 'metering' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="enterprise-card" style={{ padding: '18px 20px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Ingestion Volume Metering</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Google Workspace Messages</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>28,410 / 50,000 monthly quota</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: '#f1f5f9', overflow: 'hidden' }}>
                  <div style={{ width: '56%', height: '100%', background: 'var(--accent-blue)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Google Drive Documents</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>4,920 / 10,000 monthly quota</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: '#f1f5f9', overflow: 'hidden' }}>
                  <div style={{ width: '49%', height: '100%', background: 'var(--status-success)' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="enterprise-card" style={{ padding: '18px 20px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Cost Optimization</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Content-Hash Cache Hit Rate:</span>
                <span style={{ color: 'var(--status-success-text)', fontWeight: 700 }}>88.4% (Zero extra inference cost)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Local Private Model Inference Ratio:</span>
                <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>94.2%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Estimated Monthly Compute Savings:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>$4,120 / month</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Audit Log */}
      {activeTab === 'audit' && (
        <div className="enterprise-card" style={{ padding: '18px 20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Security Audit Trail</h3>
          <table className="enterprise-table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Action</th>
                <th style={{ width: '38%' }}>Target Entity</th>
                <th style={{ width: '15%' }}>ACL Group</th>
                <th style={{ width: '15%' }}>Timestamp</th>
                <th style={{ width: '10%', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {(auditLogs.length > 0 ? auditLogs : mockAuditLogs).map((log) => (
                <tr key={log.id}>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.target}</td>
                  <td>
                    <span className="badge badge-primary" style={{ fontSize: '0.62rem' }}>
                      {log.aclMatched}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {log.timestamp.substring(11, 19)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="badge badge-emerald" style={{ fontSize: '0.62rem' }}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default AdminPage;

