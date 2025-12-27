'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useMotionValue, useTransform, useSpring } from 'framer-motion';

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
}> = ({ logoClickCount, setLogoClickCount }) => {
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
    <Link href="/" style={{ textDecoration: 'none' }}>
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
                  initial={{ x: 0, y: 0, scale: 0, rotate: 0 }}
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

        {/* Logo Mark with breathing glow */}
        <motion.div
          animate={{
            rotate: isHovered ? 360 : 0,
            boxShadow: [
              `0 0 20px rgba(217, 162, 153, 0.2)`,
              `0 0 30px rgba(217, 162, 153, 0.4)`,
              `0 0 20px rgba(217, 162, 153, 0.2)`,
            ]
          }}
          transition={{
            rotate: { duration: 0.8, ease: 'easeInOut' },
            boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
          }}
          style={{ borderRadius: '12px' }}
        >
          <Image
            src="/voca-coach-icon.svg"
            alt="Voca-Coach Logo"
            width={36}
            height={36}
            style={{ borderRadius: '8px' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </motion.div>

        {/* Wordmark with staggered letter animation */}
        <span style={{ display: 'flex', fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em' }}>
          {'Voca-Coach'.split('').map((letter, i) => (
            <motion.span
              key={i}
              animate={{ color: isHovered ? colors.accent : colors.text }}
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

// Navigation Link with hover effects
const NavLink: React.FC<{
  label: string;
  href: string;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  isActive: boolean;
  onHover: (label: string | null) => void;
  hoveredItem: string | null;
}> = ({ label, href, onClick, isActive, onHover, hoveredItem }) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
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
    <motion.a
      ref={linkRef}
      href={href}
      onClick={onClick}
      style={{
        x: springX,
        y: springY,
        fontSize: '14px',
        fontWeight: 500,
        letterSpacing: '0.3px',
        color: isActive || hoveredItem === label ? colors.accent : colors.textMuted,
        padding: '10px 18px',
        borderRadius: '100px',
        position: 'relative',
        cursor: 'pointer',
        textDecoration: 'none',
        zIndex: 1,
      }}
      onMouseEnter={() => onHover(label)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Spotlight glow */}
      {hoveredItem === label && (
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
      {label}
    </motion.a>
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
        style={{ width: 22, height: 2, borderRadius: 2, display: 'block' }}
      />
      <motion.span
        animate={{ opacity: isOpen ? 0 : 1, scale: isOpen ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        style={{ width: 22, height: 2, background: colors.text, borderRadius: 2, display: 'block' }}
      />
      <motion.span
        animate={{
          rotate: isOpen ? -45 : 0,
          y: isOpen ? -7 : 0,
          background: isOpen ? colors.accent : colors.text,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{ width: 22, height: 2, borderRadius: 2, display: 'block' }}
      />
    </motion.button>
  );
};

// Mobile Menu
const MobileMenu: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  navLinks: { label: string; href: string }[];
  onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => void;
}> = ({ isOpen, onClose, navLinks, onLinkClick }) => {
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {navLinks.map((link, index) => (
                <motion.div key={link.href} variants={itemVariants} custom={index}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      onLinkClick(e, link.href.slice(1));
                      onClose();
                    }}
                    style={{
                      display: 'block',
                      fontSize: 20,
                      fontWeight: 500,
                      color: colors.text,
                      padding: '16px 20px',
                      borderRadius: 16,
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {link.label}
                  </a>
                </motion.div>
              ))}
            </div>

            {/* Auth Buttons */}
            <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24, paddingTop: 24, borderTop: `1px solid ${colors.border}` }}>
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Main Landing Navbar Component
const LandingNavbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('');
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

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Use Cases', href: '#testimonials' },
    { label: 'Pricing', href: '#pricing' },
  ];

  // Smooth scroll to section
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = navLinks.map(link => link.href.slice(1));
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll handling
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    isScrolled.set(currentScrollY > 20 ? 1 : 0);

    if (currentScrollY > lastScrollY && currentScrollY > 300) {
      setShouldHide(true);
    } else {
      setShouldHide(false);
    }

    setLastScrollY(currentScrollY);
  }, [isScrolled, lastScrollY]);

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
          overflow: 'hidden',
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
          />

          {/* Center Navigation (Desktop) */}
          <div className="hide-mobile" style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
          }}>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                position: 'relative',
              }}
            >
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  label={link.label}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href.slice(1))}
                  isActive={activeSection === link.href.slice(1)}
                  onHover={setHoveredItem}
                  hoveredItem={hoveredItem}
                />
              ))}
            </motion.div>
          </div>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navLinks={navLinks}
        onLinkClick={scrollToSection}
      />

      {/* Spacer to prevent content from going under fixed navbar */}
      <div style={{ height: 80 }} />

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

export default LandingNavbar;
