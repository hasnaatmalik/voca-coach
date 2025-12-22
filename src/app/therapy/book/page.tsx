'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

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
  const [showPayment, setShowPayment] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

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
      // Create pending session first
      const res = await fetch('/api/therapy/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          therapistId: selectedTherapist,
          scheduledAt,
          userNote,
          status: 'pending_payment',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSessionId(data.session.id);
        setShowPayment(true);
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

  const processPayment = async () => {
    if (!sessionId) return;

    setPaymentLoading(true);
    setPaymentError(null);

    try {
      // Create payment intent
      const paymentRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, duration: 60 }),
      });

      if (!paymentRes.ok) {
        throw new Error('Failed to create payment');
      }

      const { clientSecret, amount } = await paymentRes.json();

      // Redirect to Stripe checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Use Stripe's redirect to checkout for simplicity
      // In production, you might use Stripe Elements inline
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: {
            // For demo, we'll redirect to success page
            // In real app, use Stripe Elements here
          } as never,
        },
      }).catch(() => {
        // Redirect to Stripe hosted page for easier implementation
        window.location.href = `/therapy/checkout?session_id=${sessionId}&amount=${amount}`;
        return { error: { message: 'Redirecting to checkout...' } };
      });

      if (result?.error) {
        // If not redirecting, show error
        if (result.error.message !== 'Redirecting to checkout...') {
          setPaymentError(result.error.message || 'Payment failed');
        }
      } else {
        // Payment succeeded
        router.push('/therapy/sessions');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('Payment processing failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const skipPayment = async () => {
    // For development/demo: Allow skipping payment
    if (!sessionId) return;

    try {
      await fetch(`/api/therapy/sessions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, status: 'scheduled' }),
      });
      router.push('/therapy/sessions');
    } catch {
      router.push('/therapy/sessions');
    }
  };

  const getSelectedTherapistRate = () => {
    const therapist = therapists.find(t => t.id === selectedTherapist);
    return therapist?.therapistProfile?.hourlyRate || 90;
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

      {/* Payment Modal */}
      {showPayment && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '20px',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1F2937',
              marginBottom: '8px',
            }}>
              Complete Your Booking
            </h2>
            <p style={{ color: '#6B7280', marginBottom: '24px' }}>
              Secure payment for your therapy session
            </p>

            {/* Session Summary */}
            <div style={{
              background: '#F9FAFB',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}>
                <span style={{ color: '#6B7280' }}>Session Duration</span>
                <span style={{ fontWeight: '600', color: '#1F2937' }}>60 minutes</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}>
                <span style={{ color: '#6B7280' }}>Therapist Rate</span>
                <span style={{ fontWeight: '600', color: '#1F2937' }}>
                  ${getSelectedTherapistRate()}/hour
                </span>
              </div>
              <div style={{
                borderTop: '1px solid #E5E7EB',
                paddingTop: '12px',
                marginTop: '12px',
                display: 'flex',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontWeight: '600', color: '#1F2937' }}>Total</span>
                <span style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#7C3AED',
                }}>
                  ${getSelectedTherapistRate()}
                </span>
              </div>
            </div>

            {paymentError && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px',
                color: '#DC2626',
                fontSize: '14px',
              }}>
                {paymentError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowPayment(false);
                  setSessionId(null);
                }}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  background: '#F3F4F6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={processPayment}
                disabled={paymentLoading}
                style={{
                  flex: 2,
                  padding: '14px 24px',
                  background: paymentLoading ? '#9CA3AF' : 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: paymentLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {paymentLoading ? 'Processing...' : 'Pay Now'}
              </button>
            </div>

            {/* Dev mode: Skip payment */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={skipPayment}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  padding: '10px',
                  background: 'transparent',
                  color: '#9CA3AF',
                  border: '1px dashed #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Skip payment (dev mode)
              </button>
            )}

            <p style={{
              marginTop: '16px',
              fontSize: '12px',
              color: '#9CA3AF',
              textAlign: 'center',
            }}>
              Payments are securely processed by Stripe
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
