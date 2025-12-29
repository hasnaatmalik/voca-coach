'use client';

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

// Color Palette
const colors = {
  primaryBg: '#FAF7F3',
  secondary: '#F0E4D3',
  accent: '#DCC5B2',
  primaryCTA: '#D9A299',
  primaryCTADark: '#C8847A',
  textPrimary: '#2D2D2D',
  textSecondary: '#5A5A5A',
};

interface HeroProps {
  badge?: { icon: ReactNode; text: string };
  headline: string;
  highlightedWords?: string[];
  subheadline: string;
  primaryCTA: { label: string; href: string };
  visualVariant?: 'cards' | 'illustration' | 'blobs';
}

// Noise texture SVG for grain effect
const NoiseTexture = () => (
  <svg
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      opacity: 0.03,
      pointerEvents: 'none',
    }}
  >
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)" />
  </svg>
);

// Floating Orb Component
const FloatingOrb: React.FC<{
  size: number;
  color: string;
  blur: number;
  initialX: string;
  initialY: string;
  duration: number;
  delay?: number;
}> = ({ size, color, blur, initialX, initialY, duration, delay = 0 }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: prefersReducedMotion ? 0 : [0, 20, -10, 0],
        y: prefersReducedMotion ? 0 : [0, -15, 10, 0],
      }}
      transition={{
        opacity: { duration: 1, delay },
        scale: { duration: 1, delay },
        x: { duration, repeat: Infinity, ease: 'easeInOut', delay },
        y: { duration: duration * 1.2, repeat: Infinity, ease: 'easeInOut', delay },
      }}
      style={{
        position: 'absolute',
        left: initialX,
        top: initialY,
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        filter: `blur(${blur}px)`,
        pointerEvents: 'none',
      }}
    />
  );
};

// Shimmer Animation Component
const ShimmerEffect: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <motion.div style={{ position: 'relative', overflow: 'hidden', display: 'inline-flex' }}>
      {children}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 3,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
};

// Floating Icon Component
const FloatingIcon: React.FC<{
  icon: ReactNode;
  x: string;
  y: string;
  delay: number;
  duration: number;
  mouseX: number;
  mouseY: number;
}> = ({ icon, x, y, delay, duration, mouseX, mouseY }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: prefersReducedMotion ? 0 : [0, -8, 0],
      }}
      transition={{
        opacity: { duration: 0.5, delay },
        scale: { duration: 0.5, delay, type: 'spring', stiffness: 200 },
        y: { duration, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.5 },
      }}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: '48px',
        height: '48px',
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(8px)',
        border: `1px solid ${colors.accent}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        transform: `translate(${mouseX * 0.02}px, ${mouseY * 0.02}px)`,
        transition: 'transform 0.3s ease-out',
        zIndex: 10,
      }}
    >
      {icon}
    </motion.div>
  );
};

// 3D Card Component with Glassmorphism
const GlassCard: React.FC<{
  children: ReactNode;
  x: string;
  y: string;
  width: string;
  height: string;
  rotation: number;
  delay: number;
  mouseX: number;
  mouseY: number;
  depth: number;
}> = ({ children, x, y, width, height, rotation, delay, mouseX, mouseY, depth }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Calculate tilt based on mouse position
  const tiltX = prefersReducedMotion ? 0 : (mouseY * 0.01 * depth);
  const tiltY = prefersReducedMotion ? 0 : (-mouseX * 0.01 * depth);
  const translateZ = depth * 20;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.8, rotateY: rotation - 10 }}
      animate={{ opacity: 1, scale: 1, rotateY: rotation }}
      transition={{
        duration: 0.8,
        delay,
        type: 'spring',
        stiffness: 100,
      }}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        borderRadius: '24px',
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: `
          0 4px 24px rgba(0, 0, 0, 0.06),
          0 12px 48px rgba(217, 162, 153, 0.12)
        `,
        padding: '20px',
        transformStyle: 'preserve-3d',
        transform: `
          perspective(1000px)
          rotateX(${tiltX}deg)
          rotateY(${tiltY + rotation}deg)
          translateZ(${translateZ}px)
        `,
        transition: 'transform 0.2s ease-out',
        overflow: 'hidden',
      }}
    >
      {children}
    </motion.div>
  );
};

// Analytics Mini Chart
const MiniChart = () => (
  <div style={{ width: '100%', height: '100%' }}>
    <div style={{ fontSize: '12px', fontWeight: 600, color: colors.textSecondary, marginBottom: '8px' }}>
      Weekly Progress
    </div>
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '60px' }}>
      {[40, 65, 45, 80, 55, 90, 75].map((height, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${height}%` }}
          transition={{ duration: 0.5, delay: 1.2 + i * 0.1 }}
          style={{
            flex: 1,
            background: i === 5
              ? `linear-gradient(180deg, ${colors.primaryCTA} 0%, ${colors.primaryCTADark} 100%)`
              : colors.secondary,
            borderRadius: '4px',
          }}
        />
      ))}
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
        <span key={i} style={{ fontSize: '10px', color: colors.textSecondary, flex: 1, textAlign: 'center' }}>
          {day}
        </span>
      ))}
    </div>
  </div>
);

