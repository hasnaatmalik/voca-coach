'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import CommunityCard from '@/components/community/CommunityCard';
import { motion, AnimatePresence } from 'framer-motion';

const colors = {
  background: '#FAF7F3',
  surface: '#F0E4D3',
  border: '#DCC5B2',
  accent: '#D9A299',
  accentDark: '#C8847A',
  text: '#2D2D2D',
  textMuted: '#7A7A7A',
};

export default function CommunitiesPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [communities, setCommunities] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: '', description: '', icon: '🌐' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const res = await fetch('/api/communities');
      if (res.ok) {
        const data = await res.json();
        setCommunities(data.communities);
      }
    } catch (error) {
      console.error('Failed to fetch communities:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommunity.name) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCommunity),
      });
      if (res.ok) {
        const data = await res.json();
        setCommunities([data.community, ...communities]);
        setShowCreateModal(false);
        setNewCommunity({ name: '', description: '', icon: '🌐' });
        router.push(`/communities/${data.community.slug}`);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create community');
      }
    } catch (error) {
      console.error('Failed to create community:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCommunities = communities.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return null;

  return (
    <div style={{ minHeight: '100vh', background: colors.background }}>
      <Navbar
        isAuthenticated={!!user}
        userName={user?.name || 'User'}
        userEmail={user?.email || ''}
        onLogout={() => { logout(); router.push('/login'); }}
        currentPage="/communities"
        isAdmin={user?.isAdmin}
        isTherapist={user?.isTherapist}
      />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', color: colors.text, marginBottom: '8px', letterSpacing: '-0.02em' }}>
              Communities
            </h1>
            <p style={{ fontSize: '16px', color: colors.textMuted }}>
              Find your tribe and share your journey with others.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '12px 24px',
              background: colors.accent,
              color: 'white',
              borderRadius: '100px',
              border: 'none',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(217, 162, 153, 0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            Create Community
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '40px' }}>
          <input
            type="text"
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 24px 16px 56px',
              borderRadius: '20px',
              border: `1px solid ${colors.border}60`,
              background: 'white',
              fontSize: '16px',
              outline: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
            }}
          />
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.textMuted}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)' }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {/* Grid */}
        {loadingData ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ height: '240px', background: 'white', borderRadius: '24px', opacity: 0.5, animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {filteredCommunities.map(community => (
              <CommunityCard key={community.id} community={community} />
            ))}
          </div>
        )}

        {/* Create Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <div style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '24px',
            }}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCreateModal(false)}
                style={{ position: 'absolute', inset: 0, background: 'rgba(45, 45, 45, 0.4)', backdropFilter: 'blur(8px)' }}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                style={{
                  position: 'relative',
                  background: 'white',
                  borderRadius: '32px',
                  padding: '40px',
                  width: '100%',
                  maxWidth: '500px',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
                }}
              >
                <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: colors.text }}>
                  Create a Community
                </h2>
                <form onSubmit={handleCreateCommunity} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '700', color: colors.text }}>Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Zen Masters"
                      value={newCommunity.name}
                      onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                      style={{ padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.border}`, outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '700', color: colors.text }}>Description</label>
                    <textarea
                      placeholder="What is this community about?"
                      value={newCommunity.description}
                      onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                      style={{ padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.border}`, outline: 'none', minHeight: '100px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '700', color: colors.text }}>Icon (Emoji)</label>
                    <input
                      type="text"
                      placeholder="🌐"
                      value={newCommunity.icon}
                      onChange={(e) => setNewCommunity({ ...newCommunity, icon: e.target.value })}
                      style={{ padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.border}`, outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        flex: 1,
                        padding: '14px',
                        background: colors.accent,
                        color: 'white',
                        borderRadius: '100px',
                        border: 'none',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        opacity: isSubmitting ? 0.6 : 1,
                      }}
                    >
                      {isSubmitting ? 'Creating...' : 'Create Community'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      style={{
                        padding: '14px 24px',
                        background: 'none',
                        color: colors.textMuted,
                        borderRadius: '100px',
                        border: `1px solid ${colors.border}`,
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 0.3; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
