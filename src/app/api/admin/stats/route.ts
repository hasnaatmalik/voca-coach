import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();

    const [
      totalUsers,
      totalTherapists,
      totalSessions,
      totalTherapySessions,
      recentUsers,
      recentTherapySessions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isTherapist: true } }),
      prisma.session.count(),
      prisma.therapySession.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.therapySession.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          scheduledAt: true,
          status: true,
          createdAt: true,
          user: {
            select: { name: true, email: true },
          },
          therapist: {
            select: { name: true, email: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalTherapists,
        totalSessions,
        totalTherapySessions,
      },
      recentUsers,
      recentTherapySessions,
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    );
  }
}
