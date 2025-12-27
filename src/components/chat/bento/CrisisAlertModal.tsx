'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { CrisisAlert } from '@/types/chat';

interface CrisisAlertModalProps {
  alert: CrisisAlert | null;
  onClose: () => void;
}

export default function CrisisAlertModal({ alert, onClose }: CrisisAlertModalProps) {
  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginBottom: '20px',
            }}>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: alert.riskLevel === 'critical'
                    ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                    : alert.riskLevel === 'high'
                    ? 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)'
                    : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  boxShadow: alert.riskLevel === 'critical'
                    ? '0 4px 16px rgba(239, 68, 68, 0.3)'
                    : alert.riskLevel === 'high'
                    ? '0 4px 16px rgba(249, 115, 22, 0.3)'
                    : '0 4px 16px rgba(245, 158, 11, 0.3)',
                }}
              >
                💚
              </motion.div>
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#2D2D2D',
                }}>
                  We&apos;re Here to Help
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6B6B6B',
                }}>
                  It sounds like you may be going through a difficult time.
                </p>
              </div>
            </div>

            {/* Message */}
            <p style={{
              marginBottom: '20px',
              color: '#4B5563',
              lineHeight: 1.6,
              fontSize: '15px',
            }}>
              If you&apos;re in crisis or need immediate support, please reach out to one of these resources:
            </p>

            {/* Resources */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginBottom: '24px',
            }}>
              {alert.resources.map((resource, i) => (
                <motion.a
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  href={resource.url || `tel:${resource.contact.replace(/\D/g, '')}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 16px',
                    background: '#FAF7F3',
                    borderRadius: '14px',
                    textDecoration: 'none',
                    color: 'inherit',
                    border: '1px solid #F0E4D3',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #7AB89E 0%, #5A9880 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px',
                  }}>
                    📞
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#2D2D2D' }}>
                      {resource.name}
                    </div>
                    <div style={{ fontSize: '14px', color: '#7AB89E', fontWeight: '500' }}>
                      {resource.contact}
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              style={{
                width: '100%',
                padding: '16px',
                background: '#2D2D2D',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                fontWeight: '600',
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              I Understand
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
