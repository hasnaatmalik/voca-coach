import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature, transferToTherapist } from '@/lib/stripe';
import Stripe from 'stripe';

// Platform fee percentage (10%)
const PLATFORM_FEE_PERCENT = 10;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(paymentIntent);
        break;
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        await handleAccountUpdate(account);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { sessionId, therapistId } = paymentIntent.metadata;

  // Update payment record
  const payment = await prisma.payment.updateMany({
    where: { stripePaymentIntentId: paymentIntent.id },
    data: { status: 'succeeded' },
  });

  if (!payment.count) {
    console.error('Payment record not found for:', paymentIntent.id);
    return;
  }

  // Update session status if applicable
  if (sessionId) {
    await prisma.therapySession.update({
      where: { id: sessionId },
      data: { status: 'paid' },
    });
  }

  // Transfer to therapist if they have a connected account
  if (therapistId) {
    const therapist = await prisma.user.findUnique({
      where: { id: therapistId },
      select: { stripeAccountId: true },
    });

    if (therapist?.stripeAccountId) {
      // Calculate therapist payout (amount minus platform fee)
      const platformFee = Math.round(paymentIntent.amount * (PLATFORM_FEE_PERCENT / 100));
      const therapistAmount = paymentIntent.amount - platformFee;

      try {
        await transferToTherapist(
          therapistAmount,
          therapist.stripeAccountId,
          `Payment for session ${sessionId}`
        );

        // Create a record of the transfer
        await prisma.payment.create({
          data: {
            userId: therapistId,
            therapistId,
            amount: therapistAmount,
            currency: 'usd',
            status: 'succeeded',
            type: 'payout',
            description: `Payout for session ${sessionId}`,
          },
        });
      } catch (transferError) {
        console.error('Transfer to therapist failed:', transferError);
        // Log but don't fail - can be retried manually
      }
    }
  }

  console.log('Payment succeeded:', paymentIntent.id);
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  // Update payment record
  await prisma.payment.updateMany({
    where: { stripePaymentIntentId: paymentIntent.id },
    data: { status: 'failed' },
  });

  console.log('Payment failed:', paymentIntent.id);
}

async function handleAccountUpdate(account: Stripe.Account) {
  // Update therapist's account status
  if (account.charges_enabled) {
    await prisma.user.updateMany({
      where: { stripeAccountId: account.id },
      data: {
        // Could add a field for account status if needed
      },
    });
    console.log('Therapist account activated:', account.id);
  }
}
