'use client';

import { motion, AnimatePresence } from 'framer-motion';

// SVG Icon Component
const TrashIcon = ({ color = '#EF4444', size = 32 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  personaName?: string;
}

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  personaName,
}: DeleteModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
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
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            }}
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '18px',
                background: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '32px',
              }}
            >
              <TrashIcon color="#EF4444" size={32} />
            </motion.div>

            {/* Title */}
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#2D2D2D',
              textAlign: 'center',
              margin: '0 0 12px',
            }}>
              Delete Persona?
            </h3>

            {/* Description */}
            <p style={{
              fontSize: '15px',
              color: '#6B6B6B',
              textAlign: 'center',
              margin: '0 0 28px',
              lineHeight: 1.5,
            }}>
              {personaName ? (
                <>
                  Are you sure you want to delete <strong style={{ color: '#2D2D2D' }}>{personaName}</strong>? This action cannot be undone.
                </>
              ) : (
                'This will permanently delete this persona and cannot be undone.'
              )}
            </p>

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: '12px',
            }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  background: '#FAF7F3',
                  border: '1px solid #DCC5B2',
                  borderRadius: '14px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#6B6B6B',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: 'white',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
                }}
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
