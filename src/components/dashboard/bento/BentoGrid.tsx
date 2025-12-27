'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';
import { useBreakpoint, Breakpoint } from '@/hooks/useBreakpoint';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const getGridStyles = (breakpoint: Breakpoint): React.CSSProperties => {
  const base: React.CSSProperties = {
    display: 'grid',
    gap: '20px',
    width: '100%',
    maxWidth: '1400px',
    margin: '0 auto',
  };

  switch (breakpoint) {
    case 'mobile':
      return {
        ...base,
        gridTemplateColumns: '1fr',
        gridTemplateAreas: `
          "banner"
          "focus"
          "progress"
          "quick"
          "analytics"
          "mood"
          "sessions"
          "achievements"
          "insights"
          "activity"
        `,
      };
    case 'tablet':
      return {
        ...base,
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateAreas: `
          "banner banner"
          "progress focus"
          "quick quick"
          "analytics analytics"
          "mood mood"
          "sessions achievements"
          "insights insights"
          "activity activity"
        `,
      };
    case 'desktop':
    default:
      return {
        ...base,
        gridTemplateColumns: 'repeat(12, 1fr)',
        gridTemplateRows: 'auto auto auto auto auto',
        gridTemplateAreas: `
          "banner banner banner banner banner banner banner banner banner banner banner banner"
          "progress progress progress progress focus focus focus focus quick quick quick quick"
          "analytics analytics analytics analytics analytics analytics analytics analytics mood mood mood mood"
          "sessions sessions sessions sessions achievements achievements achievements achievements insights insights insights insights"
          "activity activity activity activity activity activity activity activity activity activity activity activity"
        `,
      };
  }
};

export default function BentoGrid({ children, className }: BentoGridProps) {
  const breakpoint = useBreakpoint();
  const shouldReduceMotion = useReducedMotion();

  const gridStyles = getGridStyles(breakpoint);

  return (
    <motion.div
      variants={shouldReduceMotion ? {} : containerVariants}
      initial={shouldReduceMotion ? 'visible' : 'hidden'}
      animate="visible"
      style={gridStyles}
      className={className}
    >
      {children}
    </motion.div>
  );
}
