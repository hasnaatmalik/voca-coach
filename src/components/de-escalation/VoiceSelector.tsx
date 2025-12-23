'use client';

import React, { useState, useRef, useCallback } from 'react';
import { VoiceOption, VOICE_OPTIONS } from '@/types/de-escalation';

interface VoiceSelectorProps {
  selectedVoiceId: string | null;
  onVoiceSelect: (voiceId: string) => void;
  onSave?: (voiceId: string, speechRate: number) => void;
  speechRate?: number;
  onSpeechRateChange?: (rate: number) => void;
  darkMode?: boolean;
  compact?: boolean;
}

export default function VoiceSelector({
  selectedVoiceId,
  onVoiceSelect,
  onSave,
  speechRate = 1.0,
  onSpeechRateChange,
  darkMode = false,
  compact = false,
}: VoiceSelectorProps) {
  const [isPreviewPlaying, setIsPreviewPlaying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [localSpeechRate, setLocalSpeechRate] = useState(speechRate);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const previewText = "Take a deep breath. You're doing great. Let's work through this together.";

  const previewVoice = useCallback(async (voiceId: string) => {
    // Stop any existing preview
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (isPreviewPlaying === voiceId) {
      setIsPreviewPlaying(null);
      return;
    }

    setIsLoading(voiceId);

    try {
      const response = await fetch('/api/de-escalation/breathing-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: previewText,
          voiceId,
          speechRate: localSpeechRate,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate preview');

      const data = await response.json();
      if (data.audio) {
        const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
        audioRef.current = audio;

        audio.onended = () => {
          setIsPreviewPlaying(null);
        };

        audio.onplay = () => {
          setIsPreviewPlaying(voiceId);
          setIsLoading(null);
        };

        await audio.play();
      }
    } catch (error) {
      console.error('Error previewing voice:', error);
      setIsLoading(null);
    }
  }, [isPreviewPlaying, localSpeechRate]);

  const handleSpeechRateChange = (rate: number) => {
    setLocalSpeechRate(rate);
    onSpeechRateChange?.(rate);
  };

  const handleSave = () => {
    if (selectedVoiceId && onSave) {
      onSave(selectedVoiceId, localSpeechRate);
    }
  };

  const bgColor = darkMode ? '#1F2937' : 'white';
  const textColor = darkMode ? '#F9FAFB' : '#1F2937';
  const mutedColor = darkMode ? '#9CA3AF' : '#6B7280';
  const borderColor = darkMode ? '#374151' : '#E5E7EB';
  const cardBg = darkMode ? '#111827' : '#F9FAFB';

  const getStyleIcon = (style: VoiceOption['style']) => {
    switch (style) {
      case 'calm': return '😌';
      case 'warm': return '🤗';
      case 'professional': return '👔';
      default: return '🎙️';
    }
  };

  const getGenderIcon = (gender: VoiceOption['gender']) => {
    switch (gender) {
      case 'female': return '♀️';
      case 'male': return '♂️';
      default: return '⚪';
    }
  };

  if (compact) {
    return (
      <div style={{
        background: bgColor,
        borderRadius: '12px',
        padding: '12px',
        border: `1px solid ${borderColor}`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🎙️</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: textColor }}>
              Voice
            </span>
          </div>
        </div>

        <select
          value={selectedVoiceId || ''}
          onChange={(e) => onVoiceSelect(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: cardBg,
            border: `1px solid ${borderColor}`,
            borderRadius: '8px',
            color: textColor,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          <option value="">Select a voice</option>
          {VOICE_OPTIONS.map((voice) => (
            <option key={voice.id} value={voice.id}>
              {voice.name} - {voice.style}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div style={{
      background: bgColor,
      borderRadius: '16px',
      padding: '20px',
      border: `1px solid ${borderColor}`,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
      }}>
        <span style={{ fontSize: '20px' }}>🎙️</span>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: textColor,
          margin: 0,
        }}>
          AI Coach Voice
        </h3>
      </div>

      {/* Voice Options */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '20px',
      }}>
        {VOICE_OPTIONS.map((voice) => (
          <div
            key={voice.id}
            onClick={() => onVoiceSelect(voice.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              background: selectedVoiceId === voice.id
                ? darkMode ? 'rgba(124, 58, 237, 0.2)' : 'rgba(124, 58, 237, 0.1)'
                : cardBg,
              borderRadius: '12px',
              cursor: 'pointer',
              border: selectedVoiceId === voice.id
                ? '2px solid #7C3AED'
                : `1px solid ${borderColor}`,
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Selection indicator */}
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: `2px solid ${selectedVoiceId === voice.id ? '#7C3AED' : borderColor}`,
                background: selectedVoiceId === voice.id ? '#7C3AED' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {selectedVoiceId === voice.id && (
                  <span style={{ color: 'white', fontSize: '12px' }}>✓</span>
                )}
              </div>

              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '4px',
                }}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: textColor,
                  }}>
                    {voice.name}
                  </span>
                  <span style={{ fontSize: '12px' }}>{getGenderIcon(voice.gender)}</span>
                  <span style={{ fontSize: '12px' }}>{getStyleIcon(voice.style)}</span>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: mutedColor,
                }}>
                  {voice.description}
                </div>
              </div>
            </div>

            {/* Preview button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                previewVoice(voice.id);
              }}
              disabled={isLoading === voice.id}
              style={{
                padding: '8px 14px',
                background: isPreviewPlaying === voice.id
                  ? '#EF4444'
                  : darkMode ? '#374151' : '#E5E7EB',
                color: isPreviewPlaying === voice.id ? 'white' : textColor,
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: isLoading === voice.id ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                opacity: isLoading === voice.id ? 0.7 : 1,
              }}
            >
              {isLoading === voice.id ? (
                <>
                  <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                  Loading
                </>
              ) : isPreviewPlaying === voice.id ? (
                <>
                  <span>⏹️</span>
                  Stop
                </>
              ) : (
                <>
                  <span>▶️</span>
                  Preview
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Speech Rate Control */}
      <div style={{
        padding: '16px',
        background: cardBg,
        borderRadius: '12px',
        marginBottom: '16px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}>
          <span style={{ fontSize: '13px', fontWeight: '500', color: textColor }}>
            Speech Rate
          </span>
          <span style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#7C3AED',
            padding: '2px 8px',
            background: 'rgba(124, 58, 237, 0.1)',
            borderRadius: '4px',
          }}>
            {localSpeechRate.toFixed(1)}x
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize: '11px', color: mutedColor }}>Slow</span>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={localSpeechRate}
            onChange={(e) => handleSpeechRateChange(parseFloat(e.target.value))}
            style={{
              flex: 1,
              height: '6px',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          />
          <span style={{ fontSize: '11px', color: mutedColor }}>Fast</span>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '12px',
        }}>
          {[0.75, 1.0, 1.25].map((rate) => (
            <button
              key={rate}
              onClick={() => handleSpeechRateChange(rate)}
              style={{
                padding: '4px 12px',
                background: localSpeechRate === rate
                  ? '#7C3AED'
                  : 'transparent',
                color: localSpeechRate === rate ? 'white' : mutedColor,
                border: `1px solid ${localSpeechRate === rate ? '#7C3AED' : borderColor}`,
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              {rate === 1.0 ? 'Normal' : `${rate}x`}
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      {onSave && (
        <button
          onClick={handleSave}
          disabled={!selectedVoiceId}
          style={{
            width: '100%',
            padding: '14px',
            background: selectedVoiceId
              ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)'
              : darkMode ? '#374151' : '#E5E7EB',
            color: selectedVoiceId ? 'white' : mutedColor,
            border: 'none',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: selectedVoiceId ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <span>💾</span>
          Save Voice Preference
        </button>
      )}

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
