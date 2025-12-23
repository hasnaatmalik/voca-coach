'use client';

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import Navbar from '@/components/Navbar';
import MessageBubble from '@/components/chat/MessageBubble';
import TypingIndicator from '@/components/chat/TypingIndicator';
import type { CrisisAlert } from '@/types/chat';

function StudentChatContent() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const therapistId = searchParams.get('therapist');

  const [newMessage, setNewMessage] = useState('');
  const [showCrisisAlert, setShowCrisisAlert] = useState<CrisisAlert | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize chat with WebSocket
  const {
    conversations,
    selectedConversation,
    selectedConversationId,
    messages,
    typingUsers,
    isConnected,
    isLoading,
    error,
    fetchConversations,
    selectConversation,
    sendMessage,
    addReaction,
    removeReaction,
    editMessage,
    deleteMessage,
    sendTyping,
    markAsRead,
    startConversation
  } = useChat({
    userId: user?.id || '',
    onCrisisAlert: (alert) => setShowCrisisAlert(alert),
    onNewMessage: (msg) => {
      // Play notification sound for incoming messages
      if (msg.senderId !== user?.id) {
        // Could add sound notification here
      }
    }
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch conversations on mount
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  // Handle therapist ID from URL
  useEffect(() => {
    if (therapistId && conversations.length > 0) {
      const existing = conversations.find(c => c.otherUser.id === therapistId);
      if (existing) {
        selectConversation(existing.id);
      } else {
        startConversation(therapistId).then(convId => {
          if (convId) selectConversation(convId);
        });
      }
    }
  }, [therapistId, conversations, selectConversation, startConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (selectedConversationId && messages.length > 0 && user) {
      const unreadMessages = messages
        .filter(m => m.senderId !== user.id && !m.readAt)
        .map(m => m.id);
      if (unreadMessages.length > 0) {
        markAsRead(unreadMessages);
      }
    }
  }, [selectedConversationId, messages, user, markAsRead]);

  // Handle input changes with typing indicator
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Send typing indicator
    sendTyping(true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of no input
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 2000);
  }, [sendTyping]);

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendMessage(newMessage.trim(), replyingTo || undefined);
    setNewMessage('');
    setReplyingTo(null);
    sendTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const formatLastSeen = (dateStr?: string) => {
    if (!dateStr) return 'Offline';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getReplyPreview = () => {
    if (!replyingTo) return null;
    return messages.find(m => m.id === replyingTo);
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F9FAFB' }}>
      {user && (
        <Navbar
          isAuthenticated={true}
          userName={user.name}
          userEmail={user.email}
          onLogout={handleLogout}
          currentPage="/chat"
          isAdmin={user.isAdmin}
          isSuperAdmin={user.isSuperAdmin}
          isTherapist={user.isTherapist}
        />
      )}

      {/* Crisis Alert Modal */}
      {showCrisisAlert && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
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
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: showCrisisAlert.riskLevel === 'critical' ? '#DC2626' : '#EA580C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                ⚠️
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>
                  We&apos;re Here to Help
                </h3>
                <p style={{ fontSize: '14px', color: '#6B7280' }}>
                  It sounds like you may be going through a difficult time.
                </p>
              </div>
            </div>

            <p style={{ marginBottom: '16px', color: '#4B5563', lineHeight: '1.6' }}>
              If you&apos;re in crisis or need immediate support, please reach out to one of these resources:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {showCrisisAlert.resources.map((resource, i) => (
                <a
                  key={i}
                  href={resource.url || `tel:${resource.contact.replace(/\D/g, '')}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: '#F3F4F6',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: 'inherit'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600'
                  }}>
                    📞
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1F2937' }}>{resource.name}</div>
                    <div style={{ fontSize: '13px', color: '#7C3AED' }}>{resource.contact}</div>
                  </div>
                </a>
              ))}
            </div>

            <button
              onClick={() => setShowCrisisAlert(null)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#1F2937',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '24px' }}>
        {/* Conversations List */}
        <div style={{
          width: '320px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          marginRight: '24px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>My Therapists</h2>
                <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>
                  Chat with your therapists
                </p>
              </div>
              <div
                title={isConnected ? 'Connected' : 'Disconnected'}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: isConnected ? '#10B981' : '#EF4444'
                }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {isLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
                Loading...
              </div>
            ) : error ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#EF4444' }}>
                {error}
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
                <p style={{ color: '#6B7280' }}>No conversations yet</p>
                <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
                  Click &quot;Talk to Therapist&quot; on Dashboard to start
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  style={{
                    padding: '16px 20px',
                    cursor: 'pointer',
                    background: selectedConversationId === conv.id ? 'rgba(124, 58, 237, 0.05)' : 'white',
                    borderLeft: selectedConversationId === conv.id ? '3px solid #7C3AED' : '3px solid transparent',
                    borderBottom: '1px solid #F3F4F6',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '16px',
                      }}>
                        {conv.otherUser.name.charAt(0)}
                      </div>
                      <div style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: conv.otherUser.isOnline ? '#10B981' : '#9CA3AF',
                        border: '2px solid white',
                      }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontWeight: '600', color: '#1F2937', fontSize: '14px' }}>
                          {conv.otherUser.name}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span style={{
                            background: '#7C3AED',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: '600',
                            padding: '2px 6px',
                            borderRadius: '10px',
                            minWidth: '18px',
                            textAlign: 'center'
                          }}>
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p style={{
                        fontSize: '13px',
                        color: '#6B7280',
                        marginTop: '2px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {conv.lastMessage?.type === 'voice' ? '🎤 Voice message' :
                         conv.lastMessage?.type === 'image' ? '🖼️ Image' :
                         conv.lastMessage?.type === 'file' ? '📎 File' :
                         conv.lastMessage?.content?.substring(0, 30) || 'Start chatting'}
                        {conv.lastMessage?.content && conv.lastMessage.content.length > 30 ? '...' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{
          flex: 1,
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600',
                    }}>
                      {selectedConversation.otherUser.name.charAt(0)}
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: selectedConversation.otherUser.isOnline ? '#10B981' : '#9CA3AF',
                      border: '2px solid white',
                    }} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: '700', color: '#1F2937' }}>
                      {selectedConversation.otherUser.name}
                    </h3>
                    <p style={{ fontSize: '13px', color: selectedConversation.otherUser.isOnline ? '#10B981' : '#6B7280' }}>
                      {selectedConversation.otherUser.isOnline
                        ? '● Online'
                        : formatLastSeen(selectedConversation.otherUser.lastActiveAt)}
                    </p>
                  </div>
                </div>

                {/* Header actions - placeholder for search, call, etc */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: 'none',
                    background: '#F3F4F6',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }} title="Search messages">
                    🔍
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#F9FAFB' }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>👋</div>
                    <p>Say hello to your therapist!</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isOwn={msg.senderId === user?.id}
                        showReadReceipt={msg.senderId === user?.id}
                        currentUserId={user?.id || ''}
                        onReact={(emoji) => addReaction(msg.id, emoji)}
                        onRemoveReaction={(emoji) => removeReaction(msg.id, emoji)}
                        onEdit={(content) => editMessage(msg.id, content)}
                        onDelete={() => deleteMessage(msg.id)}
                        onReply={() => {
                          setReplyingTo(msg.id);
                          inputRef.current?.focus();
                        }}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}

                {/* Typing indicator */}
                {typingUsers.length > 0 && (
                  <TypingIndicator userName={typingUsers[0].userName} />
                )}
              </div>

              {/* Reply preview */}
              {replyingTo && getReplyPreview() && (
                <div style={{
                  padding: '12px 20px',
                  borderTop: '1px solid #E5E7EB',
                  background: '#F9FAFB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{
                    borderLeft: '3px solid #7C3AED',
                    paddingLeft: '12px'
                  }}>
                    <div style={{ fontSize: '12px', color: '#7C3AED', fontWeight: '600' }}>
                      Replying to {getReplyPreview()?.senderName}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6B7280' }}>
                      {getReplyPreview()?.type === 'voice' ? '🎤 Voice message' :
                       getReplyPreview()?.content?.substring(0, 50)}
                    </div>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '18px',
                      cursor: 'pointer',
                      color: '#6B7280'
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Message Input */}
              <form onSubmit={handleSendMessage} style={{
                padding: '16px 20px',
                borderTop: '1px solid #E5E7EB',
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}>
                {/* Attachment button - placeholder */}
                <button
                  type="button"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: 'none',
                    background: '#F3F4F6',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}
                  title="Attach file"
                >
                  📎
                </button>

                <input
                  ref={inputRef}
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1.5px solid #E5E7EB',
                    borderRadius: '24px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#7C3AED'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />

                {/* Voice message button - placeholder */}
                <button
                  type="button"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: 'none',
                    background: '#F3F4F6',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}
                  title="Voice message"
                >
                  🎤
                </button>

                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: newMessage.trim() ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)' : '#E5E7EB',
                    color: newMessage.trim() ? 'white' : '#9CA3AF',
                    border: 'none',
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    transition: 'all 0.2s'
                  }}
                >
                  ➤
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>💬</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', marginBottom: '8px' }}>
                Select a conversation
              </h3>
              <p style={{ color: '#6B7280' }}>Choose a therapist to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentChatPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>}>
      <StudentChatContent />
    </Suspense>
  );
}
