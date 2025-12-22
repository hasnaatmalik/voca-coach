import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const COOKIE_NAME = 'voca-coach-auth';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  isTherapist: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  name?: string;
  stripeCustomerId?: string | null;
  stripeAccountId?: string | null;
}

// Type alias for convenience - allows using user.id or user.userId
export type AuthUser = JWTPayload & { id: string };

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function createToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 12, // 12 hours
    path: '/',
  });
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  return cookie?.value || null;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getAuthToken();
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  // Add id alias for userId for convenience
  return { ...payload, id: payload.userId };
}

export async function checkIsAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.isAdmin || false;
}

export async function checkIsSuperAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.isSuperAdmin || false;
}

export async function checkIsTherapist(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.isTherapist || false;
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  if (!user.isAdmin) {
    throw new Error('Admin access required');
  }
  return user;
}

export async function requireSuperAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  if (!user.isSuperAdmin) {
    throw new Error('Superadmin access required');
  }
  return user;
}

export async function requireTherapist(): Promise<AuthUser> {
  const user = await requireAuth();
  if (!user.isTherapist) {
    throw new Error('Therapist access required');
  }
  return user;
}
