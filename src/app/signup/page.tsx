'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// ========== CONSTANTS ==========
const colors = {
  cream: '#FAF7F3',
  beige: '#F0E4D3',
  tan: '#DCC5B2',
  rose: '#D9A299',
  roseDark: '#C8847A',
  text: '#2D2D2D',
  textMuted: '#6B6B6B',
  error: '#E07A7A',
  success: '#7AB89E',
  white: '#FFFFFF',
};

// ========== VALIDATION SCHEMA ==========
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupFormData = z.infer<typeof signupSchema>;

// ========== FLOATING INPUT COMPONENT ==========
interface FloatingInputProps {
  id: string;
  label: string;
  type: string;
  error?: string;
  register: ReturnType<typeof useForm<SignupFormData>>['register'];
  name: keyof SignupFormData;
  delay?: number;
  hint?: string;
}

function FloatingInput({ id, label, type: initialType, error, register, name, delay = 0, hint }: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = initialType === 'password';
  const type = isPassword && showPassword ? 'text' : initialType;
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ position: 'relative', marginBottom: '20px' }}
    >
      <div style={{ position: 'relative' }}>
        <motion.label
          htmlFor={id}
          initial={false}
          animate={{
            top: isFocused || hasValue ? '-10px' : '18px',
            fontSize: isFocused || hasValue ? '12px' : '16px',
            color: error ? colors.error : isFocused ? colors.rose : colors.textMuted,
            background: isFocused || hasValue ? colors.cream : 'transparent',
            padding: isFocused || hasValue ? '0 8px' : '0',
          }}
          transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 25 }}
          style={{
            position: 'absolute',
            left: '16px',
            pointerEvents: 'none',
            zIndex: 1,
            fontWeight: 500,
          }}
        >
          {label}
        </motion.label>
        <input
          id={id}
          type={type}
          {...register(name, {
            onChange: (e) => setHasValue(e.target.value.length > 0),
          })}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            setHasValue(e.target.value.length > 0);
          }}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          style={{
            width: '100%',
            padding: '18px 16px',
            paddingRight: isPassword ? '50px' : '16px',
            border: `1.5px solid ${error ? colors.error : isFocused ? colors.rose : colors.tan}`,
            borderRadius: '16px',
            fontSize: '16px',
            background: colors.white,
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: isFocused ? `0 0 0 3px rgba(217, 162, 153, 0.15)` : 'inset 0 1px 2px rgba(0,0,0,0.05)',
            color: colors.text,
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: colors.textMuted,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = colors.rose)}
            onMouseLeave={(e) => (e.currentTarget.style.color = colors.textMuted)}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} style={{ color: colors.textMuted, fontSize: '12px', marginTop: '6px', marginLeft: '4px' }}>
          {hint}
        </p>
      )}
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            style={{
              color: colors.error,
              fontSize: '13px',
              marginTop: '6px',
              marginLeft: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            role="alert"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ========== ROLE SELECTOR ==========
function RoleSelector({ value, onChange, delay = 0 }: { value: 'student' | 'therapist'; onChange: (role: 'student' | 'therapist') => void; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}
    >
      <motion.button
        type="button"
        onClick={() => onChange('student')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          padding: '20px 16px',
          borderRadius: '16px',
          border: `2px solid ${value === 'student' ? colors.rose : colors.tan}`,
          background: value === 'student' ? `${colors.rose}15` : colors.white,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke={value === 'student' ? colors.rose : colors.textMuted}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ margin: '0 auto 8px' }}
        >
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
        <div style={{ fontSize: '15px', fontWeight: 600, color: value === 'student' ? colors.rose : colors.text }}>Student</div>
        <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '4px' }}>Get support & guidance</div>
      </motion.button>
      <motion.button
        type="button"
        onClick={() => onChange('therapist')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          padding: '20px 16px',
          borderRadius: '16px',
          border: `2px solid ${value === 'therapist' ? colors.success : colors.tan}`,
          background: value === 'therapist' ? `${colors.success}15` : colors.white,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke={value === 'therapist' ? colors.success : colors.textMuted}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ margin: '0 auto 8px' }}
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
        <div style={{ fontSize: '15px', fontWeight: 600, color: value === 'therapist' ? colors.success : colors.text }}>Therapist</div>
        <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '4px' }}>Help others grow</div>
      </motion.button>
    </motion.div>
  );
}

