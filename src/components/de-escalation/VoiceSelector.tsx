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

  const bgColor = darkMode ? '#1F2937' : 'rgba(255, 255, 255, 0.95)';
  const textColor = darkMode ? '#F9FAFB' : '#2D2D2D';
  const mutedColor = darkMode ? '#9CA3AF' : '#6B6B6B';
  const borderColor = darkMode ? '#374151' : '#DCC5B2';
  const cardBg = darkMode ? '#111827' : '#F0E4D3';
  const accentColor = '#D9A299';
  const accentColorDark = '#C08B82';

  // SVG Icons
  const MicIcon = ({ size = 14, color = 'white' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );

  const PlayIcon = ({ size = 12, color = accentColorDark }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );

  const StopIcon = ({ size = 12, color = 'white' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );

  const LoadingIcon = ({ size = 12, color = accentColorDark }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );

  const SaveIcon = ({ size = 12, color = 'white' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17,21 17,13 7,13 7,21" />
      <polyline points="7,3 7,8 15,8" />
    </svg>
  );

  const getStyleLabel = (style: VoiceOption['style']) => {
    switch (style) {
      case 'calm': return 'Calm';
      case 'warm': return 'Warm';
      case 'professional': return 'Pro';
      default: return '';
    }
  };

  if (compact) {
    return (
      <div style={{
        background: bgColor,
        borderRadius: '16px',
        padding: '14px',
        border: `1px solid ${borderColor}`,
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MicIcon size={14} color={accentColor} />
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
            padding: '10px 14px',
            background: darkMode ? cardBg : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${borderColor}`,
            borderRadius: '10px',
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
      padding: '16px',
      border: `1px solid ${borderColor}`,
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: `linear-gradient(135deg, ${accentColor} 0%, #DCC5B2 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 2px 8px rgba(217, 162, 153, 0.3)`,
        }}>
          <MicIcon size={16} color="white" />
        </div>
        <h3 style={{
          fontSize: '14px',
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
        gap: '6px',
        marginBottom: '12px',
      }}>
        {VOICE_OPTIONS.map((voice) => (
          <div
            key={voice.id}
            onClick={() => onVoiceSelect(voice.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              background: selectedVoiceId === voice.id
                ? darkMode ? 'rgba(217, 162, 153, 0.2)' : 'rgba(217, 162, 153, 0.12)'
                : darkMode ? cardBg : 'rgba(255, 255, 255, 0.9)',
              borderRadius: '10px',
              cursor: 'pointer',
              border: selectedVoiceId === voice.id
                ? `2px solid ${accentColor}`
                : `1px solid ${borderColor}`,
              transition: 'all 0.2s ease',
              boxShadow: selectedVoiceId === voice.id
                ? '0 2px 8px rgba(217, 162, 153, 0.2)'
                : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Selection indicator */}
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: `2px solid ${selectedVoiceId === voice.id ? accentColor : borderColor}`,
                background: selectedVoiceId === voice.id ? accentColor : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s ease',
              }}>
                {selectedVoiceId === voice.id && (
                  <span style={{ color: 'white', fontSize: '10px' }}>✓</span>
                )}
              </div>

              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: textColor,
                  }}>
                    {voice.name}
                  </span>
                  <span style={{
                    fontSize: '9px',
                    fontWeight: '500',
                    color: accentColorDark,
                    background: 'rgba(217, 162, 153, 0.15)',
                    padding: '2px 5px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                  }}>
                    {getStyleLabel(voice.style)}
                  </span>
                </div>
                <div style={{
                  fontSize: '11px',
                  color: mutedColor,
                  lineHeight: 1.2,
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
                padding: '6px',
                background: isPreviewPlaying === voice.id
                  ? accentColorDark
                  : darkMode ? '#374151' : 'rgba(240, 228, 211, 0.8)',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading === voice.id ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isLoading === voice.id ? 0.7 : 1,
                transition: 'all 0.2s ease',
                flexShrink: 0,
                width: '28px',
                height: '28px',
              }}
            >
              {isLoading === voice.id ? (
                <LoadingIcon size={14} color={accentColorDark} />
              ) : isPreviewPlaying === voice.id ? (
                <StopIcon size={12} color="white" />
              ) : (
                <PlayIcon size={12} color={accentColorDark} />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Speech Rate Control */}
      <div style={{
        padding: '12px',
        background: darkMode ? cardBg : 'rgba(255, 255, 255, 0.9)',
        borderRadius: '10px',
        marginBottom: '12px',
        border: `1px solid ${borderColor}`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: textColor }}>
            Speech Rate
          </span>
          <span style={{
            fontSize: '11px',
            fontWeight: '600',
            color: accentColorDark,
            padding: '2px 6px',
            background: 'rgba(217, 162, 153, 0.15)',
            borderRadius: '4px',
          }}>
            {localSpeechRate.toFixed(1)}x
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '10px', color: mutedColor }}>Slow</span>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={localSpeechRate}
            onChange={(e) => handleSpeechRateChange(parseFloat(e.target.value))}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              cursor: 'pointer',
              accentColor: accentColor,
            }}
          />
          <span style={{ fontSize: '10px', color: mutedColor }}>Fast</span>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '6px',
          marginTop: '8px',
        }}>
          {[0.75, 1.0, 1.25].map((rate) => (
            <button
              key={rate}
              onClick={() => handleSpeechRateChange(rate)}
              style={{
                padding: '4px 10px',
                background: localSpeechRate === rate
                  ? accentColor
                  : 'transparent',
                color: localSpeechRate === rate ? 'white' : mutedColor,
                border: `1px solid ${localSpeechRate === rate ? accentColor : borderColor}`,
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
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
            padding: '10px',
            background: selectedVoiceId
              ? `linear-gradient(135deg, ${accentColor} 0%, #DCC5B2 100%)`
              : darkMode ? '#374151' : '#E5DDD3',
            color: selectedVoiceId ? 'white' : mutedColor,
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '12px',
            cursor: selectedVoiceId ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: selectedVoiceId ? '0 2px 8px rgba(217, 162, 153, 0.35)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <SaveIcon size={14} color={selectedVoiceId ? 'white' : mutedColor} />
          Save Preference
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
