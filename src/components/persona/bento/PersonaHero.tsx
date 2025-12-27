'use client';

import { motion } from 'framer-motion';

// SVG Icon Components
const TheaterMaskIcon = ({ color = 'white', size = 48 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
    <path d="M5.5 5.5A2.5 2.5 0 0 1 8 3h8a2.5 2.5 0 0 1 2.5 2.5v2.9a10 10 0 0 1-5 8.7 10 10 0 0 1-5-8.7v-2.9z" />
    <path d="M6 16c1.5 1 3 1.5 6 1.5s4.5-.5 6-1.5" />
    <circle cx="9" cy="10" r="1" fill={color} />
    <circle cx="15" cy="10" r="1" fill={color} />
  </svg>
);

const SparklesIcon = ({ color = 'white', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

interface PersonaHeroProps {
  totalPersonas: number;
  customPersonas: number;
}

export default function PersonaHero({ totalPersonas, customPersonas }: PersonaHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        background: 'linear-gradient(135deg, #7AAFC9 0%, #5A9BB8 50%, #4A8BA8 100%)',
        borderRadius: '28px',
        padding: '40px 48px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '24px',
      }}
    >
      {/* Floating decorations */}
      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [0, 10, 0],
        }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '15px',
          right: '100px',
          width: '90px',
          height: '90px',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
        }}
      />
      <motion.div
        animate={{
          y: [0, 12, 0],
          rotate: [0, -8, 0],
        }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '50px',
          width: '130px',
          height: '130px',
          borderRadius: '32px',
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(8px)',
        }}
      />

      {/* Floating mask icon */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [-5, 5, -5],
        }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '35px',
          right: '200px',
          fontSize: '48px',
          opacity: 0.3,
        }}
      >
        <TheaterMaskIcon color="white" size={48} />
      </motion.div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: 'white',
            margin: '0 0 8px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}>
            Persona Studio
          </h1>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.85)',
            margin: 0,
          }}>
            Practice conversations with AI personas or create your own
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            display: 'flex',
            gap: '20px',
            marginTop: '28px',
          }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '14px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <TheaterMaskIcon color="white" size={24} />
            <div>
              <div style={{
                fontSize: '22px',
                fontWeight: '700',
                color: 'white',
              }}>
                {totalPersonas}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: '500',
              }}>
                Total Personas
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '14px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <SparklesIcon color="white" size={24} />
            <div>
              <div style={{
                fontSize: '22px',
                fontWeight: '700',
                color: 'white',
              }}>
                {customPersonas}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: '500',
              }}>
                Custom Created
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
