'use client';

import React from 'react';
import { DeEscalationTechnique } from '@/types/de-escalation';

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'breathing': return '#10B981';
      case 'grounding': return '#7C3AED';
      case 'cognitive': return '#F59E0B';
      case 'physical': return '#EC4899';
      default: return '#6B7280';
    }
  };

  const bgColor = darkMode ? '#1F2937' : 'white';
  const textColor = darkMode ? '#F9FAFB' : '#1F2937';
  const mutedColor = darkMode ? '#9CA3AF' : '#6B7280';
  const borderColor = darkMode ? '#374151' : '#E5E7EB';
  const typeColor = getTypeColor(technique.type);

  if (compact) {
    return (
      <button
        onClick={() => onStart(technique)}
        disabled={isActive}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          background: isActive
            ? `${typeColor}20`
            : bgColor,
          border: `1px solid ${isActive ? typeColor : borderColor}`,
          borderRadius: '12px',
          cursor: isActive ? 'default' : 'pointer',
          width: '100%',
          textAlign: 'left',
          transition: 'all 0.2s ease',
        }}
      >
        <span style={{ fontSize: '24px' }}>{technique.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: textColor,
            marginBottom: '2px',
          }}>
            {technique.name}
          </div>
          <div style={{ fontSize: '12px', color: mutedColor }}>
            {formatDuration(technique.duration)}
            {effectiveness !== undefined && (
              <span style={{ marginLeft: '8px', color: typeColor }}>
                {effectiveness}% effective
              </span>
            )}
          </div>
        </div>
        <span style={{
          padding: '4px 8px',
          background: `${typeColor}20`,
          color: typeColor,
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '600',
          textTransform: 'capitalize',
        }}>
          {technique.type}
        </span>
      </button>
    );
  }

  return (
    <div style={{
      background: bgColor,
      borderRadius: '16px',
      padding: '20px',
      border: `1px solid ${isActive ? typeColor : borderColor}`,
      boxShadow: isActive ? `0 0 0 2px ${typeColor}30` : 'none',
      transition: 'all 0.2s ease',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontSize: '32px',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${typeColor}15`,
            borderRadius: '12px',
          }}>
            {technique.icon}
          </span>
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: textColor,
              margin: '0 0 4px 0',
            }}>
              {technique.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                padding: '2px 8px',
                background: `${typeColor}15`,
                color: typeColor,
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'capitalize',
              }}>
                {technique.type}
              </span>
              <span style={{ fontSize: '12px', color: mutedColor }}>
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
              ? 'rgba(16, 185, 129, 0.1)'
              : darkMode ? '#374151' : '#F3F4F6',
            borderRadius: '6px',
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '700',
              color: effectiveness > 50 ? '#10B981' : mutedColor,
            }}>
              {effectiveness}%
            </div>
            <div style={{ fontSize: '10px', color: mutedColor }}>
              effective
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <p style={{
        fontSize: '13px',
        color: mutedColor,
        lineHeight: '1.5',
        margin: '0 0 16px 0',
      }}>
        {technique.description}
      </p>

      {/* Steps Preview */}
      {technique.steps && technique.steps.length > 0 && (
        <div style={{
          padding: '12px',
          background: darkMode ? '#111827' : '#F9FAFB',
          borderRadius: '10px',
          marginBottom: '16px',
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: mutedColor,
            marginBottom: '8px',
          }}>
            Steps ({technique.steps.length})
          </div>
          <ul style={{
            margin: 0,
            paddingLeft: '16px',
            fontSize: '12px',
            color: darkMode ? '#D1D5DB' : '#4B5563',
          }}>
            {technique.steps.slice(0, 3).map((step, i) => (
              <li key={i} style={{ marginBottom: '4px' }}>{step}</li>
            ))}
            {technique.steps.length > 3 && (
              <li style={{ color: mutedColor }}>
                +{technique.steps.length - 3} more steps...
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
          padding: '12px',
          background: isActive
            ? darkMode ? '#374151' : '#E5E7EB'
            : `linear-gradient(135deg, ${typeColor} 0%, ${typeColor}DD 100%)`,
          color: isActive ? mutedColor : 'white',
          border: 'none',
          borderRadius: '10px',
          fontWeight: '600',
          fontSize: '14px',
          cursor: isActive ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s ease',
        }}
      >
        {isActive ? (
          <>In Progress...</>
        ) : (
          <>
            <span>▶️</span>
            Start Exercise
          </>
        )}
      </button>
    </div>
  );
}
