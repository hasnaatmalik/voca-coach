'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSocket, useSocketRoom } from '@/hooks/useSocket';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useRecording } from '@/hooks/useRecording';
import VideoCall from '@/components/VideoCall/VideoCall';

interface SessionData {
  id: string;
  userId: string;
  therapistId: string;
  scheduledAt: string;
  duration: number;
  status: string;
  therapist: {
    id: string;
    name: string;
    email: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export default function TherapySessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const { user, logout } = useAuth();
  const { socket, isConnected, connect } = useSocket();

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  // Recording hook
  const {
    isRecording,
    hasConsent,
    bothConsented,
    formattedDuration: recordingDuration,
    updateConsent,
    startRecording,
    stopRecording,
  } = useRecording({
    sessionId,
    onError: (error) => setRecordingError(error),
  });

  // Determine if current user is the therapist
  const isTherapist = user?.isTherapist && session?.therapistId === user?.id;
  const remoteName = isTherapist ? session?.user?.name : session?.therapist?.name;

  // WebRTC hook
  const {
    connectionState,
    localStream,
    remoteStream,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    startCall,
    endCall,
    toggleMute,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
  } = useWebRTC({
    sessionId,
    socket,
    isInitiator: !isTherapist, // Student initiates the call
  });

  // Join session room
  useSocketRoom('session', isConnected ? sessionId : null);

  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/therapy/sessions?sessionId=${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.session) {
            setSession(data.session);
          } else {
            setError('Session not found');
          }
        } else {
          setError('Failed to load session');
        }
      } catch (err) {
        setError('Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  // Connect to socket
  useEffect(() => {
    const initSocket = async () => {
      try {
        const tokenRes = await fetch('/api/socket/token');
        const { token } = await tokenRes.json();
        await connect(token);
      } catch (err) {
        console.error('Failed to connect socket:', err);
      }
    };

    if (user && !isConnected) {
      initSocket();
    }
  }, [user, isConnected, connect]);

  // Start call when socket is connected and session is loaded
  useEffect(() => {
    if (isConnected && session && connectionState === 'idle') {
      startCall(true);
    }
  }, [isConnected, session, connectionState, startCall]);

  // Session timer
  useEffect(() => {
    if (session?.status === 'in_progress') {
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [session?.status]);

  // Start recording when both consent and we have streams
  useEffect(() => {
    if (bothConsented && localStream && !isRecording && connectionState === 'connected') {
      // Combine local and remote streams for recording
      const combinedStream = new MediaStream();
      localStream.getTracks().forEach(track => combinedStream.addTrack(track));
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => combinedStream.addTrack(track));
      }
      startRecording(combinedStream);
    }
  }, [bothConsented, localStream, remoteStream, isRecording, connectionState, startRecording]);

  // Listen for chat messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
    };

    socket.on('chat:message', handleMessage);

    return () => {
      socket.off('chat:message', handleMessage);
    };
  }, [socket]);

  // Listen for session events
  useEffect(() => {
    if (!socket) return;

    const handleSessionEnded = ({ endedBy }: { sessionId: string; endedBy: string }) => {
      alert(`Session ended by ${endedBy}`);
      router.push(`/therapy/summary/${sessionId}`);
    };

    socket.on('session:ended', handleSessionEnded);

    return () => {
      socket.off('session:ended', handleSessionEnded);
    };
  }, [socket, router, sessionId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    socket.emit('chat:send', {
      conversationId: sessionId, // Using session ID for in-session chat
      content: newMessage.trim(),
    });

    // Optimistically add message
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      senderId: user?.id || '',
      senderName: user?.name || 'You',
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
    }]);

    setNewMessage('');
  };

  const handleEndSession = () => {
    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }
    socket?.emit('session:end', sessionId);
    endCall();
    router.push(`/therapy/summary/${sessionId}`);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  if (!user) return null;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#1F2937',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
      }}>
        Loading session...
      </div>
    );
  }

  if (error || !session) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#1F2937',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        gap: '16px',
      }}>
        <div style={{ fontSize: '48px' }}>😕</div>
        <div style={{ fontSize: '18px' }}>{error || 'Session not found'}</div>
        <button
          onClick={() => router.push('/therapy/sessions')}
          style={{
            padding: '12px 24px',
            background: '#7C3AED',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Back to Sessions
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#111827',
      display: 'flex',
    }}>
      {/* Main Video Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          color: 'white',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: '600' }}>
              Session with {remoteName}
            </h1>
            <div style={{
              padding: '6px 12px',
              background: 'rgba(16, 185, 129, 0.2)',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '500',
              color: '#10B981',
            }}>
              {formatTime(elapsedTime)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Recording Consent Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                color: 'white',
              }}>
                <input
                  type="checkbox"
                  checked={hasConsent}
                  onChange={(e) => updateConsent(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                Record session
              </label>
              {isRecording && (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#EF4444',
                  fontSize: '12px',
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#EF4444',
                    animation: 'pulse 1s infinite',
                  }} />
                  REC {recordingDuration}
                </span>
              )}
              {hasConsent && !bothConsented && !isRecording && (
                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                  (waiting for other party)
                </span>
              )}
            </div>

            {/* Recording Error */}
            {recordingError && (
              <span style={{ fontSize: '12px', color: '#EF4444' }}>
                {recordingError}
              </span>
            )}

            <button
              onClick={() => setShowChat(!showChat)}
              style={{
                padding: '8px 16px',
                background: showChat ? '#7C3AED' : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              💬 Chat
            </button>
            <button
              onClick={() => setShowEndConfirm(true)}
              style={{
                padding: '8px 16px',
                background: '#DC2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              End Session
            </button>
          </div>
        </div>

        {/* Video Call */}
        <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden' }}>
          <VideoCall
            localStream={localStream}
            remoteStream={remoteStream}
            connectionState={connectionState}
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
            isScreenSharing={isScreenSharing}
            onToggleMute={toggleMute}
            onToggleCamera={toggleCamera}
            onStartScreenShare={startScreenShare}
            onStopScreenShare={stopScreenShare}
            onEndCall={() => setShowEndConfirm(true)}
            remoteName={remoteName || 'Participant'}
            isTherapist={isTherapist}
          />
        </div>
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <div style={{
          width: '320px',
          background: '#1F2937',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            padding: '16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            fontWeight: '600',
          }}>
            Session Chat
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {chatMessages.length === 0 ? (
              <div style={{
                color: '#6B7280',
                textAlign: 'center',
                padding: '40px 20px',
                fontSize: '14px',
              }}>
                No messages yet. Start the conversation!
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.senderId === user.id ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                  }}
                >
                  <div style={{
                    padding: '10px 14px',
                    background: msg.senderId === user.id ? '#7C3AED' : '#374151',
                    color: 'white',
                    borderRadius: msg.senderId === user.id
                      ? '14px 14px 4px 14px'
                      : '14px 14px 14px 4px',
                    fontSize: '14px',
                  }}>
                    {msg.content}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#6B7280',
                    marginTop: '4px',
                    textAlign: msg.senderId === user.id ? 'right' : 'left',
                  }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  background: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                style={{
                  padding: '10px 16px',
                  background: '#7C3AED',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  opacity: newMessage.trim() ? 1 : 0.5,
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Session Confirmation Modal */}
      {showEndConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{
            background: '#1F2937',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            color: 'white',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
              End Session?
            </h2>
            <p style={{ color: '#9CA3AF', marginBottom: '24px' }}>
              Are you sure you want to end this therapy session? You'll be redirected to the session summary.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowEndConfirm(false)}
                style={{
                  padding: '10px 20px',
                  background: '#374151',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleEndSession}
                style={{
                  padding: '10px 20px',
                  background: '#DC2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
