'use client';

import React from 'react';
import EmotionScale from './EmotionScale';

interface Emotions {
  happy: number;
  sad: number;
  anxious: number;
  calm: number;
  neutral: number;
  frustrated: number;
}

interface EmotionBreakdownProps {
  emotions: Emotions;
  isLive?: boolean;
}

const EmotionBreakdown: React.FC<EmotionBreakdownProps> = ({ emotions, isLive = false }) => {
  const emotionList = [
    { key: 'happy', emoji: '😊', label: 'Happy', color: '#10B981' },
    { key: 'calm', emoji: '😌', label: 'Calm', color: '#06B6D4' },
    { key: 'neutral', emoji: '😐', label: 'Neutral', color: '#6B7280' },
    { key: 'anxious', emoji: '😰', label: 'Anxious', color: '#F59E0B' },
    { key: 'sad', emoji: '😔', label: 'Sad', color: '#3B82F6' },
    { key: 'frustrated', emoji: '😤', label: 'Frustrated', color: '#EF4444' }
  ];

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '24px',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937' }}>
          Emotion Breakdown
        </h3>
        {isLive && (
          <span style={{
            fontSize: '11px',
            fontWeight: '600',
            color: '#10B981',
            background: '#ECFDF5',
            padding: '4px 8px',
            borderRadius: '999px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#10B981',
              animation: 'blink 1.5s ease-in-out infinite'
            }}></span>
            LIVE
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {emotionList.map((emotion) => (
          <EmotionScale
            key={emotion.key}
            emoji={emotion.emoji}
            label={emotion.label}
            percentage={Math.round((emotions[emotion.key as keyof Emotions] || 0) * 100)}
            color={emotion.color}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
};

export default EmotionBreakdown;
