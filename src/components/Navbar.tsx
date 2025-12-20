'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProfileDropdown from './ProfileDropdown';

interface NavbarProps {
  isAuthenticated?: boolean;
  userName?: string;
  userEmail?: string;
  profilePic?: string;
  onProfilePicChange?: (imageUrl: string) => void;
  onLogout?: () => void;
  currentPage?: string;
  isAdmin?: boolean;
  isTherapist?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  isAuthenticated = false,
  userName = 'User',
  userEmail,
  profilePic,
  onProfilePicChange,
  onLogout,
  currentPage = '',
  isAdmin = false,
  isTherapist = false
}) => {
  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/de-escalation', label: 'Live Session' },
    { href: '/biomarkers', label: 'Analytics' },
    { href: '/journal', label: 'Journal' },
    { href: '/persona', label: 'Practice' },
    { href: '/therapy/book', label: 'Therapy' }
  ];

  const roleNavItems = [];
  if (isTherapist) {
    roleNavItems.push({ href: '/therapist', label: '🧑‍⚕️ Therapist' });
  }
  if (isAdmin) {
    roleNavItems.push({ href: '/admin', label: '⚙️ Admin' });
  }

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(124, 58, 237, 0.1)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px'
      }}>
        {/* Logo */}
        <Link href={isAuthenticated ? "/dashboard" : "/"} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Image
            src="/voca-coach-logo.png"
            alt="Voca-Coach Logo"
            width={40}
            height={40}
            style={{ borderRadius: '10px' }}
            onError={(e) => {
              // Fallback to gradient if image fails
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              if (target.nextSibling) {
                (target.nextSibling as HTMLElement).style.display = 'flex';
              }
            }}
          />
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
            borderRadius: '10px',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            color: 'white',
            fontSize: '14px'
          }}>
            VC
          </div>
          <span style={{ fontSize: '20px', fontWeight: '700', color: '#1F2937' }}>Voca-Coach</span>
        </Link>

        {/* Navigation Links (only show if authenticated) */}
        {isAuthenticated && (
          <div className="hide-mobile" style={{ display: 'flex', gap: '24px' }}>
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: currentPage === item.href ? '#7C3AED' : '#6B7280',
                  padding: '8px 0',
                  borderBottom: currentPage === item.href ? '2px solid #7C3AED' : 'none',
                  transition: 'color 0.2s ease'
                }}
              >
                {item.label}
              </Link>
            ))}
            {roleNavItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: currentPage === item.href ? '#10B981' : '#059669',
                  padding: '8px 12px',
                  background: currentPage === item.href ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.05)',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right Side - Auth Buttons or Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!isAuthenticated ? (
            <>
              <Link href="/login" className="hide-mobile" style={{
                fontSize: '15px',
                fontWeight: '600',
                color: '#4B5563',
                padding: '10px 16px'
              }}>
                Log in
              </Link>
              <Link href="/signup" style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                color: 'white',
                borderRadius: '999px',
                fontSize: '15px',
                fontWeight: '600',
                display: 'inline-block'
              }}>
                Get Started
              </Link>
            </>
          ) : (
            <ProfileDropdown
              userName={userName}
              userEmail={userEmail}
              profilePic={profilePic}
              onProfilePicChange={onProfilePicChange}
              onLogout={onLogout}
            />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
