import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password, name, isTherapist: isTherapistParam } = await req.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const isTherapist = isTherapistParam === true;
    
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role: isTherapist ? 'therapist' : 'user',
        isTherapist: isTherapist,
        isAdmin: false,
        isSuperAdmin: false,
      },
    });

    // Create therapist profile if signing up as therapist
    if (isTherapist) {
      await prisma.therapistProfile.create({
        data: {
          userId: user.id,
          isApproved: false,
        },
      });
    }

    // Create token and set cookie
    const token = createToken({ 
      userId: user.id, 
      email: user.email,
      role: user.role,
      isTherapist: user.isTherapist,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin
    });
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isTherapist: user.isTherapist,
        isAdmin: user.isAdmin,
        isSuperAdmin: user.isSuperAdmin,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
