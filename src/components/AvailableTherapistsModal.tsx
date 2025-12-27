'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Therapist {
  id: string;
  name: string;
  email: string;
  lastActiveAt: string | null;
  therapistProfile: {
    bio: string | null;
    specializations: string | null;
    hourlyRate: number | null;
  } | null;
}

interface AvailableTherapistsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AvailableTherapistsModal({ isOpen, onClose }: AvailableTherapistsModalProps) {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchTherapists();
      // Poll for updates every 10 seconds
      const interval = setInterval(fetchTherapists, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const fetchTherapists = async () => {
    try {
      const res = await fetch('/api/therapists/available');
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

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'white',
          borderRadius: '24px',
          padding: '32px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>
              Available Now
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>
              {therapists.length} therapist{therapists.length !== 1 ? 's' : ''} online
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              border: 'none',
              background: '#F3F4F6',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div className="animate-spin" style={{
              width: '40px',
              height: '40px',
              border: '3px solid #E5E7EB',
              borderTopColor: '#7C3AED',
              borderRadius: '50%',
              margin: '0 auto 16px',
            }} />
            <p style={{ color: '#6B7280' }}>Finding available therapists...</p>
          </div>
        ) : therapists.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>😔</div>
            <p style={{ fontSize: '16px', fontWeight: '500', color: '#1F2937', marginBottom: '8px' }}>
              No therapists available right now
            </p>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
              Check back later or book a scheduled session
            </p>
            <Link
              href="/therapy/book"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                color: 'white',
                borderRadius: '12px',
                fontWeight: '600',
                textDecoration: 'none',
              }}
            >
              Book a Session
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
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
                    padding: '20px',
                    background: 'white',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: '#10B981',
                          animation: 'pulse 2s infinite',
                        }} />
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937' }}>
                          {therapist.name}
                        </h3>
                      </div>
                      {therapist.therapistProfile?.bio && (
                        <p style={{
                          fontSize: '13px',
                          color: '#6B7280',
                          marginBottom: '12px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {therapist.therapistProfile.bio}
                        </p>
                      )}
                      {specializations.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                          {specializations.slice(0, 3).map((spec: string) => (
                            <span
                              key={spec}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '500',
                                background: 'rgba(124, 58, 237, 0.1)',
                                color: '#7C3AED',
                              }}
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        // Redirect to chat page, let it handle conversation creation
                        window.location.href = `/chat?therapist=${therapist.id}`;
                      }}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: 'linear-gradient(135deg, #D9A299 0%, #C8847A 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      💬 Chat Now
                    </button>
                    <Link
                      href={`/therapy/book?therapist=${therapist.id}`}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: 'linear-gradient(135deg, #DCC5B2 0%, #D9A299 100%)',
                        color: '#2D2D2D',
                        borderRadius: '12px',
                        fontWeight: '600',
                        textAlign: 'center',
                        textDecoration: 'none',
                        fontSize: '14px',
                      }}
                    >
                      📅 Book
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <style jsx global>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    </div>
  );
}
