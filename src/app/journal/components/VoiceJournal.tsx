'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Message } from '../types';

// Theme colors
const themeColors = {
  primary: '#D9A299',
  primaryDark: '#C08B82',
  secondary: '#DCC5B2',
  border: '#DCC5B2',
  text: '#2D2D2D',
  textMuted: '#6B6B6B',
  cream: '#FAF7F3',
  beige: '#F0E4D3',
  success: '#7AB89E',
  recording: '#E07A5F',
};

// SVG Icon Components
const MicIcon = ({ color = 'currentColor', size = 28 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const StopIcon = ({ color = 'currentColor', size = 32 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

const LoaderIcon = ({ color = 'currentColor', size = 32 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const VolumeIcon = ({ color = themeColors.success, size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

interface VoiceJournalProps {
  onStreakUpdate?: () => void;
}

export default function VoiceJournal({ onStreakUpdate }: VoiceJournalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Welcome to voice journaling. Press the microphone and speak freely. I'll listen and respond.",
    },
  ]);
  const [isPlayingResponse, setIsPlayingResponse] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    setAudioLevel(average / 255);

    if (isRecording) {
      animationRef.current = requestAnimationFrame(updateAudioLevel);
    }
  }, [isRecording]);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Set up audio analysis
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      // Set up recording
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());

        // Transcribe
        setIsProcessing(true);
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          const res = await fetch('/api/stt', {
            method: 'POST',
            body: formData,
          });

          const data = await res.json();
          if (data.text) {
            setTranscription(data.text);
            await handleTranscription(data.text);
          }
        } catch (err) {
          console.error('Transcription error:', err);
          setError('Failed to transcribe audio');
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      updateAudioLevel();
    } catch (err) {
      console.error('Recording error:', err);
      setError('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  };

  const handleTranscription = async (text: string) => {
    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      // Get AI response
      const res = await fetch('/api/journal-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: messages.slice(-4),
          mode: 'chat',
        }),
      });

      const data = await res.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.socraticPrompt,
        timestamp: Date.now(),
        distortion: data.distortion,
      };

      setMessages([...updatedMessages, assistantMessage]);

      // Save to journal
      await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: text,
          distortion: data.distortion,
          socraticPrompt: data.socraticPrompt,
          isVoiceEntry: true,
        }),
      });

      onStreakUpdate?.();

      // Play TTS response
      await playTTS(data.socraticPrompt);
    } catch (err) {
      console.error('Response error:', err);
    }
  };

  const playTTS = async (text: string) => {
    setIsPlayingResponse(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceId: '21m00Tcm4TlvDq8ikWAM',
          voiceStability: 0.75,
          voiceSimilarity: 0.8,
          voiceStyle: 0.1,
          speechRate: 0.9,
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        audioRef.current.src = url;
        audioRef.current.onended = () => setIsPlayingResponse(false);
        await audioRef.current.play();
      }
    } catch (err) {
      console.error('TTS error:', err);
      setIsPlayingResponse(false);
    }
  };

  const getButtonStyle = () => {
    if (isProcessing) {
      return { background: themeColors.secondary, scale: 1 };
    }
    if (isRecording) {
      return {
        background: themeColors.recording,
        scale: 1 + audioLevel * 0.3,
      };
    }
    return { background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryDark} 100%)`, scale: 1 };
  };

  const buttonStyle = getButtonStyle();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 200px)',
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 4px 16px rgba(217, 162, 153, 0.12)',
      border: `1px solid ${themeColors.border}`,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: `1px solid ${themeColors.border}`,
        background: `linear-gradient(135deg, ${themeColors.primary}15 0%, ${themeColors.secondary}20 100%)`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: `${themeColors.primary}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <MicIcon color={themeColors.primaryDark} size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: themeColors.text, margin: 0 }}>
              Voice Journal
            </h2>
            <p style={{ fontSize: '13px', color: themeColors.textMuted, margin: '2px 0 0' }}>
              Speak freely, I&apos;ll respond with my voice
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div style={{
                maxWidth: '80%',
                padding: '16px 20px',
                borderRadius: '20px',
                fontSize: '15px',
                lineHeight: '1.6',
                ...(m.role === 'user'
                  ? {
                      background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryDark} 100%)`,
                      color: 'white',
                      borderBottomRightRadius: '4px',
                    }
                  : {
                      background: themeColors.cream,
                      color: themeColors.text,
                      borderBottomLeftRadius: '4px',
                      border: `1px solid ${themeColors.border}`,
                    }),
              }}>
                {m.content}
              </div>
              {m.role === 'user' && (
                <span style={{ fontSize: '11px', color: themeColors.textMuted, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MicIcon color={themeColors.textMuted} size={12} /> Voice input
                </span>
              )}
            </div>
          ))}

          {isProcessing && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: themeColors.textMuted,
              fontSize: '14px',
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: `2px solid ${themeColors.border}`,
                borderTop: `2px solid ${themeColors.primaryDark}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              Processing...
            </div>
          )}

          {isPlayingResponse && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: themeColors.success,
              fontSize: '14px',
            }}>
              <VolumeIcon color={themeColors.success} size={16} /> Speaking...
            </div>
          )}
        </div>
      </div>

      {/* Current Transcription */}
      {transcription && (
        <div style={{
          padding: '12px 24px',
          background: themeColors.cream,
          borderTop: `1px solid ${themeColors.border}`,
          fontSize: '13px',
          color: themeColors.textMuted,
        }}>
          <strong style={{ color: themeColors.text }}>Last transcription:</strong> {transcription}
        </div>
      )}

      {/* Recording Controls */}
      <div style={{
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderTop: `1px solid ${themeColors.border}`,
        background: `linear-gradient(180deg, white 0%, ${themeColors.cream} 100%)`,
      }}>
        {error && (
          <div style={{
            marginBottom: '16px',
            padding: '8px 16px',
            background: `${themeColors.recording}15`,
            color: themeColors.recording,
            borderRadius: '8px',
            fontSize: '13px',
            border: `1px solid ${themeColors.recording}30`,
          }}>
            {error}
          </div>
        )}

        {/* Main Record Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: 'none',
            background: buttonStyle.background,
            color: 'white',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            transform: `scale(${buttonStyle.scale})`,
            transition: 'transform 0.1s, background 0.3s',
            boxShadow: isRecording
              ? `0 0 0 8px ${themeColors.recording}30`
              : '0 4px 16px rgba(217, 162, 153, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isProcessing ? (
            <LoaderIcon color="white" size={32} />
          ) : isRecording ? (
            <StopIcon color="white" size={32} />
          ) : (
            <MicIcon color="white" size={32} />
          )}
        </button>

        <p style={{
          marginTop: '16px',
          fontSize: '14px',
          color: themeColors.textMuted,
        }}>
          {isProcessing
            ? 'Processing your voice...'
            : isRecording
            ? 'Recording... tap to stop'
            : 'Tap to start speaking'}
        </p>

        {/* Audio Level Indicator */}
        {isRecording && (
          <div style={{
            marginTop: '16px',
            display: 'flex',
            gap: '4px',
            height: '24px',
            alignItems: 'flex-end',
          }}>
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: '4px',
                  height: `${Math.max(4, audioLevel * 100 * (0.5 + Math.random() * 0.5))}%`,
                  background: themeColors.recording,
                  borderRadius: '2px',
                  transition: 'height 0.1s',
                }}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
