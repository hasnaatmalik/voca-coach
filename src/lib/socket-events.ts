// Shared Socket.io event type definitions

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: string;
  createdAt: string;
}

// Server -> Client Events
export interface ServerToClientEvents {
  // Chat events
  'chat:message': (message: ChatMessage) => void;
  'chat:typing': (data: { conversationId: string; userId: string; userName: string; isTyping: boolean }) => void;
  'chat:read': (data: { conversationId: string; messageIds: string[] }) => void;

  // WebRTC Signaling
  'webrtc:offer': (data: { sessionId: string; offer: RTCSessionDescriptionInit; peerId: string }) => void;
  'webrtc:answer': (data: { sessionId: string; answer: RTCSessionDescriptionInit; peerId: string }) => void;
  'webrtc:ice-candidate': (data: { sessionId: string; candidate: RTCIceCandidateInit; peerId: string }) => void;
  'webrtc:peer-joined': (data: { sessionId: string; peerId: string; peerName: string; isTherapist: boolean }) => void;
  'webrtc:peer-left': (data: { sessionId: string; peerId: string }) => void;
  'webrtc:peer-media-state': (data: { sessionId: string; peerId: string; audio: boolean; video: boolean }) => void;

  // Notifications
  'notification:new': (notification: Notification) => void;

  // Session events
  'session:started': (data: { sessionId: string }) => void;
  'session:ended': (data: { sessionId: string; endedBy: string }) => void;
  'session:recording-started': (data: { sessionId: string }) => void;
  'session:recording-stopped': (data: { sessionId: string }) => void;

  // Connection
  'connect_error': (error: Error) => void;
}

// Client -> Server Events
export interface ClientToServerEvents {
  // Room management
  'join:user-room': () => void;
  'join:session': (sessionId: string) => void;
  'leave:session': (sessionId: string) => void;
  'join:conversation': (conversationId: string) => void;
  'leave:conversation': (conversationId: string) => void;

  // Chat
  'chat:send': (data: { conversationId: string; content: string }) => void;
  'chat:typing': (data: { conversationId: string; isTyping: boolean }) => void;
  'chat:mark-read': (data: { conversationId: string; messageIds: string[] }) => void;

  // WebRTC Signaling
  'webrtc:offer': (data: { sessionId: string; offer: RTCSessionDescriptionInit }) => void;
  'webrtc:answer': (data: { sessionId: string; answer: RTCSessionDescriptionInit }) => void;
  'webrtc:ice-candidate': (data: { sessionId: string; candidate: RTCIceCandidateInit }) => void;
  'webrtc:media-state': (data: { sessionId: string; audio: boolean; video: boolean }) => void;
  'webrtc:request-offer': (data: { sessionId: string }) => void;

  // Session controls
  'session:start': (sessionId: string) => void;
  'session:end': (sessionId: string) => void;
  'session:start-recording': (sessionId: string) => void;
  'session:stop-recording': (sessionId: string) => void;
}

// Inter-server events (for internal use)
export interface InterServerEvents {
  ping: () => void;
}

// Socket data (attached to each socket)
export interface SocketData {
  userId: string;
  userName: string;
  isTherapist: boolean;
}

// Room naming conventions
export const ROOM_NAMES = {
  user: (userId: string) => `user:${userId}`,
  session: (sessionId: string) => `session:${sessionId}`,
  conversation: (conversationId: string) => `conversation:${conversationId}`,
} as const;
