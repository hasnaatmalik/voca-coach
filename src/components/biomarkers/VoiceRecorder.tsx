'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { READING_PROMPTS, formatDuration } from '@/lib/biomarker-utils';

// Theme colors
const themeColors = {
  primary: '#D9A299',
  primaryDark: '#C08B82',
  secondary: '#DCC5B2',
  background: '#FAF7F3',
  cardBg: '#F0E4D3',
  border: '#DCC5B2',
  text: '#2D2D2D',
  textMuted: '#6B6B6B',
  recording: '#E07A5F',
  success: '#7AB89E',
};

// Icon components
const MicIcon = ({ color = 'white', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const StopIcon = ({ color = 'white', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

const LoadingIcon = ({ color = 'white', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

const CloseIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const AlertIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

interface BiomarkerResult {
  pitch: number;
  clarity: number;
  stress: number;
  pauseDuration?: number;
  articulationRate?: number;
  jitter?: number;
  shimmer?: number;
  speechRate?: number;
  hnr?: number;
  overallScore?: number;
  observations?: string;
  recommendations?: string[];
}

interface VoiceRecorderProps {
  onAnalysisComplete: (result: BiomarkerResult, audioBlob: Blob) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

type RecordingState = 'idle' | 'countdown' | 'recording' | 'processing';

export default function VoiceRecorder({
  onAnalysisComplete,
  onError,
  disabled = false,
}: VoiceRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState(READING_PROMPTS[0]);
  const [duration, setDuration] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [audioLevel, setAudioLevel] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>(new Array(32).fill(0));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const MIN_DURATION = 10; // Minimum 10 seconds
  const MAX_DURATION = 120; // Maximum 2 minutes

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const updateAudioLevel = useCallback(() => {
    if (analyserRef.current && state === 'recording') {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate average level
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setAudioLevel(average / 255);

      // Create waveform visualization data
      const step = Math.floor(dataArray.length / 32);
      const waveform = [];
      for (let i = 0; i < 32; i++) {
        waveform.push(dataArray[i * step] / 255);
      }
      setWaveformData(waveform);

      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  }, [state]);

  const startCountdown = async () => {
    try {
      setError(null);

      // Request microphone permission early
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      setState('countdown');
      setCountdown(3);

      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            startRecording(stream);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Failed to access microphone:', err);
      setError('Microphone access denied. Please allow microphone access to record.');
      setState('idle');
      onError?.('Microphone access denied');
    }
  };

  const startRecording = (stream: MediaStream) => {
    try {
      // Set up audio analysis for visualization
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await analyzeAudio(blob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second

      setState('recording');
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= MAX_DURATION) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      // Start audio level monitoring
      updateAudioLevel();
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start recording');
      setState('idle');
    }
  };

  const stopRecording = () => {
    if (duration < MIN_DURATION && state === 'recording') {
      setError(`Please record for at least ${MIN_DURATION} seconds`);
      return;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setAudioLevel(0);
    setWaveformData(new Array(32).fill(0));

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setState('processing');
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const cancelRecording = () => {
    cleanup();
    setDuration(0);
    setAudioLevel(0);
    setWaveformData(new Array(32).fill(0));
    setState('idle');
  };

  const analyzeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('prompt', selectedPrompt.id);
      formData.append('duration', duration.toString());

      const res = await fetch('/api/biomarkers/analyze-audio', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const result: BiomarkerResult = await res.json();
      onAnalysisComplete(result, audioBlob);
      setState('idle');
      setDuration(0);
    } catch (err) {
      console.error('Analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      onError?.(errorMessage);
      setState('idle');
    }
  };

  const handleClick = () => {
    if (disabled) return;

    if (state === 'idle') {
      startCountdown();
    } else if (state === 'recording') {
      stopRecording();
    }
  };

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 8px 32px rgba(217, 162, 153, 0.15)',
        border: `1px solid ${themeColors.border}`,
      }}
    >
      {/* Prompt Selection */}
      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 600,
            color: themeColors.text,
            marginBottom: '8px',
          }}
        >
          Choose a Reading Prompt
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {READING_PROMPTS.map(prompt => (
            <button
              key={prompt.id}
              onClick={() => setSelectedPrompt(prompt)}
              disabled={state !== 'idle'}
              style={{
                padding: '6px 12px',
                borderRadius: '16px',
                border:
                  selectedPrompt.id === prompt.id
                    ? `2px solid ${themeColors.primaryDark}`
                    : `1px solid ${themeColors.border}`,
                background:
                  selectedPrompt.id === prompt.id
                    ? `${themeColors.primary}15`
                    : 'white',
                color: selectedPrompt.id === prompt.id ? themeColors.primaryDark : themeColors.textMuted,
                fontSize: '12px',
                fontWeight: 500,
                cursor: state !== 'idle' ? 'not-allowed' : 'pointer',
                opacity: state !== 'idle' ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
            >
              {prompt.title}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Text Display */}
      <div
        style={{
          background: `linear-gradient(135deg, ${themeColors.primary}15 0%, ${themeColors.secondary}20 100%)`,
          borderRadius: '12px',
          padding: '14px',
          marginBottom: '20px',
          border: `1px solid ${themeColors.border}`,
        }}
      >
        <p
          style={{
            fontSize: '14px',
            lineHeight: 1.6,
            color: themeColors.text,
            margin: 0,
            fontStyle: selectedPrompt.id === 'free_speech' ? 'italic' : 'normal',
          }}
        >
          "{selectedPrompt.text}"
        </p>
        <p
          style={{
            fontSize: '11px',
            color: themeColors.textMuted,
            marginTop: '8px',
            marginBottom: 0,
          }}
        >
          Recommended duration: ~{selectedPrompt.duration} seconds
        </p>
      </div>

      {/* Waveform Visualization */}
      {(state === 'recording' || state === 'processing') && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            height: '50px',
            marginBottom: '16px',
          }}
        >
          {waveformData.map((level, i) => (
            <div
              key={i}
              style={{
                width: '5px',
                height: `${Math.max(4, level * 45)}px`,
                background:
                  state === 'processing'
                    ? themeColors.border
                    : `linear-gradient(to top, ${themeColors.primary}, ${themeColors.primaryDark})`,
                borderRadius: '3px',
                transition: 'height 0.1s',
              }}
            />
          ))}
        </div>
      )}

      {/* Countdown Display */}
      {state === 'countdown' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '80px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              fontSize: '56px',
              fontWeight: 700,
              background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryDark} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'pulse 1s ease-in-out infinite',
            }}
          >
            {countdown}
          </div>
        </div>
      )}

      {/* Recording Controls */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {/* Timer Display */}
        {state === 'recording' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '20px',
              fontWeight: 600,
              color: themeColors.recording,
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: themeColors.recording,
                animation: 'blink 1s infinite',
              }}
            />
            {formatDuration(duration)}
          </div>
        )}

        {/* Main Record Button */}
        <button
          onClick={handleClick}
          disabled={disabled || state === 'processing' || state === 'countdown'}
          style={{
            width: state === 'recording' ? '70px' : '80px',
            height: state === 'recording' ? '70px' : '80px',
            borderRadius: '50%',
            border: 'none',
            background:
              state === 'recording'
                ? themeColors.recording
                : state === 'processing'
                  ? themeColors.border
                  : `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryDark} 100%)`,
            cursor:
              disabled || state === 'processing' || state === 'countdown'
                ? 'not-allowed'
                : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transition: 'all 0.3s',
            boxShadow:
              state === 'recording'
                ? `0 0 24px ${themeColors.recording}50`
                : `0 6px 20px rgba(217, 162, 153, 0.35)`,
            transform: `scale(${1 + audioLevel * 0.08})`,
          }}
        >
          {/* Pulse effect when recording */}
          {state === 'recording' && (
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: `3px solid ${themeColors.recording}`,
                opacity: 0.5,
                animation: 'ripple 1.5s infinite',
              }}
            />
          )}

          {/* Button Icon */}
          <span
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {state === 'processing' ? (
              <span style={{ animation: 'spin 1s linear infinite', display: 'flex' }}>
                <LoadingIcon size={28} />
              </span>
            ) : state === 'recording' ? (
              <StopIcon size={28} />
            ) : (
              <MicIcon size={28} />
            )}
          </span>
        </button>

        {/* Cancel button during recording */}
        {state === 'recording' && (
          <button
            onClick={cancelRecording}
            style={{
              padding: '6px 20px',
              borderRadius: '16px',
              border: `1px solid ${themeColors.border}`,
              background: 'white',
              color: themeColors.textMuted,
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Cancel
          </button>
        )}

        {/* Duration hint */}
        {state === 'idle' && (
          <p style={{ fontSize: '12px', color: themeColors.textMuted, textAlign: 'center', margin: 0 }}>
            Record at least {MIN_DURATION} seconds for accurate analysis
          </p>
        )}

        {/* Processing message */}
        {state === 'processing' && (
          <p style={{ fontSize: '12px', color: themeColors.textMuted, textAlign: 'center', margin: 0 }}>
            Analyzing your voice biomarkers...
          </p>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div
          style={{
            marginTop: '14px',
            padding: '10px 14px',
            background: `${themeColors.recording}15`,
            borderRadius: '10px',
            border: `1px solid ${themeColors.recording}30`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertIcon color={themeColors.recording} size={16} />
          <p style={{ margin: 0, fontSize: '12px', color: themeColors.recording, flex: 1 }}>{error}</p>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: themeColors.recording,
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CloseIcon color={themeColors.recording} size={14} />
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
