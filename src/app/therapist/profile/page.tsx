'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import RoleGuard from '@/components/RoleGuard';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

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
          // Parse specializations safely
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
        alert('Profile updated successfully!');
        fetchProfile();
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile');
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
      <div style={{ minHeight: '100vh' }}>
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
        
        <main style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <Link href="/therapist" style={{ color: '#7C3AED', fontWeight: '500', fontSize: '14px' }}>
              ← Back to Dashboard
            </Link>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937', marginTop: '16px', marginBottom: '8px' }}>
              Edit Profile
            </h1>
            <p style={{ color: '#6B7280' }}>Complete your profile to start receiving clients</p>
          </div>

          {/* Approval Status */}
          {profile && (
            <div style={{
              padding: '16px 20px',
              borderRadius: '12px',
              marginBottom: '24px',
              background: profile.isApproved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              border: `1px solid ${profile.isApproved ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>{profile.isApproved ? '✅' : '⏳'}</span>
                <div>
                  <p style={{ fontWeight: '600', color: profile.isApproved ? '#059669' : '#D97706' }}>
                    {profile.isApproved ? 'Profile Approved' : 'Pending Approval'}
                  </p>
                  <p style={{ fontSize: '13px', color: '#6B7280' }}>
                    {profile.isApproved 
                      ? 'You can now receive client bookings' 
                      : 'Complete your profile and wait for admin approval'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <div className="animate-spin" style={{
                width: '40px',
                height: '40px',
                border: '3px solid #E5E7EB',
                borderTopColor: '#7C3AED',
                borderRadius: '50%',
                margin: '0 auto',
              }} />
            </div>
          ) : (
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)'
            }}>
              {/* Bio */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell clients about yourself, your experience, and approach..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1.5px solid #E5E7EB',
                    borderRadius: '12px',
                    fontSize: '15px',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Specializations */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Specializations
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input
                    value={newSpec}
                    onChange={(e) => setNewSpec(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                    placeholder="e.g., Anxiety, Depression, Stress"
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      border: '1.5px solid #E5E7EB',
                      borderRadius: '12px',
                      fontSize: '15px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={addSpecialization}
                    style={{
                      padding: '10px 20px',
                      background: '#7C3AED',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {Array.isArray(specializations) && specializations.map((spec) => (
                    <span
                      key={spec}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: 'rgba(124, 58, 237, 0.1)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#7C3AED',
                      }}
                    >
                      {spec}
                      <button
                        onClick={() => removeSpecialization(spec)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '16px',
                          color: '#7C3AED',
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Availability
                </label>
                <input
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="e.g., Mon-Fri 9am-5pm, Weekends by appointment"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1.5px solid #E5E7EB',
                    borderRadius: '12px',
                    fontSize: '15px',
                  }}
                />
              </div>

              {/* Hourly Rate */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="50"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1.5px solid #E5E7EB',
                    borderRadius: '12px',
                    fontSize: '15px',
                  }}
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  background: saving ? '#9CA3AF' : 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          )}
        </main>
      </div>
    </RoleGuard>
  );
}