// Chat Bubble Card
const ChatBubble = () => (
  <div>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '12px',
    }}>
      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${colors.primaryCTA} 0%, ${colors.primaryCTADark} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
        </svg>
      </div>
      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textPrimary }}>AI Coach</div>
        <div style={{ fontSize: '9px', color: colors.textSecondary }}>Just now</div>
      </div>
    </div>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.5 }}
      style={{
        background: colors.secondary,
        borderRadius: '12px',
        padding: '10px 12px',
        fontSize: '12px',
        color: colors.textPrimary,
        lineHeight: 1.4,
      }}
    >
      Great progress! Your tone was 23% calmer today.
    </motion.div>
  </div>
);

// Session Timer Card
const SessionTimer = () => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '10px', fontWeight: 600, color: colors.textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      Session Active
    </div>
    <motion.div
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
      style={{
        fontSize: '28px',
        fontWeight: 700,
        color: colors.primaryCTA,
        fontFamily: 'monospace',
      }}
    >
      12:34
    </motion.div>
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '6px',
      marginTop: '10px',
    }}>
      <motion.div
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#4CAF50',
        }}
      />
      <span style={{ fontSize: '10px', color: colors.textSecondary }}>Recording</span>
    </div>
  </div>
);

// Main Hero Component
const Hero: React.FC<HeroProps> = ({
  badge = { icon: <span>✨</span>, text: 'AI-Powered Coaching' },
  headline = 'Master Your Voice, Transform Your Life',
  highlightedWords = ['Voice'],
  subheadline = 'Voco-Coach empowers you to communicate with confidence through AI-driven feedback, personalized coaching, and evidence-based techniques.',
  primaryCTA = { label: 'Start Free Trial', href: '/signup' },
  visualVariant = 'cards',
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollY } = useScroll();
  const scrollProgress = useTransform(scrollY, [0, 500], [1, 0.95]);
  const scrollOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current && !prefersReducedMotion) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [prefersReducedMotion]);

  // Check mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Set loaded
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Parse headline with highlighted words
  const renderHeadline = () => {
    let text = headline;
    const parts: ReactNode[] = [];
    let lastIndex = 0;

    highlightedWords?.forEach((word) => {
      const index = text.toLowerCase().indexOf(word.toLowerCase());
      if (index !== -1) {
        if (index > lastIndex) {
          parts.push(text.slice(lastIndex, index));
        }
        parts.push(
          <span
            key={word}
            style={{
              background: `linear-gradient(135deg, ${colors.primaryCTA} 0%, ${colors.accent} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {text.slice(index, index + word.length)}
          </span>
        );
        lastIndex = index + word.length;
      }
    });

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : headline;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
      },
    },
  };

  const floatingIcons = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill={colors.primaryCTA}>
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
      ),
      x: '5%',
      y: '20%',
      delay: 0.8,
      duration: 3,
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill={colors.primaryCTA}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
      x: '85%',
      y: '15%',
      delay: 1,
      duration: 3.5,
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill={colors.primaryCTA}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ),
      x: '90%',
      y: '65%',
      delay: 1.2,
      duration: 4,
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill={colors.primaryCTA}>
          <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />
        </svg>
      ),
      x: '75%',
      y: '80%',
      delay: 1.4,
      duration: 3.2,
    },
  ];

  return (
    <motion.section
      ref={heroRef}
      style={{
        minHeight: 'calc(100vh - 80px)',
        background: colors.primaryBg,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        scale: prefersReducedMotion ? 1 : scrollProgress,
        opacity: prefersReducedMotion ? 1 : scrollOpacity,
      }}
    >
      {/* Noise Texture */}
      <NoiseTexture />

      {/* Background Floating Orbs */}
      <FloatingOrb
        size={isMobile ? 300 : 500}
        color={`radial-gradient(circle, ${colors.secondary} 0%, transparent 70%)`}
        blur={60}
        initialX="-10%"
        initialY="20%"
        duration={15}
        delay={0.2}
      />
      <FloatingOrb
        size={isMobile ? 200 : 400}
        color={`radial-gradient(circle, rgba(217, 162, 153, 0.3) 0%, transparent 70%)`}
        blur={50}
        initialX="70%"
        initialY="-10%"
        duration={18}
        delay={0.5}
      />
      <FloatingOrb
        size={isMobile ? 150 : 300}
        color={`radial-gradient(circle, ${colors.accent}40 0%, transparent 70%)`}
        blur={40}
        initialX="60%"
        initialY="70%"
        duration={12}
        delay={0.8}
      />

      {/* Dot Grid Pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(${colors.accent}30 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      />

      {/* Gradient Mesh in Corner */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: isMobile ? '50%' : '40%',
          height: '60%',
          background: `radial-gradient(ellipse at bottom right, ${colors.primaryCTA}20 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Main Content Container */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: isMobile ? '40px 24px 40px' : '20px 48px 40px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '55% 45%',
          gap: isMobile ? '48px' : '48px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Left Content Area */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? 'visible' : 'hidden'}
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <ShimmerEffect>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  background: colors.secondary,
                  borderRadius: '999px',
                  border: `1px solid ${colors.accent}`,
                  marginBottom: '24px',
                }}
              >
                <span style={{ fontSize: '16px' }}>{badge.icon}</span>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: colors.textSecondary,
                  }}
                >
                  {badge.text}
                </span>
              </div>
            </ShimmerEffect>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            style={{
              fontSize: isMobile ? 'clamp(36px, 10vw, 42px)' : 'clamp(48px, 5vw, 72px)',
              fontWeight: 800,
              lineHeight: 1.1,
              color: colors.textPrimary,
              marginBottom: '24px',
              letterSpacing: '-0.03em',
            }}
          >
            {renderHeadline()}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            style={{
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: 400,
              lineHeight: 1.7,
              color: colors.textSecondary,
              maxWidth: '480px',
              marginBottom: '36px',
            }}
          >
            {subheadline}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '16px',
              marginBottom: '40px',
            }}
          >
            {/* Primary CTA */}
            <Link href={primaryCTA.href} style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: `0 12px 40px ${colors.primaryCTA}50` }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '18px 36px',
                  background: `linear-gradient(135deg, ${colors.primaryCTA} 0%, ${colors.primaryCTADark} 100%)`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '999px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: `0 8px 30px ${colors.primaryCTA}40`,
                  transition: 'all 0.3s ease',
                  width: isMobile ? '100%' : 'auto',
                }}
              >
                {primaryCTA.label}
                <motion.svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  initial={{ x: 0 }}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <path
                    d="M4 10h12M12 6l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </motion.button>
            </Link>

          </motion.div>

        </motion.div>

        {/* Right Visual Area */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{
              position: 'relative',
              height: '500px',
              perspective: '1000px',
            }}
          >
            {/* Floating Icons */}
            {floatingIcons.map((icon, index) => (
              <FloatingIcon
                key={index}
                icon={icon.icon}
                x={icon.x}
                y={icon.y}
                delay={icon.delay}
                duration={icon.duration}
                mouseX={mousePosition.x}
                mouseY={mousePosition.y}
              />
            ))}

            {/* Glass Cards */}
            {visualVariant === 'cards' && (
              <>
                {/* Analytics Card */}
                <GlassCard
                  x="10%"
                  y="5%"
                  width="220px"
                  height="160px"
                  rotation={-8}
                  delay={0.6}
                  mouseX={mousePosition.x}
                  mouseY={mousePosition.y}
                  depth={1.5}
                >
                  <MiniChart />
                </GlassCard>

                {/* Chat Card */}
                <GlassCard
                  x="35%"
                  y="35%"
                  width="200px"
                  height="140px"
                  rotation={5}
                  delay={0.8}
                  mouseX={mousePosition.x}
                  mouseY={mousePosition.y}
                  depth={1}
                >
                  <ChatBubble />
                </GlassCard>

                {/* Timer Card */}
                <GlassCard
                  x="5%"
                  y="55%"
                  width="160px"
                  height="130px"
                  rotation={-3}
                  delay={1}
                  mouseX={mousePosition.x}
                  mouseY={mousePosition.y}
                  depth={2}
                >
                  <SessionTimer />
                </GlassCard>
              </>
            )}

            {/* Blobs Variant */}
            {visualVariant === 'blobs' && (
              <>
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    rotate: { duration: 30, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  style={{
                    position: 'absolute',
                    left: '20%',
                    top: '20%',
                    width: '300px',
                    height: '300px',
                    background: `linear-gradient(135deg, ${colors.primaryCTA} 0%, ${colors.accent} 100%)`,
                    borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
                    opacity: 0.8,
                    boxShadow: `0 20px 60px ${colors.primaryCTA}40`,
                  }}
                />
                <motion.div
                  animate={{
                    rotate: [0, -360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    rotate: { duration: 25, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  style={{
                    position: 'absolute',
                    left: '40%',
                    top: '40%',
                    width: '200px',
                    height: '200px',
                    background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.accent} 100%)`,
                    borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                    opacity: 0.6,
                  }}
                />
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -20, 0],
                      x: [0, 10, 0],
                    }}
                    transition={{
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                    style={{
                      position: 'absolute',
                      left: `${30 + i * 15}%`,
                      top: `${20 + i * 12}%`,
                      width: 20 + i * 8,
                      height: 20 + i * 8,
                      background: colors.primaryCTA,
                      borderRadius: '50%',
                      opacity: 0.4 + i * 0.1,
                    }}
                  />
                ))}
              </>
            )}

            {/* Illustration Variant */}
            {visualVariant === 'illustration' && (
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '400px',
                  height: '400px',
                }}
              >
                {/* Abstract Human Silhouette */}
                <motion.svg
                  viewBox="0 0 400 400"
                  fill="none"
                  style={{ width: '100%', height: '100%' }}
                >
                  {/* Head */}
                  <motion.circle
                    cx="200"
                    cy="100"
                    r="50"
                    fill={`url(#headGradient)`}
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                  {/* Body */}
                  <motion.path
                    d="M150 150 Q200 180 250 150 L270 320 Q200 350 130 320 Z"
                    fill={`url(#bodyGradient)`}
                    animate={{ d: [
                      "M150 150 Q200 180 250 150 L270 320 Q200 350 130 320 Z",
                      "M150 155 Q200 175 250 155 L268 318 Q200 348 132 318 Z",
                      "M150 150 Q200 180 250 150 L270 320 Q200 350 130 320 Z",
                    ]}}
                    transition={{ duration: 6, repeat: Infinity }}
                  />
                  {/* Sound Waves */}
                  {[1, 2, 3].map((i) => (
                    <motion.path
                      key={i}
                      d={`M${280 + i * 20} 100 Q${300 + i * 20} 130 ${280 + i * 20} 160`}
                      stroke={colors.primaryCTA}
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ opacity: 0, pathLength: 0 }}
                      animate={{ opacity: [0, 1, 0], pathLength: [0, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    />
                  ))}
                  <defs>
                    <linearGradient id="headGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={colors.primaryCTA} />
                      <stop offset="100%" stopColor={colors.accent} />
                    </linearGradient>
                    <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={colors.secondary} />
                      <stop offset="100%" stopColor={colors.accent} />
                    </linearGradient>
                  </defs>
                </motion.svg>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.5 }}
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: isMobile ? 'none' : 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '12px', color: colors.textSecondary, letterSpacing: '1px' }}>
          SCROLL
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            width: '24px',
            height: '40px',
            borderRadius: '12px',
            border: `2px solid ${colors.accent}`,
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '8px',
          }}
        >
          <motion.div
            animate={{ opacity: [1, 0], y: [0, 12] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              width: '4px',
              height: '8px',
              borderRadius: '2px',
              background: colors.primaryCTA,
            }}
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

export default Hero;
