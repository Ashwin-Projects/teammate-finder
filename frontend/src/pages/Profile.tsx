import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, generateProfileSummary } from '../utils/api';
import { useUserStore } from '../store/useUserStore';
import { tokens } from '../tokens';

const SKILLS_OPTIONS = [
  'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'Machine Learning',
  'Data Science', 'UI/UX Design', 'Problem Solving', 'Algorithms', 'Web Development',
  'Mobile Development', 'Cloud Computing', 'DevOps', 'Cybersecurity'
];
const COMPETITION_OPTIONS = [
  'Hackathons', 'Coding Competitions', 'Design Challenges', 'Business Competitions',
  'Data Science Competitions', 'CTF', 'Game Jams', 'Robotics', 'AI Challenges'
];

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [formData, setFormData] = useState({
    bio: '', skills: [] as string[], interests: [] as string[], competitions: [] as string[],
    availability: '', experienceLevel: 'intermediate', summary: ''
  });

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    loadProfile();
  }, [isAuthenticated, navigate]);

  const loadProfile = async () => {
    try {
      const response = await getProfile();
      if (response.profile) {
        setFormData({
          bio: response.profile.bio || '',
          skills: response.profile.skills || [],
          interests: response.profile.interests || [],
          competitions: response.profile.competitions || [],
          availability: response.profile.availability || '',
          experienceLevel: response.profile.experienceLevel || 'intermediate',
          summary: response.profile.summary || ''
        });
      }
    } catch (error: any) {
      if (error.response?.status !== 404) console.error('Error loading profile:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const toggleSkill = (s: string) => setFormData({ ...formData, skills: formData.skills.includes(s) ? formData.skills.filter(x => x !== s) : [...formData.skills, s] });
  const toggleComp  = (c: string) => setFormData({ ...formData, competitions: formData.competitions.includes(c) ? formData.competitions.filter(x => x !== c) : [...formData.competitions, c] });

  const handleGenerateSummary = async () => {
    setGenerating(true);
    try {
      const resp = await generateProfileSummary();
      setFormData(prev => ({ ...prev, summary: resp.summary }));
      setIsError(false); setMessage('Summary generated.'); setTimeout(() => setMessage(''), 3000);
    } catch {
      setIsError(true); setMessage('Failed to generate summary.'); setTimeout(() => setMessage(''), 3000);
    } finally { setGenerating(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMessage('');
    try {
      await updateProfile(formData);
      setIsError(false); setMessage('Profile saved successfully.');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch {
      setIsError(true); setMessage('Failed to save profile.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ backgroundColor: tokens.bg, minHeight: '100vh' }}>
      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 30, borderBottom: `1px solid ${tokens.border}`, backgroundColor: tokens.bgElevated }}>
        <div className="content-container" style={{ height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg width="16" height="16" style={{ color: tokens.blue }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: tokens.textPrimary, letterSpacing: '-0.01em' }}>TeamSync</span>
          </button>
          <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'none', border: 'none', cursor: 'pointer', color: tokens.textMuted, fontSize: '0.75rem', transition: 'color 0.1s', fontFamily: 'inherit' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = tokens.textSecondary}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = tokens.textMuted}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Dashboard
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="content-container" style={{ paddingTop: '1.25rem', paddingBottom: '2.5rem', maxWidth: '560px' }}>
        <h1 className="t-heading" style={{ fontSize: '0.9375rem', marginBottom: '1rem' }}>Profile settings</h1>

        {message && (
          <div style={{ padding: '0.4rem 0.625rem', borderRadius: tokens.radius, fontSize: '0.72rem', marginBottom: '1rem', background: isError ? tokens.redBg : tokens.greenBg, border: `1px solid ${isError ? tokens.redBorder : tokens.greenBorder}`, color: isError ? tokens.red : tokens.green }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Bio */}
          <FormSection label="Bio">
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className="input" placeholder="Briefly describe your background, interests, and goals." style={{ resize: 'vertical' }} />
          </FormSection>

          {/* Skills */}
          <FormSection label="Skills">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
              {SKILLS_OPTIONS.map(s => (
                <button key={s} type="button" onClick={() => toggleSkill(s)} className={formData.skills.includes(s) ? 'tag tag-active' : 'tag'} style={{ cursor: 'pointer', transition: 'border-color 0.1s, color 0.1s' }}>
                  {s}
                </button>
              ))}
            </div>
          </FormSection>

          {/* Competition types */}
          <FormSection label="Competition types">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
              {COMPETITION_OPTIONS.map(c => (
                <button key={c} type="button" onClick={() => toggleComp(c)} className={formData.competitions.includes(c) ? 'tag tag-active' : 'tag'} style={{ cursor: 'pointer', transition: 'border-color 0.1s, color 0.1s' }}>
                  {c}
                </button>
              ))}
            </div>
          </FormSection>

          {/* Experience */}
          <FormSection label="Experience level">
            <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className="input" style={{ width: 'auto', minWidth: '150px' }}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </FormSection>

          {/* Availability */}
          <FormSection label="Availability">
            <input type="text" name="availability" value={formData.availability} onChange={handleChange} className="input" placeholder="e.g. Weekends, Evenings (10–20 hrs/week)" />
          </FormSection>

          {/* AI Summary */}
          <FormSection label="AI-generated summary" labelRight={
            <button type="button" onClick={handleGenerateSummary} disabled={generating} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.6875rem' }}>
              {generating ? 'Generating…' : 'Generate'}
            </button>
          }>
            <textarea name="summary" value={formData.summary} onChange={handleChange} rows={3} className="input" placeholder="AI will summarize your profile skills and goals for discovery." style={{ resize: 'vertical' }} />
          </FormSection>

          <div style={{ borderTop: `1px solid ${tokens.border}`, paddingTop: '0.75rem' }}>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function FormSection({ label, labelRight, children }: { label: string; labelRight?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
        <label className="t-label">{label}</label>
        {labelRight}
      </div>
      {children}
    </div>
  );
}

export default Profile;
