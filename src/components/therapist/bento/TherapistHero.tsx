'use client';

import { motion } from 'framer-motion';

interface TherapistHeroProps {
  userName: string;
  isOnline: boolean;
  togglingOnline: boolean;
  onToggleOnline: () => void;
}

export default function TherapistHero({
  userName,
  isOnline,
  togglingOnline,
  onToggleOnline,
}: TherapistHeroProps) {
  const firstName = userName?.split(' ')[0] || 'Therapist';
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'linear-gradient(135deg, #7AB89E 0%, #5A9880 100%)',
        borderRadius: '28px',
        padding: '32px 40px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Elements */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '-30px',
          right: '80px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
        }}
      />
      <motion.div
        animate={{ y: [0, 8, 0], rotate: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 0.5 }}
        style={{
          position: 'absolute',
          bottom: '-40px',
          right: '200px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              fontSize: '32px',
              fontWeight: '700',
              color: 'white',
              marginBottom: '8px',
            }}
          >
            {getGreeting()}, {firstName}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            Manage your therapy sessions and connect with students
          </motion.p>
        </div>

        {/* Online Status Toggle */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onToggleOnline}
          disabled={togglingOnline}
          style={{
            padding: '16px 28px',
            background: isOnline
              ? 'rgba(255, 255, 255, 0.95)'
              : 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '16px',
            fontSize: '15px',
            fontWeight: '700',
            color: isOnline ? '#059669' : 'white',
            cursor: togglingOnline ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: isOnline
              ? '0 8px 24px rgba(0, 0, 0, 0.15)'
              : '0 4px 16px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
          }}
        >
          <motion.span
            animate={isOnline ? { scale: [1, 1.3, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: isOnline ? '#10B981' : 'rgba(255, 255, 255, 0.5)',
              boxShadow: isOnline ? '0 0 12px rgba(16, 185, 129, 0.6)' : 'none',
            }}
          />
          {togglingOnline ? 'Updating...' : isOnline ? 'Online - Accepting Clients' : 'Go Online'}
        </motion.button>
      </div>
    </motion.div>
  );
}
