'use client';

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useInView } from 'framer-motion';

// Color Palette
const colors = {
  primaryBg: '#FAF7F3',      // cream
  secondaryBg: '#F0E4D3',    // warm beige
  border: '#DCC5B2',         // tan
  accent: '#D9A299',         // dusty rose
  accentDark: '#C8847A',     // darker dusty rose
  textPrimary: '#3D3D3D',
  textSecondary: '#6B6B6B',
  textMuted: '#9B9B9B',
};

interface SocialLink {
  platform: string;
  url: string;
  icon: ReactNode;
}

interface FooterProps {
  companyName?: string;
  tagline?: string;
  logoSrc?: string;
  socialLinks?: SocialLink[];
  onNewsletterSubmit?: (email: string) => void;
  showNewsletter?: boolean;
}

// Default social icons
const DefaultTwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const DefaultLinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const DefaultInstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const DefaultFacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const defaultSocialLinks: SocialLink[] = [
  { platform: 'Twitter', url: '#', icon: <DefaultTwitterIcon /> },
  { platform: 'LinkedIn', url: '#', icon: <DefaultLinkedInIcon /> },
  { platform: 'Instagram', url: '#', icon: <DefaultInstagramIcon /> },
  { platform: 'Facebook', url: '#', icon: <DefaultFacebookIcon /> },
];

// Accordion Section Component for Mobile
const AccordionSection: React.FC<{
  title: string;
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}> = ({ title, children, isOpen, onToggle, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{
        borderBottom: `1px dashed ${colors.border}`,
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 0',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase' as const,
          letterSpacing: '1px',
          color: colors.textPrimary,
        }}
      >
        {title}
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={colors.textSecondary}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingBottom: '16px' }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Animated Link Component
const AnimatedLink: React.FC<{
  href: string;
  children: ReactNode;
  delay?: number;
}> = ({ href, children, delay = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Link
        href={href}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          fontSize: '14px',
          fontWeight: 400,
          color: isHovered ? colors.accent : colors.textSecondary,
          textDecoration: 'none',
          transition: 'all 0.3s ease',
          transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
          position: 'relative',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span style={{ position: 'relative' }}>
          {children}
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: isHovered ? '100%' : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              bottom: -2,
              left: 0,
              height: '1px',
              background: colors.accent,
            }}
          />
        </span>
      </Link>
    </motion.div>
  );
};

// Social Icon Component
const SocialIcon: React.FC<{
  link: SocialLink;
  delay?: number;
}> = ({ link, delay = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3, delay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isHovered ? colors.accent : 'transparent',
        border: `1.5px solid ${isHovered ? colors.accent : colors.border}`,
        color: isHovered ? 'white' : colors.textSecondary,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        textDecoration: 'none',
      }}
      aria-label={link.platform}
    >
      {link.icon}
    </motion.a>
  );
};

