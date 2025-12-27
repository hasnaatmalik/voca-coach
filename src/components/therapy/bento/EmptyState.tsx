'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

// SVG Icon Components
const CalendarIcon = ({ color = '#7AB89E' }: { color?: string }) => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const TherapistIcon = ({ color = '#7AB89E' }: { color?: string }) => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
    <path d="M12 14v7" />
    <path d="M9 18h6" />
  </svg>
);

const BrainIcon = ({ color = '#7AB89E' }: { color?: string }) => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54Z" />
  </svg>
);

const iconComponents: Record<string, React.FC<{ color?: string }>> = {
  calendar: CalendarIcon,
  therapist: TherapistIcon,
  brain: BrainIcon,
};

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionText: string;
  actionHref: string;
  iconColor?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionText,
  actionHref,
  iconColor = '#7AB89E',
}: EmptyStateProps) {
  const IconComponent = iconComponents[icon];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '60px 40px',
        textAlign: 'center',
        border: '1px solid #DCC5B2',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorations */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '-30%',
          left: '-20%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #7AB89E 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: '-30%',
          right: '-20%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #D9A299 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #FAF7F3 0%, #F0E4D3 100%)',
            border: '2px solid #DCC5B2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {IconComponent ? <IconComponent color={iconColor} /> : null}
        </motion.div>

        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#2D2D2D',
          marginBottom: '8px',
        }}>
          {title}
        </h3>

        <p style={{
          color: '#6B6B6B',
          marginBottom: '24px',
          fontSize: '15px',
        }}>
          {description}
        </p>

        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link
            href={actionHref}
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #7AB89E 0%, #5A9880 100%)',
              color: 'white',
              borderRadius: '14px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '15px',
              boxShadow: '0 4px 16px rgba(122, 184, 158, 0.3)',
            }}
          >
            {actionText}
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
