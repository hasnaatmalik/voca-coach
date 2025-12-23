// De-Escalation Training System Types

export type PitchLevel = 'low' | 'normal' | 'elevated' | 'high';
export type PauseFrequency = 'low' | 'normal' | 'healthy';
export type RiskLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type TechniqueType = 'breathing' | 'grounding' | 'cognitive' | 'physical';
export type ScenarioDifficulty = 'easy' | 'medium' | 'hard';
export type ScenarioCategory = 'conflict' | 'anxiety' | 'anger' | 'panic';
export type BreathingPattern = 'box' | '478' | 'physiological';
export type InterventionType = 'coaching' | 'breathing' | 'grounding' | 'crisis';

// Voice Biomarkers from real-time analysis
export interface VoiceBiomarkers {
  speakingRate: number;        // Words per minute (WPM)
  pitchLevel: PitchLevel;
  volumeIntensity: number;     // 0-1 scale
  pauseFrequency: PauseFrequency;
  tremorDetected: boolean;
  overallStressScore: number;  // 0-1 scale
  recommendations: string[];
  timestamp?: number;          // Seconds into session
}

// Transcript segment with emotion tagging
export interface TranscriptSegment {
  id: string;
  timestamp: number;           // Seconds into session
  duration: number;            // Duration of this segment in seconds
  text: string;
  emotion: string;
  intensity: number;           // 0-1 scale
  isTriggerWord?: boolean;
}

// Full transcript with metadata
export interface SessionTranscript {
  segments: TranscriptSegment[];
  fullText: string;
  dominantEmotion: string;
  averageIntensity: number;
}

// AI Intervention during session
export interface AIIntervention {
  id: string;
  timestamp: number;
  type: InterventionType;
  message: string;
  triggerReason: string;
  audioPlayed?: boolean;
}

// Breathing exercise configuration
export interface BreathingConfig {
  pattern: BreathingPattern;
  name: string;
  description: string;
  inhale: number;              // Seconds
  hold?: number;               // Seconds (optional)
  exhale: number;              // Seconds
  holdAfter?: number;          // Seconds (optional, for box breathing)
  cycles: number;
  totalDuration: number;       // Total duration in seconds
}

// Pre-defined breathing patterns
export const BREATHING_PATTERNS: Record<BreathingPattern, BreathingConfig> = {
  box: {
    pattern: 'box',
    name: 'Box Breathing',
    description: 'Equal counts for inhale, hold, exhale, and hold. Great for calming anxiety.',
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdAfter: 4,
    cycles: 4,
    totalDuration: 64, // 4 * 4 * 4 = 64 seconds
  },
  '478': {
    pattern: '478',
    name: '4-7-8 Breathing',
    description: 'Inhale for 4, hold for 7, exhale for 8. Promotes relaxation and sleep.',
    inhale: 4,
    hold: 7,
    exhale: 8,
    cycles: 4,
    totalDuration: 76, // (4+7+8) * 4 = 76 seconds
  },
  physiological: {
    pattern: 'physiological',
    name: 'Physiological Sigh',
    description: 'Double inhale followed by a long exhale. Fast stress relief.',
    inhale: 2,       // First inhale
    hold: 1,         // Second quick inhale
    exhale: 6,
    cycles: 3,
    totalDuration: 27, // (2+1+6) * 3 = 27 seconds
  },
};

// De-escalation technique
export interface DeEscalationTechnique {
  id: string;
  name: string;
  type: TechniqueType;
  description: string;
  duration: number;            // Seconds
  icon: string;
  steps: string[];
  audioGuide?: string;
  effectiveness?: number;      // 0-100, based on user history
}

// Practice scenario
export interface DeEscalationScenario {
  id: string;
  name: string;
  description: string;
  difficulty: ScenarioDifficulty;
  category: ScenarioCategory;
  icon: string;
  aiPrompt: string;
  tips?: string[];
}

// Scenario practice message
export interface ScenarioMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  emotion?: string;
  intensity?: number;
}

