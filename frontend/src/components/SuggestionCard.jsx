import React from 'react';
import { tokens } from '../tokens';

const SuggestionCard = ({ suggestion, title = 'Strategy output' }: { suggestion: any; title?: string }) => {
  if (!suggestion) return null;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p className="t-label" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</p>

      {/* Recommended Roles */}
      {(suggestion.recommendedRoles || []).length > 0 && (
        <section>
          <p className="t-label" style={{ marginBottom: '0.375rem' }}>Recommended roles</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {suggestion.recommendedRoles.map((item: any, i: number) => (
              <div key={i} style={{ padding: '0.4rem 0.625rem', background: tokens.surfaceHover, border: `1px solid ${tokens.border}`, borderRadius: tokens.radius }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 500, color: tokens.textSecondary, marginBottom: '0.15rem' }}>{item.role}</div>
                <div style={{ fontSize: '0.6875rem', color: tokens.textMuted }}>{item.focus}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skill Distribution */}
      {(suggestion.skillDistribution || []).length > 0 && (
        <section>
          <p className="t-label" style={{ marginBottom: '0.375rem' }}>Skill distribution</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
            {suggestion.skillDistribution.map((item: any, i: number) => (
              <span key={i} className="tag">
                {item.skill} · {item.priority}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Team Strategy */}
      {(suggestion.teamStrategySuggestions || []).length > 0 && (
        <section>
          <p className="t-label" style={{ marginBottom: '0.375rem' }}>Team strategy</p>
          <ul style={{ margin: 0, paddingLeft: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {suggestion.teamStrategySuggestions.map((item: any, i: number) => (
              <li key={i} style={{ fontSize: '0.75rem', color: tokens.textMuted, lineHeight: 1.5 }}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Project Ideas */}
      {(suggestion.projectIdeaSuggestions || []).length > 0 && (
        <section>
          <p className="t-label" style={{ marginBottom: '0.375rem' }}>Project ideas</p>
          <ul style={{ margin: 0, paddingLeft: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {suggestion.projectIdeaSuggestions.map((item: any, i: number) => (
              <li key={i} style={{ fontSize: '0.75rem', color: tokens.textMuted, lineHeight: 1.5 }}>{item}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default SuggestionCard;
