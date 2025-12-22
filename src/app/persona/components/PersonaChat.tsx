'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import MicrophoneInput from './MicrophoneInput';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

interface Persona {
  id: string;
  name: string;
  icon: string;
  voiceId?: string;
  voiceStability?: number;
  voiceSimilarity?: number;
  voiceStyle?: number;
  voiceSpeakerBoost?: boolean;
  speechRate?: number;
}

interface PersonaChatProps {
  persona: Persona;
  onEndChat: () => void;
  onSaveConversation?: (messages: ChatMessage[]) => void;
}

export default function PersonaChat({ persona, onEndChat, onSaveConversation }: PersonaChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize conversation
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      role: 'assistant',
      content: `Hello! I'm ${persona.name}. How can I help you today?`,
      timestamp: Date.now()
    };
    setMessages([welcomeMessage]);
  }, [persona.name]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save conversation on message change
  useEffect(() => {
    if (onSaveConversation && messages.length > 1) {
      onSaveConversation(messages);
    }
  }, [messages, onSaveConversation]);

  const playTTS = useCallback(async (text: string) => {
    if (!autoPlay) return;

    try {
      setIsPlaying(true);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceId: persona.voiceId,
          voiceStability: persona.voiceStability,
          voiceSimilarity: persona.voiceSimilarity,
          voiceStyle: persona.voiceStyle,
          voiceSpeakerBoost: persona.voiceSpeakerBoost,
          speechRate: persona.speechRate
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
    } catch (error) {
      console.error('TTS failed:', error);
    }
  }, [autoPlay, persona]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isSending) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: messageText.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/persona-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          personaId: persona.id,
          conversationHistory: messages.slice(-6),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, assistantMessage]);
        await playTTS(data.response);
      }
    } catch (error) {
      console.error('Chat failed:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Let's try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleTranscript = (text: string) => {
    if (voiceMode) {
      // In voice mode, send immediately
      sendMessage(text);
    } else {
      // In normal mode, just fill the input
      setInput(text);
      inputRef.current?.focus();
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
    // In voice mode, could auto-start recording here
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <audio ref={audioRef} onEnded={handleAudioEnd} style={{ display: 'none' }} />

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid #E5E7EB'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>{persona.icon}</span>
          <div>
            <div style={{ fontWeight: '600', color: '#1F2937' }}>{persona.name}</div>
            {isPlaying && (
              <span style={{ fontSize: '12px', color: '#7C3AED' }}>
                🔊 Speaking...
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Voice Mode Toggle */}
          <button
            onClick={() => setVoiceMode(!voiceMode)}
            style={{
              padding: '8px 12px',
              background: voiceMode ? '#7C3AED' : '#F3F4F6',
              color: voiceMode ? 'white' : '#4B5563',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            🎤 {voiceMode ? 'Voice Mode' : 'Type Mode'}
          </button>

          {/* Auto-play Toggle */}
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            title={autoPlay ? 'Disable auto-play' : 'Enable auto-play'}
            style={{
              width: '36px',
              height: '36px',
              background: autoPlay ? '#ECFDF5' : '#F3F4F6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            {autoPlay ? '🔊' : '🔇'}
          </button>

          {/* End Chat */}
          <button
            onClick={onEndChat}
            style={{
              padding: '8px 16px',
              background: '#FEF2F2',
              color: '#EF4444',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            End Chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px'
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '12px'
            }}
          >
            <div style={{
              maxWidth: '80%',
              padding: '12px 16px',
              borderRadius: '16px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)'
                : '#F3F4F6',
              color: msg.role === 'user' ? 'white' : '#1F2937',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isSending && (
          <div style={{ display: 'flex', gap: '6px', padding: '12px' }}>
            {[0, 1, 2].map(i => (
              <span
                key={i}
                style={{
                  width: '8px',
                  height: '8px',
                  background: '#7C3AED',
                  borderRadius: '50%',
                  animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`
                }}
              />
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: '12px',
          padding: '16px 20px',
          borderTop: '1px solid #E5E7EB',
          alignItems: 'center'
        }}
      >
        <MicrophoneInput
          onTranscript={handleTranscript}
          disabled={isSending}
        />

        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={voiceMode ? "Voice mode active - speak to chat" : "Type a message..."}
          disabled={voiceMode}
          style={{
            flex: 1,
            padding: '14px 18px',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            fontSize: '14px',
            outline: 'none',
            opacity: voiceMode ? 0.5 : 1
          }}
        />

        <button
          type="submit"
          disabled={!input.trim() || isSending || voiceMode}
          style={{
            padding: '14px 24px',
            background: input.trim() && !isSending && !voiceMode
              ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)'
              : '#E5E7EB',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: input.trim() && !isSending && !voiceMode ? 'pointer' : 'not-allowed'
          }}
        >
          Send
        </button>
      </form>

      <style jsx>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
