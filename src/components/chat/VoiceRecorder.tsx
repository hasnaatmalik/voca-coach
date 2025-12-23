'use client';

import { useState, useRef, useCallback, useEffect, CSSProperties } from 'react';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
  maxDuration?: number; // seconds, default 60
  darkMode?: boolean;
}

type RecordingState = 'idle' | 'recording' | 'processing';

export default function VoiceRecorder({
  onRecordingComplete,
  onCancel,
  maxDuration = 60,
  darkMode = false
}: VoiceRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>(new Array(32).fill(0));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecording(true);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Update waveform visualization
  const updateWaveform = useCallback(() => {
    if (!analyserRef.current || state !== 'recording') return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Sample 32 bars from frequency data
    const bars: number[] = [];
    const step = Math.floor(dataArray.length / 32);
    for (let i = 0; i < 32; i++) {
      const value = dataArray[i * step] / 255;
      bars.push(value);
    }
    setWaveformData(bars);

    // Calculate overall level
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    setAudioLevel(average / 255);

    animationFrameRef.current = requestAnimationFrame(updateWaveform);
  }, [state]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio analysis
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Set up MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const recordingDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        onRecordingComplete(blob, recordingDuration);
        setState('idle');
      };

      // Start recording
      mediaRecorderRef.current.start(100);
      startTimeRef.current = Date.now();
      setState('recording');

      // Start timer
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);

        if (elapsed >= maxDuration) {
          stopRecording(false);
        }
      }, 100);

      // Start waveform animation
      updateWaveform();
    } catch (error) {
      console.error('Failed to start recording:', error);
      onCancel();
    }
  };

  const stopRecording = useCallback((cancel: boolean) => {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      if (cancel) {
        mediaRecorderRef.current.ondataavailable = null;
        mediaRecorderRef.current.onstop = null;
      }
      mediaRecorderRef.current.stop();
    }

    // Stop stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (cancel) {
      setState('idle');
      setDuration(0);
      setAudioLevel(0);
      setWaveformData(new Array(32).fill(0));
      onCancel();
    }
  }, [onCancel]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start recording on mount
  useEffect(() => {
    startRecording();
  }, []);

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    background: darkMode ? '#1F2937' : 'white',
    borderTop: '1px solid',
    borderColor: darkMode ? '#374151' : '#E5E7EB'
  };

  const cancelButtonStyle: CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    background: '#EF4444',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    transition: 'transform 0.2s'
  };

  const waveformContainerStyle: CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    height: '40px'
  };

  const barStyle = (height: number): CSSProperties => ({
    width: '3px',
    height: `${Math.max(4, height * 40)}px`,
    borderRadius: '2px',
    background: 'linear-gradient(180deg, #7C3AED 0%, #EC4899 100%)',
    transition: 'height 0.05s ease-out'
  });

  const durationStyle: CSSProperties = {
    fontSize: '16px',
    fontWeight: '600',
    color: state === 'recording' ? '#EF4444' : darkMode ? '#F3F4F6' : '#1F2937',
    fontFamily: 'monospace',
    minWidth: '50px',
    textAlign: 'center'
  };

  const sendButtonStyle: CSSProperties = {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: 'none',
    background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    transition: 'transform 0.2s',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)'
  };

  const recordingIndicatorStyle: CSSProperties = {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#EF4444',
    animation: 'pulse 1s infinite'
  };

  return (
    <div style={containerStyle}>
      {/* Cancel button */}
      <button
        style={cancelButtonStyle}
        onClick={() => stopRecording(true)}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title="Cancel recording"
      >
        ✕
      </button>

      {/* Recording indicator */}
      <div style={recordingIndicatorStyle} />

      {/* Waveform visualization */}
      <div style={waveformContainerStyle}>
        {waveformData.map((value, i) => (
          <div key={i} style={barStyle(value)} />
        ))}
      </div>

      {/* Duration */}
      <div style={durationStyle}>
        {formatDuration(duration)}
      </div>

      {/* Send button */}
      <button
        style={sendButtonStyle}
        onClick={() => stopRecording(false)}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        disabled={duration < 1}
        title="Send voice message"
      >
        ➤
      </button>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
