'use client';

import React from 'react';

interface SentimentSnapshot {
  timestamp: number;
  sentiment: string;
  intensity: number;
  aiInsight?: string;
}

interface MoodTimelineProps {
  snapshots: SentimentSnapshot[];
  duration: number; // total session duration in seconds
}

const MoodTimeline: React.FC<MoodTimelineProps> = ({ snapshots, duration }) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'calm': return '#06B6D4';
      case 'positive': return '#10B981';
      case 'anxious': return '#F59E0B';
      case 'frustrated': return '#EF4444';
      case 'negative': return '#3B82F6';
      case 'neutral':
      default: return '#6B7280';
    }
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'calm': return '😌';
      case 'positive': return '😊';
      case 'anxious': return '😰';
      case 'frustrated': return '😤';
      case 'negative': return '😔';
      case 'neutral':
      default: return '😐';
    }
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (snapshots.length === 0) {
    return null;
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '24px',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937', marginBottom: '16px' }}>
        Mood Timeline
      </h3>

      {/* Timeline */}
      <div style={{ position: 'relative', paddingBottom: '20px' }}>
        {/* Base line */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '0',
          right: '0',
          height: '4px',
          background: '#E5E7EB',
          borderRadius: '999px'
        }} />

        {/* Colored segments */}
        {snapshots.map((snapshot, index) => {
          if (index === snapshots.length - 1) return null;
          
          const startPercent = (snapshot.timestamp / duration) * 100;
          const endPercent = (snapshots[index + 1].timestamp / duration) * 100;
          const width = endPercent - startPercent;

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: '20px',
                left: `${startPercent}%`,
                width: `${width}%`,
                height: '4px',
                background: getSentimentColor(snapshot.sentiment),
                transition: 'all 0.3s ease'
              }}
            />
          );
        })}

        {/* Mood points */}
        {snapshots.map((snapshot, index) => {
          const positionPercent = (snapshot.timestamp / duration) * 100;

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: '0',
                left: `${positionPercent}%`,
                transform: 'translateX(-50%)',
                cursor: 'pointer'
              }}
              title={snapshot.aiInsight || snapshot.sentiment}
            >
              {/* Emoji bubble */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'white',
                border: `2px solid ${getSentimentColor(snapshot.sentiment)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {getSentimentEmoji(snapshot.sentiment)}
              </div>

              {/* Timestamp */}
              <div style={{
                fontSize: '11px',
                color: '#6B7280',
                textAlign: 'center',
                marginTop: '4px',
                fontWeight: '600'
              }}>
                {formatTimestamp(snapshot.timestamp)}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Insights */}
      {snapshots.filter(s => s.aiInsight).length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937', marginBottom: '12px' }}>
            Key Moments
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {snapshots.filter(s => s.aiInsight).map((snapshot, index) => (
              <div
                key={index}
                style={{
                  padding: '12px',
                  background: `${getSentimentColor(snapshot.sentiment)}10`,
                  borderLeft: `3px solid ${getSentimentColor(snapshot.sentiment)}`,
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#4B5563'
                }}
              >
                <span style={{ fontWeight: '600', color: getSentimentColor(snapshot.sentiment) }}>
                  {formatTimestamp(snapshot.timestamp)}
                </span>
                {' • '}
                {snapshot.aiInsight}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodTimeline;
