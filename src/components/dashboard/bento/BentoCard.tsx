'use client';

import { motion, MotionProps } from 'framer-motion';
import { ReactNode, forwardRef, CSSProperties } from 'react';

export interface BentoCardProps extends MotionProps {
  children: ReactNode;
  gridArea?: string;
  variant?: 'default' | 'highlight' | 'feature' | 'compact';
  noPadding?: boolean;
  className?: string;
  style?: CSSProperties;
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95
  },
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

const hoverTransition = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25,
};

const variantStyles: Record<string, React.CSSProperties> = {
  default: {
    background: 'rgba(255, 255, 255, 0.95)',
    border: '1px solid #DCC5B2',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
  },
  highlight: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(217, 162, 153, 0.1) 100%)',
    border: '2px solid #D9A299',
    boxShadow: '0 4px 24px rgba(217, 162, 153, 0.15)',
  },
  feature: {
    background: 'linear-gradient(135deg, #FAF7F3 0%, #F0E4D3 100%)',
    border: '1px solid #DCC5B2',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
  },
  compact: {
    background: 'rgba(255, 255, 255, 0.95)',
    border: '1px solid #DCC5B2',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
  },
};

const BentoCard = forwardRef<HTMLDivElement, BentoCardProps>(({
  children,
  gridArea,
  variant = 'default',
  noPadding = false,
  className,
  style,
  onMouseMove,
  onClick,
  ...motionProps
}, ref) => {
  const baseStyle: CSSProperties = {
    borderRadius: '20px',
    padding: noPadding ? 0 : variant === 'compact' ? '16px' : variant === 'feature' ? '28px' : '24px',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    overflow: 'hidden',
    position: 'relative' as const,
    ...variantStyles[variant],
    ...(gridArea && { gridArea }),
    ...style,
  };

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{
        y: -2,
        boxShadow: variant === 'highlight'
          ? '0 12px 40px rgba(217, 162, 153, 0.25)'
          : '0 12px 32px rgba(0, 0, 0, 0.08)',
        transition: hoverTransition,
      }}
      style={baseStyle}
      className={className}
      onMouseMove={onMouseMove}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
});

BentoCard.displayName = 'BentoCard';

export default BentoCard;
