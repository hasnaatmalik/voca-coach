'use client';

import { useState } from 'react';
import { formatDate, formatTime, formatDuration, BIOMARKER_METRICS } from '@/lib/biomarker-utils';
import TrendIndicator from './TrendIndicator';

interface BiomarkerSession {
  id: string;
  date: string;
  pitch: number;
  clarity: number;
  stress: number;
  pauseDuration?: number | null;
  articulationRate?: number | null;
  jitter?: number | null;
  shimmer?: number | null;
  speechRate?: number | null;
  hnr?: number | null;
  duration?: number | null;
  prompt?: string | null;
  notes?: string | null;
  overallScore?: number | null;
  observations?: string | null;
  recommendations?: string | null;
}

interface SessionListProps {
  sessions: BiomarkerSession[];
  onSessionClick?: (session: BiomarkerSession) => void;
  onDeleteSession?: (sessionId: string) => void;
  loading?: boolean;
}

export default function SessionList({
  sessions,
  onSessionClick,
  onDeleteSession,
  loading = false,
}: SessionListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getPromptLabel = (promptId?: string | null) => {
    const prompts: Record<string, string> = {
      rainbow: 'Rainbow Passage',
      grandfather: 'Grandfather Passage',
      north_wind: 'North Wind',
      caterpillar: 'Caterpillar',
      free_speech: 'Free Speech',
    };
    return prompts[promptId || ''] || 'Voice Recording';
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)',
          border: '1px solid rgba(124, 58, 237, 0.1)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid #E5E7EB',
            borderTopColor: '#7C3AED',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p style={{ color: '#6B7280', margin: 0 }}>Loading sessions...</p>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)',
          border: '1px solid rgba(124, 58, 237, 0.1)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>Recording</div>
        <p style={{ color: '#6B7280', margin: 0, fontSize: '16px' }}>
          No voice recordings yet
        </p>
        <p style={{ color: '#9CA3AF', margin: '8px 0 0 0', fontSize: '14px' }}>
          Record your first voice sample to start tracking biomarkers
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)',
        border: '1px solid rgba(124, 58, 237, 0.1)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1F2937' }}>
          Recording History
        </h3>
        <span style={{ fontSize: '13px', color: '#6B7280' }}>
          {sessions.length} session{sessions.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {sessions.map((session, index) => {
          const isExpanded = expandedId === session.id;
          const score = session.overallScore ?? Math.round((session.clarity * 0.6 + (100 - session.stress) * 0.4));
          const prevSession = index < sessions.length - 1 ? sessions[index + 1] : null;
          const scoreDiff = prevSession
            ? score - (prevSession.overallScore ?? Math.round((prevSession.clarity * 0.6 + (100 - prevSession.stress) * 0.4)))
            : 0;

          return (
            <div key={session.id}>
              {/* Session row */}
              <div
                onClick={() => toggleExpand(session.id)}
                style={{
                  padding: '16px 20px',
                  borderBottom: isExpanded ? 'none' : '1px solid #F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  cursor: 'pointer',
                  background: isExpanded ? '#F9FAFB' : 'white',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => {
                  if (!isExpanded) (e.currentTarget as HTMLElement).style.background = '#FAFAFA';
                }}
                onMouseLeave={e => {
                  if (!isExpanded) (e.currentTarget as HTMLElement).style.background = 'white';
                }}
              >
                {/* Score indicator */}
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: `conic-gradient(${getScoreColor(score)} ${score * 3.6}deg, #E5E7EB 0deg)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: getScoreColor(score),
                    }}
                  >
                    {score}
                  </div>
                </div>

                {/* Session info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#1F2937' }}>
                      {formatDate(session.date)}
                    </span>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>
                      {formatTime(session.date)}
                    </span>
                    {scoreDiff !== 0 && (
                      <TrendIndicator
                        direction={scoreDiff > 0 ? 'up' : 'down'}
                        percentChange={Math.abs(scoreDiff)}
                        isPositive={scoreDiff > 0}
                        size="sm"
                        showLabel={false}
                      />
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>
                      {getPromptLabel(session.prompt)}
                    </span>
                    {session.duration && (
                      <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                        {formatDuration(session.duration)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick metrics */}
                <div style={{ display: 'flex', gap: '16px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#7C3AED' }}>
                      {session.pitch.toFixed(0)}
                    </div>
                    <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Hz</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#EC4899' }}>
                      {session.clarity.toFixed(0)}%
                    </div>
                    <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Clarity</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: session.stress > 50 ? '#F59E0B' : '#10B981' }}>
                      {session.stress.toFixed(0)}%
                    </div>
                    <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Stress</div>
                  </div>
                </div>

                {/* Expand arrow */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                  style={{
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div
                  style={{
                    padding: '16px 20px',
                    background: '#F9FAFB',
                    borderBottom: '1px solid #E5E7EB',
                  }}
                >
                  {/* All metrics grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                      gap: '12px',
                      marginBottom: '16px',
                    }}
                  >
                    {Object.entries(BIOMARKER_METRICS).map(([key, metric]) => {
                      const value = session[key as keyof BiomarkerSession] as number | undefined;
                      if (value === undefined || value === null) return null;

                      return (
                        <div
                          key={key}
                          style={{
                            background: 'white',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                          }}
                        >
                          <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>
                            {metric.label}
                          </div>
                          <div style={{ fontSize: '18px', fontWeight: 600, color: metric.color }}>
                            {typeof value === 'number' ? value.toFixed(1) : value}
                            <span style={{ fontSize: '12px', fontWeight: 400, color: '#9CA3AF', marginLeft: '4px' }}>
                              {metric.unit}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Observations */}
                  {session.observations && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                        Observations
                      </h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', lineHeight: 1.5 }}>
                        {typeof session.observations === 'string'
                          ? session.observations
                          : JSON.stringify(session.observations)}
                      </p>
                    </div>
                  )}

                  {/* Recommendations */}
                  {session.recommendations && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                        Recommendations
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#6B7280' }}>
                        {(Array.isArray(session.recommendations)
                          ? session.recommendations
                          : JSON.parse(session.recommendations)
                        ).map((rec: string, i: number) => (
                          <li key={i} style={{ marginBottom: '4px' }}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Notes */}
                  {session.notes && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                        Notes
                      </h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
                        {session.notes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onSessionClick?.(session);
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid #7C3AED',
                        background: 'white',
                        color: '#7C3AED',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      View Details
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this recording?')) {
                          onDeleteSession?.(session.id);
                        }
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        background: 'white',
                        color: '#EF4444',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
