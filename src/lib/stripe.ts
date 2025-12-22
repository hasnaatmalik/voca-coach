import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null;

function getStripeInstance(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('Missing STRIPE_SECRET_KEY. Payment features require a valid Stripe key.');
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
    });
  }
  return stripeInstance;
}

// Export a proxy that lazily initializes Stripe
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return getStripeInstance()[prop as keyof Stripe];
  },
});

// Session pricing
export const SESSION_PRICES = {
  30: 5000, // $50.00
  45: 7000, // $70.00
  60: 9000, // $90.00
  90: 12000, // $120.00
} as const;

// Create a payment intent for a therapy session
export async function createSessionPayment(
  amount: number,
  currency: string = 'usd',
  metadata: Record<string, string>
) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return paymentIntent;
}

// Create a customer in Stripe
export async function createCustomer(email: string, name: string) {
  const customer = await stripe.customers.create({
    email,
    name,
  });

  return customer;
}

// Get or create a customer
export async function getOrCreateCustomer(email: string, name: string, existingCustomerId?: string) {
  if (existingCustomerId) {
    try {
      const customer = await stripe.customers.retrieve(existingCustomerId);
      if (!customer.deleted) {
        return customer;
      }
    } catch {
      // Customer doesn't exist, create new one
    }
  }

  return createCustomer(email, name);
}

// Create a Stripe Connect account for therapists
export async function createConnectAccount(email: string) {
  const account = await stripe.accounts.create({
    type: 'express',
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  return account;
}

// Create an account link for onboarding
export async function createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });

  return accountLink;
}

// Transfer funds to therapist after session
export async function transferToTherapist(
  amount: number,
  therapistAccountId: string,
  description: string
) {
  const transfer = await stripe.transfers.create({
    amount,
    currency: 'usd',
    destination: therapistAccountId,
    description,
  });

  return transfer;
}

// Webhook signature verification
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
) {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
