import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  SESSION_PRICES,
  createSessionPayment,
  getOrCreateCustomer,
} from '@/lib/stripe';

// GET /api/payments - Get payment history
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const payments = await prisma.payment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        session: {
          select: {
            id: true,
            scheduledAt: true,
            therapist: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

// POST /api/payments - Create payment for session
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, duration } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    // Get session
    const session = await prisma.therapySession.findFirst({
      where: { id: sessionId, userId: user.id },
      include: {
        therapist: {
          include: { therapistProfile: true },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Calculate amount
    const sessionDuration = duration || session.duration;
    const basePrice = SESSION_PRICES[sessionDuration as keyof typeof SESSION_PRICES] || SESSION_PRICES[60];
    const therapistRate = session.therapist.therapistProfile?.hourlyRate;
    const amount = therapistRate ? Math.round(therapistRate * 100 * (sessionDuration / 60)) : basePrice;

    // Get or create Stripe customer
    const customer = await getOrCreateCustomer(
      user.email,
      user.name || 'Unknown',
      user.stripeCustomerId || undefined
    );

    // Update user with customer ID if new
    if (!user.stripeCustomerId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customer.id },
      });
    }

    // Create payment intent
    const paymentIntent = await createSessionPayment(amount, 'usd', {
      sessionId,
      userId: user.id,
      therapistId: session.therapistId,
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        sessionId,
        userId: user.id,
        therapistId: session.therapistId,
        amount,
        currency: 'usd',
        status: 'pending',
        stripePaymentIntentId: paymentIntent.id,
        type: 'session',
        description: `Therapy session with ${session.therapist.name}`,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
      amount,
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
