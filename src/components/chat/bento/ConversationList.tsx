'use client';

import { motion } from 'framer-motion';
import type { ChatConversation } from '@/types/chat';

// SVG Icon Components
const ChatIcon = ({ color = '#D9A299', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const MicIcon = ({ color = '#6B6B6B', size = 14 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const ImageIcon = ({ color = '#6B6B6B', size = 14 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const PaperclipIcon = ({ color = '#6B6B6B', size = 14 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

interface ConversationListProps {
  conversations: ChatConversation[];
  selectedConversationId: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  onSelectConversation: (id: string) => void;
}

export default function ConversationList({
  conversations,
  selectedConversationId,
  isConnected,
  isLoading,
  error,
  onSelectConversation,
}: ConversationListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        width: '320px',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        border: '1px solid #DCC5B2',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
        marginRight: '24px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid #F0E4D3',
        background: '#FAF7F3',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#2D2D2D',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <ChatIcon color="#D9A299" size={20} />
              My Therapists
            </h2>
            <p style={{
              fontSize: '13px',
              color: '#6B6B6B',
              marginTop: '4px',
            }}>
              Chat with your therapists
            </p>
          </div>
          <motion.div
            animate={isConnected ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            title={isConnected ? 'Connected' : 'Disconnected'}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: isConnected ? '#7AB89E' : '#EF4444',
              boxShadow: isConnected ? '0 0 8px rgba(122, 184, 158, 0.5)' : 'none',
            }}
          />
        </div>
      </div>

      {/* Conversations */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid #F0E4D3',
                borderTop: '3px solid #D9A299',
                borderRadius: '50%',
                margin: '0 auto',
              }}
            />
            <p style={{ color: '#6B6B6B', marginTop: '12px', fontSize: '14px' }}>Loading...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#EF4444' }}>
            {error}
          </div>
        ) : conversations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '40px', textAlign: 'center' }}
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}
            >
              <ChatIcon color="#D9A299" size={40} />
            </motion.div>
            <p style={{ color: '#6B6B6B', fontWeight: '500' }}>No conversations yet</p>
            <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
              Click &quot;Talk to Therapist&quot; on Dashboard to start
            </p>
          </motion.div>
        ) : (
          conversations.map((conv, index) => {
            const isSelected = selectedConversationId === conv.id;
            return (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
                onClick={() => onSelectConversation(conv.id)}
                style={{
                  padding: '16px 20px',
                  cursor: 'pointer',
                  background: isSelected ? 'rgba(217, 162, 153, 0.1)' : 'transparent',
                  borderLeft: isSelected ? '3px solid #D9A299' : '3px solid transparent',
                  borderBottom: '1px solid #F0E4D3',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ position: 'relative' }}>
                    <motion.div
                      animate={isSelected ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 2 }}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: isSelected
                          ? 'linear-gradient(135deg, #D9A299 0%, #C8847A 100%)'
                          : 'linear-gradient(135deg, #7AB89E 0%, #5A9880 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '16px',
                      }}
                    >
                      {conv.otherUser.name.charAt(0)}
                    </motion.div>
                    <div style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: conv.otherUser.isOnline ? '#7AB89E' : '#9CA3AF',
                      border: '2px solid white',
                    }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{
                        fontWeight: '600',
                        color: '#2D2D2D',
                        fontSize: '14px',
                      }}>
                        {conv.otherUser.name}
                      </p>
                      {conv.unreadCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          style={{
                            background: 'linear-gradient(135deg, #D9A299 0%, #C8847A 100%)',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: '600',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            minWidth: '20px',
                            textAlign: 'center',
                          }}
                        >
                          {conv.unreadCount}
                        </motion.span>
                      )}
                    </div>
                    <p style={{
                      fontSize: '13px',
                      color: '#6B6B6B',
                      marginTop: '2px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      {conv.lastMessage?.type === 'voice' ? (
                        <><MicIcon color="#6B6B6B" size={14} /> Voice message</>
                      ) : conv.lastMessage?.type === 'image' ? (
                        <><ImageIcon color="#6B6B6B" size={14} /> Image</>
                      ) : conv.lastMessage?.type === 'file' ? (
                        <><PaperclipIcon color="#6B6B6B" size={14} /> File</>
                      ) : (
                        <>
                          {conv.lastMessage?.content?.substring(0, 30) || 'Start chatting'}
                          {conv.lastMessage?.content && conv.lastMessage.content.length > 30 ? '...' : ''}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
