'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Message, InsightResponse } from '../types';
import MicrophoneInput from '@/app/persona/components/MicrophoneInput';

// Theme colors
const themeColors = {
  primary: '#D9A299',
  primaryDark: '#C08B82',
  secondary: '#DCC5B2',
  border: '#DCC5B2',
  text: '#2D2D2D',
  textMuted: '#6B6B6B',
};

// SVG Icon Components
const SearchIcon = ({ color = '#E4B17A', size = 12 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const SendIcon = ({ color = 'white', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

interface JournalChatProps {
  sessionId?: string | null;
  onSessionChange?: (sessionId: string | null) => void;
  onStreakUpdate?: () => void;
}

export default function JournalChat({
  sessionId,
  onSessionChange,
  onStreakUpdate,
}: JournalChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm here to listen and help you reflect. What's on your mind today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [autoPlayTTS, setAutoPlayTTS] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [crisisResources, setCrisisResources] = useState<string[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId || null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const playTTS = useCallback(async (text: string) => {
    if (!autoPlayTTS) return;

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceId: '21m00Tcm4TlvDq8ikWAM',
          voiceStability: 0.7,
          voiceSimilarity: 0.8,
          voiceStyle: 0.1,
          speechRate: 0.9,
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play();
        }
      }
    } catch (err) {
      console.error('TTS error:', err);
    }
  }, [autoPlayTTS]);

  const createOrUpdateSession = async (newMessages: Message[]) => {
    try {
      if (!currentSessionId) {
        // Create new session
        const res = await fetch('/api/journal-sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionType: 'guided',
            messages: newMessages,
          }),
        });
        const data = await res.json();
        if (data.session) {
          setCurrentSessionId(data.session.id);
          onSessionChange?.(data.session.id);
        }
      } else {
        // Update existing session
        await fetch('/api/journal-sessions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: currentSessionId,
            messages: newMessages,
          }),
        });
      }
    } catch (err) {
      console.error('Session save error:', err);
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    setInput('');
    const userMessage: Message = {
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    setShowCrisisAlert(false);

    try {
      // Get AI insight
      const res = await fetch('/api/journal-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          context: messages.slice(-6),
          sessionId: currentSessionId,
          mode: 'chat',
        }),
      });

      const insight: InsightResponse = await res.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: insight.socraticPrompt,
        timestamp: Date.now(),
        distortion: insight.distortion,
        distortions: insight.distortions,
        moodIndicators: insight.moodIndicators,
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Handle crisis detection
      if (insight.crisisDetected) {
        setShowCrisisAlert(true);
        setCrisisResources(insight.suggestedResources || []);
      }

      // Play TTS if enabled
      if (autoPlayTTS) {
        playTTS(insight.socraticPrompt);
      }

      // Save to database
      await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageText,
          distortion: insight.distortion,
          distortions: insight.distortions,
          socraticPrompt: insight.socraticPrompt,
          sessionId: currentSessionId,
        }),
      });

      onStreakUpdate?.();

      // Save session
      createOrUpdateSession(finalMessages);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMessage: Message = {
        role: 'assistant',
        content: "I hear you. Tell me more about what's on your mind.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranscript = (text: string) => {
    if (voiceMode) {
      handleSend(text);
    } else {
      setInput(text);
    }
  };

  const handleEndSession = async () => {
    if (!currentSessionId) return;

    try {
      await fetch('/api/journal-sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentSessionId,
          isComplete: true,
          generateSummary: true,
          messages,
        }),
      });

      // Reset for new session
      setCurrentSessionId(null);
      onSessionChange?.(null);
      setMessages([
        {
          role: 'assistant',
          content: "Great session! Ready to start a new one whenever you are.",
        },
      ]);
    } catch (err) {
      console.error('End session error:', err);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      flex: 1,
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 4px 16px rgba(217, 162, 153, 0.12)',
      overflow: 'hidden',
      border: `1px solid ${themeColors.border}`,
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: `1px solid ${themeColors.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${themeColors.primary}08 0%, ${themeColors.secondary}08 100%)`,
        flexShrink: 0,
      }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: themeColors.text, margin: 0 }}>
            Reflective Chat
          </h2>
          <p style={{ fontSize: '13px', color: themeColors.textMuted, margin: '4px 0 0' }}>
            Share your thoughts and I&apos;ll help you reflect
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: '#6B7280',
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={autoPlayTTS}
              onChange={(e) => setAutoPlayTTS(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Voice Replies
          </label>
          {currentSessionId && (
            <button
              onClick={handleEndSession}
              style={{
                padding: '8px 16px',
                background: '#F3F4F6',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#4B5563',
                cursor: 'pointer',
              }}
            >
              End Session
            </button>
          )}
        </div>
      </div>

      {/* Crisis Alert */}
      {showCrisisAlert && (
        <div style={{
          margin: '16px 24px',
          padding: '16px 20px',
          background: '#FEF2F2',
          border: '1px solid #FCA5A5',
          borderRadius: '12px',
        }}>
          <div style={{ fontWeight: '600', color: '#DC2626', marginBottom: '8px' }}>
            We care about your safety
          </div>
          <p style={{ fontSize: '14px', color: '#7F1D1D', margin: '0 0 12px' }}>
            If you&apos;re in crisis, please reach out to these resources:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#991B1B' }}>
            {crisisResources.map((resource, i) => (
              <li key={i} style={{ marginBottom: '4px' }}>{resource}</li>
            ))}
          </ul>
          <button
            onClick={() => setShowCrisisAlert(false)}
            style={{
              marginTop: '12px',
              padding: '6px 12px',
              background: 'white',
              border: '1px solid #FCA5A5',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#DC2626',
              cursor: 'pointer',
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '24px',
        }}
      >
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
              {/* Distortion Badge */}
              {m.distortion && (
                <span style={{
                  fontSize: '11px',
                  color: '#F59E0B',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: '600',
                  background: '#FEF3E7',
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}>
                  <SearchIcon color="#F59E0B" size={12} /> Detected: {m.distortion}
                </span>
              )}

              {/* Message Bubble */}
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
                      boxShadow: '0 2px 8px rgba(217, 162, 153, 0.25)',
                    }
                  : {
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      color: themeColors.text,
                      borderBottomLeftRadius: '4px',
                      border: `1px solid ${themeColors.border}`,
                      boxShadow: '0 2px 8px rgba(217, 162, 153, 0.08)',
                    }),
              }}>
                {m.content}
              </div>

              {/* Mood Indicator */}
              {m.moodIndicators && m.role === 'assistant' && (
                <span style={{
                  fontSize: '11px',
                  color: '#9CA3AF',
                  marginTop: '4px',
                }}>
                  Sensing: {m.moodIndicators.detected}
                </span>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div style={{
                background: 'white',
                padding: '16px 20px',
                borderRadius: '20px',
                borderBottomLeftRadius: '4px',
                border: `1px solid ${themeColors.border}`,
                display: 'flex',
                gap: '6px',
              }}>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      width: '8px',
                      height: '8px',
                      background: themeColors.primary,
                      borderRadius: '50%',
                      animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div style={{
        padding: '16px 24px',
        borderTop: `1px solid ${themeColors.border}`,
        background: '#FAF7F3',
        flexShrink: 0,
      }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <MicrophoneInput
            onTranscript={handleTranscript}
            disabled={isLoading}
          />

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={voiceMode ? 'Voice mode active...' : 'Share your thoughts...'}
            disabled={voiceMode}
            style={{
              flex: 1,
              padding: '14px 20px',
              border: `1px solid ${themeColors.border}`,
              borderRadius: '999px',
              fontSize: '15px',
              outline: 'none',
              background: voiceMode ? '#F0E4D3' : 'white',
              opacity: voiceMode ? 0.6 : 1,
              color: themeColors.text,
            }}
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            style={{
              width: '48px',
              height: '48px',
              background:
                input.trim() && !isLoading
                  ? `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryDark} 100%)`
                  : themeColors.border,
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: input.trim() && !isLoading ? '0 4px 12px rgba(217, 162, 153, 0.35)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <SendIcon size={18} />
          </button>
        </form>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '12px',
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: '#9CA3AF',
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={voiceMode}
              onChange={(e) => setVoiceMode(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Voice-only mode (auto-send transcripts)
          </label>
        </div>
      </div>

      {/* Hidden audio element for TTS */}
      <audio ref={audioRef} style={{ display: 'none' }} />

      <style jsx>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
