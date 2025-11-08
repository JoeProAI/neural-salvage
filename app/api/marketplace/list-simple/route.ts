import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import admin from 'firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { assetId, price, currency, duration, seller } = await request.json();

    // Validate
    if (!assetId || !price || !seller) {
      return NextResponse.json(
        { error: 'Missing required fields: assetId, price, seller' },
        { status: 400 }
      );
    }

    console.log('📝 [SIMPLE LIST] Creating listing:', {
      assetId,
      price,
      currency,
      duration,
      seller,
    });

    // Create listing in Firebase
    const listingId = `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = admin.firestore.Timestamp.now();
    const expiresAt = duration > 0 
      ? admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
        )
      : null;

    const listing = {
      id: listingId,
      assetId,
      seller,
      price,
      currency: currency || 'USD',
      status: 'active',
      createdAt: now,
      expiresAt,
      views: 0,
      offers: [],
    };

    await adminDb().collection('marketplace_listings').doc(listingId).set(listing);
    console.log('✅ [SIMPLE LIST] Listing created in Firebase');

    // Update NFT with listing info
    await adminDb().collection('nfts').doc(assetId).update({
      isListed: true,
      currentListing: listingId,
      listedAt: now,
      listPrice: price,
      listCurrency: currency || 'USD',
      updatedAt: now,
    });
    console.log('✅ [SIMPLE LIST] NFT updated with listing info');

    return NextResponse.json({
      success: true,
      listingId,
      message: 'NFT listed successfully! No blockchain signature required.',
      listing: {
        id: listingId,
        price,
        currency: currency || 'USD',
        expiresAt: expiresAt ? expiresAt.toDate() : null,
      },
    });
  } catch (error: any) {
    console.error('❌ [SIMPLE LIST] Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create listing',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
