'use client';

import { useState } from 'react';
import VoiceSelector from './VoiceSelector';
import EmojiPicker from './EmojiPicker';
import VoiceSettings from './VoiceSettings';

interface PersonaData {
  id?: string;
  name: string;
  description: string;
  icon: string;
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
  const [icon, setIcon] = useState(editingPersona?.icon || '✨');
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
        color: '#1F2937',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        {editingPersona ? '✏️ Edit Persona' : '✨ Create Custom Persona'}
      </h3>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        background: '#F3F4F6',
        padding: '4px',
        borderRadius: '10px'
      }}>
        <button
          onClick={() => setActiveTab('basic')}
          style={{
            flex: 1,
            padding: '10px',
            background: activeTab === 'basic' ? 'white' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '500',
            color: activeTab === 'basic' ? '#1F2937' : '#6B7280',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: activeTab === 'basic' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          Basic Info
        </button>
        <button
          onClick={() => setActiveTab('voice')}
          style={{
            flex: 1,
            padding: '10px',
            background: activeTab === 'voice' ? 'white' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '500',
            color: activeTab === 'voice' ? '#1F2937' : '#6B7280',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: activeTab === 'voice' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
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
              color: '#4B5563',
              marginBottom: '8px'
            }}>
              Persona Icon
            </label>
            <EmojiPicker selectedEmoji={icon} onSelect={setIcon} />
          </div>

          {/* Name Input */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#4B5563',
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
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                fontSize: '15px',
                outline: 'none'
              }}
            />
            <div style={{
              fontSize: '12px',
              color: '#9CA3AF',
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
              color: '#4B5563',
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
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                fontSize: '15px',
                outline: 'none',
                resize: 'none',
                lineHeight: '1.5'
              }}
            />
            <div style={{
              fontSize: '12px',
              color: '#9CA3AF',
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
              color: '#4B5563',
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
            background: '#F3F4F6',
            color: '#4B5563',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1
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
              ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)'
              : '#E5E7EB',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: isValid && !saving ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
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
      `}</style>
    </div>
  );
}
