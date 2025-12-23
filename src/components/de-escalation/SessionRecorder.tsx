'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { SessionRecording, TranscriptSegment, VoiceBiomarkers, AIIntervention } from '@/types/de-escalation';

interface SessionRecorderProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSave?: (recording: SessionRecording) => void;
  transcriptSegments?: TranscriptSegment[];
  biomarkerTimeline?: VoiceBiomarkers[];
  aiInterventions?: AIIntervention[];
  sessionId: string;
  darkMode?: boolean;
  compact?: boolean;
}

export default function SessionRecorder({
  isRecording,
  onStartRecording,
  onStopRecording,
  onSave,
  transcriptSegments = [],
  biomarkerTimeline = [],
  aiInterventions = [],
  sessionId,
  darkMode = false,
  compact = false,
}: SessionRecorderProps) {
  const [hasConsent, setHasConsent] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const bgColor = darkMode ? '#1F2937' : 'white';
  const textColor = darkMode ? '#F9FAFB' : '#1F2937';
  const mutedColor = darkMode ? '#9CA3AF' : '#6B7280';
  const borderColor = darkMode ? '#374151' : '#E5E7EB';
  const cardBg = darkMode ? '#111827' : '#F9FAFB';

  // Format duration as MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start recording with MediaRecorder
  const startRecordingInternal = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

      onStartRecording();
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, [onStartRecording]);

  // Stop recording
  const stopRecordingInternal = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    onStopRecording();
  }, [onStopRecording]);

  // Handle consent and start recording
  const handleRecordClick = () => {
    if (!hasConsent) {
      setShowConsentModal(true);
    } else if (isRecording) {
      stopRecordingInternal();
    } else {
      startRecordingInternal();
    }
  };

  // Accept consent and start recording
  const acceptConsent = () => {
    setHasConsent(true);
    setShowConsentModal(false);
    startRecordingInternal();
  };

  // Save recording
  const saveRecording = async () => {
    if (!audioBlob || !onSave) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Convert blob to base64
      const base64Audio = await blobToBase64(audioBlob);

      // Send to API
      const response = await fetch('/api/de-escalation/recordings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          audio: base64Audio,
          duration: recordingDuration,
          transcript: {
            segments: transcriptSegments,
            fullText: transcriptSegments.map(s => s.text).join(' '),
            dominantEmotion: getDominantEmotion(transcriptSegments),
            averageIntensity: getAverageIntensity(transcriptSegments),
          },
          biomarkers: biomarkerTimeline,
          aiInterventions,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSaveSuccess(true);

        onSave({
          id: data.id,
          sessionId,
          audioPath: data.audioPath,
          duration: recordingDuration,
          transcript: {
            segments: transcriptSegments,
            fullText: transcriptSegments.map(s => s.text).join(' '),
            dominantEmotion: getDominantEmotion(transcriptSegments),
            averageIntensity: getAverageIntensity(transcriptSegments),
          },
          biomarkerTimeline,
          aiInterventions,
          createdAt: new Date().toISOString(),
        });

        // Reset after save
        setTimeout(() => {
          setAudioBlob(null);
          setAudioUrl(null);
          setRecordingDuration(0);
          setSaveSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving recording:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const getDominantEmotion = (segments: TranscriptSegment[]): string => {
    if (segments.length === 0) return 'neutral';
    const emotions = segments.map(s => s.emotion);
    const counts: Record<string, number> = {};
    emotions.forEach(e => { counts[e] = (counts[e] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
  };

  const getAverageIntensity = (segments: TranscriptSegment[]): number => {
    if (segments.length === 0) return 0;
    return segments.reduce((sum, s) => sum + s.intensity, 0) / segments.length;
  };

  // Discard recording
  const discardRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingDuration(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Consent Modal
  const ConsentModal = () => (
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
        maxWidth: '450px',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '24px',
          borderBottom: `1px solid ${borderColor}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '32px' }}>🎙️</span>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: textColor, margin: 0 }}>
              Recording Consent
            </h2>
          </div>
          <p style={{ fontSize: '14px', color: mutedColor, margin: 0, lineHeight: '1.6' }}>
            This session can be recorded to help you review your progress later.
          </p>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{
            padding: '14px',
            background: 'rgba(124, 58, 237, 0.1)',
            borderRadius: '12px',
            marginBottom: '16px',
          }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#7C3AED', marginBottom: '8px' }}>
              What will be recorded:
            </div>
            <ul style={{
              margin: 0,
              paddingLeft: '20px',
              fontSize: '13px',
              color: mutedColor,
              lineHeight: '1.8',
            }}>
              <li>Your voice during the session</li>
              <li>AI coaching responses</li>
              <li>Biomarker data and transcript</li>
            </ul>
          </div>

          <div style={{
            padding: '14px',
            background: cardBg,
            borderRadius: '12px',
            borderLeft: '3px solid #F59E0B',
          }}>
            <div style={{ fontSize: '13px', color: mutedColor }}>
              <strong style={{ color: textColor }}>Privacy:</strong> Recordings are stored
              securely and only accessible to you. You can delete them at any time.
            </div>
          </div>
        </div>

        <div style={{
          padding: '16px 20px 20px',
          display: 'flex',
          gap: '12px',
        }}>
          <button
            onClick={() => setShowConsentModal(false)}
            style={{
              flex: 1,
              padding: '14px',
              background: cardBg,
              color: textColor,
              border: 'none',
              borderRadius: '10px',
              fontWeight: '500',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Not Now
          </button>
          <button
            onClick={acceptConsent}
            style={{
              flex: 1,
              padding: '14px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>✓</span>
            I Consent
          </button>
        </div>
      </div>
    </div>
  );

  // Compact view
  if (compact) {
    return (
      <>
        {showConsentModal && <ConsentModal />}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <button
            onClick={handleRecordClick}
            style={{
              padding: '8px 16px',
              background: isRecording
                ? '#EF4444'
                : hasConsent
                  ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)'
                  : darkMode ? '#374151' : '#E5E7EB',
              color: isRecording || hasConsent ? 'white' : textColor,
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {isRecording ? (
              <>
                <span style={{ animation: 'blink 1s ease-in-out infinite' }}>●</span>
                {formatDuration(recordingDuration)}
              </>
            ) : (
              <>
                <span>🎙️</span>
                Record
              </>
            )}
          </button>

          {audioUrl && !isRecording && (
            <button
              onClick={saveRecording}
              disabled={isSaving}
              style={{
                padding: '8px 12px',
                background: saveSuccess ? '#10B981' : '#7C3AED',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {saveSuccess ? '✓' : isSaving ? '...' : '💾'}
            </button>
          )}
        </div>

        <style jsx global>{`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      {showConsentModal && <ConsentModal />}

      <div style={{
        background: bgColor,
        borderRadius: '16px',
        padding: '20px',
        border: `1px solid ${borderColor}`,
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🎙️</span>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: textColor,
              margin: 0,
            }}>
              Session Recording
            </h3>
          </div>

          {hasConsent && (
            <span style={{
              padding: '4px 10px',
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10B981',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '600',
            }}>
              Consent Given
            </span>
          )}
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div style={{
            padding: '16px',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#EF4444',
                animation: 'blink 1s ease-in-out infinite',
              }} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#EF4444' }}>
                Recording
              </span>
            </div>
            <span style={{
              fontSize: '24px',
              fontWeight: '700',
              color: textColor,
              fontFamily: 'monospace',
            }}>
              {formatDuration(recordingDuration)}
            </span>
          </div>
        )}

        {/* Recorded Audio */}
        {audioUrl && !isRecording && (
          <div style={{
            padding: '16px',
            background: cardBg,
            borderRadius: '12px',
            marginBottom: '16px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: textColor }}>
                Recorded Session
              </span>
              <span style={{ fontSize: '13px', color: mutedColor }}>
                {formatDuration(recordingDuration)}
              </span>
            </div>

            <audio
              controls
              src={audioUrl}
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '8px',
              }}
            />

            <div style={{
              display: 'flex',
              gap: '8px',
              marginTop: '12px',
            }}>
              <button
                onClick={discardRecording}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'transparent',
                  color: '#EF4444',
                  border: `1px solid #EF4444`,
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Discard
              </button>
              <button
                onClick={saveRecording}
                disabled={isSaving}
                style={{
                  flex: 2,
                  padding: '10px',
                  background: saveSuccess
                    ? '#10B981'
                    : 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: isSaving ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                {saveSuccess ? (
                  <>✓ Saved</>
                ) : isSaving ? (
                  <>Saving...</>
                ) : (
                  <><span>💾</span> Save Recording</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Controls */}
        {!audioUrl && (
          <button
            onClick={handleRecordClick}
            style={{
              width: '100%',
              padding: '16px',
              background: isRecording
                ? '#EF4444'
                : hasConsent
                  ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)'
                  : cardBg,
              color: isRecording || hasConsent ? 'white' : textColor,
              border: isRecording || hasConsent ? 'none' : `1px solid ${borderColor}`,
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {isRecording ? (
              <>
                <span>⏹️</span>
                Stop Recording
              </>
            ) : hasConsent ? (
              <>
                <span>🎙️</span>
                Start Recording
              </>
            ) : (
              <>
                <span>🔒</span>
                Enable Recording
              </>
            )}
          </button>
        )}

        {/* Info */}
        {!hasConsent && !isRecording && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: 'rgba(245, 158, 11, 0.1)',
            borderRadius: '10px',
            fontSize: '12px',
            color: mutedColor,
            textAlign: 'center',
          }}>
            Recording requires your consent. Your privacy is our priority.
          </div>
        )}

        <style jsx global>{`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>
      </div>
    </>
  );
}
