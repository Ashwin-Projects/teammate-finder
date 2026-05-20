import React, { useEffect, useState } from 'react';
import { getSuggestions } from '../utils/api';
import SuggestionCard from './SuggestionCard';
import { tokens } from '../tokens';

const SavedSuggestions = ({ refreshKey = 0 }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        const res = await getSuggestions();
        setSuggestions(res.suggestions || []);
      } catch (err) {
        setError(err?.response?.data?.error || 'Failed to load saved suggestions.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refreshKey]);

  if (loading) return <p className="t-label">Loading saved suggestions…</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      <p className="t-label" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Saved suggestions</p>

      {error && (
        <div style={{ padding: '0.35rem 0.5rem', background: tokens.redBg, border: `1px solid ${tokens.redBorder}`, borderRadius: tokens.radius, color: tokens.red, fontSize: '0.72rem' }}>
          {error}
        </div>
      )}

      {suggestions.length === 0 ? (
        <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <span className="t-label">No saved suggestions yet.</span>
        </div>
      ) : (
        suggestions.map(item => (
          <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <p className="t-label" style={{ fontSize: '0.6875rem' }}>
              {item.competitionDescription} · {new Date(item.createdAt).toLocaleDateString()}
            </p>
            <SuggestionCard suggestion={item.generatedResponse} title="Saved strategy" />
          </div>
        ))
      )}
    </div>
  );
};

export default SavedSuggestions;
