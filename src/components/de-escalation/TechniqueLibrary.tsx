'use client';

import React, { useState } from 'react';
import { DeEscalationTechnique, DEFAULT_TECHNIQUES, TechniqueType } from '@/types/de-escalation';
import TechniqueCard from './TechniqueCard';

interface TechniqueLibraryProps {
  onStartTechnique: (technique: DeEscalationTechnique) => void;
  activeTechniqueId?: string | null;
  effectiveness?: Record<string, number>;
  darkMode?: boolean;
  compact?: boolean;
}

const TECHNIQUE_TYPES: { value: TechniqueType | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: '📚' },
  { value: 'breathing', label: 'Breathing', icon: '🫁' },
  { value: 'grounding', label: 'Grounding', icon: '🌍' },
  { value: 'cognitive', label: 'Cognitive', icon: '🧠' },
  { value: 'physical', label: 'Physical', icon: '💪' },
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

  const bgColor = darkMode ? '#1F2937' : 'white';
  const textColor = darkMode ? '#F9FAFB' : '#1F2937';
  const mutedColor = darkMode ? '#9CA3AF' : '#6B7280';
  const borderColor = darkMode ? '#374151' : '#E5E7EB';

  if (compact) {
    return (
      <div style={{
        background: bgColor,
        borderRadius: '16px',
        padding: '16px',
        border: `1px solid ${borderColor}`,
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
              background: darkMode ? '#111827' : '#F3F4F6',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              color: textColor,
              cursor: 'pointer',
            }}
          >
            {TECHNIQUE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
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
      padding: '24px',
      border: `1px solid ${borderColor}`,
    }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '4px',
        }}>
          <span style={{ fontSize: '20px' }}>🧘</span>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: textColor,
            margin: 0,
          }}>
            Technique Library
          </h2>
        </div>
        <p style={{
          fontSize: '13px',
          color: mutedColor,
          margin: 0,
        }}>
          Evidence-based techniques for stress management and emotional regulation
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Search techniques..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: darkMode ? '#111827' : '#F9FAFB',
            border: `1px solid ${borderColor}`,
            borderRadius: '10px',
            fontSize: '14px',
            color: textColor,
            outline: 'none',
          }}
        />
      </div>

      {/* Type Filters */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        flexWrap: 'wrap',
      }}>
        {TECHNIQUE_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => setSelectedType(type.value)}
            style={{
              padding: '8px 14px',
              background: selectedType === type.value
                ? '#7C3AED'
                : darkMode ? '#374151' : '#F3F4F6',
              color: selectedType === type.value ? 'white' : textColor,
              border: 'none',
              borderRadius: '8px',
              fontWeight: '500',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{type.icon}</span>
            {type.label}
          </button>
        ))}
      </div>

      {/* Techniques Grid */}
      {filteredTechniques.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
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
          padding: '40px 20px',
          color: mutedColor,
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}>🔍</div>
          <div style={{ fontSize: '14px' }}>
            No techniques found matching your search
          </div>
        </div>
      )}

      {/* Stats Footer */}
      <div style={{
        marginTop: '20px',
        padding: '12px 16px',
        background: darkMode ? '#111827' : '#F9FAFB',
        borderRadius: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: mutedColor,
      }}>
        <span>
          {filteredTechniques.length} technique{filteredTechniques.length !== 1 ? 's' : ''} available
        </span>
        {Object.keys(effectiveness).length > 0 && (
          <span>
            💡 Effectiveness based on your session history
          </span>
        )}
      </div>
    </div>
  );
}
