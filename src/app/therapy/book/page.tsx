'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Therapist {
  id: string;
  name: string;
  email: string;
  therapistProfile: {
    id: string;
    bio: string | null;
    specializations: string | null;
    isApproved: boolean;
  } | null;
}

export default function TherapyBooking() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [userNote, setUserNote] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchTherapists();
  }, [user, router]);

  const fetchTherapists = async () => {
    try {
      const res = await fetch('/api/therapy/therapists');
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

  const bookSession = async () => {
    if (!selectedTherapist || !scheduledAt) {
      alert('Please select a therapist and time');
      return;
    }

    setBooking(true);
    try {
      const res = await fetch('/api/therapy/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          therapistId: selectedTherapist,
          scheduledAt,
          userNote,
          status: 'scheduled',
        }),
      });

      if (res.ok) {
        router.push('/therapy/sessions?booked=true');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to book session');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to book session');
    } finally {
      setBooking(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar
        isAuthenticated={true}
        userName={user.name}
        userEmail={user.email}
        onLogout={handleLogout}
        currentPage="/therapy/book"
        isAdmin={user.isAdmin}
        isSuperAdmin={user.isSuperAdmin}
        isTherapist={user.isTherapist}
      />
      
      <div style={{ 
        minHeight: 'calc(100vh - 72px)',
        padding: '40px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header Section - Clean & Minimal */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '100px',
              marginBottom: '16px'
            }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: '#10B981',
                boxShadow: '0 0 8px #10B981'
              }} />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#10B981' }}>Free Sessions</span>
            </div>
            
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#1F2937',
              marginBottom: '8px'
            }}>
              Book a Therapy Session
            </h1>
            <p style={{ color: '#6B7280', fontSize: '16px', marginBottom: '20px', maxWidth: '500px' }}>
              Connect with licensed professionals for personalized mental health support — completely free.
            </p>
            <Link 
              href="/therapy/sessions" 
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--primary)',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              View My Sessions →
            </Link>
          </div>

          {loading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '100px 0'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '3px solid rgba(124, 58, 237, 0.1)',
                borderTopColor: 'var(--primary)',
                animation: 'spin 1s linear infinite'
              }} />
              <p style={{ marginTop: '16px', color: '#9CA3AF' }}>Loading therapists...</p>
              <style jsx>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
              gap: '40px',
              alignItems: 'start'
            }}>
              {/* Therapist List */}
              <div>
                <h2 style={{ 
                  fontSize: '15px', 
                  fontWeight: '600', 
                  color: '#6B7280', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '20px'
                }}>
                  Available Therapists {therapists.length > 0 && `(${therapists.length})`}
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                    
                    const isSelected = selectedTherapist === therapist.id;
                    
                    return (
                      <div
                        key={therapist.id}
                        onClick={() => setSelectedTherapist(therapist.id)}
                        style={{
                          background: 'white',
                          borderRadius: '16px',
                          padding: '24px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid #E5E7EB',
                          boxShadow: isSelected 
                            ? '0 4px 20px rgba(124, 58, 237, 0.15)' 
                            : '0 1px 3px rgba(0, 0, 0, 0.05)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                          <div style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '14px',
                            background: isSelected 
                              ? 'linear-gradient(135deg, var(--primary) 0%, #EC4899 100%)'
                              : '#F3F4F6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '22px',
                            flexShrink: 0,
                            transition: 'all 0.2s ease'
                          }}>
                            {isSelected ? '✓' : '🧑‍⚕️'}
                          </div>
                          
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={{ 
                              fontSize: '17px', 
                              fontWeight: '600', 
                              color: '#1F2937',
                              marginBottom: '4px'
                            }}>
                              {therapist.name}
                            </h3>
                            
                            {therapist.therapistProfile?.bio && (
                              <p style={{ 
                                fontSize: '14px', 
                                color: '#6B7280', 
                                lineHeight: '1.5',
                                marginBottom: '12px'
                              }}>
                                {therapist.therapistProfile.bio}
                              </p>
                            )}
                            
                            {specializations.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {specializations.slice(0, 3).map((spec: string) => (
                                  <span
                                    key={spec}
                                    style={{
                                      padding: '4px 10px',
                                      borderRadius: '6px',
                                      fontSize: '12px',
                                      fontWeight: '500',
                                      background: '#F3F4F6',
                                      color: '#4B5563'
                                    }}
                                  >
                                    {spec}
                                  </span>
                                ))}
                                {specializations.length > 3 && (
                                  <span style={{
                                    padding: '4px 10px',
                                    fontSize: '12px',
                                    color: '#9CA3AF'
                                  }}>
                                    +{specializations.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {therapists.length === 0 && (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '60px 24px',
                      background: 'white',
                      borderRadius: '16px',
                      border: '1px dashed #E5E7EB'
                    }}>
                      <div style={{
                        width: '64px',
                        height: '64px',
                        margin: '0 auto 16px',
                        borderRadius: '16px',
                        background: '#F3F4F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px'
                      }}>
                        🧑‍⚕️
                      </div>
                      <p style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                        No Therapists Available
                      </p>
                      <p style={{ fontSize: '14px', color: '#9CA3AF' }}>
                        Check back later for available sessions
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Form - Sticky */}
              <div style={{ position: 'sticky', top: '100px' }}>
                <div style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '28px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                }}>
                  <h2 style={{ 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    color: '#1F2937', 
                    marginBottom: '24px'
                  }}>
                    Schedule Your Session
                  </h2>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '1px solid #E5E7EB',
                          fontSize: '15px',
                          fontFamily: 'inherit',
                          background: 'white',
                          transition: 'border-color 0.2s ease',
                          outline: 'none'
                        }}
                        min={new Date().toISOString().slice(0, 16)}
                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        Note <span style={{ fontWeight: '400', color: '#9CA3AF' }}>(optional)</span>
                      </label>
                      <textarea
                        value={userNote}
                        onChange={(e) => setUserNote(e.target.value)}
                        placeholder="Topics you'd like to discuss..."
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '1px solid #E5E7EB',
                          fontSize: '15px',
                          fontFamily: 'inherit',
                          background: 'white',
                          transition: 'border-color 0.2s ease',
                          outline: 'none',
                          resize: 'none',
                          minHeight: '100px',
                          lineHeight: '1.5'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                      />
                    </div>

                    {selectedTherapist && (
                      <div style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        background: 'rgba(16, 185, 129, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ color: '#10B981', fontSize: '16px' }}>✓</span>
                        <span style={{ fontSize: '14px', color: '#10B981', fontWeight: '500' }}>
                          {therapists.find(t => t.id === selectedTherapist)?.name} selected
                        </span>
                      </div>
                    )}

                    <button
                      onClick={bookSession}
                      disabled={!selectedTherapist || !scheduledAt || booking}
                      style={{ 
                        width: '100%',
                        padding: '14px',
                        borderRadius: '12px',
                        border: 'none',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: !selectedTherapist || !scheduledAt || booking ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        background: !selectedTherapist || !scheduledAt || booking 
                          ? '#E5E7EB' 
                          : 'var(--primary)',
                        color: !selectedTherapist || !scheduledAt || booking ? '#9CA3AF' : 'white',
                      }}
                    >
                      {booking ? 'Booking...' : 'Book Free Session'}
                    </button>

                    {!selectedTherapist && (
                      <p style={{ 
                        fontSize: '13px', 
                        color: '#9CA3AF', 
                        textAlign: 'center'
                      }}>
                        Select a therapist to continue
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Trust Indicators */}
                <div style={{
                  marginTop: '16px',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '20px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9CA3AF', fontSize: '12px' }}>
                    <span>🔒</span> <span>Private</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9CA3AF', fontSize: '12px' }}>
                    <span>⭐</span> <span>Licensed</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontSize: '12px' }}>
                    <span>✓</span> <span>100% Free</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
