import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, assetId, userId } = body;
    let price = body.price;

    if (!type || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user is beta user (beta users get everything free)
    const userDoc = await adminDb().collection('users').doc(userId).get();
    const user = userDoc.data();

    if (user?.isBetaUser) {
      return NextResponse.json({
        success: true,
        isBetaUser: true,
        message: 'Beta user - no payment required',
      });
    }

    // Check if user is pro subscriber
    if (user?.plan === 'pro' && user?.stripeSubscriptionStatus === 'active') {
      // Pro users get free AI analysis
      if (type === 'ai_analysis') {
        return NextResponse.json({
          success: true,
          isPro: true,
          message: 'Pro plan - AI analysis included',
        });
      }
      
      // Pro users get discounted NFT minting ($0.50 instead of $1)
      if (type === 'nft_mint') {
        // Check if they've used their 10 free mints this month
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const mintsThisMonth = await adminDb()
          .collection('nfts')
          .where('userId', '==', userId)
          .where('createdAt', '>=', monthStart)
          .count()
          .get();

        if (mintsThisMonth.data().count < 10) {
          return NextResponse.json({
            success: true,
            isPro: true,
            freeMintUsed: true,
            message: `Pro plan - Free mint ${mintsThisMonth.data().count + 1}/10 this month`,
          });
        }
        // After 10 free mints, charge $0.50
        price = 0.50;
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Determine product details based on type
    let productName: string;
    let productDescription: string;
    let amount: number;
    let successUrl: string;
    let cancelUrl: string;

    switch (type) {
      case 'nft_mint':
        productName = 'NFT Mint on Arweave';
        productDescription = 'Mint your asset as a permanent blockchain NFT';
        // Enforce Stripe minimum of $0.50, default to $2.99
        amount = Math.max(price || 2.99, 0.50);
        successUrl = `${appUrl}/api/payment/success?type=nft_mint&assetId=${assetId}&session_id={CHECKOUT_SESSION_ID}`;
        cancelUrl = `${appUrl}/gallery/${assetId}`;
        break;

      case 'ai_analysis':
        productName = 'AI Analysis';
        productDescription = 'Generate AI description and tags for your asset';
        amount = price || 1.99;
        successUrl = `${appUrl}/api/payment/success?type=ai_analysis&assetId=${assetId}&session_id={CHECKOUT_SESSION_ID}`;
        cancelUrl = `${appUrl}/gallery/${assetId}`;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid payment type' },
          { status: 400 }
        );
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              description: productDescription,
              metadata: {
                type,
                assetId: assetId || '',
                userId,
              },
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      customer_email: user?.email,
      metadata: {
        type,
        assetId: assetId || '',
        userId,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('Create checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
