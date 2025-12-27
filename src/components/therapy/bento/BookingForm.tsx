'use client';

import { motion } from 'framer-motion';

// SVG Icon Components
const CalendarIcon = ({ color = '#7AB89E', size = 22 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CheckIcon = ({ color = 'white', size = 12 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const LockIcon = ({ color = '#9CA3AF', size = 14 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const StarIcon = ({ color = '#9CA3AF', size = 14 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

interface Therapist {
  id: string;
  name: string;
}

interface BookingFormProps {
  selectedTherapist: Therapist | null;
  scheduledAt: string;
  userNote: string;
  booking: boolean;
  onScheduleChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onBookSession: () => void;
}

export default function BookingForm({
  selectedTherapist,
  scheduledAt,
  userNote,
  booking,
  onScheduleChange,
  onNoteChange,
  onBookSession,
}: BookingFormProps) {
  const isDisabled = !selectedTherapist || !scheduledAt || booking;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      style={{
        position: 'sticky',
        top: '100px',
      }}
    >
      <div style={{
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '28px',
        border: '1px solid #DCC5B2',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#2D2D2D',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <CalendarIcon color="#7AB89E" size={22} />
          Schedule Your Session
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#4B5563',
              marginBottom: '8px',
            }}>
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => onScheduleChange(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid #DCC5B2',
                fontSize: '15px',
                fontFamily: 'inherit',
                background: '#FAF7F3',
                outline: 'none',
                transition: 'all 0.2s',
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#4B5563',
              marginBottom: '8px',
            }}>
              Note <span style={{ fontWeight: '400', color: '#9CA3AF' }}>(optional)</span>
            </label>
            <textarea
              value={userNote}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Topics you'd like to discuss..."
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid #DCC5B2',
                fontSize: '15px',
                fontFamily: 'inherit',
                background: '#FAF7F3',
                outline: 'none',
                resize: 'none',
                minHeight: '100px',
                lineHeight: 1.5,
              }}
            />
          </div>

          {selectedTherapist && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                padding: '14px 18px',
                borderRadius: '12px',
                background: 'rgba(122, 184, 158, 0.1)',
                border: '1px solid rgba(122, 184, 158, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#7AB89E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CheckIcon color="white" size={12} />
              </span>
              <span style={{ fontSize: '14px', color: '#5A9880', fontWeight: '500' }}>
                {selectedTherapist.name} selected
              </span>
            </motion.div>
          )}

          <motion.button
            whileHover={!isDisabled ? { scale: 1.02 } : {}}
            whileTap={!isDisabled ? { scale: 0.98 } : {}}
            onClick={onBookSession}
            disabled={isDisabled}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '14px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              background: isDisabled
                ? '#E5E7EB'
                : 'linear-gradient(135deg, #7AB89E 0%, #5A9880 100%)',
              color: isDisabled ? '#9CA3AF' : 'white',
              boxShadow: isDisabled
                ? 'none'
                : '0 4px 16px rgba(122, 184, 158, 0.3)',
            }}
          >
            {booking ? 'Booking...' : 'Book Free Session'}
          </motion.button>

          {!selectedTherapist && (
            <p style={{
              fontSize: '13px',
              color: '#9CA3AF',
              textAlign: 'center',
            }}>
              Select a therapist to continue
            </p>
          )}
        </div>
      </div>

      {/* Trust Indicators */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          marginTop: '16px',
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9CA3AF', fontSize: '12px' }}>
          <LockIcon color="#9CA3AF" size={14} />
          <span>Private</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9CA3AF', fontSize: '12px' }}>
          <StarIcon color="#9CA3AF" size={14} />
          <span>Licensed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7AB89E', fontSize: '12px' }}>
          <CheckIcon color="#7AB89E" size={14} />
          <span>100% Free</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
