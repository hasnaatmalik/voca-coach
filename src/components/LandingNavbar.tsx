'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const LandingNavbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Use Cases', href: '#testimonials' },
    { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: isScrolled
            ? 'rgba(250, 247, 243, 0.85)'
            : 'rgba(250, 247, 243, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: isScrolled
            ? '1px solid rgba(220, 197, 178, 0.5)'
            : '1px solid transparent',
          transition: 'all 0.3s ease',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '72px',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                background: 'linear-gradient(135deg, #D9A299 0%, #C8847A 100%)',
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
            <span
              style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#3D3D3D',
                letterSpacing: '-0.02em',
              }}
            >
              Voca-Coach
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '32px',
            }}
            className="hide-mobile"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href.slice(1))}
                style={{
                  fontSize: '15px',
                  fontWeight: '500',
                  color: '#6B6B6B',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#D9A299')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#6B6B6B')}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
            className="hide-mobile"
          >
            <Link
              href="/login"
              style={{
                fontSize: '15px',
                fontWeight: '600',
                color: '#3D3D3D',
                textDecoration: 'none',
                padding: '10px 16px',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#D9A299')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#3D3D3D')}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #D9A299 0%, #C8847A 100%)',
                color: 'white',
                borderRadius: '999px',
                fontSize: '15px',
                fontWeight: '600',
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(217, 162, 153, 0.35)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(217, 162, 153, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(217, 162, 153, 0.35)';
              }}
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              display: 'none',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              width: '44px',
              height: '44px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              gap: '6px',
            }}
            className="show-mobile"
            aria-label="Toggle menu"
          >
            <span
              style={{
                width: '24px',
                height: '2px',
                background: '#3D3D3D',
                borderRadius: '2px',
                transition: 'all 0.3s ease',
                transform: isMenuOpen ? 'rotate(45deg) translateY(8px)' : 'none',
              }}
            />
            <span
              style={{
                width: '24px',
                height: '2px',
                background: '#3D3D3D',
                borderRadius: '2px',
                transition: 'all 0.3s ease',
                opacity: isMenuOpen ? 0 : 1,
              }}
            />
            <span
              style={{
                width: '24px',
                height: '2px',
                background: '#3D3D3D',
                borderRadius: '2px',
                transition: 'all 0.3s ease',
                transform: isMenuOpen ? 'rotate(-45deg) translateY(-8px)' : 'none',
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(61, 61, 61, 0.5)',
          zIndex: 998,
          opacity: isMenuOpen ? 1 : 0,
          visibility: isMenuOpen ? 'visible' : 'hidden',
          transition: 'all 0.3s ease',
        }}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '80%',
          maxWidth: '320px',
          background: '#FAF7F3',
          zIndex: 999,
          padding: '24px',
          transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsMenuOpen(false)}
          style={{
            alignSelf: 'flex-end',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F0E4D3',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            marginBottom: '24px',
          }}
          aria-label="Close menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M15 5L5 15M5 5l10 10"
              stroke="#3D3D3D"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Mobile Nav Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => scrollToSection(e, link.href.slice(1))}
              style={{
                fontSize: '18px',
                fontWeight: '500',
                color: '#3D3D3D',
                textDecoration: 'none',
                padding: '16px',
                borderRadius: '12px',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F0E4D3')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Mobile Auth Buttons */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <Link
            href="/login"
            style={{
              display: 'block',
              textAlign: 'center',
              fontSize: '16px',
              fontWeight: '600',
              color: '#3D3D3D',
              textDecoration: 'none',
              padding: '16px',
              border: '2px solid #DCC5B2',
              borderRadius: '999px',
              transition: 'all 0.2s ease',
            }}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '16px',
              background: 'linear-gradient(135deg, #D9A299 0%, #C8847A 100%)',
              color: 'white',
              borderRadius: '999px',
              fontSize: '16px',
              fontWeight: '600',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(217, 162, 153, 0.35)',
            }}
          >
            Get Started
          </Link>
        </div>
      </div>

    </>
  );
};

export default LandingNavbar;
