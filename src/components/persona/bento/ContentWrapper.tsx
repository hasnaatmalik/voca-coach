'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ContentWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  onClose?: () => void;
  noPadding?: boolean;
}

export default function ContentWrapper({
  children,
  title,
  subtitle,
  icon,
  onClose,
  noPadding = false,
}: ContentWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        border: '1px solid #DCC5B2',
        overflow: 'hidden',
        height: noPadding ? 'calc(100vh - 220px)' : 'auto',
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      {(title || onClose) && (
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid #F0E4D3',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#FAF7F3',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {icon && (
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                  border: '1px solid #F0E4D3',
                }}
              >
                {icon}
              </motion.div>
            )}
            {title && (
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#2D2D2D',
                  margin: 0,
                }}>
                  {title}
                </h3>
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

          {onClose && (
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: '1px solid #DCC5B2',
                background: 'white',
                cursor: 'pointer',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6B6B6B',
              }}
            >
              ×
            </motion.button>
          )}
        </div>
      )}

      {/* Content */}
      <div style={{ padding: noPadding ? 0 : '28px' }}>
        {children}
      </div>
    </motion.div>
  );
}
