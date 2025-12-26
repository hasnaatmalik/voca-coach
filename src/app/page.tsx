'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import LandingNavbar from '@/components/LandingNavbar';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';

// Custom hook for scroll animations
function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// Animated section wrapper component
function AnimatedSection({
  children,
  delay = 0,
  style = {}
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {

  // Feature data for bento grid
  const features = [
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M16 4v24M4 16h24M8 8l16 16M24 8L8 24" stroke="#D9A299" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      ),
      title: 'Real-time Feedback',
      description: 'Get instant insights on your tone, pace, and emotional cues as you speak. Our AI analyzes every nuance.',
      size: 'large',
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M4 24l6-6 4 4 8-8 6 6" stroke="#D9A299" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="4" cy="24" r="2" fill="#D9A299"/>
          <circle cx="10" cy="18" r="2" fill="#D9A299"/>
          <circle cx="14" cy="22" r="2" fill="#D9A299"/>
          <circle cx="22" cy="14" r="2" fill="#D9A299"/>
          <circle cx="28" cy="20" r="2" fill="#D9A299"/>
        </svg>
      ),
      title: 'Progress Tracking',
      description: 'Monitor your improvement over time with beautiful charts and actionable insights.',
      size: 'small',
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="12" stroke="#D9A299" strokeWidth="2.5"/>
          <path d="M16 10v6l4 4" stroke="#D9A299" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M12 4h8M16 4v2" stroke="#D9A299" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      title: 'CBT Techniques',
      description: 'Evidence-based cognitive behavioral therapy exercises to reframe negative thought patterns.',
      size: 'small',
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="6" y="10" width="20" height="16" rx="3" stroke="#D9A299" strokeWidth="2.5"/>
          <circle cx="16" cy="18" r="3" stroke="#D9A299" strokeWidth="2.5"/>
          <path d="M13 10V8a3 3 0 116 0v2" stroke="#D9A299" strokeWidth="2.5"/>
        </svg>
      ),
      title: 'Privacy & Security',
      description: 'Your voice recordings and personal data are encrypted end-to-end. We never share or sell your information.',
      size: 'small',
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M16 6l2.5 5 5.5.8-4 3.9.9 5.3-4.9-2.6-4.9 2.6.9-5.3-4-3.9 5.5-.8L16 6z" stroke="#D9A299" strokeWidth="2.5" strokeLinejoin="round"/>
          <circle cx="16" cy="16" r="12" stroke="#D9A299" strokeWidth="2.5" strokeDasharray="4 4"/>
        </svg>
      ),
      title: 'AI-Powered Coaching',
      description: 'Our advanced AI adapts to your unique speaking style and provides personalized recommendations for growth.',
      size: 'large',
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M8 24l4-8 4 4 4-6 4 2" stroke="#D9A299" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="4" y="6" width="24" height="20" rx="3" stroke="#D9A299" strokeWidth="2.5"/>
          <circle cx="8" cy="10" r="1.5" fill="#D9A299"/>
          <circle cx="12" cy="10" r="1.5" fill="#D9A299"/>
          <circle cx="16" cy="10" r="1.5" fill="#D9A299"/>
        </svg>
      ),
      title: 'Practice Mode',
      description: 'Rehearse difficult conversations with AI personas in a safe, judgment-free environment.',
      size: 'small',
    },
  ];

  // Steps data
  const steps = [
    {
      number: '01',
      title: 'Record or Speak',
      description: 'Use your microphone to capture your voice during conversations or practice sessions.',
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="16" r="6" stroke="#D9A299" strokeWidth="2.5"/>
          <path d="M10 16a10 10 0 0020 0M20 26v6M14 32h12" stroke="#D9A299" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      number: '02',
      title: 'Get Real-time Analysis',
      description: 'Our AI processes your speech patterns, tone, and emotional cues instantly.',
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="14" stroke="#D9A299" strokeWidth="2.5"/>
          <path d="M20 10v10l7 7" stroke="#D9A299" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="20" cy="20" r="3" fill="#D9A299"/>
        </svg>
      ),
    },
    {
      number: '03',
      title: 'Improve & Reflect',
      description: 'Receive personalized insights and track your communication journey over time.',
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M8 28l8-8 6 6 10-14" stroke="#D9A299" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M28 12h6v6" stroke="#D9A299" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

  // Who It's For data
  const audiences = [
    {
      title: 'Therapists & Counselors',
      description: 'Prepare for challenging client sessions with de-escalation tools. Track emotional patterns and improve your therapeutic communication.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="16" r="8" stroke="#D9A299" strokeWidth="2.5"/>
          <path d="M12 40c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="#D9A299" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M32 20l4 4-4 4M36 24H28" stroke="#D9A299" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      benefits: ['Session preparation tools', 'Stress pattern recognition', 'Client engagement insights'],
    },
    {
      title: 'Executives & Leaders',
      description: 'Master high-stakes conversations and presentations. Get real-time feedback on tone, pace, and emotional intelligence.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="8" y="12" width="32" height="24" rx="3" stroke="#D9A299" strokeWidth="2.5"/>
          <path d="M16 24h16M16 30h10" stroke="#D9A299" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="36" cy="12" r="6" fill="#F0E4D3" stroke="#D9A299" strokeWidth="2.5"/>
          <path d="M36 10v4l2 1" stroke="#D9A299" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      benefits: ['Presentation coaching', 'Leadership communication', 'Confident delivery'],
    },
    {
      title: 'Students & Professionals',
      description: 'Overcome presentation anxiety and build confidence. Practice difficult conversations in a safe, judgment-free environment.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M24 8l16 8-16 8-16-8 16-8z" stroke="#D9A299" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M8 16v12c0 4 7.2 8 16 8s16-4 16-8V16" stroke="#D9A299" strokeWidth="2.5"/>
          <path d="M40 16v16M40 36l-3-3M40 36l3-3" stroke="#D9A299" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      benefits: ['Anxiety reduction', 'Interview preparation', 'Public speaking skills'],
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAF7F3',
      overflowX: 'hidden',
    }}>
      {/* Navbar */}
      <LandingNavbar />

      {/* ========== HERO SECTION ========== */}
      <Hero
        badge={{ icon: <span>✨</span>, text: 'AI-Powered Coaching' }}
        headline="Transform Your Voice, Elevate Your Impact"
        highlightedWords={['Voice', 'Impact']}
        subheadline="Voca-Coach empowers therapists, executives, and students to master communication through AI-driven feedback, stress management, and personalized coaching."
        primaryCTA={{ label: 'Start Free Trial', href: '/signup' }}
        visualVariant="cards"
      />

      {/* ========== FEATURES SECTION (BENTO GRID) ========== */}
      <section
        id="features"
        style={{
          padding: '120px 0',
          background: '#F0E4D3',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <AnimatedSection>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  background: 'rgba(217, 162, 153, 0.2)',
                  borderRadius: '999px',
                  marginBottom: '20px',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#B8847A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Features
                </span>
              </span>
              <h2
                style={{
                  fontSize: 'clamp(36px, 5vw, 52px)',
                  fontWeight: '700',
                  color: '#3D3D3D',
                  marginBottom: '16px',
                  letterSpacing: '-0.02em',
                }}
              >
                Everything you need to
                <br />
                communicate with confidence
              </h2>
              <p style={{ fontSize: '18px', color: '#6B6B6B', maxWidth: '560px', margin: '0 auto', lineHeight: '1.7' }}>
                Powerful tools designed to help you understand, improve, and master your communication skills.
              </p>
            </div>
          </AnimatedSection>

          {/* Bento Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gridTemplateRows: 'auto',
              gap: '20px',
            }}
            className="bento-grid"
          >
            {features.map((feature, index) => {
              // Define grid column spans for bento layout
              const gridSpans = [
                { mobile: 'span 12', desktop: 'span 7' },  // Real-time Feedback (large)
                { mobile: 'span 12', desktop: 'span 5' },  // Progress Tracking
                { mobile: 'span 12', desktop: 'span 5' },  // CBT Techniques
                { mobile: 'span 12', desktop: 'span 4' },  // Privacy & Security
                { mobile: 'span 12', desktop: 'span 8' },  // AI-Powered Coaching (large)
                { mobile: 'span 12', desktop: 'span 4' },  // Practice Mode
              ];

              return (
                <AnimatedSection
                  key={index}
                  delay={0.1 * index}
                  style={{
                    gridColumn: gridSpans[index]?.desktop || 'span 6',
                  }}
                >
                  <div
                    style={{
                      background: '#FAF7F3',
                      borderRadius: '24px',
                      padding: feature.size === 'large' ? '40px' : '32px',
                      border: '1px solid rgba(220, 197, 178, 0.5)',
                      transition: 'all 0.3s ease',
                      cursor: 'default',
                      height: '100%',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(217, 162, 153, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = 'rgba(220, 197, 178, 0.5)';
                    }}
                  >
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        background: 'rgba(217, 162, 153, 0.15)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px',
                      }}
                    >
                      {feature.icon}
                    </div>
                    <h3 style={{ fontSize: feature.size === 'large' ? '24px' : '20px', fontWeight: '600', color: '#3D3D3D', marginBottom: '12px' }}>
                      {feature.title}
                    </h3>
                    <p style={{ fontSize: '16px', color: '#6B6B6B', lineHeight: '1.7' }}>
                      {feature.description}
                    </p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>

      </section>

      {/* ========== HOW IT WORKS SECTION ========== */}
      <section
        id="how-it-works"
        style={{
          padding: '120px 0',
          background: '#FAF7F3',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            right: '-10%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(217, 162, 153, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <AnimatedSection>
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  background: 'rgba(217, 162, 153, 0.15)',
                  borderRadius: '999px',
                  marginBottom: '20px',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#B8847A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  How It Works
                </span>
              </span>
              <h2
                style={{
                  fontSize: 'clamp(36px, 5vw, 52px)',
                  fontWeight: '700',
                  color: '#3D3D3D',
                  letterSpacing: '-0.02em',
                }}
              >
                Three steps to better communication
              </h2>
            </div>
          </AnimatedSection>

          {/* Timeline Container */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '40px',
              position: 'relative',
            }}
          >
            {/* Connection Line (desktop only) */}
            <div
              style={{
                position: 'absolute',
                top: '60px',
                left: '16.67%',
                right: '16.67%',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #DCC5B2 10%, #DCC5B2 90%, transparent)',
                zIndex: 0,
              }}
              className="hide-mobile"
            />

            {steps.map((step, index) => (
              <AnimatedSection key={index} delay={0.2 * index}>
                <div
                  style={{
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {/* Step Number Circle */}
                  <div
                    style={{
                      width: '120px',
                      height: '120px',
                      background: 'linear-gradient(135deg, #FAF7F3 0%, #F0E4D3 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 28px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                      border: '3px solid #DCC5B2',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#D9A299';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#DCC5B2';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#D9A299', marginBottom: '4px' }}>
                      {step.number}
                    </span>
                    {step.icon}
                  </div>

                  <h3 style={{ fontSize: '22px', fontWeight: '600', color: '#3D3D3D', marginBottom: '12px' }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '16px', color: '#6B6B6B', lineHeight: '1.7', maxWidth: '300px', margin: '0 auto' }}>
                    {step.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ========== WHO IT'S FOR SECTION ========== */}
      <section
        id="testimonials"
        style={{
          padding: '120px 0',
          background: '#F0E4D3',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <AnimatedSection>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  background: 'rgba(217, 162, 153, 0.2)',
                  borderRadius: '999px',
                  marginBottom: '20px',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#B8847A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Who It&apos;s For
                </span>
              </span>
              <h2
                style={{
                  fontSize: 'clamp(36px, 5vw, 52px)',
                  fontWeight: '700',
                  color: '#3D3D3D',
                  letterSpacing: '-0.02em',
                }}
              >
                Built for every communicator
              </h2>
              <p style={{ fontSize: '18px', color: '#6B6B6B', maxWidth: '560px', margin: '16px auto 0', lineHeight: '1.7' }}>
                Whether you&apos;re guiding others or finding your own voice, Voca-Coach adapts to your needs.
              </p>
            </div>
          </AnimatedSection>

          {/* Audiences Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {audiences.map((audience, index) => (
              <AnimatedSection key={index} delay={0.15 * index}>
                <div
                  style={{
                    background: '#FAF7F3',
                    borderRadius: '24px',
                    padding: '40px',
                    border: '1px solid rgba(220, 197, 178, 0.5)',
                    transition: 'all 0.3s ease',
                    height: '100%',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.06)';
                    e.currentTarget.style.borderColor = 'rgba(217, 162, 153, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'rgba(220, 197, 178, 0.5)';
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      background: 'rgba(217, 162, 153, 0.12)',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '24px',
                    }}
                  >
                    {audience.icon}
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '22px', fontWeight: '600', color: '#3D3D3D', marginBottom: '12px' }}>
                    {audience.title}
                  </h3>

                  {/* Description */}
                  <p style={{ fontSize: '16px', color: '#6B6B6B', lineHeight: '1.7', marginBottom: '24px' }}>
                    {audience.description}
                  </p>

                  {/* Benefits */}
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {audience.benefits.map((benefit, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <circle cx="10" cy="10" r="10" fill="rgba(217, 162, 153, 0.2)"/>
                          <path d="M6 10l3 3 5-6" stroke="#D9A299" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span style={{ fontSize: '15px', color: '#4A4A4A', fontWeight: '500' }}>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PRICING SECTION (Anchor target) ========== */}
      <section id="pricing" style={{ padding: '1px 0', background: '#FAF7F3' }} />

      {/* ========== CTA / NEWSLETTER SECTION ========== */}
      <section
        style={{
          padding: '100px 24px',
          background: 'linear-gradient(135deg, #D9A299 0%, #C8847A 50%, #B8847A 100%)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            left: '-50px',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            right: '-80px',
            width: '300px',
            height: '300px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '50%',
          }}
        />

        <AnimatedSection>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
            <h2
              style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontWeight: '700',
                color: 'white',
                marginBottom: '20px',
                letterSpacing: '-0.02em',
              }}
            >
              Ready to transform your communication?
            </h2>
            <p
              style={{
                fontSize: '20px',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '40px',
                lineHeight: '1.7',
              }}
            >
              Join thousands of professionals who have elevated their communication skills with Voca-Coach.
            </p>

            {/* Email Signup Form */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: '32px',
              }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                style={{
                  padding: '18px 24px',
                  borderRadius: '999px',
                  border: 'none',
                  fontSize: '16px',
                  width: '100%',
                  maxWidth: '320px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: '#3D3D3D',
                  outline: 'none',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                }}
              />
              <button
                style={{
                  padding: '18px 36px',
                  background: '#3D3D3D',
                  color: 'white',
                  borderRadius: '999px',
                  fontSize: '16px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#2D2D2D';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#3D3D3D';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Get Started Free
              </button>
            </div>

            {/* Trust Indicators */}
            <div
              style={{
                display: 'flex',
                gap: '32px',
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap',
                opacity: 0.9,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 1l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8L10 1z"/>
                </svg>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>4.9/5 Rating</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="10" cy="10" r="8"/>
                  <path d="M7 10l2 2 4-4"/>
                </svg>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>10,000+ Users</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="6" width="14" height="10" rx="2"/>
                  <circle cx="10" cy="11" r="2"/>
                  <path d="M7 6V5a3 3 0 016 0v1"/>
                </svg>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>End-to-end Encrypted</span>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ========== FOOTER ========== */}
      <Footer
        companyName="Voca-Coach"
        tagline="Empowering your wellness journey with personalized coaching, AI-driven insights, and a supportive community."
        showNewsletter={true}
        onNewsletterSubmit={(email) => console.log('Newsletter subscription:', email)}
      />

    </div>
  );
}
