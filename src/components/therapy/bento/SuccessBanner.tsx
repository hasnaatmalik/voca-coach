'use client';

import { motion, AnimatePresence } from 'framer-motion';

// SVG Icon Component
const CheckIcon = ({ color = 'white', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface SuccessBannerProps {
  show: boolean;
  message: string;
}

export default function SuccessBanner({ show, message }: SuccessBannerProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{
            padding: '18px 24px',
            background: 'linear-gradient(135deg, rgba(122, 184, 158, 0.15) 0%, rgba(90, 152, 128, 0.15) 100%)',
            borderRadius: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            border: '1px solid rgba(122, 184, 158, 0.3)',
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #7AB89E 0%, #5A9880 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckIcon color="white" size={18} />
          </motion.div>
          <span style={{ color: '#5A9880', fontWeight: '600', fontSize: '15px' }}>
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
