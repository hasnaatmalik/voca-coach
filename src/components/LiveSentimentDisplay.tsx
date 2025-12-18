'use client';

import React from 'react';

interface LiveSentimentDisplayProps {
  sentiment: string; // "positive", "neutral", "negative", "anxious", "calm", "frustrated"
  intensity: number; // 0-1
  aiInsight?: string;
}

const LiveSentimentDisplay: React.FC<LiveSentimentDisplayProps> = ({
  sentiment,
  intensity,
  aiInsight
}) => {
  const getSentimentConfig = () => {
    switch (sentiment) {
      case 'calm':
        return { emoji: '😌', label: 'Calm', color: '#06B6D4', bg: '#ECFEFF' };
      case 'positive':
        return { emoji: '😊', label: 'Happy', color: '#10B981', bg: '#ECFDF5' };
      case 'anxious':
        return { emoji: '😰', label: 'Anxious', color: '#F59E0B', bg: '#FEF3C7' };
      case 'frustrated':
        return { emoji: '😤', label: 'Frustrated', color: '#EF4444', bg: '#FEE2E2' };
      case 'negative':
        return { emoji: '😔', label: 'Sad', color: '#3B82F6', bg: '#DBEAFE' };
      case 'neutral':
      default:
        return { emoji: '😐', label: 'Neutral', color: '#6B7280', bg: '#F3F4F6' };
    }
  };

  const config = getSentimentConfig();
  const intensityPercent = Math.round(intensity * 100);

  return (
    <div style={{
      background: config.bg,
      borderRadius: '16px',
      padding: '20px',
      border: `2px solid ${config.color}30`,
      transition: 'all 0.3s ease'
    }}>
      {/* Emotion Icon and Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{
          fontSize: '32px',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          {config.emoji}
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: config.color }}>
            {config.label}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>
            Current Mood
          </div>
        </div>
      </div>

      {/* Intensity Bar */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', color: '#6B7280' }}>Intensity</span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: config.color }}>
            {intensityPercent}%
          </span>
        </div>
        <div style={{
          height: '6px',
          background: '#E5E7EB',
          borderRadius: '999px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${intensityPercent}%`,
            background: config.color,
            borderRadius: '999px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* AI Insight */}
      {aiInsight && (
        <div style={{
          fontSize: '13px',
          color: '#4B5563',
          fontStyle: 'italic',
          lineHeight: '1.5'
        }}>
          💡 {aiInsight}
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};

export default LiveSentimentDisplay;
