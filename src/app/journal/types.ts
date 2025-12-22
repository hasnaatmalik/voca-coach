export type ViewMode = 'chat' | 'write' | 'gratitude' | 'cbt' | 'voice' | 'history' | 'analytics' | 'prompts';

export type SessionType = 'free_write' | 'guided' | 'gratitude' | 'cbt_exercise' | 'voice';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
  distortion?: string | null;
  distortions?: Distortion[];
  moodIndicators?: {
    detected: string;
    intensity: number;
  };
}

export interface Distortion {
  type: string;
  confidence: number;
  excerpt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  sessionId?: string | null;
  title?: string | null;
  content: string;
  mood?: number | null;
  moodAfter?: number | null;
  distortion?: string | null;
  distortions?: string | null;
  socraticPrompt?: string | null;
  userResponse?: string | null;
  tags?: string | null;
  isVoiceEntry: boolean;
  audioUrl?: string | null;
  aiSummary?: string | null;
  gratitudeItems?: string | null;
  createdAt: string;
  updatedAt: string;
  session?: {
    id: string;
    sessionType: string;
    title?: string | null;
  } | null;
}

export interface JournalSession {
  id: string;
  userId: string;
  sessionType: SessionType;
  title?: string | null;
  summary?: string | null;
  moodStart?: number | null;
  moodEnd?: number | null;
  messages: string;
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
  entries?: JournalEntry[];
  _count?: {
    entries: number;
  };
}

export interface JournalStreak {
  currentStreak: number;
  longestStreak: number;
  lastEntryDate: string | null;
  totalEntries: number;
}

export interface JournalPrompt {
  id: string;
  category: string;
  prompt: string;
  isAIGenerated: boolean;
  usageCount: number;
  createdAt: string;
}

export interface InsightResponse {
  distortions: Distortion[];
  distortion?: string | null;
  socraticPrompt: string;
  followUpQuestions: string[];
  moodIndicators: {
    detected: string;
    intensity: number;
  };
  crisisDetected: boolean;
  crisisLevel?: 'low' | 'medium' | 'high';
  suggestedResources?: string[];
  reframingSuggestion?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface MoodTrend {
  date: string;
  mood: number;
  moodAfter?: number;
}

export interface DistortionStats {
  type: string;
  count: number;
  percentage: number;
}

export interface TagCloud {
  tag: string;
  count: number;
}

export interface JournalAnalytics {
  streak: JournalStreak | null;
  moodTrends: MoodTrend[];
  distortionStats: DistortionStats[];
  tagCloud: TagCloud[];
  weeklyActivity: number[];
  totalSessions: number;
  sessionsByType: Record<string, number>;
  averageMood: number | null;
  moodImprovement: number | null;
}

export interface CBTThoughtRecord {
  situation: string;
  automaticThought: string;
  emotion: string;
  emotionIntensity: number;
  evidenceFor: string;
  evidenceAgainst: string;
  balancedThought: string;
  newEmotionIntensity: number;
}

export interface GratitudeEntry {
  items: [string, string, string];
  elaborations?: [string, string, string];
}

export const MOOD_EMOJIS: Record<number, string> = {
  1: '😢',
  2: '😞',
  3: '😔',
  4: '😕',
  5: '😐',
  6: '🙂',
  7: '😊',
  8: '😄',
  9: '😁',
  10: '🤩',
};

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  free_write: 'Free Write',
  guided: 'Guided',
  gratitude: 'Gratitude',
  cbt_exercise: 'CBT Exercise',
  voice: 'Voice',
};

export const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  chat: 'Chat',
  write: 'Write',
  gratitude: 'Gratitude',
  cbt: 'CBT Exercise',
  voice: 'Voice',
  history: 'History',
  analytics: 'Analytics',
  prompts: 'Prompts',
};
