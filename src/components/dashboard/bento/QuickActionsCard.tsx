'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import BentoCard from './BentoCard';

interface QuickAction {
  id: string;
  label: string;
  href: string;
  color: string;
  suggested?: boolean;
}

interface QuickActionsCardProps {
  actions?: QuickAction[];
  onActionClick?: (actionId: string) => void;
}

// SVG Icons as components
const MicIcon = ({ color }: { color: string }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const JournalIcon = ({ color }: { color: string }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const PracticeIcon = ({ color }: { color: string }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const ChatIcon = ({ color }: { color: string }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const actionIcons: Record<string, React.FC<{ color: string }>> = {
  session: MicIcon,
  journal: JournalIcon,
  practice: PracticeIcon,
  therapy: ChatIcon,
};

const defaultActions: QuickAction[] = [
  {
    id: 'session',
    label: 'New Session',
    href: '/de-escalation',
    color: '#D9A299',
    suggested: true,
  },
  {
    id: 'journal',
    label: 'Journal',
    href: '/journal',
    color: '#7AAFC9',
  },
  {
    id: 'practice',
    label: 'Practice',
    href: '/biomarkers',
    color: '#7AB89E',
  },
  {
    id: 'therapy',
    label: 'Book Therapy',
    href: '/chat',
    color: '#E4B17A',
  },
];

export default function QuickActionsCard({
  actions = defaultActions,
  onActionClick,
}: QuickActionsCardProps) {
  return (
    <BentoCard gridArea="quick">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '280px',
      }}>
        {/* Header */}
        <motion.h3
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: '15px',
            fontWeight: '600',
            color: '#2D2D2D',
            marginBottom: '20px',
          }}
        >
          Quick Actions
        </motion.h3>

        {/* 2x2 Grid */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
        }}>
          {actions.map((action, index) => {
            const IconComponent = actionIcons[action.id] || MicIcon;
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.08 }}
              >
                <Link href={action.href} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{
                      scale: 1.03,
                      background: action.suggested
                        ? `linear-gradient(135deg, ${action.color}20 0%, ${action.color}10 100%)`
                        : '#F0E4D3',
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onActionClick?.(action.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      padding: '24px 16px',
                      background: action.suggested
                        ? `linear-gradient(135deg, ${action.color}15 0%, ${action.color}05 100%)`
                        : '#FAF7F3',
                      border: action.suggested
                        ? `2px solid ${action.color}40`
                        : '1px solid #DCC5B2',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Suggested badge */}
                    {action.suggested && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          padding: '2px 8px',
                          background: action.color,
                          borderRadius: '10px',
                          fontSize: '10px',
                          fontWeight: '600',
                          color: 'white',
                        }}
                      >
                        Suggested
                      </motion.div>
                    )}

                    {/* Icon with pulse animation for suggested */}
                    <motion.div
                      animate={action.suggested ? {
                        scale: [1, 1.1, 1],
                      } : {}}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: 'easeInOut',
                      }}
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '14px',
                        background: `${action.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComponent color={action.color} />
                    </motion.div>

                    {/* Label */}
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: action.suggested ? '#2D2D2D' : '#6B6B6B',
                      textAlign: 'center',
                    }}>
                      {action.label}
                    </span>

                    {/* Hover ripple effect */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 2, opacity: 0.1 }}
                      style={{
                        position: 'absolute',
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: action.color,
                        pointerEvents: 'none',
                      }}
                    />
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </BentoCard>
  );
}
