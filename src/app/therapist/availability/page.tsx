'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import RoleGuard from '@/components/RoleGuard';
import Link from 'next/link';

// SVG Icon Components
const ArrowLeftIcon = ({ color = '#7AB89E', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const CalendarIcon = ({ color = '#D9A299', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const PlusIcon = ({ color = '#7AB89E', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ClockIcon = ({ color = '#7AB89E', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const LightbulbIcon = ({ color = '#7AB89E', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

const XIcon = ({ color = '#EF4444', size = 14 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

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

  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
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
        setTimeout(() => setSuccess(''), 3000);
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
        setTimeout(() => setSuccess(''), 3000);
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

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <RoleGuard requireTherapist>
      <div style={{ minHeight: '100vh', background: '#FAF7F3' }}>
        {user && (
          <Navbar
            isAuthenticated={true}
            userName={user.name}
            userEmail={user.email}
            onLogout={handleLogout}
            currentPage="/therapist/availability"
            isAdmin={user.isAdmin}
            isSuperAdmin={user.isSuperAdmin}
            isTherapist={user.isTherapist}
          />
        )}

        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}
        >
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
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
              <CalendarIcon color="#D9A299" size={28} /> Availability Schedule
            </motion.h1>
            <p style={{ color: '#6B6B6B' }}>
              Set your weekly availability for therapy sessions
            </p>
          </div>

          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  padding: '14px 18px',
                  background: '#FEF2F2',
                  color: '#DC2626',
                  borderRadius: '14px',
                  marginBottom: '20px',
                  border: '1px solid rgba(220, 38, 38, 0.2)',
                }}
              >
                {error}
              </motion.div>
            )}

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

          {/* Add New Slot Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '28px',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
              border: '1px solid #F0E4D3',
              marginBottom: '24px',
            }}
          >
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#2D2D2D',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <PlusIcon color="#7AB89E" size={20} /> Add Availability Slot
            </h2>

            <form onSubmit={handleAddSlot} style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
            }}>
              <div style={{ flex: '1', minWidth: '150px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#6B6B6B',
                  marginBottom: '8px',
                }}>
                  Day
                </label>
                <select
                  value={newSlot.dayOfWeek}
                  onChange={(e) => setNewSlot({ ...newSlot, dayOfWeek: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #DCC5B2',
                    borderRadius: '12px',
                    fontSize: '14px',
                    background: '#FAF7F3',
                    outline: 'none',
                  }}
                >
                  {DAYS.map((day, i) => (
                    <option key={day} value={i}>{day}</option>
                  ))}
                </select>
              </div>

              <div style={{ flex: '1', minWidth: '120px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#6B6B6B',
                  marginBottom: '8px',
                }}>
                  Start Time
                </label>
                <select
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #DCC5B2',
                    borderRadius: '12px',
                    fontSize: '14px',
                    background: '#FAF7F3',
                    outline: 'none',
                  }}
                >
                  {TIME_OPTIONS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div style={{ flex: '1', minWidth: '120px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#6B6B6B',
                  marginBottom: '8px',
                }}>
                  End Time
                </label>
                <select
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #DCC5B2',
                    borderRadius: '12px',
                    fontSize: '14px',
                    background: '#FAF7F3',
                    outline: 'none',
                  }}
                >
                  {TIME_OPTIONS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div style={{ flex: '1', minWidth: '120px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#6B6B6B',
                  marginBottom: '8px',
                }}>
                  Duration
                </label>
                <select
                  value={newSlot.sessionDuration}
                  onChange={(e) => setNewSlot({ ...newSlot, sessionDuration: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #DCC5B2',
                    borderRadius: '12px',
                    fontSize: '14px',
                    background: '#FAF7F3',
                    outline: 'none',
                  }}
                >
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                  <option value={90}>90 min</option>
                </select>
              </div>

              <motion.button
                type="submit"
                disabled={saving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, #7AB89E 0%, #5A9880 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  boxShadow: '0 4px 12px rgba(122, 184, 158, 0.3)',
                }}
              >
                {saving ? 'Adding...' : 'Add Slot'}
              </motion.button>
            </form>
          </motion.div>

          {/* Weekly Calendar View */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '28px',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
              border: '1px solid #F0E4D3',
            }}
          >
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#2D2D2D',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <ClockIcon color="#7AB89E" size={20} /> Weekly Schedule
            </h2>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid #F0E4D3',
                    borderTop: '3px solid #7AB89E',
                    borderRadius: '50%',
                    margin: '0 auto',
                  }}
                />
                <p style={{ color: '#6B6B6B', marginTop: '12px' }}>Loading availability...</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {DAYS.map((day, dayIndex) => {
                  const slots = getSlotsByDay(dayIndex);
                  return (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: dayIndex * 0.03 }}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '16px',
                        padding: '16px 20px',
                        background: slots.length > 0 ? 'rgba(122, 184, 158, 0.08)' : '#FAF7F3',
                        borderRadius: '14px',
                        borderLeft: slots.length > 0 ? '4px solid #7AB89E' : '4px solid transparent',
                      }}
                    >
                      <div style={{
                        width: '100px',
                        fontWeight: '600',
                        color: slots.length > 0 ? '#7AB89E' : '#9CA3AF',
                        fontSize: '14px',
                        paddingTop: '4px',
                      }}>
                        {day}
                      </div>

                      <div style={{ flex: 1 }}>
                        {slots.length === 0 ? (
                          <span style={{ color: '#9CA3AF', fontSize: '14px' }}>No availability</span>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {slots.map(slot => (
                              <motion.div
                                key={slot.id}
                                whileHover={{ scale: 1.02 }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  padding: '8px 14px',
                                  background: 'white',
                                  borderRadius: '10px',
                                  fontSize: '13px',
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                                  border: '1px solid #F0E4D3',
                                }}
                              >
                                <span style={{ color: '#2D2D2D', fontWeight: '500' }}>
                                  {slot.startTime} - {slot.endTime}
                                </span>
                                <span style={{
                                  color: '#9CA3AF',
                                  fontSize: '12px',
                                  background: '#FAF7F3',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                }}>
                                  {slot.sessionDuration}min
                                </span>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                  title="Delete"
                                >
                                  <XIcon color="#EF4444" size={14} />
                                </motion.button>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              marginTop: '24px',
              padding: '18px 22px',
              background: 'rgba(122, 184, 158, 0.1)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              border: '1px solid rgba(122, 184, 158, 0.2)',
            }}
          >
            <LightbulbIcon color="#7AB89E" size={20} />
            <div style={{ fontSize: '14px', color: '#4B5563' }}>
              <strong style={{ color: '#2D2D2D' }}>Tip:</strong> Available time slots will be shown to students
              when they book a session. A 15-minute buffer is automatically added between sessions.
            </div>
          </motion.div>
        </motion.main>
      </div>
    </RoleGuard>
  );
}
