'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import BentoCard from './BentoCard';

interface WelcomeBannerProps {
  userName: string;
  streak: number;
  availableTherapistCount: number;
  onStartSession: () => void;
  onTalkToTherapist: () => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function WelcomeBanner({
  userName,
  streak,
  availableTherapistCount,
  onStartSession,
  onTalkToTherapist,
}: WelcomeBannerProps) {
  const [greeting, setGreeting] = useState('Welcome back');
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Parallax effect for floating elements
  const floatX = useTransform(mouseX, [0, 1], [-10, 10]);
  const floatY = useTransform(mouseY, [0, 1], [-10, 10]);

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <BentoCard
      gridArea="banner"
      variant="feature"
      noPadding
      onMouseMove={handleMouseMove}
      style={{
        background: 'linear-gradient(135deg, #FAF7F3 0%, #F0E4D3 40%, #D9A299 100%)',
        minHeight: '180px',
        overflow: 'hidden',
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '32px',
        height: '100%',
        position: 'relative',
      }}>
        {/* Left content */}
        <div style={{ zIndex: 2, flex: 1 }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#2D2D2D',
              marginBottom: '8px',
            }}
          >
            {greeting}, {userName.split(' ')[0]}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              fontSize: '15px',
              color: '#6B6B6B',
              marginBottom: '4px',
            }}
          >
            Ready to continue your wellness journey?
          </motion.p>

          {streak > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.7)',
                padding: '6px 12px',
                borderRadius: '20px',
                marginTop: '8px',
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #E4B17A 0%, #D9A299 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </motion.div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#2D2D2D' }}>
                You&apos;re on a {streak}-day streak!
              </span>
            </motion.div>
          )}
        </div>

        {/* Right side - CTAs */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'flex-end',
            zIndex: 2,
          }}
        >
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(217, 162, 153, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartSession}
            style={{
              padding: '14px 28px',
              background: '#D9A299',
              color: 'white',
              border: 'none',
              borderRadius: '30px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(217, 162, 153, 0.3)',
            }}
          >
            <span style={{ fontSize: '16px' }}>▶</span>
            Start Session
          </motion.button>

          <motion.button
            whileHover={{
              scale: 1.02,
              background: 'rgba(255, 255, 255, 0.95)',
              borderColor: '#D9A299',
            }}
            whileTap={{ scale: 0.98 }}
            onClick={onTalkToTherapist}
            style={{
              padding: '12px 20px',
              background: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid #DCC5B2',
              borderRadius: '30px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#6B6B6B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backdropFilter: 'blur(10px)',
            }}
          >
            {availableTherapistCount > 0 && (
              <motion.span
                animate={{
                  boxShadow: ['0 0 0 0 rgba(16, 185, 129, 0.4)', '0 0 0 8px rgba(16, 185, 129, 0)'],
                }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10B981',
                }}
              />
            )}
            {availableTherapistCount > 0
              ? `${availableTherapistCount} Therapist${availableTherapistCount > 1 ? 's' : ''} Online`
              : 'Talk to Therapist'}
          </motion.button>
        </motion.div>

        {/* Floating decorative elements */}
        <motion.div
          style={{
            position: 'absolute',
            right: '15%',
            top: '20%',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(217, 162, 153, 0.3) 0%, transparent 70%)',
            x: floatX,
            y: floatY,
            zIndex: 1,
          }}
        />
        <motion.div
          style={{
            position: 'absolute',
            right: '25%',
            bottom: '10%',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(240, 228, 211, 0.5) 0%, transparent 70%)',
            x: floatX,
            y: floatY,
            zIndex: 1,
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        />
        <motion.div
          style={{
            position: 'absolute',
            right: '5%',
            bottom: '30%',
            width: '60px',
            height: '60px',
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            background: 'rgba(220, 197, 178, 0.4)',
            x: floatX,
            y: floatY,
            zIndex: 1,
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
        />
      </div>
    </BentoCard>
  );
}
