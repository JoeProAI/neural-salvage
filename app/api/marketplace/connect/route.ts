import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { stripeConnect } from '@/lib/stripe/connect';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user details
    const userDoc = await adminDb().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userDoc.data();

    // Check if user already has a Stripe account
    let stripeAccountId = user?.stripeAccountId;

    if (!stripeAccountId) {
      // Create new Stripe Connect account
      const account = await stripeConnect.createConnectAccount(
        userId,
        user?.email
      );
      stripeAccountId = account.id;

      // Save to user document
      await userDoc.ref.update({
        stripeAccountId,
        updatedAt: new Date(),
      });
    }

    // Create account link for onboarding
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const onboardingUrl = await stripeConnect.createAccountLink(
      stripeAccountId,
      `${appUrl}/settings?stripe=success`,
      `${appUrl}/settings?stripe=refresh`
    );

    return NextResponse.json({
      success: true,
      onboardingUrl,
      accountId: stripeAccountId,
    });
  } catch (error: any) {
    console.error('Connect onboarding error:', error);
    return NextResponse.json(
      { error: error.message || 'Onboarding failed' },
      { status: 500 }
    );
  }
}