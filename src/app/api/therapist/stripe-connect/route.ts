import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createConnectAccount, createAccountLink, stripe } from '@/lib/stripe';

// GET /api/therapist/stripe-connect - Get connect account status
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'therapist') {
      return NextResponse.json({ error: 'Only therapists can access this' }, { status: 403 });
    }

    if (!user.stripeAccountId) {
      return NextResponse.json({
        connected: false,
        onboardingComplete: false,
      });
    }

    // Get account status from Stripe
    try {
      const account = await stripe.accounts.retrieve(user.stripeAccountId);

      return NextResponse.json({
        connected: true,
        onboardingComplete: account.charges_enabled && account.payouts_enabled,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        accountId: account.id,
      });
    } catch {
      // Account may have been deleted
      return NextResponse.json({
        connected: false,
        onboardingComplete: false,
      });
    }
  } catch (error) {
    console.error('Error fetching connect status:', error);
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}

// POST /api/therapist/stripe-connect - Create or continue onboarding
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'therapist') {
      return NextResponse.json({ error: 'Only therapists can access this' }, { status: 403 });
    }

    const { returnUrl, refreshUrl } = await req.json();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const finalReturnUrl = returnUrl || `${baseUrl}/therapist/settings?stripe=success`;
    const finalRefreshUrl = refreshUrl || `${baseUrl}/therapist/settings?stripe=refresh`;

    let accountId = user.stripeAccountId;

    // Create new account if doesn't exist
    if (!accountId) {
      const account = await createConnectAccount(user.email);
      accountId = account.id;

      // Save account ID to user
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeAccountId: accountId },
      });
    }

    // Create account link for onboarding
    const accountLink = await createAccountLink(
      accountId,
      finalRefreshUrl,
      finalReturnUrl
    );

    return NextResponse.json({
      url: accountLink.url,
      accountId,
    });
  } catch (error) {
    console.error('Error creating connect account:', error);
    return NextResponse.json({ error: 'Failed to create connect account' }, { status: 500 });
  }
}

// DELETE /api/therapist/stripe-connect - Disconnect account (for testing)
export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'therapist') {
      return NextResponse.json({ error: 'Only therapists can access this' }, { status: 403 });
    }

    if (!user.stripeAccountId) {
      return NextResponse.json({ error: 'No connected account' }, { status: 400 });
    }

    // Note: We don't delete the Stripe account, just remove the link
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeAccountId: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting account:', error);
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
  }
}
