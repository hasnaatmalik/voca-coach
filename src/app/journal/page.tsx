'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  distortion?: string;
}

export default function JournalPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello 👋 I'm here to listen and help you reflect. What's on your mind today?" }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/journal-insight', {
        method: 'POST',
        body: JSON.stringify({ message: userMsg, context: messages.slice(-3) }),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.socraticPrompt,
        distortion: data.distortion
      }]);
    } catch {
      // Fallback response if API fails
      const fallbackResponses = [
        "That's interesting. Can you tell me more about what led you to feel this way?",
        "I hear you. What do you think might be underlying these feelings?",
        "Thank you for sharing. How does this situation make you feel about yourself?",
        "That sounds challenging. What would you tell a friend in the same situation?"
      ];
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FDF8F3', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #E5E7EB',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: '#10B981',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '18px' }}>🎙️</span>
          </div>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>Voca-Coach</span>
        </Link>

        <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937' }}>📓 Socratic Journal</h1>

        <Link href="/dashboard" style={{
          padding: '10px 20px',
          background: '#F3F4F6',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#4B5563'
        }}>Exit</Link>
      </header>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '24px',
          maxWidth: '700px',
          width: '100%',
          margin: '0 auto'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: m.role === 'user' ? 'flex-end' : 'flex-start'
            }}>
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
                  borderRadius: '4px'
                }}>
                  🔍 Detected: {m.distortion}
                </span>
              )}
              <div style={{
                maxWidth: '80%',
                padding: '16px 20px',
                borderRadius: '20px',
                fontSize: '15px',
                lineHeight: '1.6',
                ...(m.role === 'user' ? {
                  background: '#10B981',
                  color: 'white',
                  borderBottomRightRadius: '4px'
                } : {
                  background: 'white',
                  color: '#1F2937',
                  borderBottomLeftRadius: '4px',
                  border: '1px solid #E5E7EB'
                })
              }}>
                {m.content}
              </div>
            </div>
          ))}
          
          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div style={{
                background: 'white',
                padding: '16px 20px',
                borderRadius: '20px',
                borderBottomLeftRadius: '4px',
                border: '1px solid #E5E7EB',
                display: 'flex',
                gap: '6px'
              }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: '8px',
                    height: '8px',
                    background: '#10B981',
                    borderRadius: '50%',
                    animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`
                  }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div style={{
        background: 'white',
        borderTop: '1px solid #E5E7EB',
        padding: '20px 24px'
      }}>
        <form onSubmit={handleSubmit} style={{
          maxWidth: '700px',
          margin: '0 auto',
          display: 'flex',
          gap: '12px'
        }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share your thoughts..."
            autoFocus
            style={{
              flex: 1,
              padding: '16px 20px',
              border: '1px solid #E5E7EB',
              borderRadius: '999px',
              fontSize: '15px',
              outline: 'none',
              background: '#F9FAFB'
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            style={{
              width: '52px',
              height: '52px',
              background: input.trim() && !loading ? '#10B981' : '#E5E7EB',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}
          >
            →
          </button>
        </form>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
