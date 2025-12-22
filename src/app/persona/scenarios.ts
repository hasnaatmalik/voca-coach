export interface Scenario {
  id: string;
  name: string;
  icon: string;
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
    icon: '💼',
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
    icon: '😤',
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
    icon: '📞',
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
    icon: '🎤',
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
    icon: '💰',
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
    icon: '🤝',
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
    icon: '📝',
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
    icon: '⚖️',
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

export const PERSONA_TEMPLATES = [
  {
    name: 'Interviewer',
    description: 'A professional interviewer who asks probing questions and evaluates responses thoughtfully. Maintains a formal but friendly demeanor.',
    icon: '👔'
  },
  {
    name: 'Coach',
    description: 'An encouraging coach who provides positive reinforcement while gently pushing you to improve. Focuses on strengths while addressing weaknesses.',
    icon: '🏆'
  },
  {
    name: 'Critic',
    description: 'A constructive critic who provides honest, detailed feedback. Points out areas for improvement while acknowledging what works well.',
    icon: '🎯'
  },
  {
    name: 'Language Partner',
    description: 'A patient language practice partner who helps with pronunciation, grammar, and natural expressions. Corrects mistakes gently.',
    icon: '🌍'
  },
  {
    name: 'Debate Partner',
    description: 'An intellectual debater who argues opposing viewpoints to help strengthen your arguments. Challenges assumptions respectfully.',
    icon: '💬'
  }
];