// Session recording metadata
export interface SessionRecording {
  id: string;
  sessionId: string;
  audioPath: string;
  duration: number;
  transcript: SessionTranscript;
  biomarkerTimeline: VoiceBiomarkers[];
  aiInterventions: AIIntervention[];
  createdAt: string;
}

// Crisis detection result
export interface CrisisDetectionResult {
  isCrisis: boolean;
  riskLevel: RiskLevel;
  triggers: string[];
  recommendedAction: string;
  resources: CrisisResource[];
  shouldPauseSession: boolean;
}

// Crisis resource
export interface CrisisResource {
  name: string;
  contact: string;
  description?: string;
  url?: string;
}

// Default crisis resources
export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    name: '988 Suicide & Crisis Lifeline',
    contact: '988',
    description: '24/7 support for people in distress',
    url: 'https://988lifeline.org',
  },
  {
    name: 'Crisis Text Line',
    contact: 'Text HOME to 741741',
    description: 'Free 24/7 text support',
    url: 'https://www.crisistextline.org',
  },
  {
    name: 'SAMHSA National Helpline',
    contact: '1-800-662-4357',
    description: 'Treatment referrals and information',
    url: 'https://www.samhsa.gov/find-help/national-helpline',
  },
  {
    name: 'Emergency Services',
    contact: '911',
    description: 'For immediate danger',
  },
];

// Session progress and analytics
export interface SessionProgress {
  totalSessions: number;
  totalMinutes: number;
  averageStressReduction: number;
  streakDays: number;
  currentStreak: number;
  longestStreak: number;
  mostEffectiveTechniques: string[];
  weeklyData: WeeklyDataPoint[];
  achievements: Achievement[];
  recentSessions: SessionSummary[];
}

export interface WeeklyDataPoint {
  date: string;
  sessions: number;
  avgStress: number;
  minutesPracticed: number;
}

export interface Achievement {
  id: string;
  type: 'streak' | 'sessions' | 'techniques' | 'improvement';
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;           // 0-100 for locked achievements
}

export interface SessionSummary {
  id: string;
  date: string;
  duration: number;
  averageStress: number;
  peakStress: number;
  techniquesUsed: string[];
  moodBefore?: number;
  moodAfter?: number;
  hasRecording: boolean;
}

// User preferences
export interface DeEscalationPreferences {
  preferredVoiceId?: string;
  preferredTechniques: string[];
  ambientSoundPref?: string;
  ambientVolume: number;
  coachingEnabled: boolean;
  recordingConsent: boolean;
  sessionReminders: boolean;
  darkMode: boolean;
}

// Personalized recommendations
export interface PersonalizedRecommendations {
  suggestedTechniques: DeEscalationTechnique[];
  suggestedScenarios: DeEscalationScenario[];
  practiceReminder?: string;
  insights: string[];
  nextMilestone?: {
    name: string;
    progress: number;
    description: string;
  };
}

// Ambient sound option
export interface AmbientSound {
  id: string;
  name: string;
  icon: string;
  url?: string;                // External URL or null for generated
  isGenerated?: boolean;       // True for Web Audio API generated sounds
  category: 'nature' | 'noise' | 'music' | 'binaural';
}

// Pre-defined ambient sounds
export const AMBIENT_SOUNDS: AmbientSound[] = [
  {
    id: 'rain',
    name: 'Gentle Rain',
    icon: '🌧️',
    url: 'https://cdn.pixabay.com/audio/2022/05/13/audio_257112847d.mp3',
    category: 'nature',
  },
  {
    id: 'forest',
    name: 'Forest Birds',
    icon: '🌲',
    url: 'https://cdn.pixabay.com/audio/2022/08/04/audio_2dde668d05.mp3',
    category: 'nature',
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    icon: '🌊',
    url: 'https://cdn.pixabay.com/audio/2022/06/07/audio_b9bd4170e4.mp3',
    category: 'nature',
  },
  {
    id: 'white-noise',
    name: 'White Noise',
    icon: '📻',
    isGenerated: true,
    category: 'noise',
  },
  {
    id: 'pink-noise',
    name: 'Pink Noise',
    icon: '🎀',
    isGenerated: true,
    category: 'noise',
  },
  {
    id: 'brown-noise',
    name: 'Brown Noise',
    icon: '🟤',
    isGenerated: true,
    category: 'noise',
  },
  {
    id: 'binaural-40hz',
    name: 'Binaural 40Hz',
    icon: '🧠',
    isGenerated: true,
    category: 'binaural',
  },
];

