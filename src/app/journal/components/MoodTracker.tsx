'use client';

import { useState } from 'react';
import { MOOD_EMOJIS } from '../types';

// SVG Icon Component
const SparklesIcon = ({ color = '#10B981', size = 48 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

interface MoodTrackerProps {
  onSave?: () => void;
  compact?: boolean;
}

export default function MoodTracker({ onSave, compact = false }: MoodTrackerProps) {
  const [mood, setMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    if (mood === null) return;

    setIsSaving(true);
    try {
      await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: note || `Mood check-in: ${mood}/10`,
          mood,
          title: 'Quick Mood Check',
        }),
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setMood(null);
        setNote('');
      }, 2000);

      onSave?.();
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const getMoodColor = (m: number) => {
    if (m <= 3) return '#EF4444';
    if (m <= 5) return '#F59E0B';
    if (m <= 7) return '#3B82F6';
    return '#10B981';
  };

  if (showSuccess) {
    return (
      <div style={{
        background: 'white',
        borderRadius: compact ? '12px' : '20px',
        padding: compact ? '16px' : '32px',
        boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)',
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: '12px' }}><SparklesIcon color="#10B981" size={48} /></div>
        <div style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#10B981',
        }}>
          Mood Logged!
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: compact ? '12px' : '20px',
      padding: compact ? '16px' : '24px',
      boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)',
    }}>
      {!compact && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1F2937',
            margin: '0 0 4px',
          }}>
            Quick Mood Check
          </h3>
          <p style={{
            fontSize: '13px',
            color: '#6B7280',
            margin: 0,
          }}>
            How are you feeling right now?
          </p>
        </div>
      )}

      {/* Mood Selection */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: compact ? '6px' : '8px',
        flexWrap: 'wrap',
        marginBottom: '16px',
      }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((m) => (
          <button
            key={m}
            onClick={() => setMood(m)}
            style={{
              width: compact ? '36px' : '44px',
              height: compact ? '36px' : '44px',
              border: mood === m
                ? `2px solid ${getMoodColor(m)}`
                : '1px solid #E5E7EB',
              borderRadius: '12px',
              background: mood === m ? `${getMoodColor(m)}15` : 'white',
              cursor: 'pointer',
              fontSize: compact ? '18px' : '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              transform: mood === m ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            {MOOD_EMOJIS[m]}
          </button>
        ))}
      </div>

      {/* Selected Mood Display */}
      {mood !== null && (
        <div style={{
          textAlign: 'center',
          marginBottom: '16px',
        }}>
          <span style={{
            fontSize: '14px',
            color: getMoodColor(mood),
            fontWeight: '600',
          }}>
            {mood <= 3 ? 'Struggling' :
             mood <= 5 ? 'Managing' :
             mood <= 7 ? 'Good' :
             'Great'} ({mood}/10)
          </span>
        </div>
      )}

      {/* Optional Note */}
      {!compact && mood !== null && (
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a quick note (optional)..."
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            fontSize: '14px',
            outline: 'none',
            marginBottom: '16px',
          }}
        />
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={mood === null || isSaving}
        style={{
          width: '100%',
          padding: compact ? '10px' : '14px',
          background: mood !== null && !isSaving
            ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)'
            : '#E5E7EB',
          border: 'none',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600',
          color: 'white',
          cursor: mood !== null && !isSaving ? 'pointer' : 'not-allowed',
        }}
      >
        {isSaving ? 'Saving...' : 'Log Mood'}
      </button>
    </div>
  );
}
