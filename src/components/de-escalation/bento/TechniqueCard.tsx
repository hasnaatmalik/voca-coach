'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, ReactNode } from 'react';

// SVG Icon Components for Techniques
const BoxIcon = ({ color = '#7AB89E' }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const MoonIcon = ({ color = '#7AB89E' }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const LeafIcon = ({ color = '#7AAFC9' }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

const MeditationIcon = ({ color = '#7AAFC9' }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="6" r="3" />
    <path d="M12 9v3" />
    <path d="M6 15c0-2 1.5-3 3-3h6c1.5 0 3 1 3 3" />
    <path d="M4 20c0-1.5 1-3 4-3h8c3 0 4 1.5 4 3" />
    <path d="M9 21v-2" />
    <path d="M15 21v-2" />
  </svg>
);

const RefreshIcon = ({ color = '#E4B17A' }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const EarIcon = ({ color = '#D9A299' }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0" />
    <path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 0 4 0" />
  </svg>
);

const ToolboxIcon = ({ color = '#D9A299' }: { color?: string }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const ClockIcon = ({ color = '#9CA3AF' }: { color?: string }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

interface Technique {
  id: string;
  name: string;
  category: 'breathing' | 'grounding' | 'cognitive' | 'communication';
  icon: ReactNode;
  description: string;
  duration: string;
  steps: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface TechniqueCardProps {
  onSelectTechnique?: (technique: Technique) => void;
  currentStressLevel?: number;
}

const techniques: Technique[] = [
  {
    id: 'box-breathing',
    name: 'Box Breathing',
    category: 'breathing',
    icon: <BoxIcon />,
    description: 'A Navy SEAL technique for instant calm',
    duration: '4 min',
    steps: [
      'Inhale slowly for 4 seconds',
      'Hold your breath for 4 seconds',
      'Exhale slowly for 4 seconds',
      'Hold empty for 4 seconds',
      'Repeat 4-6 times',
    ],
    difficulty: 'beginner',
  },
  {
    id: '478-breathing',
    name: '4-7-8 Breathing',
    category: 'breathing',
    icon: <MoonIcon />,
    description: 'Dr. Weil\'s relaxation technique',
    duration: '3 min',
    steps: [
      'Exhale completely through mouth',
      'Inhale quietly through nose for 4 seconds',
      'Hold breath for 7 seconds',
      'Exhale through mouth for 8 seconds',
    ],
    difficulty: 'intermediate',
  },
  {
    id: 'grounding-54321',
    name: '5-4-3-2-1 Grounding',
    category: 'grounding',
    icon: <LeafIcon />,
    description: 'Sensory awareness for panic relief',
    duration: '5 min',
    steps: [
      'Name 5 things you can see',
      'Name 4 things you can touch',
      'Name 3 things you can hear',
      'Name 2 things you can smell',
      'Name 1 thing you can taste',
    ],
    difficulty: 'beginner',
  },
  {
    id: 'body-scan',
    name: 'Quick Body Scan',
    category: 'grounding',
    icon: <MeditationIcon />,
    description: 'Release physical tension rapidly',
    duration: '3 min',
    steps: [
      'Close your eyes, take a deep breath',
      'Notice tension in your forehead, release',
      'Check your jaw - unclench',
      'Drop your shoulders down',
      'Relax your hands and fingers',
    ],
    difficulty: 'beginner',
  },
  {
    id: 'reframe',
    name: 'Cognitive Reframe',
    category: 'cognitive',
    icon: <RefreshIcon />,
    description: 'Change your perspective on the situation',
    duration: '2 min',
    steps: [
      'Identify the triggering thought',
      'Ask: Is this thought factual?',
      'Consider alternative explanations',
      'Choose a balanced perspective',
    ],
    difficulty: 'intermediate',
  },
  {
    id: 'active-listening',
    name: 'Active Listening',
    category: 'communication',
    icon: <EarIcon />,
    description: 'De-escalate through genuine attention',
    duration: '5 min',
    steps: [
      'Make appropriate eye contact',
      'Nod and use verbal acknowledgments',
      'Paraphrase what you\'ve heard',
      'Ask clarifying questions',
      'Avoid interrupting or defending',
    ],
    difficulty: 'intermediate',
  },
];

const categoryColors = {
  breathing: '#7AB89E',
  grounding: '#7AAFC9',
  cognitive: '#E4B17A',
  communication: '#D9A299',
};

const categoryLabels = {
  breathing: 'Breathing',
  grounding: 'Grounding',
  cognitive: 'Cognitive',
  communication: 'Communication',
};

const difficultyColors = {
  beginner: '#7AB89E',
  intermediate: '#E4B17A',
  advanced: '#D9A299',
};

export default function TechniqueCard({
  onSelectTechnique,
  currentStressLevel = 0.3,
}: TechniqueCardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedTechnique, setExpandedTechnique] = useState<string | null>(null);

  const categories = Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>;

  const filteredTechniques = selectedCategory
    ? techniques.filter((t) => t.category === selectedCategory)
    : techniques;

  // Recommend techniques based on stress level
  const recommendedIds = currentStressLevel >= 0.7
    ? ['box-breathing', 'grounding-54321']
    : currentStressLevel >= 0.5
      ? ['box-breathing', 'body-scan']
      : ['reframe', 'active-listening'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '28px',
        border: '1px solid #DCC5B2',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
      }}>
        <div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#2D2D2D',
            margin: 0,
            marginBottom: '4px',
          }}>
            Technique Library
          </h3>
          <p style={{
            fontSize: '13px',
            color: '#6B6B6B',
            margin: 0,
          }}>
            {techniques.length} techniques available
          </p>
        </div>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        >
          <ToolboxIcon />
        </motion.div>
      </div>

      {/* Category Filter */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        flexWrap: 'wrap',
      }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelectedCategory(null)}
          style={{
            padding: '8px 14px',
            background: selectedCategory === null
              ? 'linear-gradient(135deg, #D9A299 0%, #C8847A 100%)'
              : '#FAF7F3',
            color: selectedCategory === null ? 'white' : '#6B6B6B',
            border: selectedCategory === null ? 'none' : '1px solid #F0E4D3',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          All
        </motion.button>
        {categories.map((cat) => (
          <motion.button
            key={cat}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '8px 14px',
              background: selectedCategory === cat
                ? `linear-gradient(135deg, ${categoryColors[cat]} 0%, ${categoryColors[cat]}CC 100%)`
                : '#FAF7F3',
              color: selectedCategory === cat ? 'white' : '#6B6B6B',
              border: selectedCategory === cat ? 'none' : '1px solid #F0E4D3',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {categoryLabels[cat]}
          </motion.button>
        ))}
      </div>

      {/* Techniques List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxHeight: '400px',
        overflowY: 'auto',
      }}>
        <AnimatePresence mode="popLayout">
          {filteredTechniques.map((technique, index) => {
            const isRecommended = recommendedIds.includes(technique.id);
            const isExpanded = expandedTechnique === technique.id;

            return (
              <motion.div
                key={technique.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => setExpandedTechnique(isExpanded ? null : technique.id)}
                style={{
                  padding: '16px',
                  background: isRecommended
                    ? `linear-gradient(135deg, ${categoryColors[technique.category]}10 0%, ${categoryColors[technique.category]}05 100%)`
                    : '#FAF7F3',
                  borderRadius: '16px',
                  border: isRecommended
                    ? `2px solid ${categoryColors[technique.category]}`
                    : '1px solid #F0E4D3',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                {/* Recommended badge */}
                {isRecommended && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      padding: '4px 10px',
                      background: categoryColors[technique.category],
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '700',
                    }}
                  >
                    RECOMMENDED
                  </motion.div>
                )}

                {/* Main info row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}>
                  <motion.div
                    animate={isExpanded ? { scale: [1, 1.1, 1] } : {}}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: `linear-gradient(135deg, ${categoryColors[technique.category]}20 0%, ${categoryColors[technique.category]}10 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {technique.icon}
                  </motion.div>

                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#2D2D2D',
                      margin: 0,
                      marginBottom: '4px',
                    }}>
                      {technique.name}
                    </h4>
                    <p style={{
                      fontSize: '12px',
                      color: '#6B6B6B',
                      margin: 0,
                    }}>
                      {technique.description}
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '6px',
                  }}>
                    <span style={{
                      fontSize: '11px',
                      color: '#9CA3AF',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      <ClockIcon /> {technique.duration}
                    </span>
                    <span style={{
                      padding: '3px 8px',
                      background: `${difficultyColors[technique.difficulty]}20`,
                      color: difficultyColors[technique.difficulty],
                      borderRadius: '8px',
                      fontSize: '10px',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                    }}>
                      {technique.difficulty}
                    </span>
                  </div>
                </div>

                {/* Expanded steps */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{
                        marginTop: '16px',
                        padding: '16px',
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '12px',
                      }}>
                        <h5 style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#2D2D2D',
                          margin: 0,
                          marginBottom: '12px',
                        }}>
                          Steps:
                        </h5>
                        <ol style={{
                          margin: 0,
                          paddingLeft: '20px',
                        }}>
                          {technique.steps.map((step, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              style={{
                                fontSize: '13px',
                                color: '#4B5563',
                                marginBottom: '8px',
                                lineHeight: 1.4,
                              }}
                            >
                              {step}
                            </motion.li>
                          ))}
                        </ol>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTechnique?.(technique);
                          }}
                          style={{
                            marginTop: '12px',
                            padding: '10px 20px',
                            background: `linear-gradient(135deg, ${categoryColors[technique.category]} 0%, ${categoryColors[technique.category]}CC 100%)`,
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            width: '100%',
                          }}
                        >
                          Start Practice
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
