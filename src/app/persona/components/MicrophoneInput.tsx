'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

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

  const getButtonColor = () => {
    switch (state) {
      case 'recording':
        return '#EF4444';
      case 'processing':
        return '#6B7280';
      default:
        return disabled ? '#E5E7EB' : '#7C3AED';
    }
  };

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
          background: getButtonColor(),
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
            background: '#EF4444',
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
            border: '2px solid #EF4444',
            opacity: 0.5,
            transition: 'all 0.1s'
          }} />
        )}

        {/* Icon */}
        <span style={{
          fontSize: '20px',
          color: 'white',
          position: 'relative',
          zIndex: 1
        }}>
          {state === 'processing' ? (
            <span style={{
              display: 'inline-block',
              animation: 'spin 1s linear infinite'
            }}>⏳</span>
          ) : state === 'recording' ? (
            '⏹'
          ) : (
            '🎤'
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
          background: '#FEF2F2',
          color: '#EF4444',
          fontSize: '12px',
          borderRadius: '4px',
          whiteSpace: 'nowrap'
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
