import { NextRequest, NextResponse } from 'next/server';
import { submitListingTransaction } from '@/lib/marketplace/bazar';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction } = body;

    if (!transaction) {
      return NextResponse.json(
        { error: 'Missing transaction' },
        { status: 400 }
      );
    }

    console.log('📤 [API] Submitting signed transaction:', transaction.id);

    // Submit to Arweave
    const transactionId = await submitListingTransaction(transaction);

    console.log('✅ [API] Transaction submitted successfully:', transactionId);

    return NextResponse.json({
      success: true,
      transactionId,
      message: 'Listing created successfully! It will be visible on BazAR in 2-3 minutes.',
    });
  } catch (error: any) {
    console.error('❌ [API] Error submitting transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit transaction' },
      { status: 500 }
    );
  }
}
