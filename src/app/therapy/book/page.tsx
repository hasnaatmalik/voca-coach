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
    hourlyRate: number | null;
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
        }),
      });
      
      if (res.ok) {
        alert('Session booked successfully!');
        router.push('/therapy/sessions');
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
        padding: '32px 24px'
      }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Book a Therapy Session</h1>
          <p className="text-gray-600">Connect with a professional therapist</p>
          <Link href="/therapy/sessions" className="font-medium mt-2 inline-block" style={{ color: 'var(--primary)' }}>
            View My Sessions →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Therapist List */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1F2937', marginBottom: '20px' }}>Available Therapists</h2>
              <div className="space-y-4">
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
                      onClick={() => setSelectedTherapist(therapist.id)}
                      className="bg-white rounded-2xl p-6 cursor-pointer transition-all border-2 shadow"
                      style={{
                        borderColor: selectedTherapist === therapist.id ? 'var(--primary)' : '#f3f4f6',
                        boxShadow: selectedTherapist === therapist.id ? '0 10px 25px rgba(124, 58, 237, 0.2)' : undefined
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{therapist.name}</h3>
                          <p className="text-gray-600 text-sm">{therapist.email}</p>
                        </div>
                        {therapist.therapistProfile?.hourlyRate && (
                          <div className="text-right">
                            <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                              ${therapist.therapistProfile.hourlyRate}
                            </p>
                            <p className="text-xs text-gray-500">per hour</p>
                          </div>
                        )}
                      </div>
                      
                      {therapist.therapistProfile?.bio && (
                        <p className="text-gray-700 mb-3">{therapist.therapistProfile.bio}</p>
                      )}
                      
                      {specializations.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {specializations.map((spec: string) => (
                            <span
                              key={spec}
                              className="px-3 py-1 rounded-full text-sm font-medium"
                              style={{ backgroundColor: 'var(--bg-purple-light)', color: 'var(--primary-dark)' }}
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {therapists.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '48px 0', color: '#6B7280' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧑‍⚕️</div>
                    <p style={{ fontSize: '16px', fontWeight: '500' }}>No therapists available</p>
                    <p style={{ fontSize: '14px', marginTop: '8px' }}>Check back later for available therapists</p>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Form */}
            <div className="sticky top-8 h-fit">
              <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '32px',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)'
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1F2937', marginBottom: '24px' }}>Book Your Session</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note (Optional)
                    </label>
                    <textarea
                      value={userNote}
                      onChange={(e) => setUserNote(e.target.value)}
                      placeholder="Any specific concerns or topics you'd like to discuss..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:border-transparent resize-none"
                      style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                      rows={4}
                    />
                  </div>

                  <button
                    onClick={bookSession}
                    disabled={!selectedTherapist || !scheduledAt || booking}
                    className="w-full py-4 text-white rounded-xl font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    style={{ 
                      background: !selectedTherapist || !scheduledAt || booking ? undefined : 'var(--bg-gradient-purple)'
                    }}
                  >
                    {booking ? 'Booking...' : 'Book Session'}
                  </button>

                  {!selectedTherapist && (
                    <p className="text-sm text-gray-500 text-center">
                      Please select a therapist to continue
                    </p>
                  )}
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
