'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface TherapyHeroProps {
  title: string;
  subtitle: string;
  showBadge?: boolean;
  badgeText?: string;
  linkText?: string;
  linkHref?: string;
}

export default function TherapyHero({
  title,
  subtitle,
  showBadge = true,
  badgeText = 'Free Sessions',
  linkText,
  linkHref,
}: TherapyHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        background: 'linear-gradient(135deg, #7AB89E 0%, #5A9880 50%, #4A8870 100%)',
        borderRadius: '28px',
        padding: '40px 48px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '32px',
      }}
    >
      {/* Floating decorations */}
      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [0, 8, 0],
        }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '20px',
          right: '100px',
          width: '80px',
          height: '80px',
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
        }}
      />
      <motion.div
        animate={{
          y: [0, 12, 0],
          rotate: [0, -6, 0],
        }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: '25px',
          right: '50px',
          width: '120px',
          height: '120px',
          borderRadius: '30px',
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(8px)',
        }}
      />

      {/* Floating heart icon */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '40px',
          right: '200px',
          fontSize: '42px',
          opacity: 0.3,
        }}
      >
        💚
      </motion.div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {showBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              borderRadius: '100px',
              marginBottom: '16px',
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#4ADE80',
                boxShadow: '0 0 8px #4ADE80',
              }}
            />
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>
              {badgeText}
            </span>
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            fontSize: '32px',
            fontWeight: '700',
            color: 'white',
            margin: '0 0 8px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.9)',
            margin: 0,
            maxWidth: '500px',
          }}
        >
          {subtitle}
        </motion.p>

        {linkText && linkHref && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ marginTop: '20px' }}
          >
            <Link
              href={linkHref}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'white',
                fontWeight: '600',
                fontSize: '14px',
                textDecoration: 'none',
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                backdropFilter: 'blur(8px)',
              }}
            >
              {linkText} →
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
