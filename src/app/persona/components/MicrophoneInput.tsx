'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// Theme colors
const themeColors = {
  primary: '#D9A299',
  primaryDark: '#C08B82',
  secondary: '#DCC5B2',
  border: '#DCC5B2',
  recording: '#E07A5F',
  disabled: '#E5E7EB',
};

// Icon components
const MicIcon = ({ color = 'white', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const StopIcon = ({ color = 'white', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

const LoadingIcon = ({ color = 'white', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

interface MicrophoneInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

type RecordingState = 'idle' | 'recording' | 'processing';

export default function MicrophoneInput({ onTranscript, disabled = false }: MicrophoneInputProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopRecording();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const updateAudioLevel = useCallback(() => {
    if (analyserRef.current && state === 'recording') {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setAudioLevel(average / 255);
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  }, [state]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio analysis for visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(blob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setState('recording');

      // Start audio level monitoring
      updateAudioLevel();
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Microphone access denied');
      setState('idle');
    }
  };

  const stopRecording = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setAudioLevel(0);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setState('processing');
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const res = await fetch('/api/stt', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          onTranscript(data.text);
        }
      } else {
        setError('Transcription failed');
      }
    } catch (err) {
      console.error('Transcription error:', err);
      setError('Transcription failed');
    } finally {
      setState('idle');
    }
  };

  const handleClick = () => {
    if (disabled) return;

    if (state === 'idle') {
      startRecording();
    } else if (state === 'recording') {
      stopRecording();
    }
  };

  const getButtonStyle = () => {
    if (state === 'recording') {
      return {
        background: themeColors.recording,
        boxShadow: `0 0 20px ${themeColors.recording}40`,
      };
    }
    if (state === 'processing') {
      return {
        background: themeColors.secondary,
        boxShadow: 'none',
      };
    }
    if (disabled) {
      return {
        background: themeColors.disabled,
        boxShadow: 'none',
      };
    }
    return {
      background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryDark} 100%)`,
      boxShadow: '0 4px 12px rgba(217, 162, 153, 0.35)',
    };
  };

  const buttonStyle = getButtonStyle();

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={handleClick}
        disabled={disabled || state === 'processing'}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: 'none',
          ...buttonStyle,
          cursor: disabled || state === 'processing' ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'all 0.2s'
        }}
      >
        {/* Pulse animation when recording */}
        {state === 'recording' && (
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: themeColors.recording,
            opacity: 0.3,
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
        )}

        {/* Audio level indicator */}
        {state === 'recording' && (
          <div style={{
            position: 'absolute',
            width: `${48 + audioLevel * 24}px`,
            height: `${48 + audioLevel * 24}px`,
            borderRadius: '50%',
            border: `2px solid ${themeColors.recording}`,
            opacity: 0.5,
            transition: 'all 0.1s'
          }} />
        )}

        {/* Icon */}
        <span style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {state === 'processing' ? (
            <span style={{
              display: 'flex',
              animation: 'spin 1s linear infinite'
            }}>
              <LoadingIcon />
            </span>
          ) : state === 'recording' ? (
            <StopIcon />
          ) : (
            <MicIcon />
          )}
        </span>
      </button>

      {error && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '8px',
          padding: '4px 8px',
          background: `${themeColors.recording}15`,
          color: themeColors.recording,
          fontSize: '12px',
          borderRadius: '4px',
          whiteSpace: 'nowrap',
          border: `1px solid ${themeColors.recording}30`,
        }}>
          {error}
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
