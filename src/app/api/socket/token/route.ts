import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'voca-coach-secret-key';

// Generate a token for socket authentication
// This endpoint exchanges the httpOnly cookie auth for a token the client can use
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create a JWT token with user info for socket auth
    const socketToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        isTherapist: user.isTherapist,
        isAdmin: user.isAdmin,
        isSuperAdmin: user.isSuperAdmin,
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    return NextResponse.json({ token: socketToken });
  } catch (error) {
    console.error('Error generating socket token:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
