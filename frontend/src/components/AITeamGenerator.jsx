import React, { useState } from 'react';
import { generateTeamSuggestion } from '../utils/api';
import SuggestionCard from './SuggestionCard';
import { tokens } from '../tokens';

const AITeamGenerator = ({ onSaveSuggestion }: { onSaveSuggestion?: (desc: string, res: any) => void }) => {
  const [competitionDescription, setCompetitionDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [teamSize, setTeamSize] = useState(4);
  const [preferredTechnologies, setPreferredTechnologies] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const response = await generateTeamSuggestion({
        competitionDescription,
        requiredSkills: requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        teamSize: Number(teamSize),
        preferredTechnologies: preferredTechnologies.split(',').map(t => t.trim()).filter(Boolean),
      });
      setSuggestion(response.suggestion);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to generate team suggestion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="card">
        <p className="t-label" style={{ marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Team strategy generator</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label className="t-label" style={{ display: 'block', marginBottom: '0.2rem' }}>Competition description *</label>
            <textarea required rows={3} value={competitionDescription} onChange={e => setCompetitionDescription(e.target.value)} className="input" placeholder="Describe the competition scope, theme, and expected deliverables." style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <label className="t-label" style={{ display: 'block', marginBottom: '0.2rem' }}>Required skills</label>
              <input type="text" value={requiredSkills} onChange={e => setRequiredSkills(e.target.value)} className="input" placeholder="React, Python, UI/UX" />
            </div>
            <div>
              <label className="t-label" style={{ display: 'block', marginBottom: '0.2rem' }}>Team size</label>
              <input type="number" min={2} max={8} value={teamSize} onChange={e => setTeamSize(Number(e.target.value))} className="input" style={{ width: '70px' }} />
            </div>
          </div>

          <div>
            <label className="t-label" style={{ display: 'block', marginBottom: '0.2rem' }}>Preferred technologies</label>
            <input type="text" value={preferredTechnologies} onChange={e => setPreferredTechnologies(e.target.value)} className="input" placeholder="TypeScript, PostgreSQL, Tailwind" />
          </div>

          {error && (
            <div style={{ padding: '0.35rem 0.5rem', background: tokens.redBg, border: `1px solid ${tokens.redBorder}`, borderRadius: tokens.radius, color: tokens.red, fontSize: '0.72rem' }}>
              {error}
            </div>
          )}

          <div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Generating…' : 'Generate strategy'}
            </button>
          </div>
        </form>
      </div>

      {suggestion && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <SuggestionCard suggestion={suggestion} />
          <div>
            <button onClick={() => onSaveSuggestion?.(competitionDescription, suggestion)} className="btn-secondary">
              Save suggestion
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITeamGenerator;
