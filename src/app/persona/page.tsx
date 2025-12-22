'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import PersonaList from './components/PersonaList';
import PersonaCreator from './components/PersonaCreator';
import PersonaChat from './components/PersonaChat';
import ConversationHistory from './components/ConversationHistory';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { ROLEPLAY_SCENARIOS, PERSONA_TEMPLATES, Scenario } from './scenarios';

interface Persona {
  id: string;
  name: string;
  type: 'preset' | 'custom';
  description: string;
  icon: string;
  voiceId?: string;
  voiceStability?: number;
  voiceSimilarity?: number;
  voiceStyle?: number;
  voiceSpeakerBoost?: boolean;
  speechRate?: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

interface ConversationData {
  id: string;
  personaId: string;
  personaName: string;
  personaIcon: string;
  messages: ChatMessage[];
}

const DEFAULT_PERSONAS: Persona[] = [
  { id: 'p1', name: 'Calm Mentor', type: 'preset', description: 'A patient and understanding guide who helps you stay grounded.', icon: '🧘' },
  { id: 'p2', name: 'Supportive Friend', type: 'preset', description: 'An empathetic listener who validates your feelings.', icon: '💚' },
  { id: 'p3', name: 'Difficult Boss', type: 'preset', description: 'Practice handling challenging workplace conversations.', icon: '💼' },
  { id: 'p4', name: 'Anxious Client', type: 'preset', description: 'Learn to de-escalate and reassure worried individuals.', icon: '😰' },
];

type ViewMode = 'preview' | 'chat' | 'create' | 'edit' | 'history' | 'analytics' | 'scenarios';

export default function PersonaPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [personas, setPersonas] = useState<Persona[]>(DEFAULT_PERSONAS);
  const [activePersonaId, setActivePersonaId] = useState<string>('p1');
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [profilePic, setProfilePic] = useState<string>();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const selectedPersona = personas.find(p => p.id === activePersonaId);

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
        const customPersonas = (data.personas || []).map((p: Persona) => ({
          ...p,
          type: 'custom' as const,
        }));
        setPersonas([...DEFAULT_PERSONAS, ...customPersonas]);
      }
    } catch (error) {
      console.error('Failed to fetch personas:', error);
    }
  };

  const handleCreatePersona = async (personaData: {
    name: string;
    description: string;
    icon: string;
    voiceId?: string;
    voiceStability?: number;
    voiceSimilarity?: number;
    voiceStyle?: number;
    voiceSpeakerBoost?: boolean;
    speechRate?: number;
  }) => {
    const res = await fetch('/api/personas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(personaData),
    });

    if (res.ok) {
      const data = await res.json();
      const newPersona: Persona = { ...data.persona, type: 'custom' };
      setPersonas(prev => [...prev, newPersona]);
      setActivePersonaId(newPersona.id);
      setViewMode('preview');
    }
  };

  const handleEditPersona = async (personaData: {
    id?: string;
    name: string;
    description: string;
    icon: string;
    voiceId?: string;
    voiceStability?: number;
    voiceSimilarity?: number;
    voiceStyle?: number;
    voiceSpeakerBoost?: boolean;
    speechRate?: number;
  }) => {
    if (!personaData.id) return;

    const res = await fetch('/api/personas', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(personaData),
    });

    if (res.ok) {
      const data = await res.json();
      setPersonas(prev =>
        prev.map(p => p.id === personaData.id ? { ...data.persona, type: 'custom' as const } : p)
      );
      setEditingPersona(null);
      setViewMode('preview');
    }
  };

  const handleDeletePersona = async (personaId: string) => {
    const res = await fetch(`/api/personas?id=${personaId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setPersonas(prev => prev.filter(p => p.id !== personaId));
      if (activePersonaId === personaId) {
        setActivePersonaId('p1');
      }
      setDeleteConfirmId(null);
    }
  };

  const handleStartChat = () => {
    setCurrentConversationId(null);
    setActiveScenario(null);
    setViewMode('chat');
  };

  const handleEndChat = () => {
    setViewMode('preview');
    setCurrentConversationId(null);
    setActiveScenario(null);
  };

  const handleSaveConversation = useCallback(async (messages: ChatMessage[]) => {
    if (!selectedPersona || messages.length < 2) return;

    try {
      if (currentConversationId) {
        // Update existing conversation
        await fetch('/api/persona-conversations', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: currentConversationId,
            messages,
          }),
        });
      } else {
        // Create new conversation
        const res = await fetch('/api/persona-conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personaId: selectedPersona.id,
            personaName: selectedPersona.name,
            personaIcon: selectedPersona.icon,
            messages,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setCurrentConversationId(data.conversation.id);
        }
      }
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  }, [selectedPersona, currentConversationId]);

  const handleLoadConversation = (conversation: ConversationData) => {
    // Find or set the persona
    const persona = personas.find(p => p.id === conversation.personaId);
    if (persona) {
      setActivePersonaId(persona.id);
    }
    setCurrentConversationId(conversation.id);
    setViewMode('chat');
  };

  const handleStartScenario = (scenario: Scenario) => {
    // Find best matching persona for scenario
    const matchingPersona = personas.find(p =>
      p.name.toLowerCase().includes(scenario.personaHint?.toLowerCase() || '')
    );
    if (matchingPersona) {
      setActivePersonaId(matchingPersona.id);
    }
    setActiveScenario(scenario);
    setViewMode('chat');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const openEditMode = (persona: Persona) => {
    setEditingPersona(persona);
    setViewMode('edit');
  };

  const confirmDelete = (personaId: string) => {
    setDeleteConfirmId(personaId);
  };

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #E5E7EB', borderTop: '4px solid #7C3AED', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <div style={{ color: '#6B7280' }}>Loading...</div>
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

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Navbar
        isAuthenticated={true}
        userName={user.name || 'User'}
        userEmail={user.email}
        profilePic={profilePic}
        onProfilePicChange={setProfilePic}
        onLogout={handleLogout}
        currentPage="/persona"
      />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
              🎭 Persona Studio
            </h1>
            <p style={{ color: '#6B7280' }}>Practice conversations with AI personas or create your own.</p>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setViewMode('scenarios')}
              style={{
                padding: '10px 16px',
                background: viewMode === 'scenarios' ? '#7C3AED' : 'white',
                color: viewMode === 'scenarios' ? 'white' : '#4B5563',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                fontWeight: '500',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🎯 Scenarios
            </button>
            <button
              onClick={() => setViewMode('history')}
              style={{
                padding: '10px 16px',
                background: viewMode === 'history' ? '#7C3AED' : 'white',
                color: viewMode === 'history' ? 'white' : '#4B5563',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                fontWeight: '500',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              📚 History
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              style={{
                padding: '10px 16px',
                background: viewMode === 'analytics' ? '#7C3AED' : 'white',
                color: viewMode === 'analytics' ? 'white' : '#4B5563',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                fontWeight: '500',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              📊 Analytics
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                Delete Persona?
              </h3>
              <p style={{ color: '#6B7280', marginBottom: '20px' }}>
                This will permanently delete this persona and cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  style={{
                    padding: '10px 20px',
                    background: '#F3F4F6',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeletePersona(deleteConfirmId)}
                  style={{
                    padding: '10px 20px',
                    background: '#EF4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: viewMode === 'chat' ? '280px 1fr' : '1fr 1fr',
          gap: '24px'
        }}>
          {/* Left Column - Persona List */}
          <div>
            <PersonaList
              personas={personas}
              activePersonaId={activePersonaId}
              onSelect={(id) => {
                setActivePersonaId(id);
                if (viewMode !== 'chat') setViewMode('preview');
              }}
              onCreateNew={() => setViewMode('create')}
              onEdit={openEditMode}
              onDelete={confirmDelete}
              isCompact={viewMode === 'chat'}
              disabled={viewMode === 'chat'}
            />

            {/* Persona Templates Section */}
            {viewMode !== 'chat' && (
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#6B7280', marginBottom: '12px' }}>
                  💡 Quick Templates
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {PERSONA_TEMPLATES.map((template) => (
                    <button
                      key={template.name}
                      onClick={() => {
                        setViewMode('create');
                        // The PersonaCreator will handle using the template
                      }}
                      style={{
                        padding: '8px 12px',
                        background: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {template.icon} {template.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Main Panel */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            border: '1px solid #E5E7EB',
            minHeight: '500px',
            overflow: 'hidden'
          }}>
            {viewMode === 'chat' && selectedPersona ? (
              <PersonaChat
                persona={selectedPersona}
                onEndChat={handleEndChat}
                onSaveConversation={handleSaveConversation}
              />
            ) : viewMode === 'create' ? (
              <div style={{ padding: '32px' }}>
                <PersonaCreator
                  onSave={handleCreatePersona}
                  onCancel={() => setViewMode('preview')}
                />
              </div>
            ) : viewMode === 'edit' && editingPersona ? (
              <div style={{ padding: '32px' }}>
                <PersonaCreator
                  editingPersona={editingPersona}
                  onSave={handleEditPersona}
                  onCancel={() => {
                    setEditingPersona(null);
                    setViewMode('preview');
                  }}
                />
              </div>
            ) : viewMode === 'history' ? (
              <ConversationHistory
                onLoadConversation={handleLoadConversation}
                onClose={() => setViewMode('preview')}
              />
            ) : viewMode === 'analytics' ? (
              <AnalyticsDashboard
                onClose={() => setViewMode('preview')}
              />
            ) : viewMode === 'scenarios' ? (
              <div style={{ padding: '24px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ fontWeight: '600', color: '#1F2937' }}>
                    🎯 Practice Scenarios
                  </h3>
                  <button
                    onClick={() => setViewMode('preview')}
                    style={{
                      width: '32px',
                      height: '32px',
                      background: '#F3F4F6',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '18px'
                    }}
                  >
                    ×
                  </button>
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {ROLEPLAY_SCENARIOS.map((scenario) => (
                    <div
                      key={scenario.id}
                      style={{
                        padding: '16px',
                        background: '#F9FAFB',
                        borderRadius: '12px',
                        border: '1px solid #E5E7EB'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <span style={{ fontSize: '28px' }}>{scenario.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '4px'
                          }}>
                            <span style={{ fontWeight: '600', color: '#1F2937' }}>
                              {scenario.name}
                            </span>
                            <span style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: scenario.difficulty === 'easy' ? '#D1FAE5' :
                                scenario.difficulty === 'medium' ? '#FEF3C7' : '#FEE2E2',
                              color: scenario.difficulty === 'easy' ? '#065F46' :
                                scenario.difficulty === 'medium' ? '#92400E' : '#991B1B'
                            }}>
                              {scenario.difficulty}
                            </span>
                          </div>
                          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>
                            {scenario.description}
                          </p>
                          <button
                            onClick={() => handleStartScenario(scenario)}
                            style={{
                              padding: '8px 16px',
                              background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            Start Practice
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Persona Preview
              <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  background: '#ECFDF5',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  marginBottom: '24px'
                }}>
                  {selectedPersona?.icon}
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#1F2937', marginBottom: '8px' }}>
                  {selectedPersona?.name}
                </h3>
                <p style={{
                  color: '#6B7280',
                  marginBottom: '24px',
                  maxWidth: '320px',
                  lineHeight: '1.5'
                }}>
                  {selectedPersona?.description}
                </p>
                {selectedPersona?.type === 'custom' && (
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '24px'
                  }}>
                    <button
                      onClick={() => openEditMode(selectedPersona)}
                      style={{
                        padding: '10px 20px',
                        background: '#F3F4F6',
                        color: '#4B5563',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      ✏️ Edit
                    </button>
                  </div>
                )}
                <button
                  onClick={handleStartChat}
                  style={{
                    padding: '16px 40px',
                    background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '14px',
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)'
                  }}
                >
                  Start Conversation
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
