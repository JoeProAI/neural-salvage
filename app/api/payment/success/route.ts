import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');
    const type = searchParams.get('type');
    const assetId = searchParams.get('assetId');

    if (!sessionId) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Verify the session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.redirect(
        new URL(`/gallery/${assetId}?payment=failed`, request.url)
      );
    }

    // Mark payment as complete in database
    if (type === 'nft_mint' && assetId) {
      await adminDb().collection('pending_mints').doc(assetId).set({
        status: 'paid',
        sessionId,
        paidAt: new Date(),
        userId: session.metadata?.userId,
      });
      console.log(`✅ [PAYMENT] NFT mint marked as paid: ${assetId}`);
    } else if (type === 'ai_analysis' && assetId) {
      // Mark AI analysis as paid
      await adminDb().collection('pending_analyses').doc(assetId).set({
        status: 'paid',
        sessionId,
        paidAt: new Date(),
        userId: session.metadata?.userId,
      });
      
      // Also mark on the asset itself for easier checking
      await adminDb().collection('assets').doc(assetId).update({
        aiAnalysisPaid: true,
        paidAt: new Date(),
      });
      
      console.log(`✅ [PAYMENT] AI analysis marked as paid: ${assetId}`);
    }

    // Redirect based on type with success param
    if (type === 'nft_mint') {
      return NextResponse.redirect(
        new URL(`/gallery/${assetId}?payment=success&action=mint`, request.url)
      );
    } else if (type === 'ai_analysis') {
      return NextResponse.redirect(
        new URL(`/gallery/${assetId}?payment=success&action=analyze`, request.url)
      );
    }

    return NextResponse.redirect(new URL(`/gallery/${assetId}?payment=success`, request.url));
  } catch (error) {
    console.error('Payment success error:', error);
    return NextResponse.redirect(new URL('/dashboard?payment=error', request.url));
  }
}
