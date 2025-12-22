'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { READING_PROMPTS, formatDuration } from '@/lib/biomarker-utils';

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
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(124, 58, 237, 0.1)',
        border: '1px solid rgba(124, 58, 237, 0.1)',
      }}
    >
      {/* Prompt Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '8px',
          }}
        >
          Choose a Reading Prompt
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {READING_PROMPTS.map(prompt => (
            <button
              key={prompt.id}
              onClick={() => setSelectedPrompt(prompt)}
              disabled={state !== 'idle'}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border:
                  selectedPrompt.id === prompt.id
                    ? '2px solid #7C3AED'
                    : '1px solid #E5E7EB',
                background:
                  selectedPrompt.id === prompt.id
                    ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)'
                    : 'white',
                color: selectedPrompt.id === prompt.id ? '#7C3AED' : '#6B7280',
                fontSize: '13px',
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
          background: 'linear-gradient(135deg, #F3E8FF 0%, #FCE7F3 100%)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
        }}
      >
        <p
          style={{
            fontSize: '16px',
            lineHeight: 1.6,
            color: '#374151',
            margin: 0,
            fontStyle: selectedPrompt.id === 'free_speech' ? 'italic' : 'normal',
          }}
        >
          "{selectedPrompt.text}"
        </p>
        <p
          style={{
            fontSize: '12px',
            color: '#6B7280',
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
            height: '60px',
            marginBottom: '20px',
          }}
        >
          {waveformData.map((level, i) => (
            <div
              key={i}
              style={{
                width: '6px',
                height: `${Math.max(4, level * 50)}px`,
                background:
                  state === 'processing'
                    ? '#9CA3AF'
                    : `linear-gradient(to top, #7C3AED, #EC4899)`,
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
            height: '100px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
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
          gap: '16px',
        }}
      >
        {/* Timer Display */}
        {state === 'recording' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '24px',
              fontWeight: 600,
              color: '#EF4444',
            }}
          >
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#EF4444',
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
            width: state === 'recording' ? '80px' : '100px',
            height: state === 'recording' ? '80px' : '100px',
            borderRadius: '50%',
            border: 'none',
            background:
              state === 'recording'
                ? '#EF4444'
                : state === 'processing'
                  ? '#9CA3AF'
                  : 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
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
                ? '0 0 30px rgba(239, 68, 68, 0.4)'
                : '0 8px 24px rgba(124, 58, 237, 0.3)',
            transform: `scale(${1 + audioLevel * 0.1})`,
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
                border: '3px solid #EF4444',
                opacity: 0.5,
                animation: 'ripple 1.5s infinite',
              }}
            />
          )}

          {/* Button Icon */}
          <span
            style={{
              fontSize: state === 'processing' ? '28px' : '36px',
              color: 'white',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {state === 'processing' ? (
              <span
                style={{
                  display: 'inline-block',
                  animation: 'spin 1s linear infinite',
                }}
              >
                Analyzing...
              </span>
            ) : state === 'recording' ? (
              <span style={{ fontSize: '32px' }}>Stop</span>
            ) : (
              'Record'
            )}
          </span>
        </button>

        {/* Cancel button during recording */}
        {state === 'recording' && (
          <button
            onClick={cancelRecording}
            style={{
              padding: '8px 24px',
              borderRadius: '20px',
              border: '1px solid #E5E7EB',
              background: 'white',
              color: '#6B7280',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        )}

        {/* Duration hint */}
        {state === 'idle' && (
          <p style={{ fontSize: '14px', color: '#6B7280', textAlign: 'center' }}>
            Record at least {MIN_DURATION} seconds for accurate analysis
          </p>
        )}

        {/* Processing message */}
        {state === 'processing' && (
          <p style={{ fontSize: '14px', color: '#6B7280', textAlign: 'center' }}>
            Analyzing your voice biomarkers...
          </p>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: '#FEF2F2',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ color: '#EF4444' }}>Warning</span>
          <p style={{ margin: 0, fontSize: '14px', color: '#EF4444' }}>{error}</p>
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#EF4444',
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            x
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
