'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface Persona {
  id: string;
  name: string;
  type: 'preset' | 'custom';
  description: string;
  icon: string;
  voiceId?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const DEFAULT_PERSONAS: Persona[] = [
  { id: 'p1', name: 'Calm Mentor', type: 'preset', description: 'A patient and understanding guide who helps you stay grounded.', icon: '🧘' },
  { id: 'p2', name: 'Supportive Friend', type: 'preset', description: 'An empathetic listener who validates your feelings.', icon: '💚' },
  { id: 'p3', name: 'Difficult Boss', type: 'preset', description: 'Practice handling challenging workplace conversations.', icon: '💼' },
  { id: 'p4', name: 'Anxious Client', type: 'preset', description: 'Learn to de-escalate and reassure worried individuals.', icon: '😰' },
];

export default function PersonaPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [personas, setPersonas] = useState<Persona[]>(DEFAULT_PERSONAS);
  const [activePersona, setActivePersona] = useState<string>('p1');
  const [isCreating, setIsCreating] = useState(false);
  const [newPersonaName, setNewPersonaName] = useState('');
  const [newPersonaDesc, setNewPersonaDesc] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchCustomPersonas();
    }
  }, [user]);

  const fetchCustomPersonas = async () => {
    try {
      const res = await fetch('/api/personas');
      if (res.ok) {
        const data = await res.json();
        const customPersonas = (data.personas || []).map((p: { id: string; name: string; description: string; icon: string; voiceId?: string }) => ({
          ...p,
          type: 'custom' as const,
        }));
        setPersonas([...DEFAULT_PERSONAS, ...customPersonas]);
      }
    } catch (error) {
      console.error('Failed to fetch personas:', error);
    }
  };

  const createPersona = async () => {
    if (!newPersonaName.trim() || !newPersonaDesc.trim()) return;
    
    try {
      const res = await fetch('/api/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPersonaName,
          description: newPersonaDesc,
          icon: '✨',
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        const newPersona: Persona = {
          ...data.persona,
          type: 'custom',
        };
        setPersonas([...personas, newPersona]);
        setActivePersona(newPersona.id);
        setIsCreating(false);
        setNewPersonaName('');
        setNewPersonaDesc('');
      }
    } catch (error) {
      console.error('Failed to create persona:', error);
    }
  };

  const startConversation = () => {
    setIsChatting(true);
    setChatMessages([{
      role: 'assistant',
      content: `Hello! I'm ${selectedPersona?.name}. ${selectedPersona?.description} How can I help you today?`
    }]);
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || isSending) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsSending(true);

    try {
      const res = await fetch('/api/persona-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          personaId: activePersona,
          conversationHistory: chatMessages.slice(-6),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMessage = data.response;
        setChatMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
        
        // Play TTS
        await playTTS(assistantMessage);
      }
    } catch (error) {
      console.error('Chat failed:', error);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I'm having trouble responding right now. Let's try again."
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const playTTS = async (text: string) => {
    try {
      setIsPlaying(true);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId: selectedPersona?.voiceId }),
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
    } finally {
      setIsPlaying(false);
    }
  };

  const endConversation = () => {
    setIsChatting(false);
    setChatMessages([]);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const selectedPersona = personas.find(p => p.id === activePersona);

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FDF8F3' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>🎙️</div>
          <div style={{ color: '#6B7280' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FDF8F3' }}>
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
      
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

        <Link href="/dashboard" style={{
          padding: '10px 20px',
          background: '#F3F4F6',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#4B5563'
        }}>Back to Dashboard</Link>
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

        <div style={{ display: 'grid', gridTemplateColumns: isChatting ? '300px 1fr' : '1fr 1fr', gap: '32px' }}>
          {/* Persona List */}
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', marginBottom: '16px' }}>Available Personas</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {personas.map(p => (
                <div
                  key={p.id}
                  onClick={() => !isChatting && setActivePersona(p.id)}
                  style={{
                    background: activePersona === p.id ? '#ECFDF5' : 'white',
                    border: activePersona === p.id ? '2px solid #10B981' : '1px solid #E5E7EB',
                    borderRadius: '16px',
                    padding: isChatting ? '12px' : '20px',
                    cursor: isChatting ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    opacity: isChatting && activePersona !== p.id ? 0.5 : 1,
                  }}
                >
                  <div style={{
                    width: isChatting ? '36px' : '48px',
                    height: isChatting ? '36px' : '48px',
                    background: activePersona === p.id ? '#10B981' : '#F3F4F6',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isChatting ? '18px' : '24px'
                  }}>{p.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#1F2937', fontSize: isChatting ? '14px' : '16px' }}>{p.name}</div>
                    {!isChatting && <div style={{ fontSize: '13px', color: '#6B7280' }}>{p.description}</div>}
                  </div>
                </div>
              ))}

              {/* Create New Button */}
              {!isChatting && (
                <button
                  onClick={() => setIsCreating(true)}
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
                  Create Custom Persona
                </button>
              )}
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
          }}>
            {isChatting ? (
              // Chat Interface
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', padding: '20px 20px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>{selectedPersona?.icon}</span>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1F2937' }}>{selectedPersona?.name}</div>
                      {isPlaying && <span style={{ fontSize: '12px', color: '#10B981' }}>🔊 Speaking...</span>}
                    </div>
                  </div>
                  <button onClick={endConversation} style={{
                    padding: '8px 16px',
                    background: '#FEF2F2',
                    color: '#EF4444',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                    End Chat
                  </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px', padding: '0 20px' }}>
                  {chatMessages.map((msg, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        maxWidth: '80%',
                        padding: '12px 16px',
                        borderRadius: '16px',
                        background: msg.role === 'user' ? '#10B981' : '#F3F4F6',
                        color: msg.role === 'user' ? 'white' : '#1F2937',
                        fontSize: '14px',
                        lineHeight: '1.5'
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isSending && (
                    <div style={{ display: 'flex', gap: '6px', padding: '12px' }}>
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
                  )}
                </div>

                <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} style={{ display: 'flex', gap: '12px', padding: '0 20px 20px' }}>
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message..."
                    style={{
                      flex: 1,
                      padding: '14px 18px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  <button type="submit" disabled={!chatInput.trim() || isSending} style={{
                    padding: '14px 24px',
                    background: chatInput.trim() && !isSending ? '#10B981' : '#E5E7EB',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: chatInput.trim() && !isSending ? 'pointer' : 'not-allowed'
                  }}>
                    Send
                  </button>
                </form>
              </>
            ) : isCreating ? (
              // Create Persona Form
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937', marginBottom: '24px' }}>
                  ✨ Create Custom Persona
                </h3>
                <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                  <input
                    value={newPersonaName}
                    onChange={(e) => setNewPersonaName(e.target.value)}
                    placeholder="Persona name"
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      fontSize: '15px',
                      marginBottom: '12px',
                      outline: 'none'
                    }}
                  />
                  <textarea
                    value={newPersonaDesc}
                    onChange={(e) => setNewPersonaDesc(e.target.value)}
                    placeholder="Describe this persona's personality and how they should interact..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      fontSize: '15px',
                      marginBottom: '20px',
                      outline: 'none',
                      resize: 'none'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button onClick={() => setIsCreating(false)} style={{
                      padding: '14px 28px',
                      background: '#F3F4F6',
                      color: '#4B5563',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}>
                      Cancel
                    </button>
                    <button onClick={createPersona} disabled={!newPersonaName.trim() || !newPersonaDesc.trim()} style={{
                      padding: '14px 28px',
                      background: newPersonaName.trim() && newPersonaDesc.trim() ? '#10B981' : '#E5E7EB',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      cursor: newPersonaName.trim() && newPersonaDesc.trim() ? 'pointer' : 'not-allowed'
                    }}>
                      Create Persona
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Persona Preview
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
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
                <button onClick={startConversation} style={{
                  padding: '14px 32px',
                  background: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '15px',
                  cursor: 'pointer'
                }}>
                  Start Conversation
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