// Voice options for AI coach
export interface VoiceOption {
  id: string;
  name: string;
  description: string;
  previewUrl?: string;
  gender: 'male' | 'female' | 'neutral';
  style: 'calm' | 'warm' | 'professional';
}

// Default voice options (ElevenLabs)
export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    description: 'Warm and empathetic female voice',
    gender: 'female',
    style: 'warm',
  },
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    description: 'Professional and clear female voice',
    gender: 'female',
    style: 'professional',
  },
  {
    id: 'jBpfuIE2acCO8z3wKNLl',
    name: 'Gigi',
    description: 'Calm and soothing female voice',
    gender: 'female',
    style: 'calm',
  },
  {
    id: 'onwK4e9ZLuTAKqWW03F9',
    name: 'Daniel',
    description: 'Warm and reassuring male voice',
    gender: 'male',
    style: 'warm',
  },
  {
    id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    description: 'Professional male voice',
    gender: 'male',
    style: 'professional',
  },
];

// Default techniques
export const DEFAULT_TECHNIQUES: DeEscalationTechnique[] = [
  {
    id: 'box-breathing',
    name: 'Box Breathing',
    type: 'breathing',
    description: 'A powerful technique to calm your nervous system. Breathe in a square pattern: inhale, hold, exhale, hold.',
    duration: 120,
    icon: '📦',
    steps: [
      'Find a comfortable seated position',
      'Breathe in slowly for 4 seconds',
      'Hold your breath for 4 seconds',
      'Exhale slowly for 4 seconds',
      'Hold empty for 4 seconds',
      'Repeat for 4 cycles',
    ],
  },
  {
    id: '478-breathing',
    name: '4-7-8 Breathing',
    type: 'breathing',
    description: 'A relaxation technique that promotes calmness and sleep. Great for anxiety relief.',
    duration: 180,
    icon: '🌙',
    steps: [
      'Sit comfortably with your back straight',
      'Place tongue against the roof of your mouth',
      'Exhale completely through your mouth',
      'Inhale quietly through your nose for 4 seconds',
      'Hold your breath for 7 seconds',
      'Exhale completely through mouth for 8 seconds',
      'Repeat for 4 cycles',
    ],
  },
  {
    id: 'physiological-sigh',
    name: 'Physiological Sigh',
    type: 'breathing',
    description: 'The fastest way to calm down in real-time. Based on neuroscience research.',
    duration: 60,
    icon: '😮‍💨',
    steps: [
      'Take a deep breath in through your nose',
      'At the top, take another quick breath to fill lungs completely',
      'Slowly exhale through your mouth for as long as comfortable',
      'Repeat 2-3 times',
    ],
  },
  {
    id: '54321-grounding',
    name: '5-4-3-2-1 Grounding',
    type: 'grounding',
    description: 'A sensory awareness exercise to bring you back to the present moment.',
    duration: 180,
    icon: '🖐️',
    steps: [
      'Name 5 things you can SEE around you',
      'Name 4 things you can TOUCH or feel',
      'Name 3 things you can HEAR',
      'Name 2 things you can SMELL',
      'Name 1 thing you can TASTE',
      'Take a deep breath and notice how you feel',
    ],
  },
  {
    id: 'progressive-muscle',
    name: 'Progressive Muscle Relaxation',
    type: 'physical',
    description: 'Systematically tense and release muscle groups to release physical tension.',
    duration: 300,
    icon: '💪',
    steps: [
      'Find a comfortable position',
      'Start with your feet: tense for 5 seconds, then release',
      'Move to calves: tense and release',
      'Continue to thighs, abdomen, chest',
      'Arms, hands, shoulders, neck',
      'Finally, face and jaw',
      'Notice the difference between tension and relaxation',
    ],
  },
  {
    id: 'cognitive-reframe',
    name: 'Cognitive Reframing',
    type: 'cognitive',
    description: 'Challenge and reshape negative thoughts into more balanced perspectives.',
    duration: 300,
    icon: '🧠',
    steps: [
      'Identify the negative thought causing distress',
      'Ask: Is this thought completely true?',
      'What evidence supports or contradicts it?',
      'What would you tell a friend thinking this?',
      'Create a more balanced alternative thought',
      'Notice how the new perspective feels',
    ],
  },
  {
    id: 'anchoring-phrases',
    name: 'Anchoring Phrases',
    type: 'cognitive',
    description: 'Use calming mantras to center yourself during stress.',
    duration: 120,
    icon: '⚓',
    steps: [
      'Choose a phrase that resonates with you',
      'Examples: "This too shall pass", "I am safe in this moment"',
      'Repeat the phrase slowly, either aloud or silently',
      'Breathe deeply between repetitions',
      'Focus on the meaning and let it ground you',
    ],
  },
];

