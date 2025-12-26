'use client';

import { motion, AnimatePresence } from 'framer-motion';

// SVG Icon Component
const AlertIcon = ({ color = 'white', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

interface CrisisAlert {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

interface CrisisAlertsCardProps {
  alerts: CrisisAlert[];
  onDismiss: (id: string) => void;
}

export default function CrisisAlertsCard({ alerts, onDismiss }: CrisisAlertsCardProps) {
  if (alerts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        borderRadius: '24px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 8px 32px rgba(239, 68, 68, 0.25)',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <AlertIcon color="white" size={24} />
        </motion.span>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>
          Crisis Alerts
        </h2>
        <span style={{
          background: 'rgba(255, 255, 255, 0.2)',
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '13px',
          color: 'white',
          fontWeight: '600',
        }}>
          {alerts.length}
        </span>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        <AnimatePresence>
          {alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: '14px',
                padding: '16px',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px',
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '4px',
                  }}>
                    {alert.title}
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginBottom: '8px',
                  }}>
                    {alert.message}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}>
                    {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDismiss(alert.id)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                  }}
                >
                  Dismiss
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
