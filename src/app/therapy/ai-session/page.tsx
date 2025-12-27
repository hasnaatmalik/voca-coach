'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import { PERSONA_LIST, CRISIS_HELPLINES, AIPersona } from '@/lib/ai-therapy-personas';

// SVG Icon Components
const HeartIcon = ({ color = '#D9A299', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const SpeakerIcon = ({ color = '#D9A299', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const SparkleIcon = ({ color = '#D9A299', size = 32 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" />
    <path d="M5 3l.5 2L7.5 5.5 5.5 6 5 8l-.5-2L2.5 5.5 4.5 5 5 3z" />
    <path d="M19 17l.5 2 2-.5-.5 2-2 .5.5-2-2 .5.5-2z" />
  </svg>
);

const BrainIcon = ({ color = '#D9A299', size = 28 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54Z" />
  </svg>
);

const MindfulnessIcon = ({ color = '#D9A299', size = 28 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const CompassionIcon = ({ color = '#D9A299', size = 28 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const SolutionIcon = ({ color = '#D9A299', size = 28 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// Map persona IDs to icon components
const personaIcons: Record<string, React.FC<{ color?: string; size?: number }>> = {
  cbt: BrainIcon,
  mindfulness: MindfulnessIcon,
  compassion: CompassionIcon,
  solution: SolutionIcon,
};

// Web Speech API types
declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

type SessionStatus = 'selecting' | 'active' | 'ended';

export default function AISessionPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [status, setStatus] = useState<SessionStatus>('selecting');
  const [selectedPersona, setSelectedPersona] = useState<AIPersona | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [transcript, setTranscript] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + ' ' + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };
    }
  }, []);

  // Session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'active') {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startSession = async () => {
    if (!selectedPersona) return;

    try {
      const response = await fetch('/api/ai-therapy/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaType: selectedPersona.id,
          recordingConsent: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.session.id);
        setStatus('active');

        // Play intro message
        const introMessage = `Hello, I'm your ${selectedPersona.name}. I'm here to support you today. What's on your mind?`;
        setMessages([{
          id: 'intro',
          role: 'assistant',
          content: introMessage,
          timestamp: 0,
        }]);

        // Speak intro
        await playTTS(introMessage, selectedPersona.voiceId);
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    try {
      await fetch('/api/ai-therapy/session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          action: 'end',
        }),
      });

      setStatus('ended');
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const startRecording = () => {
    setTranscript('');
    setIsRecording(true);

    // Start speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Process the transcript
    if (transcript.trim()) {
      await processMessage(transcript.trim());
    }
    setTranscript('');
  };

  const processMessage = async (text: string) => {
    if (!sessionId || !selectedPersona) return;

    setIsProcessing(true);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: elapsedTime,
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/ai-therapy/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          content: text,
          timestamp: elapsedTime,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Check for crisis
        if (data.crisisDetected) {
          setShowCrisisAlert(true);
        }

        // Add AI response
        const aiMessage: Message = {
          id: data.aiMessage.id,
          role: 'assistant',
          content: data.aiResponse,
          timestamp: elapsedTime + 1,
        };
        setMessages(prev => [...prev, aiMessage]);

        // Play TTS response
        await playTTS(data.aiResponse, data.voiceId);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const playTTS = async (text: string, voiceId: string) => {
    try {
      setIsPlaying(true);

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          await audioRef.current.play();
        }
      }
    } catch (error) {
      console.error('Error playing TTS:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FAF7F3 0%, #F0E4D3 100%)' }}>
      <Navbar isAuthenticated={true} userName={user.name} userEmail={user.email} onLogout={logout} />
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Persona Selection */}
        {status === 'selecting' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#2D2D2D', marginBottom: '8px' }}>
                AI Therapy Session
              </h1>
              <p style={{ color: '#6B6B6B' }}>
                Choose a therapeutic approach for your session
              </p>
            </div>

            <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
              {PERSONA_LIST.map((persona) => (
                <div
                  key={persona.id}
                  onClick={() => setSelectedPersona(persona)}
                  style={{
                    padding: '20px',
                    background: selectedPersona?.id === persona.id
                      ? 'linear-gradient(135deg, rgba(217, 162, 153, 0.15) 0%, rgba(220, 197, 178, 0.15) 100%)'
                      : 'rgba(255, 255, 255, 0.95)',
                    border: selectedPersona?.id === persona.id
                      ? '2px solid #D9A299'
                      : '1px solid #DCC5B2',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: selectedPersona?.id === persona.id
                      ? '0 4px 24px rgba(217, 162, 153, 0.2)'
                      : '0 4px 20px rgba(0, 0, 0, 0.04)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #D9A299 0%, #DCC5B2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(217, 162, 153, 0.3)',
                    }}>
                      {(() => {
                        const PersonaIcon = personaIcons[persona.id] || BrainIcon;
                        return <PersonaIcon color="white" size={28} />;
                      })()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2D2D2D', marginBottom: '4px' }}>
                        {persona.name}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#6B6B6B' }}>
                        {persona.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={startSession}
              disabled={!selectedPersona}
              style={{
                width: '100%',
                padding: '16px',
                background: selectedPersona
                  ? 'linear-gradient(135deg, #D9A299 0%, #DCC5B2 100%)'
                  : '#E5DDD3',
                color: selectedPersona ? 'white' : '#9A9A9A',
                border: 'none',
                borderRadius: '14px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: selectedPersona ? 'pointer' : 'not-allowed',
                boxShadow: selectedPersona ? '0 4px 20px rgba(217, 162, 153, 0.35)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              Start Session
            </button>
          </>
        )}

        {/* Active Session */}
        {status === 'active' && selectedPersona && (
          <>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              padding: '16px 20px',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              border: '1px solid #DCC5B2',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #D9A299 0%, #DCC5B2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(217, 162, 153, 0.3)',
                }}>
                  {(() => {
                    const PersonaIcon = personaIcons[selectedPersona.id] || BrainIcon;
                    return <PersonaIcon color="white" size={24} />;
                  })()}
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#2D2D2D' }}>
                    {selectedPersona.name}
                  </h2>
                  <div style={{ fontSize: '13px', color: '#6B6B6B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D9A299', boxShadow: '0 0 8px rgba(217, 162, 153, 0.6)' }} />
                    Session: {formatTime(elapsedTime)}
                  </div>
                </div>
              </div>

              <button
                onClick={endSession}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(217, 162, 153, 0.15)',
                  color: '#C08B82',
                  border: '1px solid #D9A299',
                  borderRadius: '10px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                End Session
              </button>
            </div>

            {/* Crisis Alert */}
            {showCrisisAlert && (
              <div style={{
                padding: '16px 20px',
                background: 'rgba(217, 162, 153, 0.1)',
                border: '1px solid #D9A299',
                borderRadius: '16px',
                marginBottom: '20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <HeartIcon color="#D9A299" size={20} />
                  <strong style={{ color: '#C08B82' }}>We care about your safety</strong>
                </div>
                <p style={{ fontSize: '14px', color: '#6B6B6B', marginBottom: '12px' }}>
                  If you're in crisis, please reach out to one of these resources:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {CRISIS_HELPLINES.map((helpline, i) => (
                    <div key={i} style={{
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '10px',
                      fontSize: '14px',
                      border: '1px solid #F0E4D3',
                    }}>
                      <strong style={{ color: '#2D2D2D' }}>{helpline.name}:</strong>{' '}
                      <span style={{ color: '#6B6B6B' }}>{helpline.number} ({helpline.available})</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowCrisisAlert(false)}
                  style={{
                    marginTop: '12px',
                    padding: '8px 16px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #D9A299',
                    color: '#C08B82',
                    borderRadius: '8px',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  I understand
                </button>
              </div>
            )}

            {/* Messages */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              padding: '20px',
              minHeight: '300px',
              maxHeight: '400px',
              overflowY: 'auto',
              marginBottom: '20px',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
              border: '1px solid #DCC5B2',
              backdropFilter: 'blur(10px)',
            }}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{
                    maxWidth: '80%',
                    padding: '12px 16px',
                    background: message.role === 'user'
                      ? 'linear-gradient(135deg, #D9A299 0%, #DCC5B2 100%)'
                      : '#F0E4D3',
                    color: message.role === 'user' ? 'white' : '#2D2D2D',
                    borderRadius: message.role === 'user'
                      ? '18px 18px 4px 18px'
                      : '18px 18px 18px 4px',
                    boxShadow: message.role === 'user'
                      ? '0 4px 12px rgba(217, 162, 153, 0.25)'
                      : '0 2px 8px rgba(0, 0, 0, 0.03)',
                  }}>
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Recording Controls */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              padding: '24px',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              border: '1px solid #DCC5B2',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
              backdropFilter: 'blur(10px)',
            }}>
              {/* Transcript preview */}
              {transcript && (
                <div style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(217, 162, 153, 0.1)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#6B6B6B',
                  fontStyle: 'italic',
                  border: '1px solid rgba(217, 162, 153, 0.2)',
                }}>
                  {transcript}
                </div>
              )}

              {/* Status indicator */}
              <div style={{
                fontSize: '14px',
                color: '#6B6B6B',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                {isRecording && (
                  <span style={{ color: '#D9A299', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D9A299', animation: 'pulse 1.5s infinite' }} />
                    Recording...
                  </span>
                )}
                {isProcessing && <span>Processing...</span>}
                {isPlaying && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <SpeakerIcon color="#D9A299" size={16} /> Speaking...
                </span>}
                {!isRecording && !isProcessing && !isPlaying && <span>Tap to speak</span>}
              </div>

              {/* Record button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing || isPlaying}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: isProcessing || isPlaying ? 'not-allowed' : 'pointer',
                  background: isRecording
                    ? '#C08B82'
                    : 'linear-gradient(135deg, #D9A299 0%, #DCC5B2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isRecording
                    ? '0 4px 20px rgba(192, 139, 130, 0.4)'
                    : '0 4px 20px rgba(217, 162, 153, 0.4)',
                  opacity: isProcessing || isPlaying ? 0.5 : 1,
                  transition: 'all 0.2s',
                }}
              >
                {isRecording ? (
                  <div style={{
                    width: '24px',
                    height: '24px',
                    background: 'white',
                    borderRadius: '4px',
                  }} />
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                )}
              </button>
            </div>
          </>
        )}

        {/* Session Ended */}
        {status === 'ended' && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
            border: '1px solid #DCC5B2',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #D9A299 0%, #DCC5B2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 24px rgba(217, 162, 153, 0.3)',
            }}>
              <SparkleIcon color="white" size={32} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#2D2D2D', marginBottom: '8px' }}>
              Session Complete
            </h2>
            <p style={{ color: '#6B6B6B', marginBottom: '28px' }}>
              Thank you for sharing with me today. Take care of yourself.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setStatus('selecting');
                  setMessages([]);
                  setElapsedTime(0);
                  setSessionId(null);
                }}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#C08B82',
                  border: '2px solid #D9A299',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                New Session
              </button>
              <button
                onClick={() => router.push('/therapy/sessions')}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #D9A299 0%, #DCC5B2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(217, 162, 153, 0.35)',
                  transition: 'all 0.2s',
                }}
              >
                Back to Sessions
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
