'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';

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
  otherUser: { id: string; name: string; email: string; isOnline?: boolean } | null;
  messages: Message[];
}

export default function StudentChatPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const therapistId = searchParams.get('therapist');
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    // If therapist ID is in URL, start/select that conversation
    if (therapistId && conversations.length > 0) {
      const existing = conversations.find(c => c.therapistId === therapistId);
      if (existing) {
        setSelectedConversation(existing);
      } else {
        // Create new conversation
        startConversation(therapistId);
      }
    }
  }, [therapistId, conversations]);

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

  const startConversation = async (therapistId: string) => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ therapistId }),
      });
      if (res.ok) {
        fetchConversations();
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

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

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
      
      <div style={{ flex: 1, display: 'flex', maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '24px' }}>
        {/* Conversations List */}
        <div style={{
          width: '320px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          marginRight: '24px',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>My Therapists</h2>
            <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>
              Chat with your therapists
            </p>
          </div>
          
          <div style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
                Loading...
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
                <p style={{ color: '#6B7280' }}>No conversations yet</p>
                <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
                  Click "Talk to Therapist" on Dashboard to start
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  style={{
                    padding: '16px 20px',
                    cursor: 'pointer',
                    background: selectedConversation?.id === conv.id ? 'rgba(124, 58, 237, 0.05)' : 'white',
                    borderLeft: selectedConversation?.id === conv.id ? '3px solid #7C3AED' : '3px solid transparent',
                    borderBottom: '1px solid #F3F4F6',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '14px',
                      }}>
                        {conv.otherUser?.name?.charAt(0) || '?'}
                      </div>
                      {conv.otherUser?.isOnline && (
                        <div style={{
                          position: 'absolute',
                          bottom: '0',
                          right: '0',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: '#10B981',
                          border: '2px solid white',
                        }} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '600', color: '#1F2937', fontSize: '14px' }}>
                        {conv.otherUser?.name || 'Unknown'}
                      </p>
                      <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
                        {conv.messages[0]?.content?.substring(0, 30) || 'Start chatting'}...
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
        }}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                    {selectedConversation.otherUser?.name?.charAt(0) || '?'}
                  </div>
                  {selectedConversation.otherUser?.isOnline && (
                    <div style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: '#10B981',
                      border: '2px solid white',
                    }} />
                  )}
                </div>
                <div>
                  <h3 style={{ fontWeight: '700', color: '#1F2937' }}>
                    {selectedConversation.otherUser?.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: selectedConversation.otherUser?.isOnline ? '#10B981' : '#6B7280' }}>
                    {selectedConversation.otherUser?.isOnline ? '● Online' : 'Offline'}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#F9FAFB' }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                    Say hello to your therapist!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.senderId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: 'flex',
                          justifyContent: isOwn ? 'flex-end' : 'flex-start',
                          marginBottom: '12px',
                        }}
                      >
                        <div style={{
                          maxWidth: '70%',
                          padding: '12px 16px',
                          borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          background: isOwn ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)' : 'white',
                          color: isOwn ? 'white' : '#1F2937',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        }}>
                          <p style={{ fontSize: '14px', lineHeight: '1.5' }}>{msg.content}</p>
                          <p style={{
                            fontSize: '11px',
                            marginTop: '6px',
                            opacity: 0.7,
                            textAlign: 'right',
                          }}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} style={{ padding: '16px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '12px' }}>
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1.5px solid #E5E7EB',
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  style={{
                    padding: '12px 24px',
                    background: newMessage.trim() ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)' : '#E5E7EB',
                    color: newMessage.trim() ? 'white' : '#9CA3AF',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  {sending ? '...' : 'Send'}
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
