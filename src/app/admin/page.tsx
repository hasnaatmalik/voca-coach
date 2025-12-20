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
            isTherapist={user.isTherapist}
          />
        )}
        
        <div style={{ minHeight: 'calc(100vh - 72px)', padding: '32px 24px' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage users, therapists, and platform statistics</p>
          </div>

          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Total Users"
                  value={stats?.totalUsers || 0}
                  icon="👥"
                  color="var(--primary)"
                />
                <StatCard
                  title="Therapists"
                  value={stats?.totalTherapists || 0}
                  icon="🧑‍⚕️"
                  color="var(--accent)"
                />
                <StatCard
                  title="Practice Sessions"
                  value={stats?.totalSessions || 0}
                  icon="🎯"
                  color="var(--secondary)"
                />
                <StatCard
                  title="Therapy Sessions"
                  value={stats?.totalTherapySessions || 0}
                  icon="💬"
                  color="var(--tertiary)"
                />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Link href="/admin/users">
                  <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border" style={{ borderColor: '#f3f4f6' }}>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 rounded-xl p-4" style={{ backgroundColor: 'var(--bg-purple-light)' }}>
                        <span className="text-3xl">👥</span>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-bold text-gray-900">Manage Users</h3>
                        <p className="text-gray-600">View, search, and manage user accounts</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/admin/therapists">
                  <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border" style={{ borderColor: '#f3f4f6' }}>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 rounded-xl p-4" style={{ backgroundColor: 'var(--bg-green-light)' }}>
                        <span className="text-3xl">🧑‍⚕️</span>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-bold text-gray-900">Manage Therapists</h3>
                        <p className="text-gray-600">Approve and manage therapist profiles</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Recent Users */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border" style={{ borderColor: '#f3f4f6' }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Users</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">{user.name}</td>
                          <td className="py-3 px-4 text-gray-600">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className="px-3 py-1 rounded-full text-sm font-medium" style={{
                              backgroundColor: user.role === 'admin' ? 'var(--bg-pink-light)' :
                                             user.role === 'therapist' ? 'var(--bg-green-light)' :
                                             'var(--bg-purple-light)',
                              color: user.role === 'admin' ? 'var(--secondary)' :
                                    user.role === 'therapist' ? 'var(--accent)' :
                                    'var(--primary)'
                            }}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
        </div>
      </div>
    </RoleGuard>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border" style={{ borderColor: '#f3f4f6' }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="rounded-xl p-3" style={{ backgroundColor: color.startsWith('var') ? `rgba(124, 58, 237, 0.1)` : color }}>
          <span className="text-3xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}
