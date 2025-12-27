'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface SessionsHeroProps {
  upcomingCount: number;
  pastCount: number;
}

export default function SessionsHero({ upcomingCount, pastCount }: SessionsHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '20px',
      }}
    >
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#2D2D2D',
            marginBottom: '8px',
          }}
        >
          My Sessions
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            color: '#7AB89E',
            fontWeight: '500',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#7AB89E',
            }} />
            {upcomingCount} upcoming
          </span>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            color: '#9CA3AF',
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#D1D5DB',
            }} />
            {pastCount} past
          </span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Link
          href="/therapy/book"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 24px',
            background: 'linear-gradient(135deg, #7AB89E 0%, #5A9880 100%)',
            color: 'white',
            borderRadius: '14px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '15px',
            boxShadow: '0 4px 16px rgba(122, 184, 158, 0.3)',
          }}
        >
          <span>+</span> Book Session
        </Link>
      </motion.div>
    </motion.div>
  );
}
