'use client';

import React, { useRef, useEffect } from 'react';
import { TranscriptSegment } from '@/types/de-escalation';

interface TranscriptViewerProps {
  segments: TranscriptSegment[];
  isLive?: boolean;
  currentTimestamp?: number;
  onSegmentClick?: (segment: TranscriptSegment) => void;
  darkMode?: boolean;
  maxHeight?: string;
}

export default function TranscriptViewer({
  segments,
  isLive = false,
  currentTimestamp = 0,
  onSegmentClick,
  darkMode = false,
  maxHeight = '300px',
}: TranscriptViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom for live transcription
  useEffect(() => {
    if (isLive && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [segments, isLive]);

  const getEmotionColor = (emotion: string, intensity: number) => {
    const alpha = Math.max(0.3, intensity);
    const colors: Record<string, string> = {
      calm: `rgba(16, 185, 129, ${alpha})`,      // Green
      happy: `rgba(245, 158, 11, ${alpha})`,     // Amber
      neutral: `rgba(107, 114, 128, ${alpha})`,  // Gray
      anxious: `rgba(239, 68, 68, ${alpha})`,    // Red
      frustrated: `rgba(249, 115, 22, ${alpha})`, // Orange
      sad: `rgba(59, 130, 246, ${alpha})`,       // Blue
      angry: `rgba(220, 38, 38, ${alpha})`,      // Dark red
      fearful: `rgba(139, 92, 246, ${alpha})`,   // Purple
    };
    return colors[emotion.toLowerCase()] || `rgba(107, 114, 128, ${alpha})`;
  };

  const getEmotionBgColor = (emotion: string) => {
    const colors: Record<string, string> = {
      calm: 'rgba(16, 185, 129, 0.1)',
      happy: 'rgba(245, 158, 11, 0.1)',
      neutral: 'rgba(107, 114, 128, 0.1)',
      anxious: 'rgba(239, 68, 68, 0.1)',
      frustrated: 'rgba(249, 115, 22, 0.1)',
      sad: 'rgba(59, 130, 246, 0.1)',
      angry: 'rgba(220, 38, 38, 0.1)',
      fearful: 'rgba(139, 92, 246, 0.1)',
    };
    return colors[emotion.toLowerCase()] || 'rgba(107, 114, 128, 0.1)';
  };

  const getEmotionEmoji = (emotion: string) => {
    const emojis: Record<string, string> = {
      calm: '😌',
      happy: '😊',
      neutral: '😐',
      anxious: '😰',
      frustrated: '😤',
      sad: '😢',
      angry: '😠',
      fearful: '😨',
    };
    return emojis[emotion.toLowerCase()] || '💭';
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isSegmentCurrent = (segment: TranscriptSegment) => {
    return currentTimestamp >= segment.timestamp &&
           currentTimestamp < segment.timestamp + segment.duration;
  };

  const bgColor = darkMode ? '#1F2937' : 'white';
  const textColor = darkMode ? '#F9FAFB' : '#1F2937';
  const mutedColor = darkMode ? '#9CA3AF' : '#6B7280';
  const borderColor = darkMode ? '#374151' : '#E5E7EB';

  return (
    <div style={{
      background: bgColor,
      borderRadius: '16px',
      border: `1px solid ${borderColor}`,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: `1px solid ${borderColor}`,
        background: darkMode ? '#111827' : '#F9FAFB',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>📝</span>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: textColor,
            margin: 0,
          }}>
            Transcript
          </h3>
        </div>
        {isLive && (
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 8px',
            background: '#EF4444',
            borderRadius: '999px',
            fontSize: '10px',
            fontWeight: '600',
            color: 'white',
          }}>
            <span style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: 'white',
              animation: 'blink 1s infinite',
            }} />
            LIVE
          </span>
        )}
      </div>

      {/* Transcript Content */}
      <div
        ref={containerRef}
        style={{
          maxHeight,
          overflowY: 'auto',
          padding: '12px',
        }}
      >
        {segments.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {segments.map((segment) => (
              <div
                key={segment.id}
                onClick={() => onSegmentClick?.(segment)}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '10px 12px',
                  background: isSegmentCurrent(segment)
                    ? getEmotionBgColor(segment.emotion)
                    : 'transparent',
                  borderRadius: '10px',
                  cursor: onSegmentClick ? 'pointer' : 'default',
                  borderLeft: `3px solid ${getEmotionColor(segment.emotion, segment.intensity)}`,
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Timestamp */}
                <div style={{
                  minWidth: '50px',
                  fontSize: '11px',
                  color: mutedColor,
                  fontFamily: 'monospace',
                }}>
                  {formatTimestamp(segment.timestamp)}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '14px',
                    color: textColor,
                    lineHeight: '1.5',
                    margin: 0,
                  }}>
                    {segment.isTriggerWord ? (
                      <span style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        padding: '2px 4px',
                        borderRadius: '4px',
                      }}>
                        {segment.text}
                      </span>
                    ) : (
                      segment.text
                    )}
                  </p>

                  {/* Emotion tag */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '6px',
                  }}>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      background: getEmotionBgColor(segment.emotion),
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: '500',
                      color: getEmotionColor(segment.emotion, 1).replace(/[\d.]+\)$/, '1)'),
                    }}>
                      {getEmotionEmoji(segment.emotion)}
                      {segment.emotion}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      color: mutedColor,
                    }}>
                      {Math.round(segment.intensity * 100)}% intensity
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: mutedColor,
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}>📝</div>
            <div style={{ fontSize: '13px' }}>
              {isLive ? 'Waiting for speech...' : 'No transcript available'}
            </div>
          </div>
        )}
      </div>

      {/* Emotion Legend */}
      {segments.length > 0 && (
        <div style={{
          padding: '10px 16px',
          borderTop: `1px solid ${borderColor}`,
          background: darkMode ? '#111827' : '#F9FAFB',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '11px',
        }}>
          {['calm', 'neutral', 'anxious', 'frustrated'].map((emotion) => (
            <span
              key={emotion}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: mutedColor,
              }}
            >
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: getEmotionColor(emotion, 1).replace(/[\d.]+\)$/, '1)'),
              }} />
              {emotion}
            </span>
          ))}
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
