// Shared Socket.io event type definitions

// Extended ChatMessage with voice, media, and AI features
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string | null;
  type: 'text' | 'voice' | 'image' | 'file';
  mediaUrl?: string;
  mediaDuration?: number;
  mediaSize?: number;
  fileName?: string;
  mimeType?: string;
  transcript?: string;
  sentiment?: string;
  crisisLevel?: string;
  replyToId?: string;
  replyToPreview?: {
    id: string;
    content: string | null;
    senderName: string;
    type: string;
  };
  isEdited: boolean;
  reactions?: ChatReaction[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatReaction {
  id: string;
  messageId: string;
  userId: string;
  userName: string;
  emoji: string;
  createdAt: string;
}

export interface PresenceData {
  userId: string;
  userName: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen?: string;
}

export interface CrisisAlertData {
  messageId: string;
  conversationId: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  resources: Array<{
    name: string;
    contact: string;
    description: string;
    url?: string;
  }>;
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
  'chat:read': (data: { conversationId: string; messageIds: string[]; readAt: string; readBy: string }) => void;

  // Extended chat events
  'chat:message-edited': (data: { messageId: string; conversationId: string; content: string; updatedAt: string }) => void;
  'chat:message-deleted': (data: { messageId: string; conversationId: string }) => void;
  'chat:reaction-added': (data: { messageId: string; conversationId: string; reaction: ChatReaction }) => void;
  'chat:reaction-removed': (data: { messageId: string; conversationId: string; userId: string; emoji: string }) => void;
  'chat:crisis-alert': (data: CrisisAlertData) => void;
  'chat:biomarkers-ready': (data: { messageId: string; conversationId: string; biomarkers: string }) => void;

  // Presence events
  'presence:changed': (data: PresenceData) => void;
  'presence:bulk': (data: PresenceData[]) => void;

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

  // Video Call events
  'video-call:incoming': (data: {
    callId: string;
    callerId: string;
    callerName: string;
    callerIsTherapist: boolean;
    conversationId: string;
  }) => void;
  'video-call:accepted': (data: { callId: string }) => void;
  'video-call:declined': (data: { callId: string }) => void;
  'video-call:ended': (data: { callId: string }) => void;
  'video-call:failed': (data: { callId: string; reason: string }) => void;

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

  // Chat - Text messages
  'chat:send': (data: {
    conversationId: string;
    content: string;
    replyToId?: string;
  }) => void;

  // Chat - Voice messages
  'chat:send-voice': (data: {
    conversationId: string;
    audioBase64: string;
    duration: number;
    replyToId?: string;
  }) => void;

  // Chat - Media messages (image/file)
  'chat:send-media': (data: {
    conversationId: string;
    type: 'image' | 'file';
    mediaUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    content?: string;
    replyToId?: string;
  }) => void;

  // Chat - Message actions
  'chat:typing': (data: { conversationId: string; isTyping: boolean }) => void;
  'chat:mark-read': (data: { conversationId: string; messageIds: string[] }) => void;
  'chat:edit': (data: { messageId: string; conversationId: string; content: string }) => void;
  'chat:delete': (data: { messageId: string; conversationId: string }) => void;

  // Chat - Reactions
  'chat:react': (data: { messageId: string; conversationId: string; emoji: string }) => void;
  'chat:unreact': (data: { messageId: string; conversationId: string; emoji: string }) => void;

  // Chat - Biomarker analysis (on-demand)
  'chat:analyze-biomarkers': (data: { messageId: string; conversationId: string }) => void;

  // Presence
  'presence:update': (data: { status: 'online' | 'away' | 'busy' }) => void;
  'presence:get': (data: { userIds: string[] }) => void;

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

  // Video Call controls
  'video-call:initiate': (data: {
    conversationId: string;
    callId: string;
    callerId: string;
    callerName: string;
    callerIsTherapist: boolean;
    receiverId: string;
  }) => void;
  'video-call:accept': (data: {
    callId: string;
    accepterId: string;
    accepterName: string;
  }) => void;
  'video-call:decline': (data: {
    callId: string;
    declinerId: string;
  }) => void;
  'video-call:end': (data: {
    callId: string;
    endedBy: string;
  }) => void;
  'video-call:timeout': (data: { callId: string }) => void;
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
