import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../../utils/api';
import { useUserStore } from '../../store/useUserStore';
import { tokens } from '../../tokens';

interface SocialBtnProps { icon: React.ReactNode; label: string; }
const SocialBtn: React.FC<SocialBtnProps> = ({ icon, label }) => {
  const [hov, setHov] = React.useState(false);
  return (
    <button type="button"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        background: hov ? tokens.surfaceHover : 'transparent', border: `1px solid ${hov ? tokens.borderHover : tokens.border}`,
        borderRadius: tokens.radius, color: tokens.textSecondary, fontSize: '0.75rem', fontWeight: 500,
        cursor: 'pointer', transition: 'background 0.1s, border-color 0.1s', fontFamily: 'inherit',
      }}
    >{icon}{label}</button>
  );
};

const GoogleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);
const GitHubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={tokens.textSecondary}>
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);
const AppleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={tokens.textSecondary}>
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setToken } = useUserStore();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match.'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    try {
      const response = await signup({ name: formData.name, email: formData.email, password: formData.password });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      setToken(response.token);
      navigate('/profile');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ backgroundColor: tokens.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: tokens.fontSans }}>
      {/* Top bar */}
      <div style={{ borderBottom: `1px solid ${tokens.border}`, height: '44px', display: 'flex', alignItems: 'center', padding: '0 1.25rem' }}>
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={tokens.blue} strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: tokens.textPrimary, letterSpacing: '-0.01em' }}>teamsync</span>
        </button>
      </div>

      {/* Centered panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.25rem' }}>
        <div style={{ width: '100%', maxWidth: '320px' }}>
          {/* Header */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h1 style={{ fontSize: '0.9375rem', fontWeight: 600, color: tokens.textPrimary, marginBottom: '0.2rem', letterSpacing: '-0.01em' }}>
              Create your account
            </h1>
            <p style={{ fontSize: '0.75rem', color: tokens.textMuted, margin: 0 }}>
              Start finding teammates for competitions.
            </p>
          </div>

          {/* OAuth */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <SocialBtn icon={<GoogleIcon />} label="Continue with Google" />
            <SocialBtn icon={<GitHubIcon />} label="Continue with GitHub" />
            <SocialBtn icon={<AppleIcon  />} label="Continue with Apple"  />
          </div>

          <div className="auth-divider">or</div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { name: 'name',            type: 'text',     placeholder: 'Full name' },
              { name: 'email',           type: 'email',    placeholder: 'Email address' },
              { name: 'password',        type: 'password', placeholder: 'Password (min. 6 chars)' },
              { name: 'confirmPassword', type: 'password', placeholder: 'Confirm password' },
            ].map(f => (
              <input key={f.name} name={f.name} type={f.type} required className="input"
                placeholder={f.placeholder} autoComplete={f.type === 'password' ? 'new-password' : 'on'}
                value={(formData as any)[f.name]} onChange={handleChange}
                style={{ height: '34px', fontSize: '0.75rem' }}
              />
            ))}

            {error && (
              <p style={{ fontSize: '0.72rem', color: tokens.red, margin: 0, padding: '0.375rem 0.5rem', background: tokens.redBg, border: `1px solid ${tokens.redBorder}`, borderRadius: tokens.radius }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}
              style={{
                width: '100%', height: '34px',
                backgroundColor: tokens.blue, color: '#fff', border: `1px solid ${tokens.blue}`,
                borderRadius: tokens.radius, fontSize: '0.75rem', fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1,
                transition: 'opacity 0.1s, background-color 0.1s', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = tokens.blueHover; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = tokens.blue; }}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p style={{ marginTop: '1rem', fontSize: '0.72rem', color: tokens.textMuted, textAlign: 'center' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: tokens.blue, textDecoration: 'none', fontWeight: 500 }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
            >Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
