import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { stripeConnect } from '@/lib/stripe/connect';

export async function POST(request: NextRequest) {
  try {
    const { assetId, buyerId } = await request.json();

    if (!assetId || !buyerId) {
      return NextResponse.json(
        { error: 'Asset ID and buyer ID are required' },
        { status: 400 }
      );
    }

    // Get asset details
    const assetDoc = await adminDb().collection('assets').doc(assetId).get();
    
    if (!assetDoc.exists) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    const asset = assetDoc.data();

    // Verify asset is for sale
    if (!asset?.forSale || asset.sold) {
      return NextResponse.json(
        { error: 'Asset is not available for purchase' },
        { status: 400 }
      );
    }

    // Get seller's Stripe account
    const sellerDoc = await adminDb().collection('users').doc(asset.userId).get();
    const seller = sellerDoc.data();

    if (!seller?.stripeAccountId) {
      return NextResponse.json(
        { error: 'Seller has not set up payments' },
        { status: 400 }
      );
    }

    // Create checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const session = await stripeConnect.createCheckoutSession(
      assetId,
      asset.filename,
      asset.price,
      seller.stripeAccountId,
      `${appUrl}/marketplace/success?session_id={CHECKOUT_SESSION_ID}`,
      `${appUrl}/marketplace/${assetId}`
    );

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Checkout failed' },
      { status: 500 }
    );
  }
}