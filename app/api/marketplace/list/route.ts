import { NextRequest, NextResponse } from 'next/server';
import { createListingTransaction } from '@/lib/marketplace/bazar';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetId, price, currency, duration, walletAddress } = body;

    // Validate input
    if (!assetId || !price || !currency || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('📝 [API] Creating listing transaction:', {
      assetId,
      price,
      currency,
      duration,
      walletAddress,
    });

    // Create unsigned transaction
    const transaction = await createListingTransaction({
      assetId,
      price,
      currency,
      duration: duration || 0,
      walletAddress,
    });

    console.log('✅ [API] Transaction created:', transaction.id);

    // Return transaction for client to sign
    return NextResponse.json({
      success: true,
      transaction: transaction,
      transactionId: transaction.id,
    });
  } catch (error: any) {
    console.error('❌ [API] Error creating listing:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create listing' },
      { status: 500 }
    );
  }
}
