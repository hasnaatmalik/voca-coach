'use client';

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import Navbar from '@/components/Navbar';
import MessageBubble from '@/components/chat/MessageBubble';
import TypingIndicator from '@/components/chat/TypingIndicator';
import {
  ConversationList,
  ChatHeader,
  ChatInput,
  CrisisAlertModal,
  EmptyChatState,
} from '@/components/chat/bento';
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
      console.log('[Chat] Fetching conversations for user:', user.id);
      fetchConversations();
    }
  }, [user, fetchConversations]);

  // Handle therapist ID from URL - improved to avoid race conditions
  useEffect(() => {
    console.log('[Chat] Therapist param effect:', { therapistId, isLoading, conversationsCount: conversations.length });
    if (!therapistId || isLoading) return;
    
    const handleTherapistParam = async () => {
      console.log('[Chat] Handling therapist param:', therapistId);
      // Check if conversation already exists
      const existing = conversations.find(c => c.otherUser.id === therapistId);
      console.log('[Chat] Existing conversation:', existing);
      if (existing) {
        console.log('[Chat] Selecting existing conversation:', existing.id);
        selectConversation(existing.id);
      } else {
        // Create new conversation
        console.log('[Chat] Creating new conversation with therapist:', therapistId);
        const convId = await startConversation(therapistId);
        console.log('[Chat] Created conversation ID:', convId);
        if (convId) {
          selectConversation(convId);
        }
      }
    };
    
    handleTherapistParam();
  }, [therapistId, conversations.length, isLoading, selectConversation, startConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Polling fallback: Fetch new messages periodically (always run for reliability)
  useEffect(() => {
    if (!selectedConversationId) return;

    const pollInterval = setInterval(() => {
      console.log('[Chat] Polling for new messages');
      fetchConversations();
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [selectedConversationId, fetchConversations]);

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
    sendTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

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

  const getReplyPreview = () => {
    if (!replyingTo) return null;
    const msg = messages.find(m => m.id === replyingTo);
    if (!msg) return null;
    return {
      id: msg.id,
      senderName: msg.senderName,
      content: msg.content,
      type: msg.type,
    };
  };

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAF7F3',
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '3px solid #F0E4D3',
            borderTopColor: '#D9A299',
          }}
        />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#FAF7F3',
    }}>
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
      <CrisisAlertModal
        alert={showCrisisAlert}
        onClose={() => setShowCrisisAlert(null)}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          flex: 1,
          display: 'flex',
          maxWidth: '1400px',
          width: '100%',
          margin: '0 auto',
          padding: '24px',
          gap: '24px',
        }}
      >
        {/* Conversations Sidebar */}
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          isConnected={isConnected}
          isLoading={isLoading}
          error={error}
          onSelectConversation={selectConversation}
        />

        {/* Chat Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            flex: 1,
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
            border: '1px solid #F0E4D3',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <ChatHeader
                name={selectedConversation.otherUser.name}
                isOnline={selectedConversation.otherUser.isOnline}
                lastActiveAt={selectedConversation.otherUser.lastActiveAt}
              />

              {/* Messages Area */}
              <div style={{
                flex: 1,
                padding: '24px',
                overflowY: 'auto',
                background: 'linear-gradient(180deg, #FAF7F3 0%, #FFFFFF 100%)',
              }}>
                {messages.length === 0 ? (
                  <EmptyChatState variant="no-messages" />
                ) : (
                  <AnimatePresence mode="popLayout">
                    {messages.map((msg, index) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        <MessageBubble
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
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </AnimatePresence>
                )}

                {/* Typing Indicator */}
                <AnimatePresence>
                  {typingUsers.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <TypingIndicator userName={typingUsers[0].userName} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Chat Input */}
              <ChatInput
                ref={inputRef}
                value={newMessage}
                onChange={handleInputChange}
                onSubmit={handleSendMessage}
                replyPreview={getReplyPreview()}
                onCancelReply={() => setReplyingTo(null)}
              />
            </>
          ) : (
            <EmptyChatState variant="no-conversation" />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function StudentChatPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAF7F3',
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '3px solid #F0E4D3',
            borderTopColor: '#D9A299',
          }}
        />
      </div>
    }>
      <StudentChatContent />
    </Suspense>
  );
}
