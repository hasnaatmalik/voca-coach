'use client';

import React from 'react';
import { VoiceBiomarkers } from '@/types/de-escalation';

// SVG Icon Components
const ChartIcon = ({ color = '#7AAFC9', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const WarningIcon = ({ color = '#EF4444', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const LightbulbIcon = ({ color = '#7C3AED', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

const CheckIcon = ({ color = '#10B981', size = 12 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface BiometricsPanelProps {
  biomarkers: VoiceBiomarkers | null;
  isLive: boolean;
  darkMode?: boolean;
}

export default function BiometricsPanel({
  biomarkers,
  isLive,
  darkMode = false,
}: BiometricsPanelProps) {
  const getStressColor = (score: number) => {
    if (score < 0.3) return '#10B981'; // Green
    if (score < 0.5) return '#F59E0B'; // Amber
    if (score < 0.7) return '#F97316'; // Orange
    return '#EF4444'; // Red
  };

  const getPitchColor = (level: string) => {
    switch (level) {
      case 'low': return '#06B6D4';
      case 'normal': return '#10B981';
      case 'elevated': return '#F59E0B';
      case 'high': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getPauseColor = (frequency: string) => {
    switch (frequency) {
      case 'healthy': return '#10B981';
      case 'normal': return '#F59E0B';
      case 'low': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getSpeakingRateStatus = (wpm: number) => {
    if (wpm < 100) return { label: 'Slow', color: '#06B6D4' };
    if (wpm < 150) return { label: 'Normal', color: '#10B981' };
    if (wpm < 180) return { label: 'Fast', color: '#F59E0B' };
    return { label: 'Rapid', color: '#EF4444' };
  };

  const bgColor = darkMode ? '#1F2937' : 'white';
  const textColor = darkMode ? '#F9FAFB' : '#1F2937';
  const mutedColor = darkMode ? '#9CA3AF' : '#6B7280';
  const borderColor = darkMode ? '#374151' : '#E5E7EB';

  return (
    <div style={{
      background: bgColor,
      borderRadius: '20px',
      padding: '24px',
      border: `1px solid ${borderColor}`,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChartIcon color="#7AAFC9" size={20} />
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: textColor, margin: 0 }}>
            Voice Biomarkers
          </h3>
        </div>
        {isLive && (
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            background: '#10B981',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: '600',
            color: 'white',
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'white',
              animation: 'blink 1s infinite',
            }} />
            LIVE
          </span>
        )}
      </div>

      {biomarkers ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Overall Stress Score - Prominent Display */}
          <div style={{
            textAlign: 'center',
            padding: '16px',
            background: darkMode ? '#111827' : '#F9FAFB',
            borderRadius: '12px',
          }}>
            <div style={{ fontSize: '13px', color: mutedColor, marginBottom: '8px' }}>
              Overall Stress Level
            </div>
            <div style={{
              fontSize: '36px',
              fontWeight: '700',
              color: getStressColor(biomarkers.overallStressScore),
            }}>
              {Math.round(biomarkers.overallStressScore * 100)}%
            </div>
            <div style={{
              height: '8px',
              background: darkMode ? '#374151' : '#E5E7EB',
              borderRadius: '999px',
              marginTop: '12px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${biomarkers.overallStressScore * 100}%`,
                background: `linear-gradient(90deg, #10B981 0%, ${getStressColor(biomarkers.overallStressScore)} 100%)`,
                borderRadius: '999px',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>

          {/* Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
          }}>
            {/* Speaking Rate */}
            <div style={{
              padding: '12px',
              background: darkMode ? '#111827' : '#F9FAFB',
              borderRadius: '10px',
            }}>
              <div style={{ fontSize: '11px', color: mutedColor, marginBottom: '4px' }}>
                Speaking Rate
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: getSpeakingRateStatus(biomarkers.speakingRate).color,
                }}>
                  {biomarkers.speakingRate}
                </span>
                <span style={{ fontSize: '12px', color: mutedColor }}>WPM</span>
              </div>
              <div style={{
                fontSize: '11px',
                color: getSpeakingRateStatus(biomarkers.speakingRate).color,
                fontWeight: '500',
                marginTop: '2px',
              }}>
                {getSpeakingRateStatus(biomarkers.speakingRate).label}
              </div>
            </div>

            {/* Pitch Level */}
            <div style={{
              padding: '12px',
              background: darkMode ? '#111827' : '#F9FAFB',
              borderRadius: '10px',
            }}>
              <div style={{ fontSize: '11px', color: mutedColor, marginBottom: '4px' }}>
                Pitch Level
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: getPitchColor(biomarkers.pitchLevel),
                textTransform: 'capitalize',
              }}>
                {biomarkers.pitchLevel}
              </div>
              <div style={{
                display: 'flex',
                gap: '3px',
                marginTop: '6px',
              }}>
                {['low', 'normal', 'elevated', 'high'].map((level) => (
                  <div
                    key={level}
                    style={{
                      flex: 1,
                      height: '4px',
                      borderRadius: '2px',
                      background: biomarkers.pitchLevel === level
                        ? getPitchColor(level)
                        : darkMode ? '#374151' : '#E5E7EB',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Volume Intensity */}
            <div style={{
              padding: '12px',
              background: darkMode ? '#111827' : '#F9FAFB',
              borderRadius: '10px',
            }}>
              <div style={{ fontSize: '11px', color: mutedColor, marginBottom: '4px' }}>
                Volume Intensity
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: biomarkers.volumeIntensity > 0.7 ? '#EF4444' : textColor,
              }}>
                {Math.round(biomarkers.volumeIntensity * 100)}%
              </div>
              <div style={{
                height: '4px',
                background: darkMode ? '#374151' : '#E5E7EB',
                borderRadius: '2px',
                marginTop: '6px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${biomarkers.volumeIntensity * 100}%`,
                  background: biomarkers.volumeIntensity > 0.7 ? '#EF4444' : '#7C3AED',
                  borderRadius: '2px',
                }} />
              </div>
            </div>

            {/* Pause Frequency */}
            <div style={{
              padding: '12px',
              background: darkMode ? '#111827' : '#F9FAFB',
              borderRadius: '10px',
            }}>
              <div style={{ fontSize: '11px', color: mutedColor, marginBottom: '4px' }}>
                Pause Pattern
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: getPauseColor(biomarkers.pauseFrequency),
                textTransform: 'capitalize',
              }}>
                {biomarkers.pauseFrequency}
              </div>
              <div style={{
                fontSize: '11px',
                color: mutedColor,
                marginTop: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                {biomarkers.pauseFrequency === 'healthy' && (
                  <>
                    <CheckIcon color="#10B981" size={12} />
                    <span>Good breathing</span>
                  </>
                )}
                {biomarkers.pauseFrequency === 'normal' && <span>– Moderate</span>}
                {biomarkers.pauseFrequency === 'low' && (
                  <>
                    <WarningIcon color="#EF4444" size={12} />
                    <span>Rushed speech</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tremor Detection */}
          {biomarkers.tremorDetected && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '10px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}>
              <WarningIcon color="#EF4444" size={16} />
              <span style={{ fontSize: '13px', color: '#EF4444', fontWeight: '500' }}>
                Voice tremor detected - signs of anxiety
              </span>
            </div>
          )}

          {/* Recommendations */}
          {biomarkers.recommendations && biomarkers.recommendations.length > 0 && (
            <div style={{
              padding: '14px',
              background: darkMode ? 'rgba(124, 58, 237, 0.1)' : 'rgba(124, 58, 237, 0.05)',
              borderRadius: '10px',
              border: `1px solid ${darkMode ? 'rgba(124, 58, 237, 0.3)' : 'rgba(124, 58, 237, 0.2)'}`,
            }}>
              <div style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#7C3AED',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <LightbulbIcon color="#7C3AED" size={16} />
                <span>Recommendations</span>
              </div>
              <ul style={{
                margin: 0,
                paddingLeft: '16px',
                fontSize: '13px',
                color: darkMode ? '#D1D5DB' : '#4B5563',
                lineHeight: '1.5',
              }}>
                {biomarkers.recommendations.map((rec, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div style={{
          textAlign: 'center',
          padding: '32px 16px',
          color: mutedColor,
        }}>
          <div style={{ marginBottom: '12px', opacity: 0.5, display: 'flex', justifyContent: 'center' }}>
            <ChartIcon color="#9CA3AF" size={32} />
          </div>
          <div style={{ fontSize: '14px' }}>
            Start a session to see your voice biomarkers
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
