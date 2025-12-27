'use client';

import { motion } from 'framer-motion';
import { useBreakpoint, Breakpoint } from '@/hooks/useBreakpoint';

const shimmerAnimation = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear' as const,
    },
  },
};

interface SkeletonBoxProps {
  gridArea: string;
  height?: string;
  delay?: number;
}

function SkeletonBox({ gridArea, height = 'auto', delay = 0 }: SkeletonBoxProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={shimmerAnimation}
      style={{
        gridArea,
        height,
        minHeight: height === 'auto' ? '200px' : undefined,
        background: 'linear-gradient(90deg, #F0E4D3 0%, #FAF7F3 50%, #F0E4D3 100%)',
        backgroundSize: '200% 100%',
        borderRadius: '20px',
        border: '1px solid #DCC5B2',
      }}
      transition={{ delay }}
    />
  );
}

function SkeletonContent({ width = '100%', height = '16px', borderRadius = '8px' }: {
  width?: string;
  height?: string;
  borderRadius?: string;
}) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={shimmerAnimation}
      style={{
        width,
        height,
        background: 'linear-gradient(90deg, #F0E4D3 0%, #FAF7F3 50%, #F0E4D3 100%)',
        backgroundSize: '200% 100%',
        borderRadius,
      }}
    />
  );
}

const getGridStyles = (breakpoint: Breakpoint): React.CSSProperties => {
  const base: React.CSSProperties = {
    display: 'grid',
    gap: '20px',
    width: '100%',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '32px',
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

export default function BentoDashboardSkeleton() {
  const breakpoint = useBreakpoint();
  const gridStyles = getGridStyles(breakpoint);
  const isMobile = breakpoint === 'mobile';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAF7F3',
      paddingTop: '80px',
    }}>
      {/* Navbar skeleton */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '72px',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #DCC5B2',
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
        justifyContent: 'space-between',
        zIndex: 100,
      }}>
        <SkeletonContent width="120px" height="32px" borderRadius="8px" />
        <div style={{ display: 'flex', gap: '16px' }}>
          <SkeletonContent width="80px" height="32px" borderRadius="8px" />
          <SkeletonContent width="80px" height="32px" borderRadius="8px" />
          <SkeletonContent width="40px" height="40px" borderRadius="50%" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div style={gridStyles}>
        <SkeletonBox gridArea="banner" height="180px" delay={0} />
        <SkeletonBox gridArea="progress" height={isMobile ? '280px' : '320px'} delay={0.1} />
        <SkeletonBox gridArea="focus" height={isMobile ? '280px' : '320px'} delay={0.15} />
        <SkeletonBox gridArea="quick" height={isMobile ? '200px' : '320px'} delay={0.2} />
        <SkeletonBox gridArea="analytics" height="280px" delay={0.25} />
        <SkeletonBox gridArea="mood" height="280px" delay={0.3} />
        <SkeletonBox gridArea="sessions" height="260px" delay={0.35} />
        <SkeletonBox gridArea="achievements" height="260px" delay={0.4} />
        <SkeletonBox gridArea="insights" height="260px" delay={0.45} />
        <SkeletonBox gridArea="activity" height="200px" delay={0.5} />
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
