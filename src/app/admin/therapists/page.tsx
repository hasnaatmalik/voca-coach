'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import RoleGuard from '@/components/RoleGuard';
import Navbar from '@/components/Navbar';

interface TherapistProfile {
  id: string;
  bio: string | null;
  specializations: string | null;
  availability: string | null;
  hourlyRate: number | null;
  isApproved: boolean;
}

interface Therapist {
  id: string;
  name: string;
  email: string;
  role: string;
  isTherapist: boolean;
  isAdmin: boolean;
  createdAt: string;
  therapistProfile: TherapistProfile | null;
  _count: {
    therapistSessions: number;
  };
}

export default function AdminTherapists() {
  const { user: currentUser, logout } = useAuth();
  const router = useRouter();
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    try {
      const res = await fetch('/api/admin/therapists');
      if (res.ok) {
        const data = await res.json();
        setTherapists(data.therapists);
      }
    } catch (error) {
      console.error('Failed to fetch therapists:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTherapistApproval = async (therapistId: string, isApproved: boolean) => {
    try {
      const res = await fetch('/api/admin/therapists', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ therapistId, isApproved }),
      });
      if (res.ok) {
        fetchTherapists();
        alert(`Therapist ${isApproved ? 'approved' : 'unapproved'} successfully`);
      }
    } catch (error) {
      console.error('Failed to update therapist:', error);
      alert('Failed to update therapist');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <RoleGuard requireAdmin>
      <div style={{ minHeight: '100vh' }}>
        {currentUser && (
          <Navbar
            isAuthenticated={true}
            userName={currentUser.name}
            userEmail={currentUser.email}
            onLogout={handleLogout}
            currentPage="/admin/therapists"
isAdmin={currentUser.isAdmin}
            isSuperAdmin={currentUser.isSuperAdmin}
            isTherapist={currentUser.isTherapist}
          />
        )}
        
        <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
              Therapist Management
            </h1>
            <p style={{ color: '#6B7280' }}>Approve and manage therapist profiles</p>
          </div>

          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
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
              {therapists.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#6B7280' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧑‍⚕️</div>
                  <p style={{ fontSize: '16px', fontWeight: '500' }}>No therapists found</p>
                  <p style={{ fontSize: '14px', marginTop: '8px' }}>Therapists will appear here once they register</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                {therapists.map((therapist) => {
                    let specializations: string[] = [];
                    try {
                      const specs = therapist.therapistProfile?.specializations;
                      if (typeof specs === 'string' && specs) {
                        const parsed = JSON.parse(specs);
                        specializations = Array.isArray(parsed) ? parsed : [];
                      }
                    } catch {
                      specializations = [];
                    }

                    return (
                      <div
                        key={therapist.id}
                        style={{
                          border: '1px solid #E5E7EB',
                          borderRadius: '16px',
                          padding: '24px',
                          background: 'white',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>
                              {therapist.name}
                            </h3>
                            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
                              {therapist.email}
                            </p>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '13px',
                                fontWeight: '600',
                                background: therapist.therapistProfile?.isApproved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                color: therapist.therapistProfile?.isApproved ? '#059669' : '#D97706'
                              }}>
                                {therapist.therapistProfile?.isApproved ? '✅ Approved' : '⏳ Pending'}
                              </span>
                              <span style={{ fontSize: '13px', color: '#6B7280' }}>
                                {therapist._count.therapistSessions} sessions
                              </span>
                            </div>
                          </div>

                          {therapist.therapistProfile && (
                            <button
                              onClick={() => updateTherapistApproval(
                                therapist.id,
                                !therapist.therapistProfile?.isApproved
                              )}
                              style={{
                                padding: '10px 20px',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: '600',
                                border: 'none',
                                cursor: 'pointer',
                                background: therapist.therapistProfile.isApproved
                                  ? 'rgba(239, 68, 68, 0.1)'
                                  : 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                                color: therapist.therapistProfile.isApproved ? '#DC2626' : 'white',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                if (!therapist.therapistProfile?.isApproved) {
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              {therapist.therapistProfile.isApproved ? 'Unapprove' : 'Approve'}
                            </button>
                          )}
                        </div>

                        {therapist.therapistProfile && (
                          <div style={{ display: 'grid', gap: '12px' }}>
                            {therapist.therapistProfile.bio && (
                              <div>
                                <p style={{ fontSize: '13px', fontWeight: '600', color: '#6B7280', marginBottom: '4px' }}>Bio</p>
                                <p style={{ fontSize: '14px', color: '#1F2937' }}>{therapist.therapistProfile.bio}</p>
                              </div>
                            )}

                            {specializations.length > 0 && (
                              <div>
                                <p style={{ fontSize: '13px', fontWeight: '600', color: '#6B7280', marginBottom: '8px' }}>Specializations</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                  {specializations.map((spec: string, idx: number) => (
                                    <span
                                      key={idx}
                                      style={{
                                        padding: '6px 12px',
                                        borderRadius: '12px',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        background: 'rgba(124, 58, 237, 0.1)',
                                        color: '#7C3AED'
                                      }}
                                    >
                                      {spec}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '4px' }}>
                              {therapist.therapistProfile.hourlyRate && (
                                <div>
                                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#6B7280' }}>Hourly Rate</p>
                                  <p style={{ fontSize: '16px', fontWeight: '700', color: '#7C3AED' }}>
                                    ${therapist.therapistProfile.hourlyRate}/hr
                                  </p>
                                </div>
                              )}
                              <div>
                                <p style={{ fontSize: '13px', fontWeight: '600', color: '#6B7280' }}>Joined</p>
                                <p style={{ fontSize: '14px', color: '#1F2937' }}>
                                  {new Date(therapist.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </RoleGuard>
  );
}
