import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { findMatches, getTeams, createTeam, saveSuggestion } from '../utils/api';
import { useUserStore } from '../store/useUserStore';
import AITeamGenerator from '../components/AITeamGenerator';
import SavedSuggestions from '../components/SavedSuggestions';
import { tokens } from '../tokens';

interface Match {
  userId: string;
  name: string;
  email: string;
  skills: string[];
  interests: string[];
  competitions: string[];
  bio: string;
  summary: string;
  matchScore: number;
  experienceLevel: string;
  availability: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  members: any[];
  _count: { messages: number };
}

const IconUsers = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);
const IconTeam = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);
const IconAI = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
);
const IconProfile = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);
const IconSignOut = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);
const IconPlus = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);
const IconClose = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SIDEBAR_WIDTH = 200;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useUserStore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'matches' | 'teams' | 'ai'>('matches');
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [savedRefreshKey, setSavedRefreshKey] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [matchesRes, teamsRes] = await Promise.all([findMatches(20), getTeams()]);
      setMatches(matchesRes.matches || []);
      setTeams(teamsRes.teams || []);
    } catch (error: any) {
      console.error('Error loading data:', error);
      if (error.response?.status === 404) navigate('/profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    try {
      await createTeam({ name: newTeamName, description: newTeamDescription, memberIds: selectedMembers });
      setShowCreateTeam(false);
      setNewTeamName(''); setNewTeamDescription(''); setSelectedMembers([]);
      loadData();
    } catch (error) { console.error(error); }
  };

  const toggleMember = (id: string) => setSelectedMembers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const handleLogout = () => { logout(); navigate('/'); };
  const handleSaveSuggestion = async (desc: string, res: any) => {
    try { await saveSuggestion({ competitionDescription: desc, generatedResponse: res }); setSavedRefreshKey(k => k + 1); setActiveTab('ai'); }
    catch (e) { console.error(e); }
  };

  const navItems = [
    { id: 'matches' as const, label: 'Teammates', count: matches.length, icon: <IconUsers /> },
    { id: 'teams' as const,   label: 'Teams',      count: teams.length,   icon: <IconTeam /> },
    { id: 'ai' as const,      label: 'AI Generator',                       icon: <IconAI /> },
  ];

  if (loading) {
    return (
      <div style={{ backgroundColor: tokens.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="t-label">Loading…</span>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: tokens.bg, minHeight: '100vh', display: 'flex' }}>

      {/* ─── Sidebar ─── */}
      <aside
        style={{
          width: `${SIDEBAR_WIDTH}px`,
          flexShrink: 0,
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          backgroundColor: tokens.bgElevated,
          borderRight: `1px solid ${tokens.border}`,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 40,
        }}
      >
        {/* Logo row */}
        <div style={{ padding: '0 0.75rem', height: '48px', display: 'flex', alignItems: 'center', borderBottom: `1px solid ${tokens.border}`, gap: '0.4rem' }}>
          <svg width="15" height="15" style={{ color: tokens.blue, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: tokens.textPrimary, letterSpacing: '-0.01em' }}>TeamSync</span>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '0.375rem 0.375rem', overflowY: 'auto' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.35rem 0.45rem',
                borderRadius: tokens.radiusSm,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: activeTab === item.id ? 500 : 400,
                backgroundColor: activeTab === item.id ? tokens.surface : 'transparent',
                color: activeTab === item.id ? tokens.textPrimary : tokens.textMuted,
                transition: 'background-color 0.1s, color 0.1s',
                marginBottom: '1px',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => { if (activeTab !== item.id) { (e.currentTarget as HTMLElement).style.backgroundColor = tokens.surfaceHover; (e.currentTarget as HTMLElement).style.color = tokens.textSecondary; } }}
              onMouseLeave={e => { if (activeTab !== item.id) { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = tokens.textMuted; } }}
            >
              <span style={{ color: activeTab === item.id ? tokens.blue : 'inherit', flexShrink: 0 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.count !== undefined && (
                <span style={{ fontSize: '0.6875rem', color: tokens.textDim, fontFamily: tokens.fontMono }}>{item.count}</span>
              )}
            </button>
          ))}

          {/* Divider */}
          <div style={{ borderTop: `1px solid ${tokens.border}`, margin: '0.375rem 0' }} />

          <button
            onClick={() => navigate('/profile')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.45rem',
              borderRadius: tokens.radiusSm,
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.75rem',
              backgroundColor: 'transparent',
              color: tokens.textMuted,
              transition: 'background-color 0.1s, color 0.1s',
              textAlign: 'left',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = tokens.surfaceHover; (e.currentTarget as HTMLElement).style.color = tokens.textSecondary; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = tokens.textMuted; }}
          >
            <IconProfile />
            <span>Profile</span>
          </button>
        </nav>

        {/* User + logout */}
        <div style={{ borderTop: `1px solid ${tokens.border}`, padding: '0.5rem 0.75rem' }}>
          <div style={{ marginBottom: '0.3rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 500, color: tokens.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </div>
            <div className="t-label" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: tokens.textMuted,
              fontSize: '0.6875rem',
              padding: 0,
              transition: 'color 0.1s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = tokens.red}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = tokens.textMuted}
          >
            <IconSignOut />
            Sign out
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main style={{ marginLeft: `${SIDEBAR_WIDTH}px`, flex: 1, minWidth: 0 }}>
        {/* Top bar */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            backgroundColor: tokens.bgElevated,
            borderBottom: `1px solid ${tokens.border}`,
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.25rem',
          }}
        >
          <span className="t-heading" style={{ fontSize: '0.8125rem' }}>
            {activeTab === 'matches' && `Teammate matches  ·  ${matches.length} results`}
            {activeTab === 'teams' && `Your teams  ·  ${teams.length} total`}
            {activeTab === 'ai' && 'AI team strategy generator'}
          </span>
          {(activeTab === 'matches' || activeTab === 'teams') && (
            <button className="btn-primary" onClick={() => setShowCreateTeam(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <IconPlus /> New team
            </button>
          )}
        </header>

        {/* Page content */}
        <div style={{ padding: '1rem 1.25rem' }}>

          {/* ── Matches tab ── */}
          {activeTab === 'matches' && (
            <div>
              {matches.length === 0 ? (
                <EmptyState icon={<IconUsers />} title="No matches yet" desc="Complete your profile to receive skill-based teammate recommendations." action={<button className="btn-primary" onClick={() => navigate('/profile')}>Complete profile</button>} />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.5rem' }}>
                  {matches.map(match => (
                    <MatchCard
                      key={match.userId}
                      match={match}
                      onInvite={() => { setSelectedMembers([match.userId]); setShowCreateTeam(true); }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Teams tab ── */}
          {activeTab === 'teams' && (
            <div>
              {teams.length === 0 ? (
                <EmptyState icon={<IconTeam />} title="No teams yet" desc="Create a team or get invited by a teammate." />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.5rem' }}>
                  {teams.map(team => (
                    <div
                      key={team.id}
                      className="card"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/team/${team.id}`)}
                    >
                      <div style={{ fontWeight: 500, fontSize: '0.75rem', color: tokens.textSecondary, marginBottom: '0.2rem' }}>{team.name}</div>
                      {team.description && (
                        <p className="t-body" style={{ fontSize: '0.72rem', marginBottom: '0.4rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {team.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: '0.625rem' }}>
                        <span className="t-label">{team.members.length} members</span>
                        <span className="t-label">{team._count.messages} messages</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── AI tab ── */}
          {activeTab === 'ai' && (
            <div style={{ maxWidth: '640px' }}>
              <AITeamGenerator onSaveSuggestion={handleSaveSuggestion} />
              <div style={{ marginTop: '1.25rem' }}>
                <SavedSuggestions refreshKey={savedRefreshKey} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─── Create Team Modal ─── */}
      {showCreateTeam && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) { setShowCreateTeam(false); setNewTeamName(''); setNewTeamDescription(''); setSelectedMembers([]); } }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '440px', maxHeight: '85vh', overflowY: 'auto', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="t-heading">Create team</span>
              <button onClick={() => setShowCreateTeam(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: tokens.textMuted, display: 'flex' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = tokens.textSecondary}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = tokens.textMuted}
              ><IconClose /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <label className="t-label" style={{ display: 'block', marginBottom: '0.25rem' }}>Team name *</label>
                <input type="text" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} className="input" placeholder="e.g. Alpha Squad" />
              </div>
              <div>
                <label className="t-label" style={{ display: 'block', marginBottom: '0.25rem' }}>Description</label>
                <textarea value={newTeamDescription} onChange={e => setNewTeamDescription(e.target.value)} rows={2} className="input" placeholder="What competition is this team for?" style={{ resize: 'vertical' }} />
              </div>
              {matches.length > 0 && (
                <div>
                  <label className="t-label" style={{ display: 'block', marginBottom: '0.25rem' }}>Invite members (optional)</label>
                  <div style={{ maxHeight: '140px', overflowY: 'auto', border: `1px solid ${tokens.border}`, borderRadius: tokens.radius, padding: '0.25rem' }}>
                    {matches.map(m => (
                      <label key={m.userId} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.2rem', cursor: 'pointer', borderRadius: tokens.radiusSm }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = tokens.surfaceHover}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
                      >
                        <input type="checkbox" checked={selectedMembers.includes(m.userId)} onChange={() => toggleMember(m.userId)} style={{ cursor: 'pointer' }} />
                        <span style={{ fontSize: '0.75rem', color: tokens.textSecondary, flex: 1 }}>{m.name}</span>
                        <span className="t-label">{m.matchScore}%</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.375rem' }}>
              <button onClick={handleCreateTeam} disabled={!newTeamName.trim()} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Create team</button>
              <button onClick={() => { setShowCreateTeam(false); setNewTeamName(''); setNewTeamDescription(''); setSelectedMembers([]); }} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────
function EmptyState({ icon, title, desc, action }: { icon: React.ReactNode; title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '2rem 1.25rem' }}>
      <div style={{ color: tokens.textDim, display: 'flex', justifyContent: 'center', marginBottom: '0.625rem' }}>{icon}</div>
      <div className="t-heading" style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>{title}</div>
      <p className="t-body" style={{ fontSize: '0.75rem', marginBottom: action ? '0.75rem' : '0' }}>{desc}</p>
      {action}
    </div>
  );
}

function MatchCard({ match, onInvite }: { match: Match; onInvite: () => void }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 500, fontSize: '0.75rem', color: tokens.textSecondary }}>{match.name}</div>
          <div className="t-label">{match.experienceLevel}</div>
        </div>
        <span style={{ fontSize: '0.6875rem', fontFamily: tokens.fontMono, color: tokens.green, background: tokens.greenBg, border: `1px solid ${tokens.greenBorder}`, borderRadius: tokens.radiusSm, padding: '0.1rem 0.35rem' }}>
          {match.matchScore}%
        </span>
      </div>

      {/* Summary */}
      {match.summary && (
        <p className="t-body" style={{ fontSize: '0.72rem', borderTop: `1px solid ${tokens.border}`, paddingTop: '0.4rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', margin: 0 }}>
          {match.summary}
        </p>
      )}

      {/* Skills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
        {match.skills.slice(0, 4).map((skill, i) => <span key={i} className="tag">{skill}</span>)}
        {match.skills.length > 4 && <span className="t-label">+{match.skills.length - 4}</span>}
      </div>

      {/* Action */}
      <button onClick={onInvite} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.15rem' }}>
        Invite to team
      </button>
    </div>
  );
}

export default Dashboard;
