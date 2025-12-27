import { ReactNode } from 'react';

// SVG Icon Components for Scenarios
const BriefcaseIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.5">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const AngryFaceIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
    <path d="M7.5 8 10 9" />
    <path d="M14 9l2.5-1" />
    <line x1="9" y1="10" x2="9.01" y2="10" strokeWidth="2" />
    <line x1="15" y1="10" x2="15.01" y2="10" strokeWidth="2" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.5">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MicrophoneIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.5">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const DollarIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
    <path d="M12 18V6" />
  </svg>
);

const HandshakeIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.5">
    <path d="m11 17 2 2a1 1 0 1 0 3-3" />
    <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
    <path d="m21 3 1 11h-2" />
    <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
    <path d="M3 4h8" />
  </svg>
);

const ClipboardIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.5">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M9 12h6" />
    <path d="M9 16h6" />
  </svg>
);

const ScaleIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.5">
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </svg>
);

const TieIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.5">
    <path d="M12 22c1-3 6-10 6-14a6 6 0 0 0-12 0c0 4 5 11 6 14Z" />
    <path d="m9 7 3 2 3-2" />
  </svg>
);

const TrophyIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.5">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const TargetIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const ChatBubbleIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.5">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export interface Scenario {
  id: string;
  name: string;
  icon: ReactNode;
  description: string;
  context: string;
  objectives: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  personaHint?: string; // Suggested persona type
}

export const ROLEPLAY_SCENARIOS: Scenario[] = [
  {
    id: 'job-interview',
    name: 'Job Interview',
    icon: <BriefcaseIcon />,
    description: 'Practice answering common interview questions with confidence.',
    context: `You are conducting a job interview for a professional position.
    Ask typical interview questions like "Tell me about yourself", "What are your strengths and weaknesses?",
    "Where do you see yourself in 5 years?", and behavioral questions.
    Provide feedback on the candidate's answers at appropriate moments.`,
    objectives: [
      'Answer questions clearly and concisely',
      'Provide specific examples from experience',
      'Show enthusiasm and confidence',
      'Ask thoughtful questions about the role'
    ],
    difficulty: 'medium',
    personaHint: 'Difficult Boss'
  },
  {
    id: 'difficult-conversation',
    name: 'Difficult Conversation',
    icon: <AngryFaceIcon />,
    description: 'Learn to navigate challenging discussions with empathy.',
    context: `You are upset about something the user did or said. Be initially defensive and emotional.
    Allow yourself to be calmed down if the user shows genuine empathy and listens.
    Escalate if the user becomes dismissive or confrontational.`,
    objectives: [
      'Stay calm and composed',
      'Use active listening techniques',
      'Acknowledge the other person\'s feelings',
      'Find common ground and solutions'
    ],
    difficulty: 'hard',
    personaHint: 'Anxious Client'
  },
  {
    id: 'customer-complaint',
    name: 'Customer Complaint',
    icon: <PhoneIcon />,
    description: 'Handle upset customers professionally and find solutions.',
    context: `You are an unhappy customer calling to complain about a product or service issue.
    Be frustrated but not abusive. Have specific complaints ready.
    Be willing to accept reasonable solutions if offered sincerely.`,
    objectives: [
      'Remain professional and patient',
      'Acknowledge the customer\'s frustration',
      'Ask clarifying questions',
      'Offer practical solutions'
    ],
    difficulty: 'medium',
    personaHint: 'Anxious Client'
  },
  {
    id: 'public-speaking',
    name: 'Public Speaking Practice',
    icon: <MicrophoneIcon />,
    description: 'Get comfortable speaking in front of an audience.',
    context: `You are an audience member listening to a presentation.
    Ask relevant questions after the presentation.
    Occasionally look skeptical or distracted to simulate a real audience.
    Provide constructive feedback on clarity, engagement, and structure.`,
    objectives: [
      'Speak clearly and at a good pace',
      'Maintain engagement with the audience',
      'Handle questions confidently',
      'Use appropriate pauses and emphasis'
    ],
    difficulty: 'medium',
    personaHint: 'Calm Mentor'
  },
  {
    id: 'salary-negotiation',
    name: 'Salary Negotiation',
    icon: <DollarIcon />,
    description: 'Practice asking for what you deserve with confidence.',
    context: `You are a hiring manager or current boss discussing salary.
    Initially offer a lower amount than requested.
    Be willing to negotiate if the user makes a compelling case.
    Ask about their value proposition and accomplishments.`,
    objectives: [
      'Know your worth and state it clearly',
      'Provide evidence for your value',
      'Stay calm under pressure',
      'Find win-win solutions'
    ],
    difficulty: 'hard',
    personaHint: 'Difficult Boss'
  },
  {
    id: 'networking-event',
    name: 'Networking Event',
    icon: <HandshakeIcon />,
    description: 'Practice making professional connections naturally.',
    context: `You are a professional at a networking event.
    Be friendly but busy. Show interest if the user engages well.
    Ask about their work and background.
    Exchange contact information if the conversation goes well.`,
    objectives: [
      'Make a strong first impression',
      'Find common interests naturally',
      'Listen more than you talk',
      'Follow up appropriately'
    ],
    difficulty: 'easy',
    personaHint: 'Supportive Friend'
  },
  {
    id: 'giving-feedback',
    name: 'Giving Constructive Feedback',
    icon: <ClipboardIcon />,
    description: 'Learn to deliver feedback that helps people grow.',
    context: `You are an employee receiving feedback on your work.
    React realistically to the feedback - be defensive if it's delivered poorly,
    appreciative if it's delivered well with specific examples.
    Ask clarifying questions.`,
    objectives: [
      'Be specific and objective',
      'Focus on behavior, not personality',
      'Offer actionable suggestions',
      'End on a positive note'
    ],
    difficulty: 'medium',
    personaHint: 'Supportive Friend'
  },
  {
    id: 'conflict-resolution',
    name: 'Team Conflict Resolution',
    icon: <ScaleIcon />,
    description: 'Mediate disagreements between team members.',
    context: `You are a team member in conflict with another colleague (not present).
    Be frustrated but willing to find solutions.
    Have legitimate concerns about workload, communication, or respect.
    Be open to compromise if approached fairly.`,
    objectives: [
      'Understand both perspectives',
      'Stay neutral and fair',
      'Focus on solutions, not blame',
      'Create actionable agreements'
    ],
    difficulty: 'hard',
    personaHint: 'Calm Mentor'
  }
];

export interface Template {
  name: string;
  description: string;
  icon: ReactNode;
}

export const PERSONA_TEMPLATES: Template[] = [
  {
    name: 'Interviewer',
    description: 'A professional interviewer who asks probing questions and evaluates responses thoughtfully. Maintains a formal but friendly demeanor.',
    icon: <TieIcon />
  },
  {
    name: 'Coach',
    description: 'An encouraging coach who provides positive reinforcement while gently pushing you to improve. Focuses on strengths while addressing weaknesses.',
    icon: <TrophyIcon />
  },
  {
    name: 'Critic',
    description: 'A constructive critic who provides honest, detailed feedback. Points out areas for improvement while acknowledging what works well.',
    icon: <TargetIcon />
  },
  {
    name: 'Language Partner',
    description: 'A patient language practice partner who helps with pronunciation, grammar, and natural expressions. Corrects mistakes gently.',
    icon: <GlobeIcon />
  },
  {
    name: 'Debate Partner',
    description: 'An intellectual debater who argues opposing viewpoints to help strengthen your arguments. Challenges assumptions respectfully.',
    icon: <ChatBubbleIcon />
  }
];
