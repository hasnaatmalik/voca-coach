'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/hooks/useAuth';
import { SocketProvider } from '@/hooks/useSocket';
import { GlobalVideoCallProvider } from '@/components/GlobalVideoCallProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SocketProvider>
        <GlobalVideoCallProvider>
          {children}
        </GlobalVideoCallProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
