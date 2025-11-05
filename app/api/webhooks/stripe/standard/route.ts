import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const type = session.metadata?.type;
  const assetId = session.metadata?.assetId;

  if (!userId) {
    console.error('Missing userId in session metadata');
    return;
  }

  // If it's a subscription checkout
  if (session.mode === 'subscription') {
    // Subscription will be handled by subscription.created webhook
    return;
  }

  // Handle one-time payments (NFT mint or AI analysis)
  if (type === 'nft_mint' && assetId) {
    // Create pending NFT mint record
    await adminDb().collection('pending_mints').doc(assetId).set({
      userId,
      assetId,
      status: 'paid',
      sessionId: session.id,
      paymentIntentId: session.payment_intent,
      createdAt: new Date(),
    });

    console.log('NFT mint payment completed:', assetId);
  } else if (type === 'ai_analysis' && assetId) {
    // Create pending AI analysis record
    await adminDb().collection('pending_analyses').doc(assetId).set({
      userId,
      assetId,
      status: 'paid',
      sessionId: session.id,
      paymentIntentId: session.payment_intent,
      createdAt: new Date(),
    });

    console.log('AI analysis payment completed:', assetId);
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  const status = subscription.status;
  const plan = status === 'active' || status === 'trialing' ? 'pro' : 'free';

  await adminDb().collection('users').doc(userId).update({
    plan,
    stripeSubscriptionId: subscription.id,
    stripeSubscriptionStatus: status,
    updatedAt: new Date(),
  });

  console.log('Subscription updated:', subscription.id, status);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  await adminDb().collection('users').doc(userId).update({
    plan: 'free',
    stripeSubscriptionStatus: 'canceled',
    updatedAt: new Date(),
  });

  console.log('Subscription deleted:', subscription.id);
}
