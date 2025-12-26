'use client';

import React from 'react';
import { DeEscalationTechnique } from '@/types/de-escalation';

// Theme colors
const accentColor = '#D9A299';
const accentColorDark = '#C08B82';

// SVG Icon Components
const PlayIcon = ({ color = 'white' }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={color} stroke="none">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

// Map technique IDs to SVG icons
const getTechniqueIcon = (techniqueId: string, color: string = '#6B7280') => {
  const icons: Record<string, React.ReactNode> = {
    'box-breathing': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 12h18" />
        <path d="M12 3v18" />
      </svg>
    ),
    '478-breathing': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    ),
    'physiological-sigh': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
        <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
        <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
      </svg>
    ),
    '54321-grounding': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
        <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
        <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
        <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
      </svg>
    ),
    'progressive-muscle': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M6.5 6.5c1.5-1.5 3.5-.5 4 1l2.5 5c.5 1 1.5 2 3 2h4" />
        <path d="M4 14c1.5 0 2.5 1 3 2l1 2c.5 1 1.5 2 3 2h6" />
        <path d="M7 8l-3 3" />
        <path d="M5 11l-2 2" />
      </svg>
    ),
    'cognitive-reframe': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
        <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
        <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
      </svg>
    ),
    'anchoring-phrases': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <circle cx="12" cy="5" r="3" />
        <line x1="12" y1="22" x2="12" y2="8" />
        <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
      </svg>
    ),
  };
  return icons[techniqueId] || (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
};

interface TechniqueCardProps {
  technique: DeEscalationTechnique;
  onStart: (technique: DeEscalationTechnique) => void;
  isActive?: boolean;
  effectiveness?: number;
  darkMode?: boolean;
  compact?: boolean;
}

export default function TechniqueCard({
  technique,
  onStart,
  isActive = false,
  effectiveness,
  darkMode = false,
  compact = false,
}: TechniqueCardProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  };

  const getTypeColor = () => {
    return accentColor;
  };

  const bgColor = darkMode ? '#1F2937' : 'rgba(255, 255, 255, 0.95)';
  const textColor = darkMode ? '#F9FAFB' : '#2D2D2D';
  const mutedColor = darkMode ? '#9CA3AF' : '#6B6B6B';
  const borderColor = darkMode ? '#374151' : '#DCC5B2';
  const cardBg = darkMode ? '#111827' : '#F0E4D3';
  const typeColor = getTypeColor();

  if (compact) {
    return (
      <button
        onClick={() => onStart(technique)}
        disabled={isActive}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 12px',
          background: isActive
            ? 'rgba(217, 162, 153, 0.12)'
            : darkMode ? cardBg : 'rgba(255, 255, 255, 0.9)',
          border: `1px solid ${isActive ? typeColor : borderColor}`,
          borderRadius: '10px',
          cursor: isActive ? 'default' : 'pointer',
          width: '100%',
          textAlign: 'left',
          transition: 'all 0.2s ease',
          boxShadow: isActive ? '0 2px 8px rgba(217, 162, 153, 0.2)' : 'none',
        }}
      >
        {getTechniqueIcon(technique.id, typeColor)}
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: textColor,
            marginBottom: '2px',
          }}>
            {technique.name}
          </div>
          <div style={{ fontSize: '11px', color: mutedColor }}>
            {formatDuration(technique.duration)}
            {effectiveness !== undefined && (
              <span style={{ marginLeft: '8px', color: accentColorDark }}>
                {effectiveness}% effective
              </span>
            )}
          </div>
        </div>
        <span style={{
          padding: '3px 6px',
          background: 'rgba(217, 162, 153, 0.15)',
          color: accentColorDark,
          borderRadius: '4px',
          fontSize: '9px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
        }}>
          {technique.type}
        </span>
      </button>
    );
  }

  return (
    <div style={{
      background: bgColor,
      borderRadius: '14px',
      padding: '16px',
      border: `1px solid ${isActive ? typeColor : borderColor}`,
      boxShadow: isActive ? '0 4px 16px rgba(217, 162, 153, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.02)',
      transition: 'all 0.2s ease',
      backdropFilter: 'blur(10px)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(217, 162, 153, 0.15)',
            borderRadius: '10px',
          }}>
            {getTechniqueIcon(technique.id, typeColor)}
          </span>
          <div>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: textColor,
              margin: '0 0 4px 0',
            }}>
              {technique.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                padding: '2px 6px',
                background: 'rgba(217, 162, 153, 0.15)',
                color: accentColorDark,
                borderRadius: '4px',
                fontSize: '9px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
              }}>
                {technique.type}
              </span>
              <span style={{ fontSize: '11px', color: mutedColor }}>
                {formatDuration(technique.duration)}
              </span>
            </div>
          </div>
        </div>

        {effectiveness !== undefined && (
          <div style={{
            textAlign: 'right',
            padding: '4px 8px',
            background: effectiveness > 50
              ? 'rgba(217, 162, 153, 0.15)'
              : cardBg,
            borderRadius: '6px',
          }}>
            <div style={{
              fontSize: '13px',
              fontWeight: '700',
              color: effectiveness > 50 ? accentColorDark : mutedColor,
            }}>
              {effectiveness}%
            </div>
            <div style={{ fontSize: '9px', color: mutedColor }}>
              effective
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <p style={{
        fontSize: '12px',
        color: mutedColor,
        lineHeight: '1.5',
        margin: '0 0 12px 0',
      }}>
        {technique.description}
      </p>

      {/* Steps Preview */}
      {technique.steps && technique.steps.length > 0 && (
        <div style={{
          padding: '10px',
          background: cardBg,
          borderRadius: '8px',
          marginBottom: '12px',
          border: `1px solid ${borderColor}`,
        }}>
          <div style={{
            fontSize: '10px',
            fontWeight: '600',
            color: mutedColor,
            marginBottom: '6px',
          }}>
            Steps ({technique.steps.length})
          </div>
          <ul style={{
            margin: 0,
            paddingLeft: '14px',
            fontSize: '11px',
            color: darkMode ? '#D1D5DB' : '#4B5563',
          }}>
            {technique.steps.slice(0, 3).map((step, i) => (
              <li key={i} style={{ marginBottom: '3px' }}>{step}</li>
            ))}
            {technique.steps.length > 3 && (
              <li style={{ color: mutedColor }}>
                +{technique.steps.length - 3} more...
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Start Button */}
      <button
        onClick={() => onStart(technique)}
        disabled={isActive}
        style={{
          width: '100%',
          padding: '10px',
          background: isActive
            ? cardBg
            : `linear-gradient(135deg, ${accentColor} 0%, #DCC5B2 100%)`,
          color: isActive ? mutedColor : 'white',
          border: isActive ? `1px solid ${borderColor}` : 'none',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '12px',
          cursor: isActive ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          transition: 'all 0.2s ease',
          boxShadow: isActive ? 'none' : '0 2px 8px rgba(217, 162, 153, 0.3)',
        }}
      >
        {isActive ? (
          <>In Progress...</>
        ) : (
          <>
            <PlayIcon color="white" />
            Start Exercise
          </>
        )}
      </button>
    </div>
  );
}
