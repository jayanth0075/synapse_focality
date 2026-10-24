import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Check,
  Search,
  Users,
  FileText,
  Network,
  Database,
  Cpu,
  Bell,
  Shield,
  Activity,
  Sliders,
  PieChart,
  Layers,
  Lock,
  Sparkles,
  RefreshCw,
  ExternalLink,
  HelpCircle,
  CheckCircle2,
  MessageSquare,
  Plus,
  Minus,
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onGoToLogin: () => void;
  onExploreGraph: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onGoToLogin,
  onExploreGraph,
}) => {
  const [activeTab, setActiveTab] = useState<'remember' | 'recall' | 'foresee'>('recall');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        color: '#0d0d10',
        minHeight: '100vh',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* ═════════════════════════════════════════════════════════════════════════
          NAVBAR - Minimal Framer Style
          ═════════════════════════════════════════════════════════════════════════ */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            padding: '0 32px',
            height: 68,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Brand */}
          <div
            onClick={onEnterApp}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                backgroundColor: '#0d0d10',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  color: '#0d0d10',
                }}
              >
                Synapse
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  color: '#888888',
                  fontWeight: 600,
                  verticalAlign: 'super',
                }}
              >
                ™
              </span>
            </div>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <a
              href="#features"
              style={{
                fontSize: '0.9rem',
                color: '#555555',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#000')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#555555')}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              style={{
                fontSize: '0.9rem',
                color: '#555555',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#000')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#555555')}
            >
              How it works
            </a>
            <a
              href="#preview"
              style={{
                fontSize: '0.9rem',
                color: '#555555',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#000')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#555555')}
            >
              Live Demo
            </a>
            <a
              href="#architecture"
              style={{
                fontSize: '0.9rem',
                color: '#555555',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#000')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#555555')}
            >
              Security
            </a>
            <a
              href="#faq"
              style={{
                fontSize: '0.9rem',
                color: '#555555',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#000')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#555555')}
            >
              FAQ
            </a>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={onGoToLogin}
              style={{
                padding: '9px 18px',
                borderRadius: 999,
                border: '1px solid rgba(0, 0, 0, 0.1)',
                backgroundColor: '#ffffff',
                color: '#0d0d10',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7f7f7')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              Sign in
            </button>
            <button
              onClick={onEnterApp}
              style={{
                padding: '9px 22px',
                borderRadius: 999,
                border: 'none',
                backgroundColor: '#0d0d10',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <span>Get started</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </nav>

      {/* ═════════════════════════════════════════════════════════════════════════
          HERO SECTION - Framer Behance Reference Exact Match
          ═════════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '80px 32px 100px',
          display: 'grid',
          gridTemplateColumns: '1.05fr 1fr',
          alignItems: 'center',
          gap: 60,
        }}
      >
        {/* Left Column: Headline and CTAs */}
        <div>
          {/* Eyebrow badge with hollow circle */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 999,
              border: '1px solid rgba(0, 0, 0, 0.08)',
              backgroundColor: '#f9f9fb',
              marginBottom: 24,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                border: '1.5px solid #0d0d10',
                display: 'inline-block',
              }}
            />
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#444444',
                textTransform: 'uppercase',
              }}
            >
              BUILT FOR THE AI ERA &bull; ENTERPRISE MEMORY AGENT
            </span>
          </div>

          {/* Main Display Headline */}
          <h1
            style={{
              fontSize: 'clamp(2.7rem, 4.8vw, 4.1rem)',
              fontWeight: 800,
              lineHeight: 1.06,
              letterSpacing: '-0.04em',
              color: '#0d0d10',
              marginBottom: 24,
            }}
          >
            Try our AI memory
            <br />
            solution today
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '1.12rem',
              lineHeight: 1.6,
              color: '#555555',
              maxWidth: 480,
              marginBottom: 36,
            }}
          >
            Automate and streamline your organizational memory with one powerful
            knowledge graph engine. Every decision and architecture pattern,
            instantly remembered.
          </p>

          {/* Architecture verification note */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 32,
              fontSize: '0.825rem',
              color: '#64748b',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#16a34a',
                display: 'inline-block',
              }}
            />
            <span>Continuous bi-temporal sync with zero telemetry egress</span>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={onEnterApp}
              style={{
                padding: '13px 28px',
                borderRadius: 999,
                border: 'none',
                backgroundColor: '#0d0d10',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.16)',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  border: '2px solid #fff',
                }}
              />
              <span>Get Started</span>
            </button>
            <button
              onClick={onExploreGraph}
              style={{
                padding: '13px 26px',
                borderRadius: 999,
                border: '1px solid rgba(0, 0, 0, 0.12)',
                backgroundColor: '#ffffff',
                color: '#0d0d10',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7f7f7')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              Explore Knowledge Graph
            </button>
          </div>
        </div>

        {/* Right Column: Sleek Floating Dark Card with SVG Chart and Overlapping White Badges */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          {/* Top-Left Floating Badge (Waveform Icon) */}
          <div
            style={{
              position: 'absolute',
              top: '40%',
              left: -20,
              zIndex: 10,
              width: 52,
              height: 52,
              borderRadius: 12,
              backgroundColor: '#ffffff',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.14)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0d0d10',
            }}
          >
            <Activity size={22} />
          </div>

          {/* Top-Right Floating Badge (Sliders / Columns) */}
          <div
            style={{
              position: 'absolute',
              top: 60,
              right: -16,
              zIndex: 10,
              width: 52,
              height: 52,
              borderRadius: 12,
              backgroundColor: '#ffffff',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.14)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0d0d10',
            }}
          >
            <Sliders size={22} />
          </div>

          {/* Bottom-Right Floating Badge (Pie Chart / Analytics) */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              right: -18,
              zIndex: 10,
              width: 54,
              height: 54,
              borderRadius: 12,
              backgroundColor: '#ffffff',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.14)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0d0d10',
            }}
          >
            <PieChart size={22} />
          </div>

          {/* Main Dark Obsidian Hero Card */}
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              backgroundColor: '#0d0d10',
              borderRadius: 28,
              padding: '36px 32px 32px',
              color: '#ffffff',
              boxShadow: '0 25px 70px -15px rgba(0, 0, 0, 0.28)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Card Header */}
            <div style={{ marginBottom: 28 }}>
              <span
                style={{
                  fontSize: '0.85rem',
                  color: '#8e8e93',
                  fontWeight: 500,
                }}
              >
                Total active memories
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 10,
                  marginTop: 6,
                }}
              >
                <span
                  style={{
                    fontSize: '2.4rem',
                    fontWeight: 800,
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: '-0.03em',
                  }}
                >
                  14,820
                </span>
                <span
                  style={{
                    fontSize: '0.82rem',
                    color: '#4ade80',
                    fontWeight: 600,
                  }}
                >
                  +24.8%
                </span>
              </div>
            </div>

            {/* Interactive SVG Line Graph (Matching Behance Curve) */}
            <div style={{ marginBottom: 24, position: 'relative' }}>
              <svg
                viewBox="0 0 380 160"
                style={{ width: '100%', height: 'auto', overflow: 'visible' }}
              >
                <defs>
                  <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Shaded Area under curve */}
                <path
                  d="M 10 120 Q 70 125 120 95 T 210 110 T 290 60 T 360 30 L 360 150 L 10 150 Z"
                  fill="url(#curveGradient)"
                />

                {/* Main Graph Line */}
                <path
                  d="M 10 120 Q 70 125 120 95 T 210 110 T 290 60 T 360 30"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Glowing Active Data Point */}
                <circle cx="210" cy="110" r="5" fill="#ffffff" />
                <circle cx="210" cy="110" r="9" fill="none" stroke="#ffffff" strokeOpacity="0.4" />

                <circle cx="360" cy="30" r="5" fill="#ffffff" />
                <circle cx="360" cy="30" r="10" fill="none" stroke="#ffffff" strokeOpacity="0.5" />
              </svg>

              {/* Month Markers */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 6px 0',
                  fontSize: '0.75rem',
                  color: '#71717a',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </div>

            {/* Bottom Metrics Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                paddingTop: 20,
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                gap: 16,
              }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Total Users
                </span>
                <p style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                  587
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  New Insights
                </span>
                <p style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                  116
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════════
          STAT BAR - Large Typography Metrics
          ═════════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          backgroundColor: '#fafafb',
          padding: '48px 32px',
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 32,
            textAlign: 'center',
          }}
        >
          {[
            { value: '100%', label: 'Data residency & private LLM' },
            { value: '24/7', label: 'Continuous graph synthesis' },
            { value: '<15ms', label: 'Graph traversal latency' },
            { value: '96.4%', label: 'Extraction precision & recall' },
          ].map((item) => (
            <div key={item.label}>
              <div
                style={{
                  fontSize: 'clamp(2.2rem, 3vw, 2.8rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#0d0d10',
                }}
              >
                {item.value}
              </div>
              <div
                style={{
                  fontSize: '0.85rem',
                  color: '#666666',
                  marginTop: 6,
                  fontWeight: 500,
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════════
          EDITORIAL STATEMENT BANNER (Matching Behance Section 2)
          ═════════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: '#0d0d10',
          color: '#ffffff',
          padding: '100px 32px',
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '0.8fr 1.2fr',
            gap: 60,
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                INDUSTRY
              </span>
              <p style={{ fontSize: '1rem', color: '#e2e8f0', marginTop: 4, fontWeight: 500 }}>
                Artificial Intelligence &amp; Enterprise Memory
              </p>
            </div>
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                CORE CAPABILITIES
              </span>
              <p style={{ fontSize: '1rem', color: '#e2e8f0', marginTop: 4, fontWeight: 500 }}>
                Remember &bull; Recall &bull; Foresee &bull; Access Control
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                YEAR
              </span>
              <p style={{ fontSize: '1rem', color: '#e2e8f0', marginTop: 4, fontWeight: 500 }}>
                2026 Enterprise Edition
              </p>
            </div>
          </div>

          <div>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 3.2vw, 2.7rem)',
                fontWeight: 700,
                lineHeight: 1.35,
                letterSpacing: '-0.03em',
                color: '#f8fafc',
              }}
            >
              "The project's main goal was to convey trust and technical
              sophistication through visual simplicity and stand out in a sea of
              overly complex startup websites."
            </h2>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════════
          THREE PILLARS (Remember, Recall, Foresee)
          ═════════════════════════════════════════════════════════════════════════ */}
      <section
        id="features"
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '110px 32px 80px',
        }}
      >
        <div style={{ marginBottom: 60 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 12px',
              borderRadius: 999,
              border: '1px solid rgba(0, 0, 0, 0.08)',
              backgroundColor: '#f9f9fb',
              marginBottom: 16,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#0d0d10',
              }}
            />
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#444',
                textTransform: 'uppercase',
              }}
            >
              CORE CAPABILITIES
            </span>
          </div>
          <h2
            style={{
              fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.1,
              maxWidth: 620,
            }}
          >
            Three verbs that change how your organization thinks.
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
          }}
        >
          {/* Pillar 1: Remember */}
          <div
            style={{
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: 20,
              padding: '40px 32px',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)')}
          >
            <div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: '#f5f5f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 28,
                  color: '#0d0d10',
                }}
              >
                <Database size={22} />
              </div>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: 14, letterSpacing: '-0.02em' }}>
                Remember
              </h3>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#555555' }}>
                Continuously ingest emails, calendar invites, and documents into an
                active temporal graph. Every fact carries a timestamp, author provenance,
                and strict access control descriptors.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 32 }}>
              {['Incremental Sync', 'Entity Extraction', 'Human Verification Queue'].map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 999,
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    fontSize: '0.78rem',
                    color: '#444444',
                    fontWeight: 500,
                    backgroundColor: '#fafafb',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Pillar 2: Recall */}
          <div
            style={{
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: 20,
              padding: '40px 32px',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)')}
          >
            <div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: '#f5f5f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 28,
                  color: '#0d0d10',
                }}
              >
                <Search size={22} />
              </div>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: 14, letterSpacing: '-0.02em' }}>
                Recall
              </h3>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#555555' }}>
                Ask complex engineering questions in plain language. Answers are
                strictly synthesized from verified document spans with clickable inline
                citations — never hallucinated.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 32 }}>
              {['Hybrid Graph Retrieval', 'Inline Citations', 'Permission Enforcement'].map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 999,
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    fontSize: '0.78rem',
                    color: '#444444',
                    fontWeight: 500,
                    backgroundColor: '#fafafb',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Pillar 3: Foresee */}
          <div
            style={{
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: 20,
              padding: '40px 32px',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)')}
          >
            <div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: '#f5f5f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 28,
                  color: '#0d0d10',
                }}
              >
                <Bell size={22} />
              </div>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: 14, letterSpacing: '-0.02em' }}>
                Foresee
              </h3>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#555555' }}>
                When an architect proposes a design that structurally mirrors a prior
                production failure, Synapse raises an immediate alert with the full
                causal chain before code reaches staging.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 32 }}>
              {['Structural Match Engine', 'Expert Discovery', 'Confidence Scoring'].map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 999,
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    fontSize: '0.78rem',
                    color: '#444444',
                    fontWeight: 500,
                    backgroundColor: '#fafafb',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════════
          INTERACTIVE DEMO PREVIEW (Live Interactive Widget)
          ═════════════════════════════════════════════════════════════════════════ */}
      <section
        id="preview"
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '40px 32px 100px',
        }}
      >
        <div
          style={{
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: 24,
            padding: 36,
            backgroundColor: '#fafafb',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 28,
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                LIVE PREVIEW
              </span>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: 4 }}>
                Experience the engine in action
              </h3>
            </div>

            {/* Tab buttons */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#ffffff',
                padding: 4,
                borderRadius: 999,
                border: '1px solid rgba(0,0,0,0.08)',
                gap: 4,
              }}
            >
              {[
                { id: 'recall', label: '1. Cited Q&A' },
                { id: 'foresee', label: '2. Proactive Foresight' },
                { id: 'remember', label: '3. Knowledge Graph' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 999,
                    border: 'none',
                    backgroundColor: activeTab === tab.id ? '#0d0d10' : 'transparent',
                    color: activeTab === tab.id ? '#ffffff' : '#666666',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Tab Content */}
          {activeTab === 'recall' && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 16,
                border: '1px solid rgba(0, 0, 0, 0.06)',
                padding: 28,
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#0d0d10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Search size={14} color="#fff" />
                </div>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0d0d10' }}>
                  Query: "Why did the Cassandra database fail during the 2024 regional partition?"
                </span>
              </div>

              <div
                style={{
                  padding: '16px 20px',
                  backgroundColor: '#f9f9fb',
                  borderRadius: 12,
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  color: '#333333',
                  marginBottom: 16,
                }}
              >
                "During Incident #882 on October 14, 2024, an asymmetric fiber partition isolated EU-West from US-East. Because both clusters lacked an odd-quorum arbiter tie-breaker{' '}
                <span
                  style={{
                    padding: '2px 7px',
                    borderRadius: 4,
                    backgroundColor: '#0d0d10',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Doc-882
                </span>
                , both rings promoted themselves to primary, generating 4,200 corrupt duplicate transactions{' '}
                <span
                  style={{
                    padding: '2px 7px',
                    borderRadius: 4,
                    backgroundColor: '#0d0d10',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Post-Mortem-Report
                </span>
                ."
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>
                  2 verified source spans retrieved &bull; 0 hallucinations
                </span>
                <button
                  onClick={onEnterApp}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 999,
                    backgroundColor: '#0d0d10',
                    color: '#fff',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>Open Q&amp;A in Workspace</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'foresee' && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 16,
                border: '1px solid rgba(0, 0, 0, 0.06)',
                padding: 28,
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: 999,
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  CRITICAL STRUCTURAL MATCH &bull; 89% SIMILARITY
                </span>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>Identified 12 minutes ago</span>
              </div>

              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>
                Project Atlas RFC-419 mirrors 2024 Cassandra Split-Brain Outage
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: 1.55, marginBottom: 20 }}>
                The multi-master topology specified in RFC-419 by Marcus Vance repeats the
                asymmetric 2-datacenter consensus without an odd-quorum arbiter. Synapse flagged
                this design flaw before staging deployment.
              </p>

              <button
                onClick={onEnterApp}
                style={{
                  padding: '9px 18px',
                  borderRadius: 999,
                  backgroundColor: '#0d0d10',
                  color: '#fff',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>Inspect Evidence Chain in App</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {activeTab === 'remember' && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 16,
                border: '1px solid rgba(0, 0, 0, 0.06)',
                padding: 28,
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
                <div style={{ padding: 16, borderRadius: 12, backgroundColor: '#f9f9fb', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>INDEXED ENTITIES</span>
                  <p style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
                    2,410
                  </p>
                </div>
                <div style={{ padding: 16, borderRadius: 12, backgroundColor: '#f9f9fb', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>KEY DECISIONS</span>
                  <p style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
                    847
                  </p>
                </div>
                <div style={{ padding: 16, borderRadius: 12, backgroundColor: '#f9f9fb', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>GRAPH EDGES</span>
                  <p style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
                    48,190
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={onExploreGraph}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 999,
                    backgroundColor: '#0d0d10',
                    color: '#fff',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>Open Knowledge Graph Canvas</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════════
          HOW IT WORKS (4-Step Timeline)
          ═════════════════════════════════════════════════════════════════════════ */}
      <section
        id="how-it-works"
        style={{
          backgroundColor: '#0d0d10',
          color: '#ffffff',
          padding: '110px 32px',
        }}
      >
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ marginBottom: 60 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 12px',
                borderRadius: 999,
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                }}
              />
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#cccccc',
                  textTransform: 'uppercase',
                }}
              >
                HOW IT WORKS
              </span>
            </div>
            <h2
              style={{
                fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
                fontWeight: 800,
                letterSpacing: '-0.035em',
                lineHeight: 1.1,
                maxWidth: 600,
              }}
            >
              From raw communication to actionable foresight.
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 24,
            }}
          >
            {[
              {
                step: '01',
                title: 'Connect',
                desc: 'Sync Google Workspace, Slack, Jira, and Git repositories through secure, read-only APIs.',
              },
              {
                step: '02',
                title: 'Extract',
                desc: 'LLMs extract people, projects, decisions, and problem statements into structured temporal entities.',
              },
              {
                step: '03',
                title: 'Verify',
                desc: 'Low-confidence entity merges enter an interactive human-in-the-loop queue before committing.',
              },
              {
                step: '04',
                title: 'Foresee',
                desc: 'Synapse matches current active architecture proposals against past historical outage topologies.',
              },
            ].map((s) => (
              <div
                key={s.step}
                style={{
                  padding: '32px 28px',
                  borderRadius: 16,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.85rem',
                    color: '#666666',
                    fontWeight: 700,
                    marginBottom: 20,
                    display: 'block',
                  }}
                >
                  {s.step}
                </span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 12 }}>
                  {s.title}
                </h4>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#999999' }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════════
          ARCHITECTURE & ENTERPRISE SECURITY
          ═════════════════════════════════════════════════════════════════════════ */}
      <section
        id="architecture"
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '110px 32px',
        }}
      >
        <div style={{ marginBottom: 60 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 12px',
              borderRadius: 999,
              border: '1px solid rgba(0, 0, 0, 0.08)',
              backgroundColor: '#f9f9fb',
              marginBottom: 16,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#0d0d10',
              }}
            />
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#444',
                textTransform: 'uppercase',
              }}
            >
              ARCHITECTURE &amp; COMPLIANCE
            </span>
          </div>
          <h2
            style={{
              fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.1,
              maxWidth: 580,
            }}
          >
            Built for security-first enterprise compliance.
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 24,
          }}
        >
          {[
            {
              title: 'Bi-Temporal Knowledge Graph',
              desc: 'Facts carry discrete valid_from and valid_to timestamps. Historical queries reproduce what the organization knew at any exact point in history.',
              icon: <Network size={22} />,
            },
            {
              title: 'Zero-Egress Local Execution',
              desc: 'Run self-hosted 14B parameter models via Ollama. Customer communications and proprietary documents never leave your VPC boundary.',
              icon: <Cpu size={22} />,
            },
            {
              title: 'Fine-Grained Access Control',
              desc: 'Extracted facts inherit security descriptors from their source files. Confidential compensation or board data remains strictly restricted.',
              icon: <Shield size={22} />,
            },
            {
              title: 'Audit Logs & Cryptographic Deletion',
              desc: 'Every search, entity merge, and extraction is recorded in immutable audit logs. Built-in cryptographic deletion path satisfies GDPR right-to-be-forgotten.',
              icon: <FileText size={22} />,
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: 18,
                padding: '36px 32px',
                backgroundColor: '#ffffff',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: '#f5f5f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                  color: '#0d0d10',
                }}
              >
                {item.icon}
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 10 }}>
                {item.title}
              </h4>
              <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: '#555555' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════════
          FAQ SECTION (Accordion)
          ═════════════════════════════════════════════════════════════════════════ */}
      <section
        id="faq"
        style={{
          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
          backgroundColor: '#fafafb',
          padding: '100px 32px',
        }}
      >
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Frequently asked questions
            </h2>
            <p style={{ fontSize: '1rem', color: '#666', marginTop: 8 }}>
              Everything you need to know about Synapse's architecture and capabilities.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              {
                q: 'How does Synapse prevent hallucinations in recall?',
                a: 'Synapse utilizes hybrid graph retrieval combined with strict ground-truth extraction. Answers are synthesized exclusively from verified episodes in the knowledge graph, and every claim is accompanied by an inline citation badge linking to the source document span.',
              },
              {
                q: 'Can Synapse be deployed fully on-premise without cloud LLM dependencies?',
                a: 'Yes. Synapse supports fully air-gapped deployments using local Ollama-backed LLMs and self-hosted PostgreSQL/Neo4j datastores. No data or telemetry leaves your infrastructure.',
              },
              {
                q: 'How does human-in-the-loop entity verification work?',
                a: 'When new communication references people or systems with ambiguous names (e.g. similarity score below 85%), Synapse places the candidate merge into an interactive review queue for human sign-off rather than silently poisoning the knowledge graph.',
              },
              {
                q: 'How does the Foresight failure-pattern warning engine work?',
                a: 'When an architectural proposal or project RFC is indexed, the Foresight engine performs structural graph topology matching against past incident post-mortems. If a match occurs (such as active-active split quorum vulnerability), an alert with the full historical precedent is issued.',
              },
            ].map((faq, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 14,
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  overflow: 'hidden',
                }}
              >
                <div
                  onClick={() => toggleFaq(i)}
                  style={{
                    padding: '22px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0d0d10' }}>
                    {faq.q}
                  </span>
                  {openFaq === i ? <Minus size={18} color="#888" /> : <Plus size={18} color="#888" />}
                </div>
                {openFaq === i && (
                  <div
                    style={{
                      padding: '0 24px 22px',
                      fontSize: '0.92rem',
                      lineHeight: 1.6,
                      color: '#555555',
                      borderTop: '1px solid rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════════
          BOTTOM CTA
          ═════════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: '#0d0d10',
          color: '#ffffff',
          padding: '100px 32px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(2.4rem, 4.2vw, 3.4rem)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.15,
              marginBottom: 20,
            }}
          >
            Stop losing what your company already knows.
          </h2>
          <p
            style={{
              fontSize: '1.1rem',
              color: '#999999',
              lineHeight: 1.6,
              marginBottom: 36,
            }}
          >
            Launch the workspace and explore an active living knowledge graph built from
            real enterprise communication streams.
          </p>
          <button
            onClick={onEnterApp}
            style={{
              padding: '15px 36px',
              borderRadius: 999,
              border: 'none',
              backgroundColor: '#ffffff',
              color: '#0d0d10',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 8px 30px rgba(255, 255, 255, 0.2)',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <span>Launch workspace</span>
            <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════════
          FOOTER - Clean Minimalist
          ═════════════════════════════════════════════════════════════════════════ */}
      <footer
        style={{
          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
          padding: '32px 32px',
          maxWidth: 1240,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: '#0d0d10',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#fff' }} />
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0d0d10' }}>
            Synapse
          </span>
          <span style={{ fontSize: '0.82rem', color: '#888888', marginLeft: 4 }}>
            by Artisan Systems &bull; &copy; 2026
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <span style={{ fontSize: '0.82rem', color: '#888888' }}>
            Interactive Demo Mode &bull; No credentials required
          </span>
          <button
            onClick={onEnterApp}
            style={{
              background: 'none',
              border: 'none',
              color: '#0d0d10',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>Enter App</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;
