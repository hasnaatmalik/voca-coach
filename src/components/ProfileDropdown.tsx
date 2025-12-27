'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfilePictureUpload from './ProfilePictureUpload';
import Link from 'next/link';

const colors = {
  background: '#FAF7F3',
  surface: '#F0E4D3',
  border: '#DCC5B2',
  accent: '#D9A299',
  accentDark: '#C8847A',
  text: '#2D2D2D',
  textMuted: '#6B6B6B',
  success: '#7AB89E',
  danger: '#EF4444',
};

interface ProfileDropdownProps {
  userName: string;
  userEmail?: string;
  profilePic?: string;
  onProfilePicChange?: (imageUrl: string) => void;
  onLogout?: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  userName,
  userEmail,
  profilePic,
  onProfilePicChange,
  onLogout
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = () => {
    return userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', zIndex: 200 }}>
      {/* Profile Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '14px',
          background: profilePic ? 'transparent' : `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`,
          border: `2px solid ${colors.border}`,
          cursor: 'pointer',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'all 0.2s ease'
        }}
      >
        {profilePic ? (
          <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>{getInitials()}</span>
        )}
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              position: 'absolute',
              top: '52px',
              right: 0,
              width: '280px',
              background: colors.background,
              borderRadius: '20px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
              border: `1px solid ${colors.border}`,
              overflow: 'hidden',
              zIndex: 1000
            }}
          >
            {/* Profile Section */}
            <div style={{
              padding: '20px',
              background: `linear-gradient(135deg, rgba(217, 162, 153, 0.1) 0%, rgba(240, 228, 211, 0.5) 100%)`,
              borderBottom: `1px solid ${colors.border}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '16px',
                    background: profilePic ? 'transparent' : `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid white`,
                    boxShadow: `0 4px 12px rgba(217, 162, 153, 0.3)`
                  }}
                >
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>{getInitials()}</span>
                  )}
                </motion.div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: colors.text }}>{userName}</div>
                  {userEmail && (
                    <div style={{ fontSize: '13px', color: colors.textMuted, marginTop: '2px' }}>{userEmail}</div>
                  )}
                </div>
              </div>

              {/* Upload Picture Button */}
              <ProfilePictureUpload
                currentImage={profilePic}
                onImageChange={onProfilePicChange}
                size={0}
                initials=""
              >
                {(handleClick) => (
                  <motion.button
                    onClick={handleClick}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'white',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: colors.text,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    Upload Picture
                  </motion.button>
                )}
              </ProfilePictureUpload>
            </div>

            {/* Menu Items */}
            <div style={{ padding: '8px' }}>
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                style={{ textDecoration: 'none' }}
              >
                <motion.div
                  whileHover={{ x: 4, background: colors.surface }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: colors.text,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: `rgba(122, 184, 158, 0.15)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.success} strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                    </svg>
                  </div>
                  <span style={{ fontWeight: '500' }}>Dashboard</span>
                </motion.div>
              </Link>

              <Link
                href="/journal"
                onClick={() => setIsOpen(false)}
                style={{ textDecoration: 'none' }}
              >
                <motion.div
                  whileHover={{ x: 4, background: colors.surface }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: colors.text,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: `rgba(122, 175, 201, 0.15)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7AAFC9" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                  <span style={{ fontWeight: '500' }}>Journal</span>
                </motion.div>
              </Link>

              {/* Divider */}
              <div style={{
                height: '1px',
                background: colors.border,
                margin: '8px 0',
              }} />

              {onLogout && (
                <motion.button
                  onClick={() => {
                    setIsOpen(false);
                    onLogout();
                  }}
                  whileHover={{ x: 4, background: 'rgba(239, 68, 68, 0.08)' }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: colors.danger,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: `rgba(239, 68, 68, 0.1)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.danger} strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </div>
                  <span style={{ fontWeight: '500' }}>Sign Out</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;
