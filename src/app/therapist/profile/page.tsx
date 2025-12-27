'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import RoleGuard from '@/components/RoleGuard';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

// SVG Icon Components
const ArrowLeftIcon = ({ color = '#7AB89E', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const UserIcon = ({ color = '#D9A299', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CheckCircleIcon = ({ color = '#059669', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ClockIcon = ({ color = '#D97706', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const XIcon = ({ color = '#5A9880', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

interface TherapistProfile {
  bio: string;
  specializations: string[];
  availability: string;
  hourlyRate: number;
  isApproved: boolean;
}

export default function TherapistProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bio, setBio] = useState('');
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [newSpec, setNewSpec] = useState('');
  const [availability, setAvailability] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/therapist/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          setBio(data.profile.bio || '');
          try {
            const specs = data.profile.specializations;
            if (typeof specs === 'string' && specs) {
              const parsed = JSON.parse(specs);
              setSpecializations(Array.isArray(parsed) ? parsed : []);
            } else if (Array.isArray(specs)) {
              setSpecializations(specs);
            } else {
              setSpecializations([]);
            }
          } catch {
            setSpecializations([]);
          }
          setAvailability(data.profile.availability || '');
          setHourlyRate(data.profile.hourlyRate?.toString() || '');
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/therapist/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          specializations: JSON.stringify(specializations),
          availability,
          hourlyRate: parseFloat(hourlyRate) || 0,
        }),
      });
      if (res.ok) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
        fetchProfile();
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const addSpecialization = () => {
    if (newSpec.trim() && !specializations.includes(newSpec.trim())) {
      setSpecializations([...specializations, newSpec.trim()]);
      setNewSpec('');
    }
  };

  const removeSpecialization = (spec: string) => {
    setSpecializations(specializations.filter(s => s !== spec));
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <RoleGuard requireTherapist>
      <div style={{ minHeight: '100vh', background: '#FAF7F3' }}>
        {user && (
          <Navbar
            isAuthenticated={true}
            userName={user.name}
            userEmail={user.email}
            onLogout={handleLogout}
            currentPage="/therapist/profile"
            isAdmin={user.isAdmin}
            isSuperAdmin={user.isSuperAdmin}
            isTherapist={user.isTherapist}
          />
        )}

        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}
        >
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <Link
              href="/therapist"
              style={{
                color: '#7AB89E',
                fontWeight: '500',
                fontSize: '14px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ArrowLeftIcon color="#7AB89E" size={16} /> Back to Dashboard
            </Link>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#2D2D2D',
                marginTop: '16px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <UserIcon color="#D9A299" size={28} /> Edit Profile
            </motion.h1>
            <p style={{ color: '#6B6B6B' }}>Complete your profile to start receiving clients</p>
          </div>

          {/* Approval Status */}
          {profile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '18px 22px',
                borderRadius: '16px',
                marginBottom: '24px',
                background: profile.isApproved ? 'rgba(122, 184, 158, 0.1)' : 'rgba(228, 177, 122, 0.1)',
                border: `1px solid ${profile.isApproved ? 'rgba(122, 184, 158, 0.3)' : 'rgba(228, 177, 122, 0.3)'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  {profile.isApproved ? <CheckCircleIcon color="#059669" size={24} /> : <ClockIcon color="#D97706" size={24} />}
                </motion.span>
                <div>
                  <p style={{ fontWeight: '600', color: profile.isApproved ? '#059669' : '#D97706' }}>
                    {profile.isApproved ? 'Profile Approved' : 'Pending Approval'}
                  </p>
                  <p style={{ fontSize: '13px', color: '#6B6B6B' }}>
                    {profile.isApproved
                      ? 'You can now receive client bookings'
                      : 'Complete your profile and wait for admin approval'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  padding: '14px 18px',
                  background: '#ECFDF5',
                  color: '#059669',
                  borderRadius: '14px',
                  marginBottom: '20px',
                  border: '1px solid rgba(5, 150, 105, 0.2)',
                }}
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid #F0E4D3',
                  borderTopColor: '#7AB89E',
                  borderRadius: '50%',
                  margin: '0 auto',
                }}
              />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                background: 'white',
                borderRadius: '24px',
                padding: '32px',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
                border: '1px solid #F0E4D3',
              }}
            >
              {/* Bio */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2D2D2D',
                  marginBottom: '10px',
                }}>
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell clients about yourself, your experience, and approach..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    border: '1px solid #DCC5B2',
                    borderRadius: '14px',
                    fontSize: '15px',
                    resize: 'vertical',
                    outline: 'none',
                    background: '#FAF7F3',
                    transition: 'all 0.2s',
                  }}
                />
              </div>

              {/* Specializations */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2D2D2D',
                  marginBottom: '10px',
                }}>
                  Specializations
                </label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                  <input
                    value={newSpec}
                    onChange={(e) => setNewSpec(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                    placeholder="e.g., Anxiety, Depression, Stress"
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: '1px solid #DCC5B2',
                      borderRadius: '12px',
                      fontSize: '15px',
                      outline: 'none',
                      background: '#FAF7F3',
                    }}
                  />
                  <motion.button
                    type="button"
                    onClick={addSpecialization}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      padding: '12px 24px',
                      background: 'linear-gradient(135deg, #7AB89E 0%, #5A9880 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Add
                  </motion.button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <AnimatePresence>
                    {Array.isArray(specializations) && specializations.map((spec) => (
                      <motion.span
                        key={spec}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 14px',
                          background: 'rgba(122, 184, 158, 0.1)',
                          borderRadius: '10px',
                          fontSize: '14px',
                          color: '#5A9880',
                          fontWeight: '500',
                        }}
                      >
                        {spec}
                        <motion.button
                          onClick={() => removeSpecialization(spec)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <XIcon color="#5A9880" size={14} />
                        </motion.button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Availability */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2D2D2D',
                  marginBottom: '10px',
                }}>
                  Availability
                </label>
                <input
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="e.g., Mon-Fri 9am-5pm, Weekends by appointment"
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    border: '1px solid #DCC5B2',
                    borderRadius: '14px',
                    fontSize: '15px',
                    outline: 'none',
                    background: '#FAF7F3',
                  }}
                />
              </div>

              {/* Hourly Rate */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2D2D2D',
                  marginBottom: '10px',
                }}>
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="50"
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    border: '1px solid #DCC5B2',
                    borderRadius: '14px',
                    fontSize: '15px',
                    outline: 'none',
                    background: '#FAF7F3',
                  }}
                />
              </div>

              {/* Save Button */}
              <motion.button
                onClick={handleSave}
                disabled={saving}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  background: saving
                    ? '#9CA3AF'
                    : 'linear-gradient(135deg, #7AB89E 0%, #5A9880 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: saving ? 'none' : '0 4px 16px rgba(122, 184, 158, 0.3)',
                }}
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </motion.button>
            </motion.div>
          )}
        </motion.main>
      </div>
    </RoleGuard>
  );
}
