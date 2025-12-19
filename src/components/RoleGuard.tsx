'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireTherapist?: boolean;
  fallbackPath?: string;
}

export default function RoleGuard({
  children,
  requireAdmin = false,
  requireTherapist = false,
  fallbackPath = '/dashboard',
}: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (requireAdmin && !user.isAdmin) {
        router.push(fallbackPath);
        return;
      }

      if (requireTherapist && !user.isTherapist) {
        router.push(fallbackPath);
        return;
      }
    }
  }, [user, loading, requireAdmin, requireTherapist, router, fallbackPath]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (requireAdmin && !user.isAdmin) return null;
  if (requireTherapist && !user.isTherapist) return null;

  return <>{children}</>;
}