// ========== SOUND WAVE VISUALIZATION ==========
function SoundWave() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.svg
      width="200"
      height="60"
      viewBox="0 0 200 60"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      style={{ marginTop: '24px' }}
    >
      {[...Array(20)].map((_, i) => {
        const height = 10 + Math.sin(i * 0.5) * 20 + Math.random() * 10;
        return (
          <motion.rect
            key={i}
            x={i * 10 + 2}
            y={30 - height / 2}
            width="6"
            height={height}
            rx="3"
            fill={colors.rose}
            initial={{ scaleY: 0 }}
            animate={shouldReduceMotion ? { scaleY: 1 } : { scaleY: [0.3, 1, 0.5, 0.8, 0.3] }}
            transition={{
              delay: 0.8 + i * 0.05,
              duration: shouldReduceMotion ? 0.3 : 1.5,
              repeat: shouldReduceMotion ? 0 : Infinity,
              ease: 'easeInOut',
            }}
            style={{ transformOrigin: 'center' }}
          />
        );
      })}
    </motion.svg>
  );
}

// ========== FLOATING CSS SHAPES ==========
function FloatingShapes({ springX, springY }: { springX: ReturnType<typeof useSpring>; springY: ReturnType<typeof useSpring> }) {
  const shouldReduceMotion = useReducedMotion();

  const shapes = [
    { type: 'sphere', size: 120, x: '15%', y: '20%', delay: 0, color: colors.rose },
    { type: 'sphere', size: 80, x: '75%', y: '15%', delay: 0.2, color: colors.tan },
    { type: 'torus', size: 100, x: '80%', y: '60%', delay: 0.4, color: colors.rose },
    { type: 'cube', size: 70, x: '20%', y: '70%', delay: 0.6, color: colors.beige },
    { type: 'sphere', size: 50, x: '60%', y: '80%', delay: 0.8, color: colors.tan },
    { type: 'sphere', size: 40, x: '40%', y: '30%', delay: 1, color: colors.cream },
  ];

  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: 0,
        x: springX,
        y: springY,
        pointerEvents: 'none',
      }}
    >
      {shapes.map((shape, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: shouldReduceMotion ? 0 : [0, -20, 0],
            rotate: shouldReduceMotion ? 0 : shape.type === 'cube' ? [0, 10, 0] : 0,
          }}
          transition={{
            opacity: { delay: shape.delay + 0.2, duration: 0.6 },
            scale: { delay: shape.delay + 0.2, duration: 0.6, type: 'spring', stiffness: 200 },
            y: { delay: shape.delay + 0.8, duration: 4 + index * 0.5, repeat: Infinity, ease: 'easeInOut' },
            rotate: { delay: shape.delay + 0.8, duration: 6, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{
            position: 'absolute',
            left: shape.x,
            top: shape.y,
            width: shape.size,
            height: shape.size,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {shape.type === 'sphere' && (
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: `radial-gradient(circle at 30% 30%, ${colors.white}, ${shape.color})`,
                boxShadow: `
                  0 ${shape.size * 0.2}px ${shape.size * 0.4}px rgba(0,0,0,0.1),
                  inset 0 -${shape.size * 0.1}px ${shape.size * 0.2}px rgba(0,0,0,0.1),
                  inset 0 ${shape.size * 0.1}px ${shape.size * 0.2}px rgba(255,255,255,0.5)
                `,
              }}
            />
          )}
          {shape.type === 'torus' && (
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: `${shape.size * 0.2}px solid ${shape.color}`,
                background: 'transparent',
                boxShadow: `
                  0 ${shape.size * 0.15}px ${shape.size * 0.3}px rgba(0,0,0,0.1),
                  inset 0 ${shape.size * 0.05}px ${shape.size * 0.1}px rgba(255,255,255,0.3)
                `,
                transform: 'rotateX(60deg)',
              }}
            />
          )}
          {shape.type === 'cube' && (
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${colors.white} 0%, ${shape.color} 100%)`,
                boxShadow: `
                  0 ${shape.size * 0.2}px ${shape.size * 0.4}px rgba(0,0,0,0.1),
                  inset 0 ${shape.size * 0.05}px ${shape.size * 0.1}px rgba(255,255,255,0.5)
                `,
                transform: 'rotate(15deg)',
              }}
            />
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}

// ========== IMMERSIVE LEFT PANEL ==========
function ImmersiveVisual() {
  const shouldReduceMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 20;
    const y = (e.clientY - rect.top - rect.height / 2) / 20;
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        width: '55%',
        minHeight: '100vh',
        background: colors.beige,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
      }}
      className="immersive-panel hide-mobile"
    >
      {/* Animated gradient mesh background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse at 20% 30%, ${colors.cream} 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, ${colors.rose}40 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, ${colors.tan}60 0%, transparent 60%)
          `,
          opacity: 0.8,
        }}
      />

      {/* Noise texture overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating CSS Shapes */}
      <FloatingShapes springX={springX} springY={springY} />

      {/* Content overlay */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '400px' }}>
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 24px',
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${colors.rose} 0%, ${colors.roseDark} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 8px 32px ${colors.rose}50, 0 0 60px ${colors.rose}30`,
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" x2="12" y1="19" y2="22"/>
          </svg>
        </motion.div>

        {/* Tagline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{
            fontSize: '32px',
            fontWeight: 700,
            background: `linear-gradient(135deg, ${colors.text} 0%, ${colors.rose} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px',
          }}
        >
          Find your voice.
        </motion.h2>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{
            fontSize: '32px',
            fontWeight: 700,
            background: `linear-gradient(135deg, ${colors.rose} 0%, ${colors.roseDark} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '24px',
          }}
        >
          Start today.
        </motion.h2>

        {/* Sound wave */}
        <SoundWave />
      </div>

    </motion.div>
  );
}

// ========== GOOGLE BUTTON ==========
function GoogleButton({ onClick }: { onClick?: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      style={{
        width: '100%',
        padding: '14px 20px',
        background: colors.beige,
        border: `1.5px solid ${isHovered ? colors.rose : colors.tan}`,
        borderRadius: '9999px',
        fontSize: '15px',
        fontWeight: 500,
        color: colors.text,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: isHovered ? `0 4px 12px ${colors.rose}20` : 'none',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Continue with Google
    </motion.button>
  );
}

// ========== ANIMATED DIVIDER ==========
function AnimatedDivider({ delay = 0, text = "or continue with email" }: { delay?: number; text?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        margin: '28px 0',
      }}
    >
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: delay + 0.1, duration: 0.5, ease: 'easeOut' }}
        style={{
          flex: 1,
          height: '1px',
          background: colors.tan,
          transformOrigin: 'right',
        }}
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.3, duration: 0.3 }}
        style={{ fontSize: '13px', color: colors.textMuted, whiteSpace: 'nowrap' }}
      >
        {text}
      </motion.span>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: delay + 0.1, duration: 0.5, ease: 'easeOut' }}
        style={{
          flex: 1,
          height: '1px',
          background: colors.tan,
          transformOrigin: 'left',
        }}
      />
    </motion.div>
  );
}

// ========== SUBMIT BUTTON ==========
function SubmitButton({ isLoading, isSuccess }: { isLoading: boolean; isSuccess: boolean }) {
  const shouldReduceMotion = useReducedMotion();
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading || isSuccess) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
  };

  const getButtonContent = () => {
    if (isSuccess) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Account created!
        </motion.div>
      );
    }
    if (isLoading) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <motion.div
            animate={shouldReduceMotion ? {} : { rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '18px',
              height: '18px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: 'white',
              borderRadius: '50%',
            }}
          />
          Creating account...
        </div>
      );
    }
    return 'Create account';
  };

  return (
    <motion.button
      ref={buttonRef}
      type="submit"
      disabled={isLoading}
      onClick={handleClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={isLoading || isSuccess ? {} : { scale: 1.01, boxShadow: `0 8px 24px ${colors.rose}40` }}
      whileTap={isLoading || isSuccess ? {} : { scale: 0.98 }}
      transition={{ delay: 1.1, duration: 0.5 }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        padding: '18px 20px',
        background: isSuccess ? colors.success : colors.rose,
        color: colors.white,
        border: 'none',
        borderRadius: '9999px',
        fontSize: '16px',
        fontWeight: 600,
        cursor: isLoading ? 'not-allowed' : 'pointer',
        opacity: isLoading && !isSuccess ? 0.8 : 1,
        transition: 'background 0.3s, opacity 0.3s',
      }}
    >
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.4)',
            pointerEvents: 'none',
          }}
        />
      ))}
      {/* Shimmer effect when loading */}
      {isLoading && !isSuccess && (
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            pointerEvents: 'none',
          }}
        />
      )}
      {getButtonContent()}
    </motion.button>
  );
}

// ========== ERROR MESSAGE ==========
function ErrorMessage({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -20, height: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        padding: '14px 16px',
        background: `${colors.error}15`,
        border: `1px solid ${colors.error}40`,
        borderRadius: '12px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
      role="alert"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.error} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span style={{ flex: 1, color: colors.error, fontSize: '14px' }}>{message}</span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss error"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          color: colors.error,
          opacity: 0.7,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </motion.div>
  );
}

// ========== SIGNUP FORM ==========
function SignupForm({ onSuccess }: { onSuccess: () => void }) {
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userRole, setUserRole] = useState<'student' | 'therapist'>('student');
  const { signup } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: SignupFormData) => {
    setServerError('');
    setIsLoading(true);

    try {
      const result = await signup(data.email, data.password, data.name, userRole === 'therapist');

      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess();
          router.push('/dashboard');
        }, 800);
      } else {
        setServerError(result.error || 'Signup failed. Please try again.');
        setIsLoading(false);
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // Google signup handler - to be implemented
    console.log('Google signup clicked');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        flex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 60px',
        background: colors.cream,
      }}
      className="signup-form-panel"
    >
      <div style={{ width: '100%', maxWidth: '380px' }}>
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${colors.rose} 0%, ${colors.roseDark} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${colors.rose}30`,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" x2="12" y1="19" y2="22"/>
              </svg>
            </div>
            <span style={{ fontSize: '18px', fontWeight: 700, color: colors.text }}>Voco-Coach</span>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: colors.text,
            marginBottom: '8px',
          }}
        >
          Create your account
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.5 }}
          style={{
            fontSize: '16px',
            color: colors.textMuted,
            marginBottom: '32px',
          }}
        >
          Start your journey to better conversations
        </motion.p>

        {/* Server Error */}
        <AnimatePresence>
          {serverError && (
            <ErrorMessage message={serverError} onDismiss={() => setServerError('')} />
          )}
        </AnimatePresence>

        {/* Google Button */}
        <GoogleButton onClick={handleGoogleSignup} />

        {/* Divider */}
        <AnimatedDivider delay={0.75} />

        {/* Role Selection */}
        <RoleSelector value={userRole} onChange={setUserRole} delay={0.8} />

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <FloatingInput
            id="name"
            label="Full name"
            type="text"
            register={register}
            name="name"
            error={errors.name?.message}
            delay={0.85}
          />
          <FloatingInput
            id="email"
            label="Email"
            type="email"
            register={register}
            name="email"
            error={errors.email?.message}
            delay={0.9}
          />
          <FloatingInput
            id="password"
            label="Password"
            type="password"
            register={register}
            name="password"
            error={errors.password?.message}
            delay={0.95}
            hint="Must be at least 6 characters"
          />

          {/* Submit Button */}
          <SubmitButton isLoading={isLoading} isSuccess={isSuccess} />
        </form>

        {/* Sign in link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          style={{
            textAlign: 'center',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: `1px solid ${colors.tan}`,
          }}
        >
          <span style={{ fontSize: '15px', color: colors.textMuted }}>
            Already have an account?{' '}
          </span>
          <Link
            href="/login"
            style={{
              fontSize: '15px',
              color: colors.rose,
              fontWeight: 600,
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              const underline = e.currentTarget.querySelector('.underline') as HTMLElement;
              if (underline) underline.style.transform = 'scaleX(1)';
            }}
            onMouseLeave={(e) => {
              const underline = e.currentTarget.querySelector('.underline') as HTMLElement;
              if (underline) underline.style.transform = 'scaleX(0)';
            }}
          >
            Sign in
            <span
              className="underline"
              style={{
                position: 'absolute',
                bottom: '-2px',
                left: 0,
                right: 0,
                height: '2px',
                background: colors.rose,
                transform: 'scaleX(0)',
                transformOrigin: 'left',
                transition: 'transform 0.3s ease',
              }}
            />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ========== MAIN SIGNUP PAGE ==========
export default function SignupPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSignupSuccess = () => {
    setIsTransitioning(true);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: colors.cream,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center' }}
        >
          <motion.div
            animate={shouldReduceMotion ? {} : { rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 16px',
              border: `3px solid ${colors.tan}`,
              borderTopColor: colors.rose,
              borderRadius: '50%',
            }}
          />
          <p style={{ color: colors.textMuted }}>Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media (max-width: 768px) {
          .immersive-panel {
            display: none !important;
          }
          .signup-form-panel {
            padding: 24px !important;
          }
        }
      `}</style>

      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: colors.cream,
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 50, opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: `linear-gradient(135deg, ${colors.rose} 0%, ${colors.roseDark} 100%)`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <ImmersiveVisual />
        <SignupForm onSuccess={handleSignupSuccess} />
      </div>
    </>
  );
}