// Newsletter Component
const Newsletter: React.FC<{
  onSubmit?: (email: string) => void;
}> = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && onSubmit) {
      onSubmit(email);
      setIsSubmitted(true);
      setEmail('');
      setTimeout(() => setIsSubmitted(false), 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      style={{
        background: colors.primaryBg,
        borderRadius: '20px',
        padding: '28px',
        boxShadow: '0 8px 32px rgba(61, 61, 61, 0.08)',
        border: `1px solid ${colors.border}`,
      }}
    >
      <h4
        style={{
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: colors.textPrimary,
          marginBottom: '12px',
        }}
      >
        Stay Updated
      </h4>
      <p
        style={{
          fontSize: '14px',
          fontWeight: 300,
          color: colors.textSecondary,
          lineHeight: 1.6,
          marginBottom: '20px',
        }}
      >
        Get wellness tips and product updates delivered to your inbox.
      </p>
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexDirection: 'column',
          }}
          className="newsletter-form"
        >
          <div
            style={{
              flex: 1,
              position: 'relative',
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '999px',
                border: `2px solid ${isFocused ? colors.accent : colors.border}`,
                background: 'white',
                fontSize: '14px',
                color: colors.textPrimary,
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02, boxShadow: `0 8px 24px rgba(217, 162, 153, 0.4)` }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '14px 28px',
              borderRadius: '999px',
              border: 'none',
              background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`,
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(217, 162, 153, 0.3)',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {isSubmitted ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Subscribed!
              </motion.span>
            ) : (
              'Subscribe'
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

// Back to Top Button
const BackToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '999px',
            border: `1.5px solid ${colors.border}`,
            background: colors.primaryBg,
            color: colors.textSecondary,
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.accent;
            e.currentTarget.style.color = colors.accent;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.color = colors.textSecondary;
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
          Back to top
        </motion.button>
      )}
    </AnimatePresence>
  );
};

const Footer: React.FC<FooterProps> = ({
  companyName = 'Voca-Coach',
  tagline = 'Empowering your wellness journey with personalized coaching, AI-driven insights, and a supportive community.',
  logoSrc,
  socialLinks = defaultSocialLinks,
  onNewsletterSubmit,
  showNewsletter = true,
}) => {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, margin: '-100px' });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const productLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Live Session', href: '/de-escalation' },
    { label: 'Analytics', href: '/biomarkers' },
    { label: 'Journal', href: '/journal' },
    { label: 'Practice', href: '/persona' },
  ];

  const resourceLinks = [
    { label: 'Help Center', href: '/help' },
    { label: 'Blog', href: '/blog' },
    { label: 'Guides', href: '/guides' },
    { label: 'API Docs', href: '/api-docs' },
  ];

  const companyLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <footer
      ref={footerRef}
      style={{
        background: colors.secondaryBg,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Top Border */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${colors.border} 0%, ${colors.accent} 50%, ${colors.border} 100%)`,
        }}
      />

      {/* Subtle Gradient Mesh Background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, rgba(217, 162, 153, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 60%, rgba(220, 197, 178, 0.1) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        }}
      />

      {/* Main Content */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '80px 24px 40px',
          position: 'relative',
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Desktop Layout */}
          <div className="footer-desktop" style={{ display: isMobile ? 'none' : 'grid' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
                gap: '48px',
              }}
            >
              {/* Brand Column */}
              <motion.div variants={itemVariants}>
                <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  {logoSrc ? (
                    <Image
                      src={logoSrc}
                      alt={companyName}
                      width={44}
                      height={44}
                      style={{
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(217, 162, 153, 0.2)',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(217, 162, 153, 0.3)',
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{ color: 'white' }}
                      >
                        <path
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                          fill="currentColor"
                        />
                        <path
                          d="M12 7V5M12 19v-2M5 12H3M21 12h-2M7.05 7.05L5.64 5.64M18.36 18.36l-1.41-1.41M7.05 16.95l-1.41 1.41M18.36 5.64l-1.41 1.41"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  )}
                  <span
                    style={{
                      fontSize: '22px',
                      fontWeight: 700,
                      color: colors.textPrimary,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {companyName}
                  </span>
                </Link>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 300,
                    color: colors.textSecondary,
                    lineHeight: 1.6,
                    maxWidth: '280px',
                    marginBottom: '24px',
                  }}
                >
                  {tagline}
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {socialLinks.map((link, index) => (
                    <SocialIcon key={link.platform} link={link} delay={0.1 * index} />
                  ))}
                </div>
              </motion.div>

              {/* Product Column */}
              <motion.div variants={itemVariants}>
                <h4
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: colors.textPrimary,
                    marginBottom: '24px',
                  }}
                >
                  Product
                </h4>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {productLinks.map((link, index) => (
                    <AnimatedLink key={link.href} href={link.href} delay={0.05 * index}>
                      {link.label}
                    </AnimatedLink>
                  ))}
                </div>
              </motion.div>

              {/* Resources Column */}
              <motion.div variants={itemVariants}>
                <h4
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: colors.textPrimary,
                    marginBottom: '24px',
                  }}
                >
                  Resources
                </h4>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {resourceLinks.map((link, index) => (
                    <AnimatedLink key={link.href} href={link.href} delay={0.05 * index}>
                      {link.label}
                    </AnimatedLink>
                  ))}
                </div>
              </motion.div>

              {/* Company Column */}
              <motion.div variants={itemVariants}>
                <h4
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: colors.textPrimary,
                    marginBottom: '24px',
                  }}
                >
                  Company
                </h4>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {companyLinks.map((link, index) => (
                    <AnimatedLink key={link.href} href={link.href} delay={0.05 * index}>
                      {link.label}
                    </AnimatedLink>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Newsletter Section - Desktop */}
            {showNewsletter && (
              <motion.div
                variants={itemVariants}
                style={{
                  marginTop: '48px',
                  paddingTop: '48px',
                  borderTop: `1px dashed ${colors.border}`,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <div style={{ maxWidth: '480px', width: '100%' }}>
                  <Newsletter onSubmit={onNewsletterSubmit} />
                </div>
              </motion.div>
            )}
          </div>

          {/* Mobile Layout */}
          <div className="footer-mobile" style={{ display: isMobile ? 'block' : 'none' }}>
            {/* Brand Section - Mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                textAlign: 'center',
                marginBottom: '32px',
                paddingBottom: '32px',
                borderBottom: `1px dashed ${colors.border}`,
              }}
            >
              <Link
                href="/"
                style={{
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(217, 162, 153, 0.3)',
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ color: 'white' }}
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    color: colors.textPrimary,
                  }}
                >
                  {companyName}
                </span>
              </Link>
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: 300,
                  color: colors.textSecondary,
                  lineHeight: 1.6,
                  maxWidth: '300px',
                  margin: '0 auto 20px',
                }}
              >
                {tagline}
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '12px',
                }}
              >
                {socialLinks.map((link, index) => (
                  <SocialIcon key={link.platform} link={link} delay={0.1 * index} />
                ))}
              </div>
            </motion.div>

            {/* Accordion Sections - Mobile */}
            <AccordionSection
              title="Product"
              isOpen={openSection === 'product'}
              onToggle={() => toggleSection('product')}
              index={0}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {productLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      fontSize: '14px',
                      color: colors.textSecondary,
                      textDecoration: 'none',
                      padding: '4px 0',
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </AccordionSection>

            <AccordionSection
              title="Resources"
              isOpen={openSection === 'resources'}
              onToggle={() => toggleSection('resources')}
              index={1}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {resourceLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      fontSize: '14px',
                      color: colors.textSecondary,
                      textDecoration: 'none',
                      padding: '4px 0',
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </AccordionSection>

            <AccordionSection
              title="Company"
              isOpen={openSection === 'company'}
              onToggle={() => toggleSection('company')}
              index={2}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {companyLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      fontSize: '14px',
                      color: colors.textSecondary,
                      textDecoration: 'none',
                      padding: '4px 0',
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </AccordionSection>

            {/* Newsletter Section - Mobile */}
            {showNewsletter && (
              <div style={{ marginTop: '32px' }}>
                <Newsletter onSubmit={onNewsletterSubmit} />
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          borderTop: `1px solid ${colors.border}`,
          background: 'rgba(250, 247, 243, 0.3)',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '24px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: isMobile ? '16px' : '0',
          }}
        >
          {/* Copyright */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              fontSize: '13px',
              color: colors.textMuted,
              margin: 0,
              textAlign: isMobile ? 'center' : 'left',
            }}
          >
            &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
          </motion.p>

          {/* Secondary Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {['Privacy', 'Terms', 'Cookies'].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                style={{
                  fontSize: '13px',
                  color: colors.textMuted,
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = colors.accent)}
                onMouseLeave={(e) => (e.currentTarget.style.color = colors.textMuted)}
              >
                {item}
              </Link>
            ))}
            <BackToTopButton />
          </motion.div>
        </div>
      </div>

      {/* Global Styles for Newsletter Form */}
      <style jsx global>{`
        @media (min-width: 480px) {
          .newsletter-form {
            flex-direction: row !important;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
