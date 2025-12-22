import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from './socket-events';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: TypedSocket | null = null;

export function getSocket(): TypedSocket | null {
  return socket;
}

export async function initializeSocket(token: string): Promise<TypedSocket> {
  if (socket?.connected) {
    return socket;
  }

  // Close existing socket if any
  if (socket) {
    socket.close();
  }

  const socketUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  socket = io(socketUrl, {
    path: '/api/socketio',
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  return new Promise((resolve, reject) => {
    if (!socket) {
      reject(new Error('Socket initialization failed'));
      return;
    }

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
      resolve(socket!);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      reject(error);
    });
  });
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}
