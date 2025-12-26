'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ChartCardWrapperProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  children: ReactNode;
  accentColor?: string;
  fullWidth?: boolean;
  actions?: ReactNode;
}

export default function ChartCardWrapper({
  title,
  subtitle,
  icon,
  children,
  accentColor = '#7AAFC9',
  fullWidth = false,
  actions,
}: ChartCardWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)' }}
      transition={{ type: 'spring' as const, stiffness: 100, damping: 15 }}
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '28px',
        border: '1px solid #DCC5B2',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
        gridColumn: fullWidth ? 'span 2' : undefined,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Accent glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: `linear-gradient(90deg, ${accentColor} 0%, ${accentColor}80 50%, transparent 100%)`,
        borderRadius: '24px 24px 0 0',
      }} />

      {/* Background decoration */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.03, 0.06, 0.03],
        }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '-30%',
          right: '-20%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '24px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 6 }}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${accentColor}20 0%, ${accentColor}10 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </motion.div>
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#2D2D2D',
              margin: 0,
            }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{
                fontSize: '13px',
                color: '#6B6B6B',
                margin: '4px 0 0 0',
              }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {actions}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </motion.div>
  );
}
