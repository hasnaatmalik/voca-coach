'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import RoleGuard from '@/components/RoleGuard';
import Navbar from '@/components/Navbar';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isTherapist: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  createdAt: string;
}

export default function AdminUsers() {
  const { user: currentUser, logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/admin/users?search=${search}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, updates: { isTherapist?: boolean; isAdmin?: boolean; isSuperAdmin?: boolean }) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates }),
      });
      if (res.ok) {
        fetchUsers();
        alert('User updated successfully');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <RoleGuard requireAdmin>
      <div style={{ minHeight: '100vh' }}>
        {currentUser && (
          <Navbar
            isAuthenticated={true}
            userName={currentUser.name}
            userEmail={currentUser.email}
            onLogout={handleLogout}
            currentPage="/admin/users"
            isAdmin={currentUser.isAdmin}
            isSuperAdmin={currentUser.isSuperAdmin}
            isTherapist={currentUser.isTherapist}
          />
        )}
        
        <div style={{ minHeight: 'calc(100vh - 72px)', padding: '32px 24px' }}>
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">User Management</h1>
              <p className="text-gray-600">Manage user roles and permissions</p>
            </div>

            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input"
                style={{ maxWidth: '400px' }}
              />
            </div>

            {loading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
              </div>
            ) : (
              <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.5)'
              }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ background: 'var(--bg-purple-light)' }}>
                      <tr>
                        <th className="text-left py-4 px-6 font-semibold" style={{ color: 'var(--text-dark)' }}>Name</th>
                        <th className="text-left py-4 px-6 font-semibold" style={{ color: 'var(--text-dark)' }}>Email</th>
                        <th className="text-left py-4 px-6 font-semibold" style={{ color: 'var(--text-dark)' }}>Role</th>
                        <th className="text-left py-4 px-6 font-semibold" style={{ color: 'var(--text-dark)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50" style={{ borderColor: '#f3f4f6' }}>
                          <td className="py-4 px-6" style={{ color: 'var(--text-dark)', fontWeight: '500' }}>{user.name}</td>
                          <td className="py-4 px-6" style={{ color: 'var(--text-medium)' }}>{user.email}</td>
                          <td className="py-4 px-6">
                            <div className="flex gap-2">
                              <span style={{
                                padding: '6px 14px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '13px',
                                fontWeight: '600',
                                background: user.isSuperAdmin ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' :
                                           user.isAdmin ? 'var(--bg-pink-light)' :
                                           user.isTherapist ? 'var(--bg-green-light)' :
                                           'var(--bg-purple-light)',
                                color: user.isSuperAdmin ? 'white' :
                                       user.isAdmin ? 'var(--secondary)' :
                                       user.isTherapist ? 'var(--accent)' :
                                       'var(--primary)'
                              }}>
                                {user.isSuperAdmin ? '👑 Superadmin' :
                                 user.isAdmin ? 'Admin' :
                                 user.isTherapist ? 'Therapist' :
                                 'User'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex gap-2">
                              {!user.isTherapist && (
                                <button
                                  onClick={() => updateUserRole(user.id, { isTherapist: true })}
                                  className="btn-secondary"
                                  style={{ 
                                    padding: '8px 16px',
                                    fontSize: '13px',
                                    borderRadius: '12px'
                                  }}
                                >
                                  Make Therapist
                                </button>
                              )}
                              {!user.isAdmin && !user.isSuperAdmin && (
                                <button
                                  onClick={() => updateUserRole(user.id, { isAdmin: true })}
                                  className="btn"
                                  style={{ 
                                    padding: '8px 16px',
                                    fontSize: '13px',
                                    background: 'var(--secondary)',
                                    color: 'white',
                                    borderRadius: '12px'
                                  }}
                                >
                                  Make Admin
                                </button>
                              )}
                              {user.isAdmin && !user.isSuperAdmin && currentUser?.isSuperAdmin && (
                                <button
                                  onClick={() => updateUserRole(user.id, { isSuperAdmin: true })}
                                  className="btn"
                                  style={{ 
                                    padding: '8px 16px',
                                    fontSize: '13px',
                                    background: 'var(--bg-gradient-purple)',
                                    color: 'white',
                                    borderRadius: '12px'
                                  }}
                                >
                                  👑 Make Superadmin
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
