'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { initializeSocket, disconnectSocket, getSocket, isSocketConnected } from '@/lib/socket-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@/lib/socket-events';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SocketContextType {
  socket: TypedSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: (token: string) => Promise<void>;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<TypedSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (token: string) => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setError(null);

    try {
      const newSocket = await initializeSocket(token);
      setSocket(newSocket);
      setIsConnected(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
      setError(errorMessage);
      console.error('Socket connection failed:', errorMessage);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, isConnected]);

  const disconnect = useCallback(() => {
    disconnectSocket();
    setSocket(null);
    setIsConnected(false);
    setError(null);
  }, []);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnect = (reason: string) => {
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        setError('Disconnected by server');
      }
    };

    const handleConnectError = (err: Error) => {
      setError(err.message);
      setIsConnected(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, [socket]);

  // Check initial connection state
  useEffect(() => {
    const existingSocket = getSocket();
    if (existingSocket && isSocketConnected()) {
      setSocket(existingSocket);
      setIsConnected(true);
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, isConnecting, error, connect, disconnect }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

// Hook for joining/leaving rooms
export function useSocketRoom(roomType: 'session' | 'conversation', roomId: string | null) {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected || !roomId) return;

    const joinEvent = roomType === 'session' ? 'join:session' : 'join:conversation';
    const leaveEvent = roomType === 'session' ? 'leave:session' : 'leave:conversation';

    socket.emit(joinEvent, roomId);

    return () => {
      socket.emit(leaveEvent, roomId);
    };
  }, [socket, isConnected, roomType, roomId]);
}

// Hook for notifications
export function useNotifications(onNotification?: (notification: ServerToClientEvents['notification:new'] extends (n: infer N) => void ? N : never) => void) {
  const { socket, isConnected } = useSocket();
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    data?: string;
    createdAt: string;
  }>>([]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNotification = (notification: {
      id: string;
      type: string;
      title: string;
      message: string;
      data?: string;
      createdAt: string;
    }) => {
      setNotifications(prev => [notification, ...prev]);
      onNotification?.(notification);
    };

    socket.on('notification:new', handleNotification);

    return () => {
      socket.off('notification:new', handleNotification);
    };
  }, [socket, isConnected, onNotification]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return { notifications, clearNotifications };
}
