'use client';

import { useState, useEffect, ReactNode } from 'react';
import { renderIconById, ICON_DEFINITIONS } from './IconPicker';

// Helper to check if a string is a valid icon ID
const isIconId = (icon: string): boolean => {
  return ICON_DEFINITIONS.some(def => def.id === icon);
};

// Render icon - handles both icon IDs and direct ReactNode/emojis
const renderPersonaIcon = (icon: string | ReactNode, size: number = 20): ReactNode => {
  if (typeof icon === 'string' && isIconId(icon)) {
    return renderIconById(icon, size);
  }
  return icon;
};

// SVG Icon Components
const BookIcon = ({ color = '#1F2937', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const ChatIcon = ({ color = '#6B7280', size = 48 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const TrashIcon = ({ color = '#9CA3AF', size = 12 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const XIcon = ({ color = '#6B7280', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

interface Conversation {
  id: string;
  personaId: string;
  personaName: string;
  personaIcon: string | ReactNode;
  messages: ConversationMessage[];
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

interface ConversationHistoryProps {
  onLoadConversation?: (conversation: Conversation) => void;
  onClose?: () => void;
}

export default function ConversationHistory({ onLoadConversation, onClose }: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/persona-conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      } else {
        setError('Failed to load conversations');
      }
    } catch {
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/persona-conversations?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== id));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getPreview = (messages: ConversationMessage[]) => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return 'No messages';
    const preview = lastMessage.content.slice(0, 60);
    return preview.length < lastMessage.content.length ? preview + '...' : preview;
  };

  const filteredConversations = conversations.filter(conv => {
    const query = searchQuery.toLowerCase();
    return (
      conv.personaName.toLowerCase().includes(query) ||
      conv.messages.some(m => m.content.toLowerCase().includes(query))
    );
  });

  // Group by persona
  const grouped = filteredConversations.reduce((acc, conv) => {
    const key = conv.personaName;
    if (!acc[key]) acc[key] = [];
    acc[key].push(conv);
    return acc;
  }, {} as Record<string, Conversation[]>);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #E5E7EB',
          borderTop: '3px solid #7C3AED',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
        <p style={{ color: '#6B7280', marginTop: '12px' }}>Loading conversations...</p>
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#EF4444' }}>{error}</p>
        <button
          onClick={fetchConversations}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            background: '#F3F4F6',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid #E5E7EB'
      }}>
        <h3 style={{ fontWeight: '600', color: '#1F2937', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookIcon color="#1F2937" size={18} /> Conversation History
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              background: '#F3F4F6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <XIcon color="#6B7280" size={18} />
          </button>
        )}
      </div>

      {/* Search */}
      <div style={{ padding: '12px 20px' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search conversations..."
          style={{
            width: '100%',
            padding: '10px 14px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none'
          }}
        />
      </div>

      {/* Conversations List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>
        {Object.keys(grouped).length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#6B7280'
          }}>
            <div style={{ marginBottom: '12px' }}><ChatIcon color="#6B7280" size={48} /></div>
            <p>No conversations yet</p>
            <p style={{ fontSize: '13px' }}>Start chatting with a persona to see your history here</p>
          </div>
        ) : (
          Object.entries(grouped).map(([personaName, convs]) => (
            <div key={personaName} style={{ marginBottom: '20px' }}>
              {/* Persona Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '20px', display: 'flex', alignItems: 'center' }}>{convs[0]?.personaIcon ? renderPersonaIcon(convs[0].personaIcon, 20) : null}</span>
                <span style={{
                  fontWeight: '600',
                  color: '#1F2937',
                  fontSize: '14px'
                }}>
                  {personaName}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: '#9CA3AF',
                  background: '#F3F4F6',
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  {convs.length}
                </span>
              </div>

              {/* Conversation Items */}
              {convs.map((conv) => (
                <div
                  key={conv.id}
                  style={{
                    padding: '12px',
                    background: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '10px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {deleteConfirm === conv.id ? (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontSize: '13px', color: '#EF4444' }}>
                        Delete this conversation?
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          style={{
                            padding: '4px 12px',
                            background: '#F3F4F6',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => deleteConversation(conv.id)}
                          style={{
                            padding: '4px 12px',
                            background: '#EF4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div onClick={() => onLoadConversation?.(conv)}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '4px'
                      }}>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>
                          {formatDate(conv.updatedAt)}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                            {conv.messages.length} messages
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(conv.id);
                            }}
                            style={{
                              width: '24px',
                              height: '24px',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#9CA3AF',
                              fontSize: '12px'
                            }}
                          >
                            <TrashIcon color="#9CA3AF" size={12} />
                          </button>
                        </div>
                      </div>
                      <p style={{
                        fontSize: '13px',
                        color: '#4B5563',
                        margin: 0,
                        lineHeight: '1.4'
                      }}>
                        {getPreview(conv.messages)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
