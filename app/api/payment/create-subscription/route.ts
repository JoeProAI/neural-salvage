import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user is beta user
    const userDoc = await adminDb().collection('users').doc(userId).get();
    const user = userDoc.data();

    if (user?.isBetaUser) {
      return NextResponse.json({
        error: 'Beta users have free access to all features',
        isBetaUser: true,
      }, { status: 400 });
    }

    // Get or create Stripe customer
    let customerId = user?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId,
        },
      });
      customerId = customer.id;

      // Save customer ID to user
      await adminDb().collection('users').doc(userId).update({
        stripeCustomerId: customerId,
        updatedAt: new Date(),
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Neural Salvage Pro',
              description: 'Unlimited AI analyses + 10 free NFT mints/month',
            },
            unit_amount: 999, // $9.99
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard?subscription=success`,
      cancel_url: `${appUrl}/pricing?subscription=canceled`,
      metadata: {
        userId,
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
