'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState<'student' | 'therapist'>('student');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup, user, loading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    const result = await signup(email, password, name, userRole === 'therapist');
    
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Signup failed');
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FDF8F3' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>🎙️</div>
          <div style={{ color: '#6B7280' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex'
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 24px'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            <img src="/voca-coach-logo.png" alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '10px' }} onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.style.cssText = 'width: 40px; height: 40px; background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px';
              fallback.textContent = 'VC';
              e.currentTarget.parentNode?.insertBefore(fallback, e.currentTarget);
            }} />
            <span style={{ fontSize: '20px', fontWeight: '700', color: '#1F2937' }}>Voca-Coach</span>
          </Link>

          {/* Header */}
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
            Create your account
          </h1>
          <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '32px' }}>
            Start your journey to better conversations.
          </p>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '12px 16px',
              background: '#FEF2F2',
              border: '1px solid #FEE2E2',
              borderRadius: '12px',
              color: '#DC2626',
              fontSize: '14px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
            <span style={{ fontSize: '13px', color: '#9CA3AF' }}>I am a...</span>
            <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
          </div>

          {/* Role Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <button
              type="button"
              onClick={() => setUserRole('student')}
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: userRole === 'student' ? '2px solid #7C3AED' : '2px solid #E5E7EB',
                background: userRole === 'student' ? 'rgba(124, 58, 237, 0.05)' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>📚</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: userRole === 'student' ? '#7C3AED' : '#374151' }}>Student</div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>Get support & guidance</div>
            </button>
            <button
              type="button"
              onClick={() => setUserRole('therapist')}
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: userRole === 'therapist' ? '2px solid #10B981' : '2px solid #E5E7EB',
                background: userRole === 'therapist' ? 'rgba(16, 185, 129, 0.05)' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🧑‍⚕️</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: userRole === 'therapist' ? '#10B981' : '#374151' }}>Therapist</div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>Help others grow</div>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: '12px',
                  fontSize: '15px',
                  outline: 'none',
                  background: 'white'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: '12px',
                  fontSize: '15px',
                  outline: 'none',
                  background: 'white'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: '12px',
                  fontSize: '15px',
                  outline: 'none',
                  background: 'white'
                }}
              />
              <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
                Must be at least 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px 20px',
                background: isLoading ? '#9CA3AF' : 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {/* Sign in link */}
          <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '15px', color: '#6B7280' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#7C3AED', fontWeight: '600' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
