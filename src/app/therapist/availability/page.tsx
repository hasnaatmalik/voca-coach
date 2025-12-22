'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import RoleGuard from '@/components/RoleGuard';

interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  isBlocked: boolean;
  sessionDuration: number;
  bufferTime: number;
  specificDate?: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_OPTIONS: string[] = [];

// Generate time options from 6:00 to 22:00
for (let h = 6; h <= 22; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

export default function AvailabilityPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state for adding new slot
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    sessionDuration: 60,
    bufferTime: 15,
  });

  // Settings
  const [settings, setSettings] = useState({
    sessionDuration: 60,
    bufferTime: 15,
  });

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await fetch('/api/therapist/availability');
      if (response.ok) {
        const data = await response.json();
        setAvailability(data.availability);
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/therapist/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSlot,
          isRecurring: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAvailability([...availability, data.slot]);
        setSuccess('Availability slot added successfully');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add availability');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this availability slot?')) return;

    try {
      const response = await fetch(`/api/therapist/availability?id=${slotId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAvailability(availability.filter(s => s.id !== slotId));
        setSuccess('Slot deleted');
      }
    } catch (err) {
      setError('Failed to delete slot');
    }
  };

  const getSlotsByDay = (dayOfWeek: number) => {
    return availability
      .filter(s => s.dayOfWeek === dayOfWeek && s.isRecurring && !s.isBlocked)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  if (!user) return null;

  return (
    <RoleGuard requireTherapist>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 100%)' }}>
        <Navbar isAuthenticated={true} userName={user.name} userEmail={user.email} onLogout={logout} isTherapist={true} />

        <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
              Availability Schedule
            </h1>
            <p style={{ color: '#6B7280' }}>
              Set your weekly availability for therapy sessions
            </p>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px',
              background: '#FEE2E2',
              color: '#DC2626',
              borderRadius: '8px',
              marginBottom: '20px',
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              padding: '12px 16px',
              background: '#D1FAE5',
              color: '#059669',
              borderRadius: '8px',
              marginBottom: '20px',
            }}>
              {success}
            </div>
          )}

          {/* Add New Slot Form */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(124, 58, 237, 0.08)',
            marginBottom: '24px',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', marginBottom: '16px' }}>
              Add Availability Slot
            </h2>

            <form onSubmit={handleAddSlot} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: '1', minWidth: '150px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#6B7280', marginBottom: '6px' }}>
                  Day
                </label>
                <select
                  value={newSlot.dayOfWeek}
                  onChange={(e) => setNewSlot({ ...newSlot, dayOfWeek: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                >
                  {DAYS.map((day, i) => (
                    <option key={day} value={i}>{day}</option>
                  ))}
                </select>
              </div>

              <div style={{ flex: '1', minWidth: '120px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#6B7280', marginBottom: '6px' }}>
                  Start Time
                </label>
                <select
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                >
                  {TIME_OPTIONS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div style={{ flex: '1', minWidth: '120px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#6B7280', marginBottom: '6px' }}>
                  End Time
                </label>
                <select
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                >
                  {TIME_OPTIONS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div style={{ flex: '1', minWidth: '120px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#6B7280', marginBottom: '6px' }}>
                  Session Duration
                </label>
                <select
                  value={newSlot.sessionDuration}
                  onChange={(e) => setNewSlot({ ...newSlot, sessionDuration: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                >
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                  <option value={90}>90 min</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '10px 24px',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? 'Adding...' : 'Add Slot'}
              </button>
            </form>
          </div>

          {/* Weekly Calendar View */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(124, 58, 237, 0.08)',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', marginBottom: '20px' }}>
              Weekly Schedule
            </h2>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
                Loading availability...
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {DAYS.map((day, dayIndex) => {
                  const slots = getSlotsByDay(dayIndex);
                  return (
                    <div
                      key={day}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '16px',
                        padding: '16px',
                        background: slots.length > 0 ? 'rgba(124, 58, 237, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                        borderRadius: '12px',
                        borderLeft: slots.length > 0 ? '4px solid #7C3AED' : '4px solid transparent',
                      }}
                    >
                      <div style={{
                        width: '100px',
                        fontWeight: '600',
                        color: slots.length > 0 ? '#7C3AED' : '#9CA3AF',
                        fontSize: '14px',
                      }}>
                        {day}
                      </div>

                      <div style={{ flex: 1 }}>
                        {slots.length === 0 ? (
                          <span style={{ color: '#9CA3AF', fontSize: '14px' }}>No availability</span>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {slots.map(slot => (
                              <div
                                key={slot.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '6px 12px',
                                  background: 'white',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                }}
                              >
                                <span style={{ color: '#1F2937', fontWeight: '500' }}>
                                  {slot.startTime} - {slot.endTime}
                                </span>
                                <span style={{ color: '#9CA3AF', fontSize: '12px' }}>
                                  ({slot.sessionDuration}min)
                                </span>
                                <button
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#DC2626',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                  title="Delete"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Info Card */}
          <div style={{
            marginTop: '24px',
            padding: '16px 20px',
            background: 'rgba(124, 58, 237, 0.08)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}>
            <span style={{ fontSize: '20px' }}>💡</span>
            <div style={{ fontSize: '14px', color: '#6B7280' }}>
              <strong style={{ color: '#1F2937' }}>Tip:</strong> Available time slots will be shown to students
              when they book a session. A 15-minute buffer is automatically added between sessions.
            </div>
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}
