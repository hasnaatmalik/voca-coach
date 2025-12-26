'use client';

import { motion } from 'framer-motion';

// SVG Icon Components
const CheckIcon = ({ color = 'white', size = 14 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const TherapistIcon = ({ color = '#6B6B6B', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
    <path d="M12 14v7" />
    <path d="M9 18h6" />
  </svg>
);

interface Therapist {
  id: string;
  name: string;
  email: string;
  therapistProfile: {
    id: string;
    bio: string | null;
    specializations: string | null;
    isApproved: boolean;
  } | null;
}

interface TherapistCardProps {
  therapist: Therapist;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

export default function TherapistCard({
  therapist,
  isSelected,
  onSelect,
  index,
}: TherapistCardProps) {
  let specializations: string[] = [];
  try {
    const specs = therapist.therapistProfile?.specializations;
    if (typeof specs === 'string' && specs) {
      const parsed = JSON.parse(specs);
      specializations = Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    specializations = [];
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.01, y: -2 }}
      onClick={onSelect}
      style={{
        background: isSelected
          ? 'linear-gradient(135deg, rgba(122, 184, 158, 0.1) 0%, rgba(90, 152, 128, 0.1) 100%)'
          : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '24px',
        cursor: 'pointer',
        border: isSelected ? '2px solid #7AB89E' : '1px solid #DCC5B2',
        boxShadow: isSelected
          ? '0 8px 24px rgba(122, 184, 158, 0.2)'
          : '0 2px 12px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <motion.div
          animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: isSelected
              ? 'linear-gradient(135deg, #7AB89E 0%, #5A9880 100%)'
              : '#FAF7F3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: isSelected ? 'none' : '1px solid #F0E4D3',
          }}
        >
          {isSelected ? <CheckIcon color="white" size={24} /> : <TherapistIcon color="#6B6B6B" size={24} />}
        </motion.div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: '17px',
            fontWeight: '600',
            color: '#2D2D2D',
            marginBottom: '4px',
          }}>
            {therapist.name}
          </h3>

          {therapist.therapistProfile?.bio && (
            <p style={{
              fontSize: '14px',
              color: '#6B6B6B',
              lineHeight: 1.5,
              marginBottom: '12px',
            }}>
              {therapist.therapistProfile.bio}
            </p>
          )}

          {specializations.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {specializations.slice(0, 3).map((spec: string) => (
                <span
                  key={spec}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '500',
                    background: isSelected ? 'rgba(122, 184, 158, 0.15)' : '#FAF7F3',
                    color: isSelected ? '#5A9880' : '#6B6B6B',
                    border: '1px solid',
                    borderColor: isSelected ? 'rgba(122, 184, 158, 0.3)' : '#F0E4D3',
                  }}
                >
                  {spec}
                </span>
              ))}
              {specializations.length > 3 && (
                <span style={{
                  padding: '4px 10px',
                  fontSize: '12px',
                  color: '#9CA3AF',
                }}>
                  +{specializations.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#7AB89E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckIcon color="white" size={14} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
