'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import {
  TherapyHero,
  TherapistCard,
  BookingForm,
  EmptyState,
} from '@/components/therapy/bento';

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

  const selectedTherapistData = therapists.find(t => t.id === selectedTherapist) || null;

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F3' }}>
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

      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px',
      }}>
        {/* Hero Section */}
        <TherapyHero
          title="Book a Therapy Session"
          subtitle="Connect with licensed professionals for personalized mental health support — completely free."
          linkText="View My Sessions"
          linkHref="/therapy/sessions"
        />

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '100px 0',
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '4px solid #F0E4D3',
                borderTop: '4px solid #7AB89E',
              }}
            />
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ marginTop: '16px', color: '#9CA3AF', fontSize: '15px' }}
            >
              Loading therapists...
            </motion.p>
          </motion.div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
            gap: '40px',
            alignItems: 'start',
          }}>
            {/* Therapist List */}
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#6B6B6B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '20px',
                }}
              >
                Available Therapists {therapists.length > 0 && `(${therapists.length})`}
              </motion.h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {therapists.map((therapist, index) => (
                  <TherapistCard
                    key={therapist.id}
                    therapist={therapist}
                    isSelected={selectedTherapist === therapist.id}
                    onSelect={() => setSelectedTherapist(therapist.id)}
                    index={index}
                  />
                ))}

                {therapists.length === 0 && (
                  <EmptyState
                    icon="therapist"
                    title="No Therapists Available"
                    description="Check back later for available sessions"
                    actionText="Browse AI Sessions"
                    actionHref="/therapy/ai-session"
                  />
                )}
              </div>
            </div>

            {/* Booking Form */}
            <BookingForm
              selectedTherapist={selectedTherapistData}
              scheduledAt={scheduledAt}
              userNote={userNote}
              booking={booking}
              onScheduleChange={setScheduledAt}
              onNoteChange={setUserNote}
              onBookSession={bookSession}
            />
          </div>
        )}
      </main>
    </div>
  );
}
