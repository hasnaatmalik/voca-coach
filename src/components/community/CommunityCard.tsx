'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface CommunityCardProps {
  community: {
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    _count: {
      members: number;
      posts: number;
    };
  };
}

const colors = {
  background: '#FAF7F3',
  surface: '#F0E4D3',
  border: '#DCC5B2',
  accent: '#D9A299',
  accentDark: '#C8847A',
  text: '#2D2D2D',
  textMuted: '#7A7A7A',
};

const CommunityCard: React.FC<CommunityCardProps> = ({ community }) => {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.06)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        background: 'white',
        borderRadius: '24px',
        padding: '24px',
        border: `1px solid ${colors.border}40`,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: '100%',
        cursor: 'pointer',
      }}
    >
      <Link href={`/communities/${community.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: `${colors.accent}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
          }}>
            {community.icon || '🌐'}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: colors.text }}>
              {community.name}
            </h3>
            <span style={{ fontSize: '14px', color: colors.textMuted }}>
              v/{community.slug}
            </span>
          </div>
        </div>

        <p style={{
          fontSize: '15px',
          color: colors.textMuted,
          lineHeight: '1.5',
          margin: '16px 0',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '4.5em',
        }}>
          {community.description || "No description provided."}
        </p>

        <div style={{ display: 'flex', gap: '16px', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span style={{ fontSize: '13px', fontWeight: '600', color: colors.text }}>
              {community._count?.members || 0} members
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span style={{ fontSize: '13px', fontWeight: '600', color: colors.text }}>
              {community._count?.posts || 0} posts
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CommunityCard;
