import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../tokens';

const NAV_LINKS = ['Docs', 'Changelog'];

const BtnRow: React.FC<{ navigate: ReturnType<typeof useNavigate> }> = ({ navigate }) => (
  <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', flexWrap: 'wrap' }}>
    <button
      className="btn-primary"
      onClick={() => navigate('/signup')}
      style={{ height: '32px', padding: '0 0.875rem', fontSize: '0.75rem' }}
    >
      Get started
    </button>
    <button
      className="btn-secondary"
      onClick={() => navigate('/login')}
      style={{ height: '32px', padding: '0 0.875rem', fontSize: '0.75rem' }}
    >
      Sign in
    </button>
  </div>
);

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/signup');
  };

  return (
    <div style={{ backgroundColor: tokens.bg, minHeight: '100vh', fontFamily: tokens.fontSans }}>

      {/* ═══════ NAVBAR ═══════ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: tokens.bg,
        borderBottom: `1px solid ${tokens.border}`,
      }}>
        <div className="content-container" style={{
          display: 'flex', alignItems: 'center', height: '44px', gap: '1.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={tokens.blue} strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: tokens.textPrimary, letterSpacing: '-0.01em' }}>
              teamsync
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {NAV_LINKS.map(l => (
              <button key={l} onClick={() => navigate('/signup')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: tokens.textMuted, padding: 0, fontFamily: 'inherit', transition: 'color 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.color = tokens.textSecondary)}
                onMouseLeave={e => (e.currentTarget.style.color = tokens.textMuted)}
              >{l}</button>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', gap: '0.375rem' }}>
            <button className="btn-secondary" onClick={() => navigate('/login')}
              style={{ height: '28px', padding: '0 0.625rem', fontSize: '0.72rem' }}>
              Sign in
            </button>
            <button className="btn-primary" onClick={() => navigate('/signup')}
              style={{ height: '28px', padding: '0 0.625rem', fontSize: '0.72rem' }}>
              Sign up
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════ HERO / SEARCH ═══════ */}
      <div style={{ borderBottom: `1px solid ${tokens.border}` }}>
        <div className="content-container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: tokens.blue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
            Teammate Discovery
          </p>
          <h1 className="t-title" style={{ marginBottom: '0.5rem', maxWidth: '480px' }}>
            Find the right teammates for your next competition
          </h1>
          <p style={{ fontSize: '0.8125rem', color: tokens.textMuted, maxWidth: '420px', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Skill-based matching powered by compatibility scoring. Search by technology, role, or competition type.
          </p>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.375rem', maxWidth: '440px', marginBottom: '1rem' }}>
            <input
              type="text"
              className="input"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by skill, language, or interest…"
              style={{ height: '34px', flex: 1, fontSize: '0.75rem' }}
            />
            <button type="submit" className="btn-primary" style={{ height: '34px', padding: '0 0.875rem', flexShrink: 0, fontSize: '0.75rem' }}>
              Search
            </button>
          </form>

          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.6875rem', color: tokens.textDim, marginRight: '0.125rem' }}>Try:</span>
            {['React', 'Python', 'ML', 'DevOps', 'UI/UX', 'Java', 'Data Science'].map(s => (
              <button key={s} className="tag" onClick={() => navigate('/signup')}
                style={{ fontFamily: 'inherit' }}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <div style={{ borderBottom: `1px solid ${tokens.border}` }}>
        <div className="content-container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: tokens.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
            How it works
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0' }}>
            {[
              { step: '01', title: 'Create your profile', desc: 'Add skills, experience level, competition interests, and availability.' },
              { step: '02', title: 'Browse matches', desc: 'Get a ranked list of profiles scored by compatibility with yours.' },
              { step: '03', title: 'Form a team', desc: 'Invite matches, create a team, and start coordinating in real time.' },
            ].map((h, i) => (
              <div key={i} style={{
                borderRight: i < 2 ? `1px solid ${tokens.border}` : 'none',
                paddingRight: '1.5rem',
                paddingLeft: i > 0 ? '1.5rem' : 0,
              }}>
                <span style={{ fontFamily: tokens.fontMono, fontSize: '0.6875rem', color: tokens.blue, display: 'block', marginBottom: '0.375rem' }}>
                  {h.step}
                </span>
                <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: tokens.textSecondary, marginBottom: '0.25rem' }}>{h.title}</div>
                <p style={{ fontSize: '0.75rem', color: tokens.textMuted, lineHeight: 1.6, margin: 0 }}>{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════ CAPABILITIES ═══════ */}
      <div style={{ borderBottom: `1px solid ${tokens.border}` }}>
        <div className="content-container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: tokens.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
            Capabilities
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: tokens.border }}>
            {[
              { title: 'Skill-based matching', desc: 'Computes match scores from skill overlap, experience level, and profile completeness. Updated as profiles change.', badge: 'Matching' },
              { title: 'AI team strategy', desc: 'Send a competition brief. Receive role recommendations, skill distribution, and project idea suggestions via LLM.', badge: 'AI' },
              { title: 'Real-time chat', desc: 'WebSocket-powered team messaging. Messages persist and are accessible to all members across sessions.', badge: 'Chat' },
              { title: 'Profile & discoverability', desc: 'Configure skills, competition types, availability, and experience level. AI writes a public summary for your profile.', badge: 'Profile' },
            ].map((f, i) => (
              <div key={i} style={{ background: tokens.bg, padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: tokens.textSecondary }}>{f.title}</span>
                  <span style={{
                    fontSize: '0.625rem', fontWeight: 600, color: tokens.blue,
                    border: `1px solid ${tokens.border}`, borderRadius: tokens.radiusSm,
                    padding: '0.08rem 0.35rem', fontFamily: tokens.fontMono,
                    letterSpacing: '0.02em',
                  }}>{f.badge}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: tokens.textMuted, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════ CTA ═══════ */}
      <div style={{ borderBottom: `1px solid ${tokens.border}` }}>
        <div className="content-container" style={{ paddingTop: '2rem', paddingBottom: '2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: tokens.textSecondary, marginBottom: '0.25rem' }}>
              Start finding teammates
            </div>
            <p style={{ fontSize: '0.75rem', color: tokens.textMuted, margin: 0 }}>
              Create an account and get matched in under 2 minutes.
            </p>
          </div>
          <BtnRow navigate={navigate} />
        </div>
      </div>

      {/* ═══════ FOOTER ═══════ */}
      <footer>
        <div className="content-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={tokens.blue} strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span style={{ fontSize: '0.72rem', color: tokens.textDim }}>teamsync · © 2026</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {['Privacy', 'Terms', 'GitHub'].map(l => (
              <span key={l}
                style={{ fontSize: '0.72rem', color: tokens.textDim, cursor: 'pointer', transition: 'color 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.color = tokens.textMuted)}
                onMouseLeave={e => (e.currentTarget.style.color = tokens.textDim)}
              >{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
