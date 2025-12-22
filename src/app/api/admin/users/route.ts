import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isTherapist: true,
          isAdmin: true,
          isSuperAdmin: true,
          createdAt: true,
          _count: {
            select: {
              sessions: true,
              journalEntries: true,
              therapySessions: true,
              therapistSessions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Admin users list error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();

    const { userId, updates } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate updates
    const allowedUpdates: any = {};
    if (typeof updates.isTherapist !== 'undefined') {
      allowedUpdates.isTherapist = updates.isTherapist;
      allowedUpdates.role = updates.isTherapist ? 'therapist' : 'user';
    }
    if (typeof updates.isAdmin !== 'undefined') {
      allowedUpdates.isAdmin = updates.isAdmin;
      if (updates.isAdmin) {
        allowedUpdates.role = 'admin';
      }
    }
    if (typeof updates.isSuperAdmin !== 'undefined') {
      allowedUpdates.isSuperAdmin = updates.isSuperAdmin;
      if (updates.isSuperAdmin) {
        allowedUpdates.isAdmin = true; // Superadmins are also admins
        allowedUpdates.role = 'superadmin';
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: allowedUpdates,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isTherapist: true,
        isAdmin: true,
        isSuperAdmin: true,
      },
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('Admin user update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    );
  }
}