// Default scenarios
export const DEFAULT_SCENARIOS: DeEscalationScenario[] = [
  {
    id: 'difficult-conversation',
    name: 'Difficult Conversation',
    description: 'Practice staying calm during a workplace disagreement or confrontation.',
    difficulty: 'easy',
    category: 'conflict',
    icon: '💼',
    aiPrompt: `You are playing the role of a frustrated coworker who is upset about a project deadline being missed. Start with mild frustration and gradually increase intensity based on how the user responds. If they use de-escalation techniques (staying calm, acknowledging feelings, seeking solutions), gradually become more cooperative. If they become defensive or aggressive, maintain your frustration but don't escalate beyond moderate levels. Keep responses conversational and realistic.`,
    tips: [
      'Acknowledge their feelings first',
      'Use "I" statements instead of "you" accusations',
      'Speak slowly and calmly',
      'Look for common ground',
    ],
  },
  {
    id: 'public-speaking',
    name: 'Public Speaking Anxiety',
    description: 'Practice calming yourself before and during a presentation.',
    difficulty: 'medium',
    category: 'anxiety',
    icon: '🎤',
    aiPrompt: `You are playing the role of an audience member asking questions after a presentation. Start with simple questions, then ask more challenging ones. Occasionally show signs of skepticism or confusion to create mild pressure. Be realistic but supportive overall. If the user stays calm and handles questions well, show appreciation. If they seem flustered, your questions become gentler.`,
    tips: [
      'Take a breath before answering',
      'It\'s okay to pause and think',
      'You don\'t need to have all answers',
      'Focus on your breathing',
    ],
  },
  {
    id: 'anger-management',
    name: 'Anger Management',
    description: 'Practice responding calmly to provocation and criticism.',
    difficulty: 'medium',
    category: 'anger',
    icon: '😤',
    aiPrompt: `You are playing the role of someone who is being critical and slightly confrontational. Make pointed comments and mild criticisms. Don't be abusive, but be persistently annoying and dismissive. If the user responds with calmness and de-escalation, gradually back down. If they escalate, maintain your position but don't get worse. The goal is to help them practice not reacting emotionally.`,
    tips: [
      'Notice physical signs of anger rising',
      'Take a step back mentally',
      'Use the pause: count to 10 before responding',
      'Focus on what you can control',
    ],
  },
  {
    id: 'panic-response',
    name: 'Panic Response',
    description: 'Practice calming techniques during a simulated panic situation.',
    difficulty: 'hard',
    category: 'panic',
    icon: '😰',
    aiPrompt: `You are a supportive guide helping someone through a panic moment. Describe a scenario where they're in a stressful situation (e.g., stuck in traffic, running late for important event, received bad news). Your role is to both create the scenario tension AND guide them through it. Occasionally increase pressure, but always offer paths to calm down. Respond to their coping attempts positively.`,
    tips: [
      'Remember: panic attacks always pass',
      'Focus on your breath',
      'Ground yourself in the present',
      'This is practice - you are safe',
    ],
  },
];
