'use client';

import { motion } from 'framer-motion';
import { useState, ReactNode } from 'react';

// SVG Icon Components for Tips
const WindIcon = ({ color = '#7AB89E' }: { color?: string }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
    <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
    <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
  </svg>
);

const LeafIcon = ({ color = '#7AAFC9' }: { color?: string }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

const PauseIcon = ({ color = '#E4B17A' }: { color?: string }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="10" y1="15" x2="10" y2="9" />
    <line x1="14" y1="15" x2="14" y2="9" />
  </svg>
);

const HeartIcon = ({ color = '#D9A299' }: { color?: string }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const VolumeDownIcon = ({ color = '#9CA3AF' }: { color?: string }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const MeditationIcon = ({ color = '#10B981' }: { color?: string }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="6" r="3" />
    <path d="M12 9v3" />
    <path d="M6 15c0-2 1.5-3 3-3h6c1.5 0 3 1 3 3" />
    <path d="M4 20c0-1.5 1-3 4-3h8c3 0 4 1.5 4 3" />
    <path d="M9 21v-2" />
    <path d="M15 21v-2" />
  </svg>
);

const LightbulbIcon = ({ color = '#E4B17A' }: { color?: string }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

const AlertIcon = ({ color = '#DC2626' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

interface Tip {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
  technique: string;
  color: string;
}

interface QuickTipsGridProps {
  stressLevel: number;
  onTechniqueSelect?: (technique: string) => void;
}

const allTips: Tip[] = [
  {
    id: 'breathing',
    icon: <WindIcon />,
    title: 'Deep Breathing',
    description: 'Inhale 4s, hold 4s, exhale 6s',
    technique: 'Box breathing activates your parasympathetic nervous system',
    color: '#7AB89E',
  },
  {
    id: 'grounding',
    icon: <LeafIcon />,
    title: '5-4-3-2-1 Grounding',
    description: 'Name 5 things you see',
    technique: 'Sensory grounding reduces anxiety quickly',
    color: '#7AAFC9',
  },
  {
    id: 'pause',
    icon: <PauseIcon />,
    title: 'Strategic Pause',
    description: 'Take 3 seconds before responding',
    technique: 'A pause creates space for thoughtful response',
    color: '#E4B17A',
  },
  {
    id: 'empathy',
    icon: <HeartIcon />,
    title: 'Empathy Statement',
    description: '"I understand this is frustrating"',
    technique: 'Validation lowers defensive reactions',
    color: '#D9A299',
  },
  {
    id: 'lowering',
    icon: <VolumeDownIcon />,
    title: 'Lower Your Voice',
    description: 'Speak softer and slower',
    technique: 'Calm voice tone is contagious',
    color: '#9CA3AF',
  },
  {
    id: 'posture',
    icon: <MeditationIcon />,
    title: 'Open Posture',
    description: 'Relax shoulders, uncross arms',
    technique: 'Body language affects your mental state',
    color: '#10B981',
  },
];

const getTipsForStressLevel = (level: number): Tip[] => {
  if (level < 0.3) return [allTips[0], allTips[5]];
  if (level < 0.5) return [allTips[0], allTips[2], allTips[4]];
  if (level < 0.7) return [allTips[0], allTips[1], allTips[2], allTips[3]];
  return allTips;
};

export default function QuickTipsGrid({
  stressLevel,
  onTechniqueSelect,
}: QuickTipsGridProps) {
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const tips = getTipsForStressLevel(stressLevel);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
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
            fontSize: '18px',
            fontWeight: '600',
            color: '#2D2D2D',
            margin: 0,
            marginBottom: '4px',
          }}>
            Quick De-escalation Tips
          </h3>
          <p style={{
            fontSize: '13px',
            color: '#6B6B6B',
            margin: 0,
          }}>
            Tap any tip for more details
          </p>
        </div>
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        >
          <LightbulbIcon />
        </motion.div>
      </div>

      {/* Tips Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
        }}
      >
        {tips.map((tip) => (
          <motion.div
            key={tip.id}
            variants={cardVariants}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setExpandedTip(expandedTip === tip.id ? null : tip.id);
              onTechniqueSelect?.(tip.id);
            }}
            style={{
              padding: '16px',
              background: expandedTip === tip.id
                ? `linear-gradient(135deg, ${tip.color}15 0%, ${tip.color}05 100%)`
                : '#FAF7F3',
              borderRadius: '16px',
              border: expandedTip === tip.id
                ? `2px solid ${tip.color}`
                : '1px solid #F0E4D3',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {/* Icon */}
            <motion.div
              animate={expandedTip === tip.id ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
              style={{
                marginBottom: '10px',
              }}
            >
              {tip.icon}
            </motion.div>

            {/* Title */}
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#2D2D2D',
              margin: 0,
              marginBottom: '4px',
            }}>
              {tip.title}
            </h4>

            {/* Short description */}
            <p style={{
              fontSize: '12px',
              color: '#6B6B6B',
              margin: 0,
              lineHeight: 1.4,
            }}>
              {tip.description}
            </p>

            {/* Expanded technique detail */}
            <motion.div
              initial={false}
              animate={{
                height: expandedTip === tip.id ? 'auto' : 0,
                opacity: expandedTip === tip.id ? 1 : 0,
                marginTop: expandedTip === tip.id ? 12 : 0,
              }}
              style={{
                overflow: 'hidden',
              }}
            >
              <div style={{
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '8px',
                fontSize: '11px',
                color: tip.color,
                fontWeight: '500',
                lineHeight: 1.4,
              }}>
                {tip.technique}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* More tips indicator when stress is high */}
      {stressLevel >= 0.7 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #EF444415 0%, #DC262605 100%)',
            borderRadius: '12px',
            border: '1px solid #EF444430',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <AlertIcon />
          </motion.span>
          <span style={{
            fontSize: '13px',
            color: '#DC2626',
            fontWeight: '500',
          }}>
            High stress detected - try combining multiple techniques
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
