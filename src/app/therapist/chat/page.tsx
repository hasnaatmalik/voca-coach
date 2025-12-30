'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { useVideoCall } from '@/hooks/useVideoCall';
import RoleGuard from '@/components/RoleGuard';
import Navbar from '@/components/Navbar';
import { VideoCallModal } from '@/components/chat/VideoCallModal';
import { IncomingCallModal } from '@/components/chat/IncomingCallModal';

// SVG Icon Components
const ChatIcon = ({ color = '#D9A299', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const WaveIcon = ({ color = '#D9A299', size = 40 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
    <line x1="12" y1="2" x2="12" y2="12" />
  </svg>
);

const InboxIcon = ({ color = '#D9A299', size = 40 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  studentId: string;
  therapistId: string;
  otherUser: { id: string; name: string; email: string } | null;
  messages: Message[];
}

export default function TherapistChatPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { isConnected, isConnecting, connect } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Video call
  const videoCall = useVideoCall({
    conversationId: selectedConversation?.id || null,
    userId: user?.id || '',
    userName: user?.name || '',
    isTherapist: true,
    onCallEnded: (duration) => {
      console.log('[VideoCall] Call ended, duration:', duration);
    },
  });

  // Initialize socket connection for video calls
  useEffect(() => {
    const initSocket = async () => {
      if (isConnected || isConnecting) return;

      try {
        const res = await fetch('/api/socket/token');
        if (res.ok) {
          const { token } = await res.json();
          await connect(token);
          console.log('[TherapistChat] Socket connected');
        }
      } catch (err) {
        console.error('[TherapistChat] Failed to initialize socket:', err);
      }
    };

    initSocket();
  }, [connect, isConnected, isConnecting]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      const interval = setInterval(() => fetchMessages(selectedConversation.id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/chat');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: newMessage.trim(),
        }),
      });
      if (res.ok) {
        setNewMessage('');
        fetchMessages(selectedConversation.id);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <RoleGuard requireTherapist>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF7F3' }}>
        {user && (
          <Navbar
            isAuthenticated={true}
            userName={user.name}
            userEmail={user.email}
            onLogout={handleLogout}
            currentPage="/therapist/chat"
            isAdmin={user.isAdmin}
            isSuperAdmin={user.isSuperAdmin}
            isTherapist={user.isTherapist}
          />
        )}

        {/* Video Call Modal */}
        <VideoCallModal
          isOpen={videoCall.isCallActive && videoCall.status !== 'incoming'}
          status={videoCall.status}
          localStream={videoCall.localStream}
          remoteStream={videoCall.remoteStream}
          participant={videoCall.participant}
          duration={videoCall.duration}
          isMuted={videoCall.isMuted}
          isVideoOff={videoCall.isVideoOff}
          isScreenSharing={videoCall.isScreenSharing}
          onToggleMute={videoCall.toggleMute}
          onToggleVideo={videoCall.toggleVideo}
          onToggleScreenShare={videoCall.toggleScreenShare}
          onEndCall={videoCall.endCall}
        />

        {/* Incoming Call Modal */}
        <IncomingCallModal
          isOpen={videoCall.status === 'incoming'}
          caller={videoCall.participant}
          onAccept={videoCall.acceptCall}
          onDecline={videoCall.declineCall}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
          {/* Conversations List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              width: '320px',
              background: 'white',
              borderRadius: '24px',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
              border: '1px solid #F0E4D3',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #F0E4D3',
              background: '#FAF7F3',
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#2D2D2D',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <ChatIcon color="#D9A299" size={20} /> Messages
              </h2>
              <p style={{ fontSize: '13px', color: '#6B6B6B', marginTop: '4px' }}>
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    style={{
                      width: '32px',
                      height: '32px',
                      border: '3px solid #F0E4D3',
                      borderTop: '3px solid #7AB89E',
                      borderRadius: '50%',
                      margin: '0 auto',
                    }}
                  />
                </div>
              ) : conversations.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ padding: '40px', textAlign: 'center' }}
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}
                  >
                    <InboxIcon color="#D9A299" size={48} />
                  </motion.div>
                  <p style={{ color: '#6B6B6B', fontWeight: '500' }}>No conversations yet</p>
                  <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
                    Students will appear here when they message you
                  </p>
                </motion.div>
              ) : (
                conversations.map((conv, index) => {
                  const isSelected = selectedConversation?.id === conv.id;
                  return (
                    <motion.div
                      key={conv.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4 }}
                      onClick={() => setSelectedConversation(conv)}
                      style={{
                        padding: '16px 20px',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(122, 184, 158, 0.1)' : 'transparent',
                        borderLeft: isSelected ? '3px solid #7AB89E' : '3px solid transparent',
                        borderBottom: '1px solid #F0E4D3',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <motion.div
                          animate={isSelected ? { scale: [1, 1.05, 1] } : {}}
                          transition={{ repeat: Infinity, duration: 2 }}
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '14px',
                            background: isSelected
                              ? 'linear-gradient(135deg, #7AB89E 0%, #5A9880 100%)'
                              : 'linear-gradient(135deg, #D9A299 0%, #C8847A 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '16px',
                          }}
                        >
                          {conv.otherUser?.name?.charAt(0) || '?'}
                        </motion.div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: '600', color: '#2D2D2D', fontSize: '14px' }}>
                            {conv.otherUser?.name || 'Unknown'}
                          </p>
                          <p style={{
                            fontSize: '13px',
                            color: '#6B6B6B',
                            marginTop: '2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {conv.messages[0]?.content?.substring(0, 30) || 'No messages'}...
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Chat Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
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
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #F0E4D3',
                    background: '#FAF7F3',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #D9A299 0%, #C8847A 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '18px',
                      boxShadow: '0 4px 12px rgba(217, 162, 153, 0.3)',
                    }}
                  >
                    {selectedConversation.otherUser?.name?.charAt(0) || '?'}
                  </motion.div>
                  <div>
                    <h3 style={{ fontWeight: '700', color: '#2D2D2D', fontSize: '16px' }}>
                      {selectedConversation.otherUser?.name}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#6B6B6B' }}>Student</p>
                  </div>

                  {/* Video Call Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => videoCall.initiateCall(
                      selectedConversation.otherUser?.id || '',
                      selectedConversation.otherUser?.name || 'Unknown',
                      false
                    )}
                    disabled={videoCall.isCallActive}
                    style={{
                      marginLeft: 'auto',
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      border: 'none',
                      background: videoCall.isCallActive
                        ? '#e5e5e5'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: videoCall.isCallActive ? '#999' : 'white',
                      cursor: videoCall.isCallActive ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: videoCall.isCallActive ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.3)',
                    }}
                    title="Start video call"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                  </motion.button>
                </motion.div>

                {/* Messages */}
                <div style={{
                  flex: 1,
                  padding: '24px',
                  overflowY: 'auto',
                  background: 'linear-gradient(180deg, #FAF7F3 0%, #FFFFFF 100%)',
                }}>
                  {messages.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ textAlign: 'center', padding: '40px', color: '#6B6B6B' }}
                    >
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}
                      >
                        <WaveIcon color="#7AB89E" size={48} />
                      </motion.div>
                      <p>No messages yet. Start the conversation!</p>
                    </motion.div>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {messages.map((msg, index) => {
                        const isOwn = msg.senderId === user?.id;
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                            style={{
                              display: 'flex',
                              justifyContent: isOwn ? 'flex-end' : 'flex-start',
                              marginBottom: '12px',
                            }}
                          >
                            <motion.div
                              whileHover={{ scale: 1.01 }}
                              style={{
                                maxWidth: '70%',
                                padding: '14px 18px',
                                borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                background: isOwn
                                  ? 'linear-gradient(135deg, #7AB89E 0%, #5A9880 100%)'
                                  : 'white',
                                color: isOwn ? 'white' : '#2D2D2D',
                                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                                border: isOwn ? 'none' : '1px solid #F0E4D3',
                              }}
                            >
                              <p style={{ fontSize: '14px', lineHeight: '1.6' }}>{msg.content}</p>
                              <p style={{
                                fontSize: '11px',
                                marginTop: '8px',
                                opacity: 0.7,
                                textAlign: 'right',
                              }}>
                                {formatTime(msg.createdAt)}
                              </p>
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} style={{
                  padding: '16px 24px',
                  borderTop: '1px solid #F0E4D3',
                  background: 'white',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                }}>
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    style={{
                      flex: 1,
                      padding: '14px 20px',
                      border: '1px solid #DCC5B2',
                      borderRadius: '16px',
                      fontSize: '15px',
                      outline: 'none',
                      background: '#FAF7F3',
                      transition: 'all 0.2s',
                    }}
                  />
                  <motion.button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    whileHover={newMessage.trim() ? { scale: 1.05 } : {}}
                    whileTap={newMessage.trim() ? { scale: 0.95 } : {}}
                    style={{
                      padding: '14px 28px',
                      background: newMessage.trim()
                        ? 'linear-gradient(135deg, #7AB89E 0%, #5A9880 100%)'
                        : '#E5E7EB',
                      color: newMessage.trim() ? 'white' : '#9CA3AF',
                      border: 'none',
                      borderRadius: '14px',
                      fontWeight: '600',
                      cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                      boxShadow: newMessage.trim() ? '0 4px 12px rgba(122, 184, 158, 0.3)' : 'none',
                    }}
                  >
                    {sending ? '...' : 'Send'}
                  </motion.button>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  background: '#FAF7F3',
                }}
              >
                <motion.div
                  animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '28px',
                    background: 'linear-gradient(135deg, #FAF7F3 0%, #F0E4D3 100%)',
                    border: '2px solid #DCC5B2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <ChatIcon color="#D9A299" size={48} />
                </motion.div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#2D2D2D', marginBottom: '8px' }}>
                  Select a conversation
                </h3>
                <p style={{ color: '#6B6B6B', fontSize: '15px' }}>
                  Choose a student to start chatting
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </RoleGuard>
  );
}
