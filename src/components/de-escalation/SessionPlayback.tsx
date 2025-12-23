'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  SessionRecording,
  TranscriptSegment,
  VoiceBiomarkers,
  AIIntervention
} from '@/types/de-escalation';

interface SessionPlaybackProps {
  recording: SessionRecording;
  onClose: () => void;
  onDelete?: (recordingId: string) => void;
  darkMode?: boolean;
}

export default function SessionPlayback({
  recording,
  onClose,
  onDelete,
  darkMode = false,
}: SessionPlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(recording.duration);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'transcript' | 'biomarkers' | 'interventions'>('transcript');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const bgColor = darkMode ? '#1F2937' : 'white';
  const textColor = darkMode ? '#F9FAFB' : '#1F2937';
  const mutedColor = darkMode ? '#9CA3AF' : '#6B7280';
  const borderColor = darkMode ? '#374151' : '#E5E7EB';
  const cardBg = darkMode ? '#111827' : '#F9FAFB';

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current transcript segment
  const getCurrentSegment = useCallback((): TranscriptSegment | null => {
    return recording.transcript.segments.find(
      (seg) => currentTime >= seg.timestamp && currentTime < seg.timestamp + seg.duration
    ) || null;
  }, [recording.transcript.segments, currentTime]);

  // Get current biomarkers
  const getCurrentBiomarkers = useCallback((): VoiceBiomarkers | null => {
    if (recording.biomarkerTimeline.length === 0) return null;

    // Find the closest biomarker reading
    let closest = recording.biomarkerTimeline[0];
    for (const bm of recording.biomarkerTimeline) {
      if (bm.timestamp && bm.timestamp <= currentTime) {
        closest = bm;
      }
    }
    return closest;
  }, [recording.biomarkerTimeline, currentTime]);

  // Get past interventions
  const getPastInterventions = useCallback((): AIIntervention[] => {
    return recording.aiInterventions.filter((int) => int.timestamp <= currentTime);
  }, [recording.aiInterventions, currentTime]);

  // Play/Pause
  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Seek to position
  const seekTo = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    seekTo(percentage * duration);
  };

  // Change playback rate
  const changePlaybackRate = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  };

  // Delete recording
  const handleDelete = async () => {
    if (onDelete) {
      onDelete(recording.id);
    }
    setShowDeleteConfirm(false);
    onClose();
  };

  // Update time display
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const currentSegment = getCurrentSegment();
  const currentBiomarkers = getCurrentBiomarkers();
  const pastInterventions = getPastInterventions();

  const getEmotionColor = (emotion: string): string => {
    const colors: Record<string, string> = {
      calm: '#10B981',
      happy: '#F59E0B',
      neutral: '#6B7280',
      anxious: '#EF4444',
      frustrated: '#F97316',
      sad: '#3B82F6',
      angry: '#DC2626',
      fearful: '#8B5CF6',
    };
    return colors[emotion.toLowerCase()] || '#6B7280';
  };

  const getStressColor = (score: number): string => {
    if (score < 0.3) return '#10B981';
    if (score < 0.6) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div style={{
        background: bgColor,
        borderRadius: '20px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🎬</span>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: textColor, margin: 0 }}>
                Session Playback
              </h2>
              <span style={{ fontSize: '12px', color: mutedColor }}>
                {new Date(recording.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                padding: '8px 12px',
                background: 'transparent',
                color: '#EF4444',
                border: `1px solid #EF4444`,
                borderRadius: '8px',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Delete
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: mutedColor,
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Audio Player */}
        <div style={{
          padding: '20px',
          background: cardBg,
          borderBottom: `1px solid ${borderColor}`,
        }}>
          <audio
            ref={audioRef}
            src={recording.audioPath}
            style={{ display: 'none' }}
          />

          {/* Progress Bar */}
          <div
            onClick={handleProgressClick}
            style={{
              height: '8px',
              background: darkMode ? '#374151' : '#E5E7EB',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '16px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${(currentTime / duration) * 100}%`,
              background: 'linear-gradient(90deg, #7C3AED 0%, #EC4899 100%)',
              borderRadius: '4px',
              transition: 'width 0.1s linear',
            }} />
          </div>

          {/* Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Play/Pause */}
              <button
                onClick={togglePlayback}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                  color: 'white',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>

              {/* Skip buttons */}
              <button
                onClick={() => seekTo(Math.max(0, currentTime - 10))}
                style={{
                  padding: '8px 12px',
                  background: 'transparent',
                  color: mutedColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                -10s
              </button>
              <button
                onClick={() => seekTo(Math.min(duration, currentTime + 10))}
                style={{
                  padding: '8px 12px',
                  background: 'transparent',
                  color: mutedColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                +10s
              </button>
            </div>

            {/* Time Display */}
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: textColor,
              fontFamily: 'monospace',
            }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {/* Playback Rate */}
            <button
              onClick={changePlaybackRate}
              style={{
                padding: '8px 16px',
                background: cardBg,
                color: textColor,
                border: `1px solid ${borderColor}`,
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {playbackRate}x
            </button>
          </div>
        </div>

        {/* Current Status */}
        <div style={{
          padding: '16px 20px',
          background: cardBg,
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          gap: '20px',
        }}>
          {/* Current Emotion */}
          {currentSegment && (
            <div style={{
              padding: '10px 16px',
              background: `${getEmotionColor(currentSegment.emotion)}15`,
              borderRadius: '10px',
              borderLeft: `3px solid ${getEmotionColor(currentSegment.emotion)}`,
            }}>
              <div style={{ fontSize: '11px', color: mutedColor, marginBottom: '2px' }}>
                Current Emotion
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: getEmotionColor(currentSegment.emotion),
                textTransform: 'capitalize',
              }}>
                {currentSegment.emotion} ({Math.round(currentSegment.intensity * 100)}%)
              </div>
            </div>
          )}

          {/* Current Stress */}
          {currentBiomarkers && (
            <div style={{
              padding: '10px 16px',
              background: `${getStressColor(currentBiomarkers.overallStressScore)}15`,
              borderRadius: '10px',
              borderLeft: `3px solid ${getStressColor(currentBiomarkers.overallStressScore)}`,
            }}>
              <div style={{ fontSize: '11px', color: mutedColor, marginBottom: '2px' }}>
                Stress Level
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: getStressColor(currentBiomarkers.overallStressScore),
              }}>
                {Math.round(currentBiomarkers.overallStressScore * 100)}%
              </div>
            </div>
          )}

          {/* Current Speaking Rate */}
          {currentBiomarkers && (
            <div style={{
              padding: '10px 16px',
              background: darkMode ? '#1F2937' : 'white',
              borderRadius: '10px',
              border: `1px solid ${borderColor}`,
            }}>
              <div style={{ fontSize: '11px', color: mutedColor, marginBottom: '2px' }}>
                Speaking Rate
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: textColor,
              }}>
                {currentBiomarkers.speakingRate} WPM
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${borderColor}`,
        }}>
          {(['transcript', 'biomarkers', 'interventions'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '14px',
                background: activeTab === tab
                  ? darkMode ? '#1F2937' : 'white'
                  : cardBg,
                color: activeTab === tab ? '#7C3AED' : mutedColor,
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #7C3AED' : '2px solid transparent',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {tab === 'transcript' && '📝 '}
              {tab === 'biomarkers' && '📊 '}
              {tab === 'interventions' && '💡 '}
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px',
        }}>
          {/* Transcript Tab */}
          {activeTab === 'transcript' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recording.transcript.segments.map((segment) => {
                const isActive = currentSegment?.id === segment.id;
                return (
                  <div
                    key={segment.id}
                    onClick={() => seekTo(segment.timestamp)}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '12px',
                      background: isActive
                        ? `${getEmotionColor(segment.emotion)}15`
                        : 'transparent',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      borderLeft: `3px solid ${getEmotionColor(segment.emotion)}`,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{
                      minWidth: '50px',
                      fontSize: '11px',
                      color: mutedColor,
                      fontFamily: 'monospace',
                    }}>
                      {formatTime(segment.timestamp)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontSize: '14px',
                        color: textColor,
                        lineHeight: '1.5',
                        margin: '0 0 6px 0',
                      }}>
                        {segment.text}
                      </p>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        background: `${getEmotionColor(segment.emotion)}20`,
                        color: getEmotionColor(segment.emotion),
                        borderRadius: '4px',
                        textTransform: 'capitalize',
                      }}>
                        {segment.emotion} ({Math.round(segment.intensity * 100)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Biomarkers Tab */}
          {activeTab === 'biomarkers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recording.biomarkerTimeline.length > 0 ? (
                recording.biomarkerTimeline.map((bm, index) => (
                  <div
                    key={index}
                    onClick={() => bm.timestamp && seekTo(bm.timestamp)}
                    style={{
                      padding: '16px',
                      background: cardBg,
                      borderRadius: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                    }}>
                      <span style={{
                        fontSize: '12px',
                        color: mutedColor,
                        fontFamily: 'monospace',
                      }}>
                        {bm.timestamp ? formatTime(bm.timestamp) : `Reading ${index + 1}`}
                      </span>
                      <span style={{
                        padding: '4px 10px',
                        background: `${getStressColor(bm.overallStressScore)}20`,
                        color: getStressColor(bm.overallStressScore),
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}>
                        Stress: {Math.round(bm.overallStressScore * 100)}%
                      </span>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '12px',
                    }}>
                      <div>
                        <div style={{ fontSize: '11px', color: mutedColor }}>Speaking Rate</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: textColor }}>
                          {bm.speakingRate} WPM
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: mutedColor }}>Pitch Level</div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: textColor,
                          textTransform: 'capitalize',
                        }}>
                          {bm.pitchLevel}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: mutedColor }}>Volume</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: textColor }}>
                          {Math.round(bm.volumeIntensity * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: mutedColor,
                }}>
                  No biomarker data available for this session.
                </div>
              )}
            </div>
          )}

          {/* Interventions Tab */}
          {activeTab === 'interventions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recording.aiInterventions.length > 0 ? (
                recording.aiInterventions.map((intervention) => {
                  const isPast = intervention.timestamp <= currentTime;
                  return (
                    <div
                      key={intervention.id}
                      onClick={() => seekTo(intervention.timestamp)}
                      style={{
                        padding: '16px',
                        background: isPast ? 'rgba(124, 58, 237, 0.1)' : cardBg,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        borderLeft: `3px solid ${isPast ? '#7C3AED' : borderColor}`,
                        opacity: isPast ? 1 : 0.6,
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}>
                        <span style={{
                          fontSize: '12px',
                          color: mutedColor,
                          fontFamily: 'monospace',
                        }}>
                          {formatTime(intervention.timestamp)}
                        </span>
                        <span style={{
                          padding: '4px 10px',
                          background: '#7C3AED',
                          color: 'white',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: '600',
                          textTransform: 'capitalize',
                        }}>
                          {intervention.type}
                        </span>
                      </div>
                      <p style={{
                        fontSize: '14px',
                        color: textColor,
                        margin: '0 0 8px 0',
                        lineHeight: '1.5',
                      }}>
                        {intervention.message}
                      </p>
                      <div style={{ fontSize: '12px', color: mutedColor }}>
                        Trigger: {intervention.triggerReason}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: mutedColor,
                }}>
                  No AI interventions during this session.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '20px',
          }}>
            <div style={{
              background: bgColor,
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '350px',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🗑️</span>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: textColor,
                margin: '0 0 8px 0',
              }}>
                Delete Recording?
              </h3>
              <p style={{
                fontSize: '14px',
                color: mutedColor,
                margin: '0 0 20px 0',
              }}>
                This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: cardBg,
                    color: textColor,
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '500',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#EF4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
