import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase/admin';
import { stripeConnect } from '@/lib/stripe/connect';
import Stripe from 'stripe';

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
    const event = stripeConnect.verifyWebhookSignature(body, signature);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;

      case 'account.updated':
        await handleAccountUpdate(event.data.object as Stripe.Account);
        break;

      case 'charge.refunded':
        await handleRefund(event.data.object as Stripe.Charge);
        break;

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

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { assetId, sellerId } = paymentIntent.metadata;

  if (!assetId || !sellerId) {
    console.error('Missing metadata in payment intent');
    return;
  }

  // Get asset
  const assetDoc = await adminDb().collection('assets').doc(assetId).get();
  const asset = assetDoc.data();

  if (!asset) {
    console.error('Asset not found:', assetId);
    return;
  }

  // Create sale record
  const platformFeePercentage = parseInt(
    process.env.PLATFORM_FEE_PERCENTAGE || '10'
  );
  const amount = paymentIntent.amount / 100; // Convert from cents
  const platformFee = amount * (platformFeePercentage / 100);
  const sellerAmount = amount - platformFee;

  const saleRef = adminDb().collection('sales').doc();
  await saleRef.set({
    assetId,
    sellerId,
    buyerId: paymentIntent.metadata.buyerId || 'unknown',
    amount,
    platformFee,
    sellerAmount,
    stripePaymentIntentId: paymentIntent.id,
    status: 'completed',
    createdAt: new Date(),
    completedAt: new Date(),
  });

  // Generate secure delivery URL (signed URL with 7-day expiration)
  const bucket = adminStorage().bucket();
  const filePath = asset.url.split('/').slice(-3).join('/'); // Extract path from URL
  const file = bucket.file(filePath);

  const [signedUrl] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Update sale with delivery URL
  await saleRef.update({
    deliveryUrl: signedUrl,
    deliveryExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // Mark asset as sold
  await assetDoc.ref.update({
    sold: true,
    updatedAt: new Date(),
  });

  // Create notifications for buyer and seller
  await adminDb().collection('notifications').add({
    userId: sellerId,
    type: 'sale',
    title: 'Sale Completed!',
    message: `Your asset "${asset.filename}" was sold for $${amount}`,
    read: false,
    actionUrl: `/sales/${saleRef.id}`,
    createdAt: new Date(),
  });

  console.log('Payment processed successfully:', paymentIntent.id);
}

async function handleAccountUpdate(account: Stripe.Account) {
  const userId = account.metadata?.userId;

  if (!userId) {
    console.error('Missing userId in account metadata');
    return;
  }

  // Update user document with account status
  await adminDb()
    .collection('users')
    .doc(userId)
    .update({
      stripeAccountStatus: {
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
      },
      updatedAt: new Date(),
    });

  console.log('Account updated:', account.id);
}

async function handleRefund(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent as string;

  // Find sale by payment intent
  const salesSnapshot = await adminDb()
    .collection('sales')
    .where('stripePaymentIntentId', '==', paymentIntentId)
    .limit(1)
    .get();

  if (salesSnapshot.empty) {
    console.error('Sale not found for payment intent:', paymentIntentId);
    return;
  }

  const saleDoc = salesSnapshot.docs[0];
  const sale = saleDoc.data();

  // Update sale status
  await saleDoc.ref.update({
    status: 'refunded',
    updatedAt: new Date(),
  });

  // Mark asset as available again
  await adminDb()
    .collection('assets')
    .doc(sale.assetId)
    .update({
      sold: false,
      updatedAt: new Date(),
    });

  // Notify seller
  await adminDb().collection('notifications').add({
    userId: sale.sellerId,
    type: 'system',
    title: 'Sale Refunded',
    message: `A sale was refunded for your asset`,
    read: false,
    createdAt: new Date(),
  });

  console.log('Refund processed:', charge.id);
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