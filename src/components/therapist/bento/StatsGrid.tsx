'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ReactNode } from 'react';

// SVG Icon Components
const CalendarIcon = ({ color = 'white', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CheckCircleIcon = ({ color = 'white', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ChatIcon = ({ color = 'white', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const UserIcon = ({ color = 'white', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ClockIcon = ({ color = 'white', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

interface StatItem {
  icon: ReactNode;
  value: string | number;
  label: string;
  gradient: string;
  href?: string;
}

interface StatsGridProps {
  upcomingCount: number;
  completedCount: number;
  activeChats: number;
}

export default function StatsGrid({ upcomingCount, completedCount, activeChats }: StatsGridProps) {
  const stats: StatItem[] = [
    {
      icon: <CalendarIcon color="white" size={24} />,
      value: upcomingCount,
      label: 'Upcoming Sessions',
      gradient: 'linear-gradient(135deg, #D9A299 0%, #C8847A 100%)',
    },
    {
      icon: <CheckCircleIcon color="white" size={24} />,
      value: completedCount,
      label: 'Completed Sessions',
      gradient: 'linear-gradient(135deg, #7AB89E 0%, #5A9880 100%)',
    },
    {
      icon: <ChatIcon color="white" size={24} />,
      value: activeChats,
      label: 'Active Chats',
      gradient: 'linear-gradient(135deg, #E4B17A 0%, #D4A166 100%)',
      href: '/therapist/chat',
    },
    {
      icon: <UserIcon color="white" size={24} />,
      value: 'Edit',
      label: 'Profile',
      gradient: 'linear-gradient(135deg, #7AAFC9 0%, #5A8FA9 100%)',
      href: '/therapist/profile',
    },
    {
      icon: <ClockIcon color="white" size={24} />,
      value: 'Set',
      label: 'Availability',
      gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
      href: '/therapist/availability',
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '28px',
    }}>
      {stats.map((stat, index) => {
        const content = (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0, 0, 0, 0.1)' }}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
              border: '1px solid #F0E4D3',
              cursor: stat.href ? 'pointer' : 'default',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 3, delay: index * 0.2 }}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: stat.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                {stat.icon}
              </motion.div>
              <div>
                <p style={{
                  fontSize: typeof stat.value === 'number' ? '28px' : '18px',
                  fontWeight: '700',
                  color: '#2D2D2D',
                }}>
                  {stat.value}
                </p>
                <p style={{ color: '#6B6B6B', fontSize: '13px' }}>{stat.label}</p>
              </div>
            </div>
          </motion.div>
        );

        return stat.href ? (
          <Link key={stat.label} href={stat.href} style={{ textDecoration: 'none' }}>
            {content}
          </Link>
        ) : (
          <div key={stat.label}>{content}</div>
        );
      })}
    </div>
  );
}
