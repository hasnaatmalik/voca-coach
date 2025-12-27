'use client';

import React, { useState, ReactNode } from 'react';
import { DeEscalationTechnique, DEFAULT_TECHNIQUES, TechniqueType } from '@/types/de-escalation';
import TechniqueCard from './TechniqueCard';

// Theme colors
const accentColor = '#D9A299';
const accentColorDark = '#C08B82';

// SVG Icon Components
const BookIcon = ({ color = accentColor }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const LungsIcon = ({ color = accentColor }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M6.081 20C2.5 20 2 16.5 2 14c0-3.5 2.5-6 4-7.5 1-1 2-2 2-3.5" />
    <path d="M17.919 20C21.5 20 22 16.5 22 14c0-3.5-2.5-6-4-7.5-1-1-2-2-2-3.5" />
    <path d="M12 3v18" />
    <path d="M8 6c2 0 4 1 4 4" />
    <path d="M16 6c-2 0-4 1-4 4" />
  </svg>
);

const LeafIcon = ({ color = accentColor }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

const BrainIcon = ({ color = accentColor }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
  </svg>
);

const MuscleIcon = ({ color = accentColor }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M6.5 6.5c1.5-1.5 3.5-.5 4 1l2.5 5c.5 1 1.5 2 3 2h4" />
    <path d="M4 14c1.5 0 2.5 1 3 2l1 2c.5 1 1.5 2 3 2h6" />
    <path d="M7 8l-3 3" />
    <path d="M5 11l-2 2" />
  </svg>
);

const MeditationIcon = ({ color = accentColor }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="6" r="3" />
    <path d="M12 9v3" />
    <path d="M6 15c0-2 1.5-3 3-3h6c1.5 0 3 1 3 3" />
    <path d="M4 20c0-1.5 1-3 4-3h8c3 0 4 1.5 4 3" />
    <path d="M9 21v-2" />
    <path d="M15 21v-2" />
  </svg>
);

const SearchIcon = ({ color = '#6B6B6B' }: { color?: string }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const LightbulbIcon = ({ color = accentColorDark }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

interface TechniqueLibraryProps {
  onStartTechnique: (technique: DeEscalationTechnique) => void;
  activeTechniqueId?: string | null;
  effectiveness?: Record<string, number>;
  darkMode?: boolean;
  compact?: boolean;
}

const TECHNIQUE_TYPES: { value: TechniqueType | 'all'; label: string; icon: ReactNode }[] = [
  { value: 'all', label: 'All', icon: <BookIcon /> },
  { value: 'breathing', label: 'Breathing', icon: <LungsIcon /> },
  { value: 'grounding', label: 'Grounding', icon: <LeafIcon /> },
  { value: 'cognitive', label: 'Cognitive', icon: <BrainIcon /> },
  { value: 'physical', label: 'Physical', icon: <MuscleIcon /> },
];

export default function TechniqueLibrary({
  onStartTechnique,
  activeTechniqueId = null,
  effectiveness = {},
  darkMode = false,
  compact = false,
}: TechniqueLibraryProps) {
  const [selectedType, setSelectedType] = useState<TechniqueType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTechniques = DEFAULT_TECHNIQUES.filter((technique) => {
    const matchesType = selectedType === 'all' || technique.type === selectedType;
    const matchesSearch = !searchQuery ||
      technique.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      technique.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const bgColor = darkMode ? '#1F2937' : 'rgba(255, 255, 255, 0.95)';
  const textColor = darkMode ? '#F9FAFB' : '#2D2D2D';
  const mutedColor = darkMode ? '#9CA3AF' : '#6B6B6B';
  const borderColor = darkMode ? '#374151' : '#DCC5B2';
  const cardBg = darkMode ? '#111827' : '#F0E4D3';

  if (compact) {
    return (
      <div style={{
        background: bgColor,
        borderRadius: '16px',
        padding: '16px',
        border: `1px solid ${borderColor}`,
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: textColor,
            margin: 0,
          }}>
            Quick Techniques
          </h3>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as TechniqueType | 'all')}
            style={{
              padding: '4px 8px',
              background: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: '6px',
              fontSize: '12px',
              color: textColor,
              cursor: 'pointer',
            }}
          >
            {TECHNIQUE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredTechniques.slice(0, 4).map((technique) => (
            <TechniqueCard
              key={technique.id}
              technique={technique}
              onStart={onStartTechnique}
              isActive={activeTechniqueId === technique.id}
              effectiveness={effectiveness[technique.id]}
              darkMode={darkMode}
              compact={true}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: bgColor,
      borderRadius: '20px',
      padding: '20px',
      border: `1px solid ${borderColor}`,
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '4px',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: `linear-gradient(135deg, ${accentColor} 0%, #DCC5B2 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(217, 162, 153, 0.3)',
          }}>
            <MeditationIcon color="white" />
          </div>
          <h2 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: textColor,
            margin: 0,
          }}>
            Technique Library
          </h2>
        </div>
        <p style={{
          fontSize: '12px',
          color: mutedColor,
          margin: '8px 0 0 0',
        }}>
          Evidence-based techniques for stress management
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '12px' }}>
        <input
          type="text"
          placeholder="Search techniques..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            background: darkMode ? '#111827' : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${borderColor}`,
            borderRadius: '10px',
            fontSize: '13px',
            color: textColor,
            outline: 'none',
          }}
        />
      </div>

      {/* Type Filters */}
      <div style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '16px',
        flexWrap: 'wrap',
      }}>
        {TECHNIQUE_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => setSelectedType(type.value)}
            style={{
              padding: '6px 12px',
              background: selectedType === type.value
                ? accentColor
                : darkMode ? '#374151' : 'rgba(255, 255, 255, 0.9)',
              color: selectedType === type.value ? 'white' : textColor,
              border: selectedType === type.value ? 'none' : `1px solid ${borderColor}`,
              borderRadius: '8px',
              fontWeight: '500',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.2s ease',
              boxShadow: selectedType === type.value ? '0 2px 8px rgba(217, 162, 153, 0.3)' : 'none',
            }}
          >
            {type.icon}
            {type.label}
          </button>
        ))}
      </div>

      {/* Techniques Grid */}
      {filteredTechniques.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '12px',
        }}>
          {filteredTechniques.map((technique) => (
            <TechniqueCard
              key={technique.id}
              technique={technique}
              onStart={onStartTechnique}
              isActive={activeTechniqueId === technique.id}
              effectiveness={effectiveness[technique.id]}
              darkMode={darkMode}
            />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '32px 20px',
          color: mutedColor,
        }}>
          <div style={{ marginBottom: '12px', opacity: 0.5, display: 'flex', justifyContent: 'center' }}>
            <SearchIcon color={mutedColor} />
          </div>
          <div style={{ fontSize: '13px' }}>
            No techniques found matching your search
          </div>
        </div>
      )}

      {/* Stats Footer */}
      <div style={{
        marginTop: '16px',
        padding: '10px 14px',
        background: cardBg,
        borderRadius: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '11px',
        color: mutedColor,
        border: `1px solid ${borderColor}`,
      }}>
        <span>
          {filteredTechniques.length} technique{filteredTechniques.length !== 1 ? 's' : ''} available
        </span>
        {Object.keys(effectiveness).length > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <LightbulbIcon color={accentColorDark} />
            Based on your history
          </span>
        )}
      </div>
    </div>
  );
}
