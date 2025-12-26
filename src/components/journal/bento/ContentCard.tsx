'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ContentCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  fullHeight?: boolean;
  noPadding?: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
}

export default function ContentCard({
  children,
  title,
  subtitle,
  icon,
  fullHeight = false,
  noPadding = false,
  onBack,
  showBackButton = false,
}: ContentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
        border: '1px solid #DCC5B2',
        overflow: 'hidden',
        height: fullHeight ? 'calc(100vh - 280px)' : 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      {(title || showBackButton) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #F0E4D3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#FAF7F3',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {showBackButton && onBack && (
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: '1px solid #DCC5B2',
                  background: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  color: '#6B6B6B',
                }}
              >
                ←
              </motion.button>
            )}

            {icon && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #D9A299 0%, #C8847A 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(217, 162, 153, 0.3)',
                }}
              >
                {icon}
              </motion.div>
            )}

            {title && (
              <div>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#2D2D2D',
                  margin: 0,
                }}>
                  {title}
                </h2>
                {subtitle && (
                  <p style={{
                    fontSize: '13px',
                    color: '#6B6B6B',
                    margin: '4px 0 0',
                  }}>
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div style={{
        flex: 1,
        overflow: 'hidden',
        padding: noPadding ? 0 : '24px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {children}
      </div>
    </motion.div>
  );
}
