'use client';

import { useEffect, useState } from 'react';
import RoleGuard from '@/components/RoleGuard';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface Stats {
  totalUsers: number;
  totalTherapists: number;
  totalSessions: number;
  totalTherapySessions: number;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecentUsers(data.recentUsers);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <RoleGuard requireAdmin>
      <div style={{ minHeight: '100vh' }}>
        {user && (
          <Navbar
            isAuthenticated={true}
            userName={user.name}
            userEmail={user.email}
            onLogout={handleLogout}
            currentPage="/admin"
            isAdmin={user.isAdmin}
            isSuperAdmin={user.isSuperAdmin}
            isTherapist={user.isTherapist}
          />
        )}
        
        <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
          {/* Welcome Section */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
              Admin Dashboard
            </h1>
            <p style={{ color: '#6B7280' }}>Manage users, therapists, and platform statistics</p>
          </div>

          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
            </div>
          ) : (
            <>
              {/* Platform Statistics */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '32px',
                marginBottom: '24px',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)'
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
                  Platform Statistics
                </h2>
                <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
                  Overview of all platform activity
                </p>

                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <StatCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    icon="👥"
                    gradient="linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)"
                  />
                  <StatCard
                    title="Therapists"
                    value={stats?.totalTherapists || 0}
                    icon="🧑‍⚕️"
                    gradient="linear-gradient(135deg, #EC4899 0%, #F472B6 100%)"
                  />
                  <StatCard
                    title="Practice Sessions"
                    value={stats?.totalSessions || 0}
                    icon="🎯"
                    gradient="linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)"
                  />
                  <StatCard
                    title="Therapy Sessions"
                    value={stats?.totalTherapySessions || 0}
                    icon="💬"
                    gradient="linear-gradient(135deg, #10B981 0%, #34D399 100%)"
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '32px',
                marginBottom: '24px',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)'
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1F2937', marginBottom: '20px' }}>
                  Quick Actions
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <Link href="/admin/users" style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
                      borderRadius: '16px',
                      padding: '20px',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      boxShadow: '0 4px 16px rgba(124, 58, 237, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(124, 58, 237, 0.2)';
                    }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>Manage Users</h3>
                      <p style={{ fontSize: '14px', opacity: 0.9 }}>View, search, and manage user accounts</p>
                    </div>
                  </Link>

                  <Link href="/admin/therapists" style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                      borderRadius: '16px',
                      padding: '20px',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.2)';
                    }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>🧑‍⚕️</div>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>Manage Therapists</h3>
                      <p style={{ fontSize: '14px', opacity: 0.9 }}>Approve and manage therapist profiles</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Recent Users */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '32px',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)'
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1F2937', marginBottom: '20px' }}>
                  Recent Users
                </h2>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                        <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>Name</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>Email</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>Role</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((recentUser, index) => (
                        <tr key={recentUser.id} style={{ borderBottom: index < recentUsers.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                          <td style={{ padding: '16px', fontSize: '14px', fontWeight: '500', color: '#1F2937' }}>{recentUser.name}</td>
                          <td style={{ padding: '16px', fontSize: '14px', color: '#6B7280' }}>{recentUser.email}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '13px',
                              fontWeight: '600',
                              background: recentUser.role === 'superadmin' ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)' :
                                         recentUser.role === 'admin' ? 'rgba(236, 72, 153, 0.1)' :
                                         recentUser.role === 'therapist' ? 'rgba(16, 185, 129, 0.1)' :
                                         'rgba(124, 58, 237, 0.1)',
                              color: recentUser.role === 'superadmin' ? 'white' :
                                     recentUser.role === 'admin' ? '#DB2777' :
                                     recentUser.role === 'therapist' ? '#059669' :
                                     '#7C3AED'
                            }}>
                              {recentUser.role === 'superadmin' && '👑 '}
                              {recentUser.role}
                            </span>
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: '#6B7280' }}>
                            {new Date(recentUser.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </RoleGuard>
  );
}

function StatCard({ title, value, icon, gradient }: { title: string; value: number; icon: string; gradient: string }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #E5E7EB',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#6B7280', marginBottom: '8px' }}>{title}</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#1F2937' }}>{value}</p>
        </div>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px'
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
}
