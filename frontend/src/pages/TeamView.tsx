import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTeam, getChatHistory } from '../utils/api';
import { useUserStore } from '../store/useUserStore';
import { initializeSocket, joinTeam, sendMessage, onReceiveMessage, offReceiveMessage } from '../utils/socket';
import { tokens } from '../tokens';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  createdAt: string;
}

const SIDEBAR = 190;

const TeamView: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUserStore();
  const [team, setTeam] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!teamId) return;
    loadTeamData();
    setupSocket();
    return () => { offReceiveMessage(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, isAuthenticated, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadTeamData = async () => {
    if (!teamId) return;
    try {
      const [teamRes, chatRes] = await Promise.all([getTeam(teamId), getChatHistory(teamId, 100)]);
      setTeam(teamRes.team);
      setMessages(chatRes.messages.map((msg: any) => ({
        id: msg.id, content: msg.content,
        senderId: msg.senderId, senderName: msg.sender.name, createdAt: msg.createdAt,
      })));
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const setupSocket = () => {
    const token = localStorage.getItem('token');
    if (!token || !teamId) return;
    initializeSocket(token);
    joinTeam(teamId);
    onReceiveMessage((msg: Message) => setMessages(prev => [...prev, msg]));
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !teamId || !user) return;
    sendMessage({ teamId, senderId: user.id, content: newMessage, senderName: user.name });
    setNewMessage('');
  };

  if (loading) return (
    <div style={{ backgroundColor: tokens.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="t-label">Loading team…</span>
    </div>
  );

  if (!team) return (
    <div style={{ backgroundColor: tokens.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem' }}>
      <span className="t-heading">Team not found</span>
      <button className="btn-secondary" onClick={() => navigate('/dashboard')}>← Dashboard</button>
    </div>
  );

  return (
    <div style={{ backgroundColor: tokens.bg, display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${tokens.border}`, height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', flexShrink: 0, backgroundColor: tokens.bgElevated }}>
        <div>
          <span style={{ fontWeight: 500, fontSize: '0.8125rem', color: tokens.textSecondary }}>{team.name}</span>
          {team.description && <span className="t-label" style={{ marginLeft: '0.625rem' }}>{team.description}</span>}
        </div>
        <button className="btn-secondary" onClick={() => navigate('/dashboard')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}>
          ← Dashboard
        </button>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Members sidebar */}
        <aside style={{ width: `${SIDEBAR}px`, flexShrink: 0, borderRight: `1px solid ${tokens.border}`, overflowY: 'auto', padding: '0.75rem 0.625rem', backgroundColor: tokens.bgElevated }}>
          <p className="t-label" style={{ marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Members ({team.members.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {team.members.map((m: any) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.2rem', borderRadius: tokens.radiusSm }}>
                <div style={{ width: '22px', height: '22px', borderRadius: tokens.radiusSm, backgroundColor: tokens.surface, border: `1px solid ${tokens.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 600, color: tokens.blue, flexShrink: 0 }}>
                  {m.user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 500, color: tokens.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.user.name}</div>
                  <div className="t-label">{m.role}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.875rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {messages.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="t-label">No messages yet. Start the conversation.</span>
              </div>
            ) : (
              messages.map(msg => {
                const isOwn = msg.senderId === user?.id;
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                    <div
                      style={{
                        maxWidth: '55%',
                        padding: '0.4rem 0.625rem',
                        borderRadius: tokens.radius,
                        background: isOwn ? tokens.blue : tokens.surface,
                        border: isOwn ? `1px solid ${tokens.blue}` : `1px solid ${tokens.border}`,
                        fontSize: '0.75rem',
                        color: isOwn ? '#fff' : tokens.textSecondary,
                        lineHeight: 1.5,
                      }}
                    >
                      {!isOwn && (
                        <div style={{ fontSize: '0.65rem', fontWeight: 500, color: tokens.blue, marginBottom: '0.15rem' }}>{msg.senderName}</div>
                      )}
                      <div style={{ wordBreak: 'break-word' }}>{msg.content}</div>
                      <div style={{ fontSize: '0.6rem', color: isOwn ? 'rgba(255,255,255,0.5)' : tokens.textDim, marginTop: '0.2rem', textAlign: 'right' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{ borderTop: `1px solid ${tokens.border}`, padding: '0.625rem 1rem', display: 'flex', gap: '0.375rem' }}>
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message…"
              className="input"
              style={{ flex: 1 }}
            />
            <button type="submit" disabled={!newMessage.trim()} className="btn-primary">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeamView;
