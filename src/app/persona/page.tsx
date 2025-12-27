'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import {
  PersonaHero,
  PersonaGrid,
  PersonaPreviewCard,
  ScenarioGrid,
  QuickActionsBar,
  DeleteModal,
  TemplatesCard,
  ContentWrapper,
} from '@/components/persona/bento';
import PersonaCreator from './components/PersonaCreator';
import PersonaChat from './components/PersonaChat';
import ConversationHistory from './components/ConversationHistory';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { ROLEPLAY_SCENARIOS, PERSONA_TEMPLATES, Scenario, Template } from './scenarios';

// SVG Icon Components for ContentWrapper
const SparklesIcon = ({ color = '#D9A299', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const PencilIcon = ({ color = '#E4B17A', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const BookIcon = ({ color = '#7AAFC9', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const ChartIcon = ({ color = '#7AB89E', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

// Theme colors for icons
const iconTheme = {
  primary: '#D9A299',
  primaryDark: '#C08B82',
  success: '#7AB89E',
  warning: '#E4B17A',
  muted: '#6B6B6B',
};

// SVG Icons for DEFAULT_PERSONAS
const MeditationIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={iconTheme.primaryDark} strokeWidth="1.5">
    <circle cx="12" cy="6" r="3" />
    <path d="M12 9v4" />
    <path d="M8 17.5c0-2.5 1.79-4.5 4-4.5s4 2 4 4.5" />
    <path d="M6 20c0-1.5.5-3 2-4" />
    <path d="M18 20c0-1.5-.5-3-2-4" />
  </svg>
);

const HeartIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={iconTheme.success} strokeWidth="1.5">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const BriefcaseIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={iconTheme.warning} strokeWidth="1.5">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const WorriedFaceIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={iconTheme.primary} strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 15s1.5 2 4 2 4-2 4-2" />
    <path d="M9 9h.01" />
    <path d="M15 9h.01" />
    <path d="M8 6s1-1 2-1" />
    <path d="M16 6s-1-1-2-1" />
  </svg>
);

interface Persona {
  id: string;
  name: string;
  type: 'preset' | 'custom';
  description: string;
  icon: string | React.ReactNode;
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
  personaIcon: string | React.ReactNode;
  messages: ChatMessage[];
}

const DEFAULT_PERSONAS: Persona[] = [
  { id: 'p1', name: 'Calm Mentor', type: 'preset', description: 'A patient and understanding guide who helps you stay grounded.', icon: <MeditationIcon size={32} /> },
  { id: 'p2', name: 'Supportive Friend', type: 'preset', description: 'An empathetic listener who validates your feelings.', icon: <HeartIcon size={32} /> },
  { id: 'p3', name: 'Difficult Boss', type: 'preset', description: 'Practice handling challenging workplace conversations.', icon: <BriefcaseIcon size={32} /> },
  { id: 'p4', name: 'Anxious Client', type: 'preset', description: 'Learn to de-escalate and reassure worried individuals.', icon: <WorriedFaceIcon size={32} /> },
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
  const customPersonasCount = personas.filter(p => p.type === 'custom').length;

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
    icon: string | React.ReactNode;
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
    icon: string | React.ReactNode;
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
        await fetch('/api/persona-conversations', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: currentConversationId,
            messages,
          }),
        });
      } else {
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
    const persona = personas.find(p => p.id === conversation.personaId);
    if (persona) {
      setActivePersonaId(persona.id);
    }
    setCurrentConversationId(conversation.id);
    setViewMode('chat');
  };

  const handleStartScenario = (scenario: Scenario) => {
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

  if (loading || !user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAF7F3',
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center' }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid #F0E4D3',
              borderTop: '4px solid #C08B82',
              borderRadius: '50%',
              margin: '0 auto 16px',
            }}
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            style={{ color: '#6B6B6B', fontSize: '15px' }}
          >
            Loading personas...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const deletePersona = personas.find(p => p.id === deleteConfirmId);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAF7F3',
    }}>
      <Navbar
        isAuthenticated={true}
        userName={user.name || 'User'}
        userEmail={user.email}
        profilePic={profilePic}
        onProfilePicChange={setProfilePic}
        onLogout={handleLogout}
        currentPage="/persona"
      />

      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px 24px',
      }}>
        {/* Hero Section */}
        <PersonaHero
          totalPersonas={personas.length}
          customPersonas={customPersonasCount}
        />

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '24px',
          }}
        >
          <QuickActionsBar
            viewMode={viewMode}
            onViewChange={setViewMode}
          />
        </motion.div>

        {/* Delete Confirmation Modal */}
        <DeleteModal
          isOpen={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          onConfirm={() => deleteConfirmId && handleDeletePersona(deleteConfirmId)}
          personaName={deletePersona?.name}
        />

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: viewMode === 'chat' ? '320px 1fr' : '1fr 1.2fr',
          gap: '24px',
          alignItems: 'start',
        }}>
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              position: viewMode === 'chat' ? 'sticky' : 'static',
              top: '100px',
            }}
          >
            {/* Persona Grid */}
            <PersonaGrid
              personas={personas}
              activePersonaId={activePersonaId}
              onSelect={(id) => {
                setActivePersonaId(id);
                if (viewMode !== 'chat') setViewMode('preview');
              }}
              onCreateNew={() => setViewMode('create')}
              onEdit={openEditMode}
              onDelete={(id) => setDeleteConfirmId(id)}
              disabled={viewMode === 'chat'}
            />

            {/* Templates Card */}
            {viewMode !== 'chat' && (
              <TemplatesCard
                templates={PERSONA_TEMPLATES}
                onSelectTemplate={() => setViewMode('create')}
              />
            )}
          </motion.div>

          {/* Right Column - Main Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {viewMode === 'chat' && selectedPersona ? (
              <ContentWrapper noPadding>
                <PersonaChat
                  persona={selectedPersona}
                  onEndChat={handleEndChat}
                  onSaveConversation={handleSaveConversation}
                />
              </ContentWrapper>
            ) : viewMode === 'create' ? (
              <ContentWrapper
                title="Create Persona"
                subtitle="Design your custom AI conversation partner"
                icon={<SparklesIcon />}
                onClose={() => setViewMode('preview')}
              >
                <PersonaCreator
                  onSave={handleCreatePersona}
                  onCancel={() => setViewMode('preview')}
                />
              </ContentWrapper>
            ) : viewMode === 'edit' && editingPersona ? (
              <ContentWrapper
                title="Edit Persona"
                subtitle="Customize your persona settings"
                icon={<PencilIcon />}
                onClose={() => {
                  setEditingPersona(null);
                  setViewMode('preview');
                }}
              >
                <PersonaCreator
                  editingPersona={editingPersona}
                  onSave={handleEditPersona}
                  onCancel={() => {
                    setEditingPersona(null);
                    setViewMode('preview');
                  }}
                />
              </ContentWrapper>
            ) : viewMode === 'history' ? (
              <ContentWrapper
                title="Conversation History"
                subtitle="Browse your past conversations"
                icon={<BookIcon />}
                onClose={() => setViewMode('preview')}
                noPadding
              >
                <ConversationHistory
                  onLoadConversation={handleLoadConversation}
                  onClose={() => setViewMode('preview')}
                />
              </ContentWrapper>
            ) : viewMode === 'analytics' ? (
              <ContentWrapper
                title="Analytics Dashboard"
                subtitle="Track your conversation practice"
                icon={<ChartIcon />}
                onClose={() => setViewMode('preview')}
                noPadding
              >
                <AnalyticsDashboard
                  onClose={() => setViewMode('preview')}
                />
              </ContentWrapper>
            ) : viewMode === 'scenarios' ? (
              <ScenarioGrid
                scenarios={ROLEPLAY_SCENARIOS}
                onStartScenario={handleStartScenario}
                onClose={() => setViewMode('preview')}
              />
            ) : (
              // Persona Preview
              <PersonaPreviewCard
                persona={selectedPersona}
                onStartChat={handleStartChat}
                onEdit={openEditMode}
              />
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
