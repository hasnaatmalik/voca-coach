'use client';

import { useState } from 'react';
import { JournalEntry as JournalEntryType, MOOD_EMOJIS } from '../types';

interface JournalEntryProps {
  entry: JournalEntryType;
  onEdit?: (entry: JournalEntryType) => void;
  onDelete?: (id: string) => void;
  expanded?: boolean;
}

export default function JournalEntryComponent({
  entry,
  onEdit,
  onDelete,
  expanded: initialExpanded = false,
}: JournalEntryProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const parsedTags = entry.tags ? JSON.parse(entry.tags) : [];
  const parsedDistortions = entry.distortions ? JSON.parse(entry.distortions) : [];
  const parsedGratitude = entry.gratitudeItems ? JSON.parse(entry.gratitudeItems) : [];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getMoodColor = (mood: number) => {
    if (mood <= 3) return '#EF4444';
    if (mood <= 5) return '#F59E0B';
    if (mood <= 7) return '#3B82F6';
    return '#10B981';
  };

  const truncateContent = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      border: '1px solid #E5E7EB',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s',
    }}>
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '16px 20px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px',
          }}>
            {/* Mood Indicator */}
            {entry.mood && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                background: `${getMoodColor(entry.mood)}15`,
                borderRadius: '999px',
              }}>
                <span style={{ fontSize: '16px' }}>
                  {MOOD_EMOJIS[entry.mood]}
                </span>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: getMoodColor(entry.mood),
                }}>
                  {entry.mood}/10
                </span>
              </div>
            )}

            {/* Voice Badge */}
            {entry.isVoiceEntry && (
              <span style={{
                fontSize: '11px',
                padding: '4px 8px',
                background: '#EDE9FE',
                color: '#7C3AED',
                borderRadius: '4px',
              }}>
                🎙️ Voice
              </span>
            )}

            {/* Session Type */}
            {entry.session && (
              <span style={{
                fontSize: '11px',
                padding: '4px 8px',
                background: '#ECFDF5',
                color: '#059669',
                borderRadius: '4px',
                textTransform: 'capitalize',
              }}>
                {entry.session.sessionType.replace('_', ' ')}
              </span>
            )}
          </div>

          {/* Title */}
          {entry.title && (
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1F2937',
              margin: '0 0 4px',
            }}>
              {entry.title}
            </h3>
          )}

          {/* Content Preview */}
          <p style={{
            fontSize: '14px',
            color: '#4B5563',
            margin: 0,
            lineHeight: '1.5',
          }}>
            {isExpanded ? entry.content : truncateContent(entry.content)}
          </p>

          {/* Timestamp */}
          <div style={{
            fontSize: '12px',
            color: '#9CA3AF',
            marginTop: '8px',
          }}>
            {formatDate(entry.createdAt)}
          </div>
        </div>

        {/* Expand Icon */}
        <span style={{
          fontSize: '18px',
          color: '#9CA3AF',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
        }}>
          ▼
        </span>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{
          padding: '0 20px 20px',
          borderTop: '1px solid #F3F4F6',
        }}>
          {/* Distortions */}
          {(entry.distortion || parsedDistortions.length > 0) && (
            <div style={{ marginTop: '16px' }}>
              <div style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#6B7280',
                marginBottom: '8px',
                textTransform: 'uppercase',
              }}>
                Detected Patterns
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {entry.distortion && (
                  <span style={{
                    padding: '6px 12px',
                    background: '#FEF3C7',
                    color: '#92400E',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '500',
                  }}>
                    🔍 {entry.distortion}
                  </span>
                )}
                {parsedDistortions.map((d: { type: string; confidence: number }, i: number) => (
                  <span
                    key={i}
                    style={{
                      padding: '6px 12px',
                      background: '#FEF3C7',
                      color: '#92400E',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                  >
                    {d.type} ({Math.round(d.confidence * 100)}%)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {parsedTags.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#6B7280',
                marginBottom: '8px',
                textTransform: 'uppercase',
              }}>
                Tags
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {parsedTags.map((tag: string) => (
                  <span
                    key={tag}
                    style={{
                      padding: '4px 10px',
                      background: '#F5F3FF',
                      color: '#7C3AED',
                      borderRadius: '999px',
                      fontSize: '12px',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Gratitude Items */}
          {parsedGratitude.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#6B7280',
                marginBottom: '8px',
                textTransform: 'uppercase',
              }}>
                Gratitude
              </div>
              <ul style={{
                margin: 0,
                paddingLeft: '20px',
                fontSize: '14px',
                color: '#4B5563',
              }}>
                {parsedGratitude.map((item: string, i: number) => (
                  <li key={i} style={{ marginBottom: '4px' }}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Summary */}
          {entry.aiSummary && (
            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: '#F0FDF4',
              borderRadius: '12px',
            }}>
              <div style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#059669',
                marginBottom: '6px',
              }}>
                AI Reflection
              </div>
              <p style={{
                fontSize: '14px',
                color: '#166534',
                margin: 0,
                lineHeight: '1.5',
              }}>
                {entry.aiSummary}
              </p>
            </div>
          )}

          {/* Mood After */}
          {entry.moodAfter && entry.mood && (
            <div style={{
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <span style={{ fontSize: '13px', color: '#6B7280' }}>Mood change:</span>
              <span style={{ fontSize: '16px' }}>{MOOD_EMOJIS[entry.mood]}</span>
              <span style={{ color: '#9CA3AF' }}>→</span>
              <span style={{ fontSize: '16px' }}>{MOOD_EMOJIS[entry.moodAfter]}</span>
              {entry.moodAfter > entry.mood && (
                <span style={{ fontSize: '12px', color: '#10B981' }}>
                  (+{entry.moodAfter - entry.mood})
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div style={{
            marginTop: '20px',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
          }}>
            {entry.audioUrl && (
              <button
                onClick={() => {
                  const audio = new Audio(entry.audioUrl!);
                  audio.play();
                }}
                style={{
                  padding: '8px 16px',
                  background: '#F5F3FF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#7C3AED',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                🔊 Play Audio
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(entry)}
                style={{
                  padding: '8px 16px',
                  background: '#F3F4F6',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#4B5563',
                  cursor: 'pointer',
                }}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <>
                {showDeleteConfirm ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        onDelete(entry.id);
                        setShowDeleteConfirm(false);
                      }}
                      style={{
                        padding: '8px 16px',
                        background: '#FEE2E2',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#DC2626',
                        cursor: 'pointer',
                      }}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      style={{
                        padding: '8px 16px',
                        background: '#F3F4F6',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#4B5563',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{
                      padding: '8px 16px',
                      background: '#FEE2E2',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#DC2626',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
