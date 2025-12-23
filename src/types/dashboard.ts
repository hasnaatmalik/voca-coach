// Dashboard-specific type definitions

export interface DashboardStats {
  sessionCount: number;
  avgCalmScore: number;
  journalCount: number;
  streak: number;
}

export interface WeeklyProgressData {
  sessions: number[];        // Last 7 days session counts
  journalEntries: number[];  // Last 7 days journal counts
  moodTrend: number[];       // Last 7 days avg mood (0-100)
  improvement: number;       // Week-over-week % change
}

export interface UpcomingSession {
  id: string;
  therapistName: string;
  therapistId: string;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface DashboardAchievement {
  id: string;
  name: string;
  icon: string;
  type: 'streak' | 'sessions' | 'techniques' | 'improvement';
  unlockedAt?: string;
  progress?: number;        // 0-100 for locked achievements
}

export interface ActivityItem {
  id: string;
  type: 'session' | 'journal' | 'chat' | 'achievement' | 'biomarker' | 'therapy';
  title: string;
  description: string;
  timestamp: string;
  icon?: string;
  metadata?: Record<string, unknown>;
}

export interface DashboardRecommendation {
  id: string;
  type: 'technique' | 'journal' | 'session' | 'insight';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  action?: {
    label: string;
    href: string;
  };
  generatedAt: string;
}

export interface SentimentData {
  avgEmotions: {
    happy: number;
    sad: number;
    anxious: number;
    calm: number;
    neutral: number;
    frustrated: number;
  };
  dominantMood: string;
  emotionalStability: number;
  recentSessions: Array<{
    date: string;
    dominantMood: string;
    emotionalScore: number;
    moodChanges: number;
  }>;
}

export interface TodaySummary {
  sessionsCompleted: number;
  targetSessions: number;
  journalEntries: number;
  minutesPracticed: number;
  moodAverage: number | null;
  focusArea: string;
}

export interface EnhancedStatsResponse {
  // Existing fields
  stats: DashboardStats;
  sentimentData: SentimentData | null;
  activity: ActivityItem[];
  userName: string;

  // New fields
  empathyScore: number;
  engagementScore: number;
  weeklyProgress: WeeklyProgressData;
  upcomingSessions: UpcomingSession[];
  achievements: DashboardAchievement[];
  recentActivity: ActivityItem[];
}

// History page types
export interface HistoryFilters {
  type: 'all' | 'sessions' | 'journal' | 'biomarkers' | 'achievements';
  dateRange: 'week' | 'month' | '3months' | 'all';
  sortBy: 'date' | 'type';
  sortOrder: 'asc' | 'desc';
}

export interface HistoryItem {
  id: string;
  type: 'session' | 'journal' | 'biomarker' | 'achievement' | 'therapy';
  title: string;
  description: string;
  date: string;
  metadata: Record<string, unknown>;
}

export interface HistoryResponse {
  items: HistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  summary: {
    totalSessions: number;
    totalJournalEntries: number;
    totalBiomarkerReadings: number;
    totalAchievements: number;
  };
}
