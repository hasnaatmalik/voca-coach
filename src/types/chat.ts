// Chat System Types

export type MessageType = 'text' | 'voice' | 'image' | 'file';
export type CrisisLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline';

// Chat Message
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string | null;
  type: MessageType;
  mediaUrl?: string;
  mediaDuration?: number; // seconds for voice
  mediaSize?: number; // bytes
  fileName?: string;
  mimeType?: string;
  transcript?: string; // voice message transcription
  sentiment?: MessageSentiment;
  biomarkers?: VoiceBiomarkers;
  crisisLevel?: CrisisLevel;
  replyToId?: string;
  replyToPreview?: ReplyPreview;
  isEdited: boolean;
  isDeleted?: boolean;
  reactions: ChatReaction[];
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Reply preview shown in threaded messages
export interface ReplyPreview {
  id: string;
  content: string | null;
  senderName: string;
  type: MessageType;
}

// Emoji reaction on a message
export interface ChatReaction {
  id: string;
  messageId: string;
  userId: string;
  userName: string;
  emoji: string;
  createdAt: string;
}

// Grouped reactions for display
export interface GroupedReaction {
  emoji: string;
  count: number;
  users: Array<{ userId: string; userName: string }>;
  hasUserReacted: boolean;
}

// Chat Conversation
export interface ChatConversation {
  id: string;
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
    lastActiveAt?: string;
  };
  lastMessage?: {
    content: string | null;
    type: MessageType;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
  updatedAt: string;
  createdAt: string;
}

// User presence
export interface UserPresence {
  userId: string;
  userName: string;
  status: PresenceStatus;
  lastSeen?: string;
}

// Message sentiment analysis
export interface MessageSentiment {
  score: number; // -1 to 1
  label: 'positive' | 'neutral' | 'negative';
  emotions?: {
    joy?: number;
    sadness?: number;
    anger?: number;
    fear?: number;
    surprise?: number;
  };
}

// Voice biomarkers (on-demand analysis)
export interface VoiceBiomarkers {
  speakingRate: number; // WPM
  pitchLevel: 'low' | 'normal' | 'elevated' | 'high';
  volumeIntensity: number; // 0-1
  pauseFrequency: 'low' | 'normal' | 'healthy';
  tremorDetected: boolean;
  overallStressScore: number; // 0-1
  recommendations: string[];
  analyzedAt: string;
}

// Crisis alert data
export interface CrisisAlert {
  messageId: string;
  conversationId: string;
  riskLevel: CrisisLevel;
  category?: string;
  resources: CrisisResource[];
}

// Crisis resource
export interface CrisisResource {
  name: string;
  contact: string;
  description: string;
  url?: string;
}

// Typing indicator state
export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: number;
}

// Read receipt
export interface ReadReceipt {
  messageId: string;
  userId: string;
  readAt: string;
}

// Smart reply suggestion
export interface SmartReply {
  id: string;
  content: string;
  confidence: number;
  category: 'empathetic' | 'informational' | 'actionable';
}

// Conversation summary
export interface ConversationSummary {
  conversationId: string;
  keyTopics: string[];
  moodProgression: {
    start: string;
    current: string;
    trend: 'improving' | 'stable' | 'declining';
  };
  actionItems: string[];
  generatedAt: string;
}

// Canned response (for therapists)
export interface CannedResponse {
  id: string;
  therapistId: string;
  category: 'greeting' | 'crisis' | 'homework' | 'scheduling' | 'encouragement';
  title: string;
  content: string;
  shortcut?: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// Media upload progress
export interface UploadProgress {
  id: string;
  fileName: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

// Offline message queue item
export interface QueuedMessage {
  id: string; // temporary ID
  conversationId: string;
  type: MessageType;
  content?: string;
  mediaBlob?: Blob;
  replyToId?: string;
  status: 'queued' | 'sending' | 'sent' | 'failed';
  retryCount: number;
  createdAt: number; // timestamp
}

// Link preview data
export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

// Session notes (for therapists)
export interface SessionNote {
  id: string;
  conversationId: string;
  messageId?: string; // linked to specific message
  content: string;
  createdAt: string;
  updatedAt: string;
}

// Client history for therapist sidebar
export interface ClientHistory {
  userId: string;
  userName: string;
  recentSessions: Array<{
    id: string;
    date: string;
    duration: number;
    mood: number;
  }>;
  moodTrend: Array<{
    date: string;
    mood: number;
  }>;
  recentJournalEntries: Array<{
    id: string;
    title?: string;
    createdAt: string;
    mood?: number;
  }>;
  biomarkerHistory: Array<{
    date: string;
    stress: number;
    clarity: number;
  }>;
  crisisEventCount: number;
}

// Mood check-in data (for students)
export interface MoodCheckIn {
  mood: number; // 1-10
  emotions: string[]; // selected emotion tags
  note?: string;
  createdAt: string;
}

// Chat notification settings
export interface ChatNotificationSettings {
  soundEnabled: boolean;
  soundVolume: number; // 0-1
  pushEnabled: boolean;
  showPreviews: boolean;
  mutedConversations: string[];
}

// Chat state for React context
export interface ChatState {
  conversations: ChatConversation[];
  selectedConversationId: string | null;
  messages: ChatMessage[];
  typingUsers: Map<string, TypingIndicator>;
  presenceMap: Map<string, UserPresence>;
  unreadCounts: Map<string, number>;
  messageQueue: QueuedMessage[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

// Chat actions for reducer
export type ChatAction =
  | { type: 'SET_CONVERSATIONS'; payload: ChatConversation[] }
  | { type: 'SELECT_CONVERSATION'; payload: string }
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<ChatMessage> } }
  | { type: 'DELETE_MESSAGE'; payload: string }
  | { type: 'ADD_REACTION'; payload: { messageId: string; reaction: ChatReaction } }
  | { type: 'REMOVE_REACTION'; payload: { messageId: string; userId: string; emoji: string } }
  | { type: 'SET_TYPING'; payload: TypingIndicator }
  | { type: 'SET_PRESENCE'; payload: UserPresence }
  | { type: 'SET_PRESENCE_BULK'; payload: UserPresence[] }
  | { type: 'UPDATE_UNREAD'; payload: { conversationId: string; count: number } }
  | { type: 'QUEUE_MESSAGE'; payload: QueuedMessage }
  | { type: 'UPDATE_QUEUE_STATUS'; payload: { id: string; status: QueuedMessage['status'] } }
  | { type: 'REMOVE_FROM_QUEUE'; payload: string }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };
