'use client';

import { useState, ReactNode } from 'react';
import VoiceSelector from './VoiceSelector';
import IconPicker from './IconPicker';
import VoiceSettings from './VoiceSettings';

// Theme colors from globals.css - wellness theme
const THEME = {
  cream: '#FAF7F3',
  beige: '#F0E4D3',
  tan: '#DCC5B2',
  rose: '#D9A299',
  roseDark: '#C8847A',
  text: '#2D2D2D',
  textMuted: '#6B6B6B',
  success: '#7AB89E',
};

// SVG Icon Components for headers
const SparklesIcon = ({ color = THEME.rose, size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const PencilIcon = ({ color = THEME.rose, size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

interface PersonaData {
  id?: string;
  name: string;
  description: string;
  icon: string | ReactNode;
  voiceId?: string;
  voiceStability?: number;
  voiceSimilarity?: number;
  voiceStyle?: number;
  voiceSpeakerBoost?: boolean;
  speechRate?: number;
}

interface PersonaCreatorProps {
  editingPersona?: PersonaData;
  onSave: (persona: PersonaData) => Promise<void>;
  onCancel: () => void;
}

export default function PersonaCreator({ editingPersona, onSave, onCancel }: PersonaCreatorProps) {
  const [name, setName] = useState(editingPersona?.name || '');
  const [description, setDescription] = useState(editingPersona?.description || '');
  // IconPicker works with icon IDs; default to 'sparkles' if icon is not a valid icon ID
  const [icon, setIcon] = useState<string>(typeof editingPersona?.icon === 'string' ? editingPersona.icon : 'sparkles');
  const [voiceId, setVoiceId] = useState(editingPersona?.voiceId || '');
  const [voiceSettings, setVoiceSettings] = useState({
    voiceStability: editingPersona?.voiceStability ?? 0.5,
    voiceSimilarity: editingPersona?.voiceSimilarity ?? 0.8,
    voiceStyle: editingPersona?.voiceStyle ?? 0,
    voiceSpeakerBoost: editingPersona?.voiceSpeakerBoost ?? true,
    speechRate: editingPersona?.speechRate ?? 1.0,
  });
  const [activeTab, setActiveTab] = useState<'basic' | 'voice'>('basic');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !description.trim()) return;

    setSaving(true);
    try {
      await onSave({
        id: editingPersona?.id,
        name: name.trim(),
        description: description.trim(),
        icon,
        voiceId: voiceId || undefined,
        ...voiceSettings,
      });
    } finally {
      setSaving(false);
    }
  };

  const isValid = name.trim() && description.trim();

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h3 style={{
        fontSize: '20px',
        fontWeight: '600',
        color: THEME.text,
        marginBottom: '24px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        {editingPersona ? (
          <>
            <PencilIcon color={THEME.rose} size={22} />
            Edit Persona
          </>
        ) : (
          <>
            <SparklesIcon color={THEME.rose} size={22} />
            Create Custom Persona
          </>
        )}
      </h3>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        background: THEME.beige,
        padding: '4px',
        borderRadius: '12px',
        border: `1px solid ${THEME.tan}`
      }}>
        <button
          onClick={() => setActiveTab('basic')}
          style={{
            flex: 1,
            padding: '10px',
            background: activeTab === 'basic' ? THEME.cream : 'transparent',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '500',
            color: activeTab === 'basic' ? THEME.text : THEME.textMuted,
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: activeTab === 'basic' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
          }}
        >
          Basic Info
        </button>
        <button
          onClick={() => setActiveTab('voice')}
          style={{
            flex: 1,
            padding: '10px',
            background: activeTab === 'voice' ? THEME.cream : 'transparent',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '500',
            color: activeTab === 'voice' ? THEME.text : THEME.textMuted,
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: activeTab === 'voice' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
          }}
        >
          Voice Settings
        </button>
      </div>

      {activeTab === 'basic' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Icon Picker */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: THEME.text,
              marginBottom: '8px'
            }}>
              Persona Icon
            </label>
            <IconPicker selectedIcon={icon} onSelect={setIcon} />
          </div>

          {/* Name Input */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: THEME.text,
              marginBottom: '8px'
            }}>
              Persona Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Confident Speaker, Interview Coach..."
              maxLength={50}
              style={{
                width: '100%',
                padding: '14px 18px',
                border: `1px solid ${THEME.tan}`,
                borderRadius: '12px',
                fontSize: '15px',
                outline: 'none',
                background: THEME.cream,
                color: THEME.text,
              }}
            />
            <div style={{
              fontSize: '12px',
              color: THEME.textMuted,
              marginTop: '4px',
              textAlign: 'right'
            }}>
              {name.length}/50
            </div>
          </div>

          {/* Description Input */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: THEME.text,
              marginBottom: '8px'
            }}>
              Personality Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe how this persona should behave, speak, and interact. Be specific about their personality, tone, and any special characteristics..."
              rows={5}
              maxLength={500}
              style={{
                width: '100%',
                padding: '14px 18px',
                border: `1px solid ${THEME.tan}`,
                borderRadius: '12px',
                fontSize: '15px',
                outline: 'none',
                resize: 'none',
                lineHeight: '1.5',
                background: THEME.cream,
                color: THEME.text,
              }}
            />
            <div style={{
              fontSize: '12px',
              color: THEME.textMuted,
              marginTop: '4px',
              textAlign: 'right'
            }}>
              {description.length}/500
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Voice Selector */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: THEME.text,
              marginBottom: '8px'
            }}>
              Select Voice
            </label>
            <VoiceSelector
              selectedVoiceId={voiceId}
              onSelect={setVoiceId}
            />
          </div>

          {/* Voice Settings */}
          <div style={{ marginTop: '8px' }}>
            <VoiceSettings
              settings={voiceSettings}
              onChange={setVoiceSettings}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        marginTop: '32px'
      }}>
        <button
          onClick={onCancel}
          disabled={saving}
          style={{
            padding: '14px 28px',
            background: THEME.beige,
            color: THEME.textMuted,
            border: `1px solid ${THEME.tan}`,
            borderRadius: '12px',
            fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            transition: 'all 0.2s',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!isValid || saving}
          style={{
            padding: '14px 28px',
            background: isValid && !saving
              ? `linear-gradient(135deg, ${THEME.rose} 0%, ${THEME.roseDark} 100%)`
              : THEME.beige,
            color: isValid && !saving ? 'white' : THEME.textMuted,
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: isValid && !saving ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: isValid && !saving ? `0 4px 12px ${THEME.rose}40` : 'none',
            transition: 'all 0.2s',
          }}
        >
          {saving && (
            <span style={{
              display: 'inline-block',
              width: '16px',
              height: '16px',
              border: '2px solid white',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          )}
          {editingPersona ? 'Save Changes' : 'Create Persona'}
        </button>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input:focus, textarea:focus {
          border-color: ${THEME.rose} !important;
          box-shadow: 0 0 0 3px ${THEME.rose}15;
        }
        input::placeholder, textarea::placeholder {
          color: ${THEME.textMuted};
        }
      `}</style>
    </div>
  );
}
