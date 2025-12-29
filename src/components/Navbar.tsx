'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useMotionValue, useTransform, useSpring } from 'framer-motion';
import ProfileDropdown from './ProfileDropdown';
import ChatNotificationBadge from './ChatNotificationBadge';

// Color Palette
const colors = {
  background: '#FAF7F3',
  surface: '#F0E4D3',
  border: '#DCC5B2',
  accent: '#D9A299',
  accentDark: '#C8847A',
  text: '#2D2D2D',
  textMuted: '#7A7A7A',
};

// SVG Icon Components for Command Palette
const HomeIcon = ({ color = '#D9A299', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const TargetIcon = ({ color = '#7AB89E', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const ChartIcon = ({ color = '#7AAFC9', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const BookIcon = ({ color = '#E4B17A', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const ChatBubbleIcon = ({ color = '#B8A9D9', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const CalendarIcon = ({ color = '#D9A299', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

interface NavItem {
  label: string;
  href: string;
  children?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    description?: string;
  }[];
}

interface ModernNavbarProps {
  logo?: { src: string; alt: string };
  navItems?: NavItem[];
  primaryCTA?: { label: string; href: string };
  showSearch?: boolean;
  showNotifications?: boolean;
  user?: {
    name: string;
    avatar: string;
    email: string;
  };
  onLogout?: () => void;
  variant?: 'floating' | 'attached';
  hideOnScroll?: boolean;
  // Legacy props for compatibility
  isAuthenticated?: boolean;
  userName?: string;
  userEmail?: string;
  profilePic?: string;
  onProfilePicChange?: (imageUrl: string) => void;
  currentPage?: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  isTherapist?: boolean;
}

// Magnetic effect hook
const useMagneticEffect = (ref: React.RefObject<HTMLElement | null>, strength: number = 0.3) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    x.set(deltaX);
    y.set(deltaY);
  }, [ref, strength, x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return { x, y, handleMouseMove, handleMouseLeave };
};

// Ripple effect component
const RippleEffect: React.FC<{ x: number; y: number; onComplete: () => void }> = ({ x, y, onComplete }) => (
  <motion.span
    initial={{ scale: 0, opacity: 0.5 }}
    animate={{ scale: 4, opacity: 0 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
    onAnimationComplete={onComplete}
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: 20,
      height: 20,
      borderRadius: '50%',
      background: 'rgba(217, 162, 153, 0.4)',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
    }}
  />
);

// Animated Logo Component
const AnimatedLogo: React.FC<{
  logoClickCount: number;
  setLogoClickCount: (fn: (prev: number) => number) => void;
  isAuthenticated: boolean;
}> = ({ logoClickCount, setLogoClickCount, isAuthenticated }) => {
  const logoRef = useRef<HTMLDivElement>(null);
  const { x, y, handleMouseMove, handleMouseLeave } = useMagneticEffect(logoRef, 0.2);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });
  const [isHovered, setIsHovered] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const element = logoRef.current;
    if (!element) return;
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  // Easter egg - 5 clicks triggers confetti
  useEffect(() => {
    if (logoClickCount >= 5) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setLogoClickCount(() => 0);
      }, 2000);
    }
  }, [logoClickCount, setLogoClickCount]);

  return (
    <Link href={isAuthenticated ? "/dashboard" : "/"} style={{ textDecoration: 'none' }}>
      <motion.div
        ref={logoRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          x: springX,
          y: springY,
          position: 'relative',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setLogoClickCount((prev: number) => prev + 1)}
        whileTap={{ scale: 0.98 }}
      >
        {/* Confetti Easter Egg */}
        <AnimatePresence>
          {showConfetti && (
            <>
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: 0,
                    y: 0,
                    scale: 0,
                    rotate: 0
                  }}
                  animate={{
                    x: (Math.random() - 0.5) * 200,
                    y: (Math.random() - 0.5) * 200 - 50,
                    scale: [0, 1, 0.5],
                    rotate: Math.random() * 720 - 360
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    width: 8,
                    height: 8,
                    borderRadius: i % 2 === 0 ? '50%' : '2px',
                    background: [colors.accent, colors.surface, colors.border, colors.accentDark][i % 4],
                    pointerEvents: 'none',
                    zIndex: 1000,
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Logo Mark */}
        <motion.div
          style={{ borderRadius: '12px' }}
        >
          <Image
            src="/voca-coach-icon.svg"
            alt="Voco-Coach Logo"
            width={36}
            height={36}
            style={{
              borderRadius: '8px',
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </motion.div>

        {/* Wordmark with staggered letter animation */}
        <span style={{ display: 'flex', fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em' }}>
          {'Voco-Coach'.split('').map((letter, i) => (
            <motion.span
              key={i}
              animate={{ color: isHovered ? colors.accentDark : colors.accent }}
              transition={{ delay: isHovered ? i * 0.03 : 0, duration: 0.2 }}
              style={{ display: letter === ' ' ? 'inline' : 'inline-block' }}
            >
              {letter}
            </motion.span>
          ))}
        </span>
      </motion.div>
    </Link>
  );
};

// Navigation Link with sliding indicator
const NavLink: React.FC<{
  item: NavItem;
  isActive: boolean;
  onHover: (href: string | null) => void;
  hoveredItem: string | null;
}> = ({ item, isActive, onHover, hoveredItem }) => {
  const linkRef = useRef<HTMLDivElement>(null);
  const { x, y, handleMouseMove, handleMouseLeave } = useMagneticEffect(linkRef, 0.15);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  useEffect(() => {
    const element = linkRef.current;
    if (!element) return;
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', () => {
      handleMouseLeave();
      onHover(null);
    });
    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave, onHover]);

  return (
    <Link href={item.href} style={{ textDecoration: 'none' }}>
      <motion.div
        ref={linkRef}
        style={{
          x: springX,
          y: springY,
          fontSize: '14px',
          fontWeight: 500,
          letterSpacing: '0.3px',
          color: isActive || hoveredItem === item.href ? colors.accent : colors.textMuted,
          padding: '10px 18px',
          borderRadius: '100px',
          position: 'relative',
          cursor: 'pointer',
          zIndex: 1,
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={() => onHover(item.href)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {/* Cursor-following spotlight glow */}
        {hoveredItem === item.href && (
          <motion.div
            layoutId="navSpotlight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle at center, rgba(217, 162, 153, 0.15) 0%, transparent 70%)`,
              borderRadius: '100px',
              zIndex: -1,
            }}
          />
        )}
        {item.label}
      </motion.div>
    </Link>
  );
};

// Sliding Pill Navigation
const SlidingPillNav: React.FC<{
  items: { href: string; label: string }[];
  currentPage: string;
}> = ({ items, currentPage }) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const activeItem = hoveredItem || currentPage;
  const navItems = useMemo(() => items.map(item => ({ ...item, children: undefined })), [items]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        background: 'transparent',
        padding: '4px',
        borderRadius: '100px',
        position: 'relative',
      }}
    >
      {/* Sliding Active Indicator */}
      <AnimatePresence>
        {navItems.map((item) =>
          activeItem === item.href && (
            <motion.div
              key="indicator"
              layoutId="activeNavIndicator"
              initial={false}
              style={{
                position: 'absolute',
                background: colors.background,
                borderRadius: '100px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                zIndex: 0,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )
        )}
      </AnimatePresence>

      {navItems.map((item) => {
        const isActive = currentPage === item.href;
        return (
          <NavLink
            key={item.href}
            item={item}
            isActive={isActive}
            onHover={setHoveredItem}
            hoveredItem={hoveredItem}
          />
        );
      })}
    </motion.div>
  );
};

// Icon Button with tooltip
const IconButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  badge?: number;
  onClick?: () => void;
}> = ({ icon, label, badge, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.button
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={onClick}
      whileHover={{ scale: 1.05, background: colors.surface }}
      whileTap={{ scale: 0.95 }}
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        color: colors.textMuted,
        transition: 'color 0.2s ease',
      }}
      aria-label={label}
    >
      <motion.div
        whileHover={{ color: colors.accent }}
        transition={{ duration: 0.2 }}
      >
        {icon}
      </motion.div>

      {/* Notification Badge */}
      {badge !== undefined && badge > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: colors.accent,
            color: colors.background,
            fontSize: '10px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <motion.span
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(217, 162, 153, 0.4)',
                '0 0 0 8px rgba(217, 162, 153, 0)',
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
            }}
          />
          {badge > 9 ? '9+' : badge}
        </motion.span>
      )}

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '100%',
              marginTop: 8,
              padding: '6px 12px',
              background: colors.text,
              color: colors.background,
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 500,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 100,
            }}
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// Primary CTA Button
const PrimaryCTAButton: React.FC<{
  label: string;
  href: string;
}> = ({ label, href }) => {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const buttonRef = useRef<HTMLAnchorElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipples(prev => [...prev, { x, y, id: Date.now() }]);
  };

  const removeRipple = (id: number) => {
    setRipples(prev => prev.filter(r => r.id !== id));
  };

  return (
    <Link href={href} style={{ textDecoration: 'none' }} ref={buttonRef}>
      <motion.span
        onClick={handleClick}
        whileHover={{
          scale: 1.03,
          boxShadow: '0 0 20px rgba(217, 162, 153, 0.4)',
        }}
        whileTap={{ scale: 0.98 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 24px',
          background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`,
          color: colors.background,
          borderRadius: '100px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(217, 162, 153, 0.35)',
        }}
      >
        {/* Ripple effects */}
        {ripples.map(ripple => (
          <RippleEffect
            key={ripple.id}
            x={ripple.x}
            y={ripple.y}
            onComplete={() => removeRipple(ripple.id)}
          />
        ))}

        {label}
      </motion.span>
    </Link>
  );
};

// Animated Hamburger Icon
const AnimatedHamburger: React.FC<{
  isOpen: boolean;
  onClick: () => void;
}> = ({ isOpen, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      style={{
        width: 44,
        height: 44,
        background: isOpen ? colors.surface : 'transparent',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        transition: 'background 0.2s ease',
      }}
      aria-label="Toggle menu"
      aria-expanded={isOpen}
    >
      <motion.span
        animate={{
          rotate: isOpen ? 45 : 0,
          y: isOpen ? 7 : 0,
          background: isOpen ? colors.accent : colors.text,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          width: 22,
          height: 2,
          borderRadius: 2,
          display: 'block',
        }}
      />
      <motion.span
        animate={{
          opacity: isOpen ? 0 : 1,
          scale: isOpen ? 0 : 1,
        }}
        transition={{ duration: 0.2 }}
        style={{
          width: 22,
          height: 2,
          background: colors.text,
          borderRadius: 2,
          display: 'block',
        }}
      />
      <motion.span
        animate={{
          rotate: isOpen ? -45 : 0,
          y: isOpen ? -7 : 0,
          background: isOpen ? colors.accent : colors.text,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          width: 22,
          height: 2,
          borderRadius: 2,
          display: 'block',
        }}
      />
    </motion.button>
  );
};

// Mobile Menu
const MobileMenu: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  navItems: { href: string; label: string }[];
  roleNavItems: { href: string; label: string }[];
  currentPage: string;
  isAuthenticated: boolean;
  userName?: string;
  userEmail?: string;
  profilePic?: string;
  onLogout?: () => void;
}> = ({
  isOpen,
  onClose,
  navItems,
  roleNavItems,
  currentPage,
  isAuthenticated,
  userName,
  userEmail,
  profilePic,
  onLogout
}) => {
  const menuVariants = {
    closed: {
      clipPath: 'inset(0 0 100% 0)',
      transition: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 40,
        staggerChildren: 0.03,
        staggerDirection: -1,
      }
    },
    open: {
      clipPath: 'inset(0 0 0 0)',
      transition: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 40,
        staggerChildren: 0.05,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    closed: { x: 50, opacity: 0 },
    open: { x: 0, opacity: 1 }
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(45, 45, 45, 0.4)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 98,
            }}
          />
        )}
      </AnimatePresence>

      {/* Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            style={{
              position: 'fixed',
              top: 80,
              left: 12,
              right: 12,
              background: colors.background,
              borderRadius: 24,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              zIndex: 99,
              padding: 24,
              maxHeight: 'calc(100vh - 100px)',
              overflowY: 'auto',
            }}
          >
            {/* Navigation Items */}
            {isAuthenticated && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {navItems.map((item, index) => {
                  const isActive = currentPage === item.href;
                  return (
                    <motion.div key={item.href} variants={itemVariants} custom={index}>
                      <Link href={item.href} onClick={onClose} style={{ textDecoration: 'none' }}>
                        <motion.div
                          whileTap={{ scale: 0.98 }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: 20,
                            fontWeight: 500,
                            color: isActive ? colors.accent : colors.text,
                            padding: '16px 20px',
                            borderRadius: 16,
                            background: isActive ? colors.surface : 'transparent',
                            borderLeft: isActive ? `3px solid ${colors.accent}` : '3px solid transparent',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {item.label}
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Role Nav Items */}
                {roleNavItems.length > 0 && (
                  <motion.div
                    variants={itemVariants}
                    style={{
                      borderTop: `1px solid ${colors.border}`,
                      marginTop: 12,
                      paddingTop: 16,
                    }}
                  >
                    {roleNavItems.map((item) => {
                      const isActive = currentPage === item.href;
                      return (
                        <Link key={item.href} href={item.href} onClick={onClose} style={{ textDecoration: 'none' }}>
                          <motion.div
                            whileTap={{ scale: 0.98 }}
                            style={{
                              fontSize: 18,
                              fontWeight: 600,
                              color: isActive ? colors.accentDark : colors.accent,
                              padding: '14px 20px',
                              borderRadius: 12,
                              background: isActive ? `${colors.accent}15` : 'transparent',
                              border: `1px solid ${colors.accent}40`,
                              marginBottom: 8,
                            }}
                          >
                            {item.label}
                          </motion.div>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            )}

            {/* Auth Buttons for non-authenticated */}
            {!isAuthenticated && (
              <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Link href="/login" onClick={onClose} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    style={{
                      textAlign: 'center',
                      fontSize: 16,
                      fontWeight: 600,
                      color: colors.text,
                      padding: 16,
                      borderRadius: 100,
                      border: `2px solid ${colors.border}`,
                    }}
                  >
                    Log in
                  </motion.div>
                </Link>
                <Link href="/signup" onClick={onClose} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    style={{
                      textAlign: 'center',
                      padding: 16,
                      background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`,
                      color: colors.background,
                      borderRadius: 100,
                      fontSize: 16,
                      fontWeight: 600,
                      boxShadow: '0 4px 16px rgba(217, 162, 153, 0.35)',
                    }}
                  >
                    Get Started
                  </motion.div>
                </Link>
              </motion.div>
            )}

            {/* Profile Section */}
            {isAuthenticated && (
              <motion.div
                variants={itemVariants}
                style={{
                  borderTop: `1px solid ${colors.border}`,
                  marginTop: 16,
                  paddingTop: 20,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  {profilePic ? (
                    <Image
                      src={profilePic}
                      alt={userName || 'User'}
                      width={48}
                      height={48}
                      style={{ borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: colors.background,
                      fontWeight: 600,
                      fontSize: 18,
                    }}>
                      {(userName || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 600, color: colors.text }}>{userName}</div>
                    {userEmail && (
                      <div style={{ fontSize: 14, color: colors.textMuted }}>{userEmail}</div>
                    )}
                  </div>
                </div>
                {onLogout && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    style={{
                      width: '100%',
                      padding: 14,
                      background: 'transparent',
                      border: `2px solid ${colors.border}`,
                      borderRadius: 12,
                      fontSize: 15,
                      fontWeight: 600,
                      color: colors.textMuted,
                      cursor: 'pointer',
                    }}
                  >
                    Sign out
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* Social Icons with staggered animation */}
            <motion.div
              variants={itemVariants}
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 16,
                marginTop: 24,
                paddingTop: 16,
                borderTop: `1px solid ${colors.border}`,
              }}
            >
              {['twitter', 'instagram', 'linkedin'].map((social, i) => (
                <motion.a
                  key={social}
                  href={`https://${social}.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 400 }}
                  whileHover={{ scale: 1.1, color: colors.accent }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: colors.surface,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.textMuted,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    {social === 'twitter' && (
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    )}
                    {social === 'instagram' && (
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    )}
                    {social === 'linkedin' && (
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    )}
                  </svg>
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Command Palette Modal
const CommandPalette: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const quickActions = [
    { label: 'Go to Dashboard', href: '/dashboard', icon: <HomeIcon color="#D9A299" size={20} /> },
    { label: 'Start Live Session', href: '/de-escalation', icon: <TargetIcon color="#7AB89E" size={20} /> },
    { label: 'View Analytics', href: '/biomarkers', icon: <ChartIcon color="#7AAFC9" size={20} /> },
    { label: 'Open Journal', href: '/journal', icon: <BookIcon color="#E4B17A" size={20} /> },
    { label: 'Practice Mode', href: '/persona', icon: <ChatBubbleIcon color="#B8A9D9" size={20} /> },
    { label: 'Book Therapy', href: '/therapy/book', icon: <CalendarIcon color="#D9A299" size={20} /> },
  ];

  const filteredActions = quickActions.filter(action =>
    action.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(45, 45, 45, 0.6)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 200,
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              position: 'fixed',
              top: '20%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: 560,
              background: `rgba(250, 247, 243, 0.95)`,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 20,
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.2)',
              border: `1px solid ${colors.border}`,
              zIndex: 201,
              overflow: 'hidden',
            }}
          >
            {/* Search Input */}
            <div style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search actions..."
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  fontSize: 16,
                  color: colors.text,
                  outline: 'none',
                }}
              />
              <kbd style={{
                padding: '4px 8px',
                background: colors.surface,
                borderRadius: 6,
                fontSize: 12,
                color: colors.textMuted,
                fontFamily: 'monospace',
              }}>
                ESC
              </kbd>
            </div>

            {/* Quick Actions */}
            <div style={{ padding: 8, maxHeight: 400, overflowY: 'auto' }}>
              <div style={{
                padding: '8px 12px',
                fontSize: 12,
                fontWeight: 600,
                color: colors.textMuted,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                Quick Actions
              </div>
              {filteredActions.map((action, index) => (
                <Link key={action.href} href={action.href} onClick={onClose} style={{ textDecoration: 'none' }}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ background: colors.surface }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      borderRadius: 12,
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{action.icon}</span>
                    <span style={{ color: colors.text, fontWeight: 500 }}>{action.label}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Main Navbar Component
const ModernNavbar: React.FC<ModernNavbarProps> = ({
  isAuthenticated = false,
  userName = 'User',
  userEmail,
  profilePic,
  onProfilePicChange,
  onLogout,
  currentPage = '',
  isAdmin = false,
  isSuperAdmin = false,
  isTherapist = false,
  hideOnScroll = false,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [shouldHide, setShouldHide] = useState(false);

  const { scrollY } = useScroll();
  const scrollProgress = useTransform(scrollY, [0, 2000], [0, 100]);

  // Scroll state
  const isScrolled = useMotionValue(0);
  const navbarHeight = useTransform(isScrolled, [0, 1], [64, 56]);
  const navbarOpacity = useTransform(isScrolled, [0, 1], [0.7, 0.95]);
  const shadowOpacity = useTransform(isScrolled, [0, 1], [0.06, 0.12]);

  const springHeight = useSpring(navbarHeight, { stiffness: 300, damping: 30 });
  const springOpacity = useSpring(navbarOpacity, { stiffness: 300, damping: 30 });

  // Navigation items
  const isTherapistPage = currentPage.startsWith('/therapist');

  const therapistNavItems = [
    { href: '/therapist', label: 'Dashboard' },
    { href: '/therapist/chat', label: 'Chat' },
    { href: '/therapist/profile', label: 'My Profile' },
  ];

  const studentNavItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/de-escalation', label: 'Live Session' },
    { href: '/biomarkers', label: 'Analytics' },
    { href: '/journal', label: 'Journal' },
    { href: '/persona', label: 'Practice' },
    { href: '/therapy/book', label: 'Therapy' }
  ];

  const navItems = isTherapistPage ? therapistNavItems : studentNavItems;

  const roleNavItems: { href: string; label: string }[] = [];
  if (isTherapist && !isTherapistPage) {
    roleNavItems.push({ href: '/therapist', label: 'Therapist' });
  }
  if (isAdmin || isSuperAdmin) {
    roleNavItems.push({ href: '/admin', label: 'Admin' });
  }

  // Scroll handling
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    isScrolled.set(currentScrollY > 20 ? 1 : 0);

    if (hideOnScroll) {
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShouldHide(true);
      } else {
        setShouldHide(false);
      }
    }

    setLastScrollY(currentScrollY);
  }, [isScrolled, lastScrollY, hideOnScroll]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  // Command palette keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Skip to content link for a11y */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          left: -9999,
          top: 'auto',
          width: 1,
          height: 1,
          overflow: 'hidden',
        }}
        onFocus={(e) => {
          e.currentTarget.style.position = 'fixed';
          e.currentTarget.style.left = '16px';
          e.currentTarget.style.top = '16px';
          e.currentTarget.style.width = 'auto';
          e.currentTarget.style.height = 'auto';
          e.currentTarget.style.padding = '12px 24px';
          e.currentTarget.style.background = colors.accent;
          e.currentTarget.style.color = colors.background;
          e.currentTarget.style.borderRadius = '8px';
          e.currentTarget.style.zIndex = '9999';
        }}
        onBlur={(e) => {
          e.currentTarget.style.position = 'absolute';
          e.currentTarget.style.left = '-9999px';
        }}
      >
        Skip to content
      </a>

      {/* Main Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0, x: '-50%' }}
        animate={{
          y: shouldHide ? -100 : 0,
          opacity: shouldHide ? 0 : 1,
          x: '-50%'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'fixed',
          top: 16,
          left: '50%',
          width: 'min(calc(100% - 32px), 1200px)',
          height: springHeight,
          zIndex: 100,
          borderRadius: 100,
          border: '1px solid rgba(220, 197, 178, 0.3)',
          boxShadow: `0 8px 32px rgba(0, 0, 0, ${shadowOpacity.get()})`,
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Glassmorphism background */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            background: `rgba(250, 247, 243, ${springOpacity.get()})`,
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: 100,
          }}
        />

        {/* Scroll Progress Indicator */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: 2,
            width: `${scrollProgress.get()}%`,
            background: `linear-gradient(90deg, ${colors.accent} 0%, ${colors.border} 100%)`,
            borderRadius: '0 2px 2px 0',
          }}
        />

        {/* Inner Layout */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
          padding: '8px 8px 8px 24px',
        }}>
          {/* Logo */}
          <AnimatedLogo
            logoClickCount={logoClickCount}
            setLogoClickCount={setLogoClickCount}
            isAuthenticated={isAuthenticated}
          />

          {/* Center Navigation (Desktop) */}
          {isAuthenticated && (
            <div className="hide-mobile" style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
            }}>
              <SlidingPillNav items={navItems} currentPage={currentPage} />
            </div>
          )}

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Search Button (Desktop) */}
            <div className="hide-mobile">
              <IconButton
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                }
                label="Search (⌘K)"
                onClick={() => setIsCommandPaletteOpen(true)}
              />
            </div>

            {/* Chat Notification Badge */}
            {isAuthenticated && (
              <ChatNotificationBadge isTherapist={isTherapist} />
            )}

            {!isAuthenticated ? (
              <>
                {/* Desktop Auth Buttons */}
                <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Link href="/login" style={{ textDecoration: 'none' }}>
                    <motion.span
                      whileHover={{ scale: 1.02, color: colors.accent }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: colors.text,
                        padding: '10px 18px',
                        cursor: 'pointer',
                      }}
                    >
                      Log in
                    </motion.span>
                  </Link>
                  <PrimaryCTAButton label="Get Started" href="/signup" />
                </div>

                {/* Mobile Hamburger */}
                <div className="show-mobile" style={{ display: 'none' }}>
                  <AnimatedHamburger
                    isOpen={isMobileMenuOpen}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  />
                </div>
              </>
            ) : (
              <>
                {/* Role Nav Items (Desktop) */}
                <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {roleNavItems.map((item) => {
                    const isActive = currentPage === item.href;
                    return (
                      <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: isActive ? colors.accentDark : colors.accent,
                            padding: '8px 14px',
                            borderRadius: 100,
                            background: isActive ? `${colors.accent}15` : 'transparent',
                            border: `1px solid ${colors.accent}40`,
                          }}
                        >
                          {item.label}
                        </motion.span>
                      </Link>
                    );
                  })}
                </div>

                {/* Profile Dropdown (Desktop) */}
                <div className="hide-mobile">
                  <ProfileDropdown
                    userName={userName}
                    userEmail={userEmail}
                    profilePic={profilePic}
                    onProfilePicChange={onProfilePicChange}
                    onLogout={onLogout}
                  />
                </div>

                {/* Mobile Hamburger */}
                <div className="show-mobile" style={{ display: 'none' }}>
                  <AnimatedHamburger
                    isOpen={isMobileMenuOpen}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navItems={navItems}
        roleNavItems={roleNavItems}
        currentPage={currentPage}
        isAuthenticated={isAuthenticated}
        userName={userName}
        userEmail={userEmail}
        profilePic={profilePic}
        onLogout={onLogout}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* Spacer to prevent content from going under fixed navbar */}
      <div style={{ height: 96 }} />

      {/* CSS for responsiveness */}
      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        @media (max-width: 768px) {
          .hide-mobile {
            display: none !important;
          }
          .show-mobile {
            display: flex !important;
          }
        }

        @media (min-width: 769px) {
          .show-mobile {
            display: none !important;
          }
        }

        /* Focus ring for accessibility */
        *:focus-visible {
          outline: 2px solid ${colors.accent};
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
};

export default ModernNavbar;
