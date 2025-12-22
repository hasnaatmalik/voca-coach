'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Message } from '../types';

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
      return { background: '#6B7280', scale: 1 };
    }
    if (isRecording) {
      return {
        background: '#EF4444',
        scale: 1 + audioLevel * 0.3,
      };
    }
    return { background: '#7C3AED', scale: 1 };
  };

  const buttonStyle = getButtonStyle();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 200px)',
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #E5E7EB',
        background: 'linear-gradient(135deg, #F5F3FF 0%, #FCE7F3 100%)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize: '28px' }}>🎙️</span>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', margin: 0 }}>
              Voice Journal
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '2px 0 0' }}>
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
                      background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                      color: 'white',
                      borderBottomRightRadius: '4px',
                    }
                  : {
                      background: '#F3F4F6',
                      color: '#1F2937',
                      borderBottomLeftRadius: '4px',
                    }),
              }}>
                {m.content}
              </div>
              {m.role === 'user' && (
                <span style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
                  🎙️ Voice input
                </span>
              )}
            </div>
          ))}

          {isProcessing && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#6B7280',
              fontSize: '14px',
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #E5E7EB',
                borderTop: '2px solid #7C3AED',
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
              color: '#10B981',
              fontSize: '14px',
            }}>
              <span>🔊</span> Speaking...
            </div>
          )}
        </div>
      </div>

      {/* Current Transcription */}
      {transcription && (
        <div style={{
          padding: '12px 24px',
          background: '#F9FAFB',
          borderTop: '1px solid #E5E7EB',
          fontSize: '13px',
          color: '#6B7280',
        }}>
          <strong>Last transcription:</strong> {transcription}
        </div>
      )}

      {/* Recording Controls */}
      <div style={{
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderTop: '1px solid #E5E7EB',
      }}>
        {error && (
          <div style={{
            marginBottom: '16px',
            padding: '8px 16px',
            background: '#FEE2E2',
            color: '#DC2626',
            borderRadius: '8px',
            fontSize: '13px',
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
            fontSize: '32px',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            transform: `scale(${buttonStyle.scale})`,
            transition: 'transform 0.1s, background 0.3s',
            boxShadow: isRecording
              ? '0 0 0 8px rgba(239, 68, 68, 0.2)'
              : '0 4px 16px rgba(124, 58, 237, 0.3)',
          }}
        >
          {isProcessing ? '⏳' : isRecording ? '⏹' : '🎙️'}
        </button>

        <p style={{
          marginTop: '16px',
          fontSize: '14px',
          color: '#6B7280',
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
                  background: '#7C3AED',
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
