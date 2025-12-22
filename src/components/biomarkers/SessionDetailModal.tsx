'use client';

import { useState } from 'react';
import { formatDate, formatTime, formatDuration, BIOMARKER_METRICS, normalizeMetricValue } from '@/lib/biomarker-utils';

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
  audioUrl?: string | null;
}

interface Baseline {
  pitch: number;
  clarity: number;
  stress: number;
  pauseDuration?: number | null;
  articulationRate?: number | null;
  jitter?: number | null;
  shimmer?: number | null;
  speechRate?: number | null;
  hnr?: number | null;
}

interface SessionDetailModalProps {
  session: BiomarkerSession;
  baseline?: Baseline;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onUpdateNotes?: (id: string, notes: string) => void;
  onPlayTTS?: (text: string) => void;
}

export default function SessionDetailModal({
  session,
  baseline,
  onClose,
  onDelete,
  onUpdateNotes,
  onPlayTTS,
}: SessionDetailModalProps) {
  const [notes, setNotes] = useState(session.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const score = session.overallScore ?? Math.round((session.clarity * 0.6 + (100 - session.stress) * 0.4));

  const getScoreColor = (s: number) => {
    if (s >= 80) return '#10B981';
    if (s >= 60) return '#F59E0B';
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

  const getComparisonToBaseline = (key: string, value: number) => {
    if (!baseline) return null;
    const baselineValue = baseline[key as keyof Baseline];
    if (baselineValue === undefined || baselineValue === null) return null;

    const diff = value - (baselineValue as number);
    const percentDiff = ((diff / (baselineValue as number)) * 100);

    if (Math.abs(percentDiff) < 5) return { label: 'At baseline', color: '#6B7280' };
    if (percentDiff > 0) return { label: `+${percentDiff.toFixed(0)}% vs baseline`, color: '#F59E0B' };
    return { label: `${percentDiff.toFixed(0)}% vs baseline`, color: '#10B981' };
  };

  const handleSaveNotes = () => {
    onUpdateNotes?.(session.id, notes);
    setIsEditingNotes(false);
  };

  const handlePlayObservations = () => {
    if (session.observations && onPlayTTS) {
      const text = typeof session.observations === 'string'
        ? session.observations
        : JSON.stringify(session.observations);
      onPlayTTS(text);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '20px',
          maxWidth: '600px',
          width: '95%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          {/* Score circle */}
          <div
            style={{
              width: '64px',
              height: '64px',
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
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '20px', fontWeight: 700, color: getScoreColor(score) }}>
                {score}
              </span>
              <span style={{ fontSize: '10px', color: '#6B7280' }}>Score</span>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1F2937' }}>
              {formatDate(session.date)}
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>
              {formatTime(session.date)} • {getPromptLabel(session.prompt)}
              {session.duration && ` • ${formatDuration(session.duration)}`}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: '#F3F4F6',
              color: '#6B7280',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            x
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Metrics Grid */}
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
            Voice Biomarkers
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            {Object.entries(BIOMARKER_METRICS).map(([key, metric]) => {
              const value = session[key as keyof BiomarkerSession] as number | undefined;
              if (value === undefined || value === null) return null;

              const comparison = getComparisonToBaseline(key, value);
              const normalizedScore = normalizeMetricValue(value, metric);

              return (
                <div
                  key={key}
                  style={{
                    background: '#F9FAFB',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: metric.color,
                      }}
                    />
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>
                      {metric.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 600, color: '#1F2937' }}>
                    {value.toFixed(1)}
                    <span style={{ fontSize: '14px', fontWeight: 400, color: '#9CA3AF', marginLeft: '4px' }}>
                      {metric.unit}
                    </span>
                  </div>
                  {/* Health score bar */}
                  <div style={{ marginTop: '8px' }}>
                    <div
                      style={{
                        height: '4px',
                        background: '#E5E7EB',
                        borderRadius: '2px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${normalizedScore}%`,
                          height: '100%',
                          background: metric.color,
                          borderRadius: '2px',
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                  </div>
                  {comparison && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: comparison.color }}>
                      {comparison.label}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Observations */}
          {session.observations && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                  AI Observations
                </h3>
                {onPlayTTS && (
                  <button
                    onClick={handlePlayObservations}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #E5E7EB',
                      background: 'white',
                      color: '#6B7280',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    Play Audio
                  </button>
                )}
              </div>
              <div
                style={{
                  padding: '16px',
                  background: 'linear-gradient(135deg, #F3E8FF 0%, #FCE7F3 100%)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#374151',
                  lineHeight: 1.6,
                }}
              >
                {typeof session.observations === 'string'
                  ? session.observations
                  : JSON.stringify(session.observations)}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {session.recommendations && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                Recommendations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(Array.isArray(session.recommendations)
                  ? session.recommendations
                  : JSON.parse(session.recommendations)
                ).map((rec: string, i: number) => (
                  <div
                    key={i}
                    style={{
                      padding: '12px 16px',
                      background: '#F0FDF4',
                      borderRadius: '8px',
                      border: '1px solid #BBF7D0',
                      fontSize: '13px',
                      color: '#166534',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                    }}
                  >
                    <span style={{ color: '#10B981', fontSize: '16px' }}>Check</span>
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                Personal Notes
              </h3>
              {!isEditingNotes && (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #E5E7EB',
                    background: 'white',
                    color: '#6B7280',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  {notes ? 'Edit' : 'Add Note'}
                </button>
              )}
            </div>
            {isEditingNotes ? (
              <div>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add notes about this session..."
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    fontSize: '14px',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    onClick={handleSaveNotes}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                      color: 'white',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setNotes(session.notes || '');
                      setIsEditingNotes(false);
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      background: 'white',
                      color: '#6B7280',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : notes ? (
              <p style={{ margin: 0, fontSize: '14px', color: '#6B7280', lineHeight: 1.5 }}>
                {notes}
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: '14px', color: '#9CA3AF', fontStyle: 'italic' }}>
                No notes added
              </p>
            )}
          </div>

          {/* Audio playback */}
          {session.audioUrl && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                Recording
              </h3>
              <audio
                src={session.audioUrl}
                controls
                style={{ width: '100%' }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          {onDelete && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this recording?')) {
                  onDelete(session.id);
                  onClose();
                }
              }}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid #FECACA',
                background: '#FEF2F2',
                color: '#EF4444',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Delete Recording
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
