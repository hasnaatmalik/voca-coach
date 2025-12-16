'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Persona {
  id: string;
  name: string;
  type: 'preset' | 'custom';
  description: string;
  icon: string;
}

const PERSONAS: Persona[] = [
  { id: 'p1', name: 'Calm Mentor', type: 'preset', description: 'A patient and understanding guide who helps you stay grounded.', icon: '🧘' },
  { id: 'p2', name: 'Supportive Friend', type: 'preset', description: 'An empathetic listener who validates your feelings.', icon: '💚' },
  { id: 'p3', name: 'Difficult Boss', type: 'preset', description: 'Practice handling challenging workplace conversations.', icon: '💼' },
  { id: 'p4', name: 'Anxious Client', type: 'preset', description: 'Learn to de-escalate and reassure worried individuals.', icon: '😰' },
];

export default function PersonaPage() {
  const [personas, setPersonas] = useState<Persona[]>(PERSONAS);
  const [activePersona, setActivePersona] = useState<string>('p1');
  const [isCreating, setIsCreating] = useState(false);
  const [recordingStep, setRecordingStep] = useState<'idle' | 'recording' | 'processing' | 'done'>('idle');

  // Chat State
  const [isChatting, setIsChatting] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const startCloneProcess = () => {
    setIsCreating(true);
    setRecordingStep('idle');
    setIsChatting(false);
  };

  const handleStartRecord = () => {
    setRecordingStep('recording');
  };

  const handleStopRecord = () => {
    setRecordingStep('processing');
    setTimeout(() => {
      const newPersona: Persona = {
        id: `c-${Date.now()}`,
        name: 'My Custom Voice',
        type: 'custom',
        description: 'Your personalized voice persona.',
        icon: '✨'
      };
      setPersonas([...personas, newPersona]);
      setActivePersona(newPersona.id);
      setRecordingStep('done');
      setTimeout(() => setIsCreating(false), 1500);
    }, 2500);
  };

  const selectedPersona = personas.find(p => p.id === activePersona);

  const startConversation = () => {
    setIsChatting(true);
    setChatMessages([]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          personaContext: selectedPersona?.description || 'A friendly assistant'
        })
      });

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setChatMessages(prev => [...prev, { role: 'model', text: data.text }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting right now. Let's try again?" }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FDF8F3' }}>
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

        <nav style={{ display: 'flex', gap: '24px' }}>
          {[
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/de-escalation', label: 'De-escalation' },
            { href: '/biomarkers', label: 'Biomarkers' },
            { href: '/journal', label: 'Journal' },
            { href: '/persona', label: 'Persona', active: true }
          ].map(item => (
            <Link key={item.href} href={item.href} style={{
              fontSize: '14px',
              fontWeight: '500',
              color: item.active ? '#10B981' : '#6B7280',
              padding: '8px 0',
              borderBottom: item.active ? '2px solid #10B981' : 'none'
            }}>
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/" style={{
          padding: '10px 20px',
          background: '#F3F4F6',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#4B5563'
        }}>Back to Home</Link>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
            🎭 Persona Studio
          </h1>
          <p style={{ color: '#6B7280' }}>Practice conversations with AI personas or create your own.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Persona List */}
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', marginBottom: '16px' }}>Available Personas</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {personas.map(p => (
                <div
                  key={p.id}
                  onClick={() => { setActivePersona(p.id); setIsChatting(false); }}
                  style={{
                    background: activePersona === p.id ? '#ECFDF5' : 'white',
                    border: activePersona === p.id ? '2px solid #10B981' : '1px solid #E5E7EB',
                    borderRadius: '16px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: activePersona === p.id ? '#10B981' : '#F3F4F6',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>{p.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#1F2937', marginBottom: '4px' }}>{p.name}</div>
                    <div style={{ fontSize: '13px', color: '#6B7280' }}>{p.description}</div>
                  </div>
                  {activePersona === p.id && (
                    <div style={{
                      width: '24px',
                      height: '24px',
                      background: '#10B981',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px'
                    }}>✓</div>
                  )}
                </div>
              ))}

              {/* Create New Button */}
              <button
                onClick={startCloneProcess}
                disabled={isCreating}
                style={{
                  background: 'transparent',
                  border: '2px dashed #D1D5DB',
                  borderRadius: '16px',
                  padding: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: '#6B7280',
                  fontWeight: '500',
                  fontSize: '15px'
                }}
              >
                <span style={{ fontSize: '20px' }}>+</span>
                Clone Your Voice
              </button>
            </div>
          </div>

          {/* Main Panel */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: isChatting ? '0' : '32px',
            border: '1px solid #E5E7EB',
            minHeight: '400px',
            height: isChatting ? '500px' : 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isChatting ? 'stretch' : 'center',
            justifyContent: isChatting ? 'flex-start' : 'center',
            overflow: 'hidden'
          }}>
            {!isCreating && !isChatting && (
              <>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: '#ECFDF5',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                  marginBottom: '20px'
                }}>
                  {selectedPersona?.icon}
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '600', color: '#1F2937', marginBottom: '8px' }}>
                  {selectedPersona?.name}
                </h3>
                <p style={{ color: '#6B7280', textAlign: 'center', marginBottom: '24px', maxWidth: '280px' }}>
                  {selectedPersona?.description}
                </p>
                <button
                  onClick={startConversation}
                  style={{
                    padding: '14px 32px',
                    background: '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '15px',
                    cursor: 'pointer'
                  }}
                >
                  Start Conversation
                </button>
              </>
            )}

            {!isCreating && isChatting && (
              <>
                {/* Chat Header */}
                <div style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'white'
                }}>
                  <button
                    onClick={() => setIsChatting(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                  >
                    ←
                  </button>
                  <div style={{ fontSize: '16px', fontWeight: '600' }}>{selectedPersona?.name}</div>
                  <div style={{ flex: 1 }} />
                  <div style={{ fontSize: '20px' }}>{selectedPersona?.icon}</div>
                </div>

                {/* Messages */}
                <div
                  ref={chatScrollRef}
                  style={{
                    flex: 1,
                    padding: '20px',
                    overflowY: 'auto',
                    background: '#F9FAFB',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  {chatMessages.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#9CA3AF', marginTop: '40px', fontSize: '14px' }}>
                      Start the conversation...
                    </div>
                  )}

                  {chatMessages.map((msg, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                    }}>
                      <div style={{
                        maxWidth: '80%',
                        padding: '12px 16px',
                        borderRadius: '16px',
                        borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                        borderBottomLeftRadius: msg.role === 'model' ? '4px' : '16px',
                        background: msg.role === 'user' ? '#10B981' : 'white',
                        color: msg.role === 'user' ? 'white' : '#1F2937',
                        border: msg.role === 'model' ? '1px solid #E5E7EB' : 'none',
                        fontSize: '14px',
                        lineHeight: '1.5'
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {chatLoading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <div style={{
                        padding: '12px 16px',
                        background: 'white',
                        borderRadius: '16px',
                        borderBottomLeftRadius: '4px',
                        border: '1px solid #E5E7EB'
                      }}>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>Typing...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} style={{
                  padding: '16px',
                  borderTop: '1px solid #E5E7EB',
                  background: 'white',
                  display: 'flex',
                  gap: '10px'
                }}>
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message..."
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '24px',
                      border: '1px solid #E5E7EB',
                      outline: 'none',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || chatLoading}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: '#10B981',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ➤
                  </button>
                </form>
              </>
            )}

            {isCreating && (
              <div style={{ width: '100%', textAlign: 'center', padding: '32px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937', marginBottom: '24px' }}>
                  🎙️ Voice Cloning
                </h3>

                {recordingStep === 'idle' && (
                  <>
                    <p style={{ color: '#6B7280', marginBottom: '20px' }}>Please read the following sentence clearly:</p>
                    <div style={{
                      background: '#F9FAFB',
                      padding: '20px',
                      borderRadius: '12px',
                      marginBottom: '24px',
                      borderLeft: '4px solid #10B981'
                    }}>
                      <p style={{ fontStyle: 'italic', color: '#4B5563', lineHeight: '1.6' }}>
                        "I am calm, grounded, and ready to face whatever comes my way with patience and understanding."
                      </p>
                    </div>
                    <button onClick={handleStartRecord} style={{
                      padding: '14px 32px',
                      background: '#10B981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}>
                      Start Recording
                    </button>
                    <button onClick={() => setIsCreating(false)} style={{ marginTop: '16px', background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer' }}>Cancel</button>
                  </>
                )}

                {recordingStep === 'recording' && (
                  <>
                    <div style={{
                      width: '100px',
                      height: '100px',
                      background: '#FEF2F2',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }}>
                      <span style={{ fontSize: '40px' }}>🔴</span>
                    </div>
                    <p style={{ color: '#EF4444', fontWeight: '600', marginBottom: '20px' }}>Recording...</p>
                    <button onClick={handleStopRecord} style={{
                      padding: '14px 32px',
                      background: '#EF4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}>
                      Stop Recording
                    </button>
                  </>
                )}

                {recordingStep === 'processing' && (
                  <>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      border: '4px solid #E5E7EB',
                      borderTopColor: '#10B981',
                      borderRadius: '50%',
                      margin: '0 auto 20px',
                      animation: 'spin 1s linear infinite'
                    }} />
                    <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', marginBottom: '8px' }}>
                      Processing Voice...
                    </h4>
                    <p style={{ color: '#6B7280' }}>Analyzing pitch, timbre, and cadence.</p>
                  </>
                )}

                {recordingStep === 'done' && (
                  <>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: '#ECFDF5',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px'
                    }}>
                      <span style={{ fontSize: '36px' }}>✅</span>
                    </div>
                    <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937' }}>
                      Voice Clone Created!
                    </h4>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
