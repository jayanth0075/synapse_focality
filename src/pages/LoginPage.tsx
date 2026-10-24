import React, { useState } from 'react';
import {
  Network,
  ArrowRight,
  CheckCircle,
  Building,
  User,
  ArrowLeft,
} from 'lucide-react';
import { UserSession } from '../types';
import { DEMO_PERSONAS } from '../data/mockData';

interface LoginPageProps {
  onLoginSuccess: (user: UserSession) => void;
  onBackToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBackToLanding }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [selectedPersona, setSelectedPersona] = useState<UserSession>(DEMO_PERSONAS[0]);
  const [emailInput, setEmailInput] = useState('priya.sharma@artisansystems.ai');
  const [tenantInput, setTenantInput] = useState('Artisan Systems (Production)');

  const handleImmediateLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onLoginSuccess(selectedPersona);
  };

  const handleSelectPersona = (persona: UserSession) => {
    setSelectedPersona(persona);
    setEmailInput(persona.email);
    setTenantInput(persona.tenantName);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--bg-app)',
        position: 'relative',
      }}
    >
      <div
        className="enterprise-card"
        style={{
          width: '100%',
          maxWidth: 440,
          padding: '32px 30px',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Logo and Brand */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-sm)',
              background: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ffffff' }} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
            SYNAPSE
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Organizational Memory Agent &bull; Enterprise Sign In
          </p>
        </div>

        {/* Tab switch between Login and Enterprise Request */}
        <div
          style={{
            display: 'flex',
            borderRadius: 'var(--radius-sm)',
            background: '#f1f5f9',
            padding: 3,
            marginBottom: 20,
          }}
        >
          <button
            onClick={() => setActiveTab('login')}
            style={{
              flex: 1,
              padding: '6px 12px',
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              background: activeTab === 'login' ? '#ffffff' : 'transparent',
              color: activeTab === 'login' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'login' ? 600 : 500,
              fontSize: '0.8rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'login' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.12s ease',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            style={{
              flex: 1,
              padding: '6px 12px',
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              background: activeTab === 'signup' ? '#ffffff' : 'transparent',
              color: activeTab === 'signup' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'signup' ? 600 : 500,
              fontSize: '0.8rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'signup' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.12s ease',
            }}
          >
            Request Access
          </button>
        </div>

        {/* Quick Demo Persona Switcher */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Select Active Persona (Instant Demo)
            </span>
            <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
              Instant Auth
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {DEMO_PERSONAS.map((p) => {
              const isSelected = selectedPersona.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPersona(p)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-xs)',
                    cursor: 'pointer',
                    background: isSelected ? '#f8fafc' : '#ffffff',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)',
                    transition: 'all 0.12s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img
                      src={p.avatar}
                      alt={p.name}
                      style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <p style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.role}</p>
                    </div>
                  </div>
                  {isSelected && <CheckCircle size={15} color="var(--accent-primary)" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleImmediateLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
              Enterprise Tenant
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 10px',
                borderRadius: 'var(--radius-xs)',
                background: '#f8fafc',
                border: '1px solid var(--border-medium)',
              }}
            >
              <Building size={14} color="var(--text-muted)" />
              <input
                type="text"
                value={tenantInput}
                onChange={(e) => setTenantInput(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.825rem',
                  width: '100%',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
              Work Email / SSO ID
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 10px',
                borderRadius: 'var(--radius-xs)',
                background: '#f8fafc',
                border: '1px solid var(--border-medium)',
              }}
            >
              <User size={14} color="var(--text-muted)" />
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.825rem',
                  width: '100%',
                }}
              />
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '9px', marginTop: 4, fontWeight: 600, fontSize: '0.85rem' }}
          >
            <span>{activeTab === 'login' ? 'Enter Workspace' : 'Continue to Workspace'}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <div style={{ marginTop: 14, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
            Direct Demo Mode &bull; Click to enter authenticated workspace immediately.
          </p>
          <button
            type="button"
            onClick={onBackToLanding}
            style={{
              background: 'none',
              border: 'none',
              color: '#0284c7',
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 8px',
              textDecoration: 'underline',
              textUnderlineOffset: 2,
            }}
          >
            <ArrowLeft size={13} />
            <span>Back to Public Landing Page</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
