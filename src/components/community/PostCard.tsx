'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    score: number;
    createdAt: string;
    author: { name: string; id: string };
    communitySlug: string;
    _count: { comments: number };
  };
  compact?: boolean;
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

const PostCard: React.FC<PostCardProps> = ({ post, compact = false }) => {
  const [currentScore, setCurrentScore] = useState(post.score);
  const [userVote, setUserVote] = useState(0); // -1, 0, 1

  const handleVote = async (value: number) => {
    const newValue = userVote === value ? 0 : value;
    const diff = newValue - userVote;
    
    setUserVote(newValue);
    setCurrentScore(prev => prev + diff);

    try {
      await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, value: newValue }),
      });
    } catch (error) {
      console.error('Failed to vote:', error);
      // rollback on error
      setUserVote(userVote);
      setCurrentScore(currentScore);
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '24px',
      border: `1px solid ${colors.border}40`,
      display: 'flex',
      gap: '12px',
      padding: '16px',
      marginBottom: '16px',
    }}>
      {/* Vote Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        padding: '8px 0',
      }}>
        <button
          onClick={() => handleVote(1)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: userVote === 1 ? colors.accent : colors.textMuted,
            padding: '4px',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={userVote === 1 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
        <span style={{
          fontSize: '14px',
          fontWeight: '700',
          color: userVote === 1 ? colors.accent : userVote === -1 ? '#7AAFC9' : colors.text,
        }}>
          {currentScore}
        </span>
        <button
          onClick={() => handleVote(-1)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: userVote === -1 ? '#7AAFC9' : colors.textMuted,
            padding: '4px',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={userVote === -1 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Content Section */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: colors.text }}>
            u/{post.author.name}
          </span>
          <span style={{ color: colors.textMuted }}>•</span>
          <span style={{ fontSize: '12px', color: colors.textMuted }}>
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>

        <Link href={`/communities/${post.communitySlug}/posts/${post.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: colors.text,
            margin: '0 0 8px 0',
            lineHeight: '1.4',
          }}>
            {post.title}
          </h3>
          <p style={{
            fontSize: '15px',
            color: colors.textMuted,
            lineHeight: '1.6',
            margin: 0,
            display: compact ? '-webkit-box' : 'block',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: compact ? 'hidden' : 'visible',
          }}>
            {post.content}
          </p>
        </Link>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          <Link href={`/communities/${post.communitySlug}/posts/${post.id}`} style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.textMuted,
            fontSize: '14px',
            fontWeight: '600',
            padding: '6px 12px',
            borderRadius: '100px',
            background: `${colors.surface}40`,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {post._count?.comments || 0} Comments
          </Link>
          
          <button style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.textMuted,
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
