/**
 * NFT Cost Estimation API
 * GET /api/nft/estimate?assetId=xxx
 * 
 * Returns cost estimate for minting an asset as NFT
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { calculateUploadCost, getArweavePrice } from '@/lib/nft/arweave';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');

    if (!assetId) {
      return NextResponse.json(
        { error: 'assetId is required' },
        { status: 400 }
      );
    }

    // Get asset from Firestore
    const assetDoc = await adminDb().collection('assets').doc(assetId).get();

    if (!assetDoc.exists) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    const asset = assetDoc.data();

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset data is invalid' },
        { status: 400 }
      );
    }

    // Check if already minted
    if (asset.isNFT) {
      return NextResponse.json(
        {
          alreadyMinted: true,
          nftId: asset.nftId,
          message: 'This asset is already minted as an NFT',
        },
        { status: 200 }
      );
    }

    // Calculate costs
    const fileSize = asset.size;
    const arweavePrice = await getArweavePrice();
    const uploadCost = await calculateUploadCost(fileSize);

    // Platform fee (if any)
    const platformFeeUSD = 0.10; // Small fee to cover costs
    const totalCostUSD = parseFloat(uploadCost.usd) + platformFeeUSD;

    return NextResponse.json({
      success: true,
      estimate: {
        assetId,
        fileSize,
        fileSizeMB: (fileSize / 1024 / 1024).toFixed(2),
        blockchain: 'arweave',
        costs: {
          arweave: {
            ar: uploadCost.ar,
            usd: uploadCost.usd,
          },
          platformFee: {
            usd: platformFeeUSD.toFixed(2),
          },
          total: {
            usd: totalCostUSD.toFixed(2),
          },
        },
        arweavePrice: {
          usd: arweavePrice.toFixed(2),
        },
        benefits: [
          'Permanent storage (200+ years guaranteed)',
          'True decentralization',
          'One-time payment, no recurring fees',
          'Tradeable on any Arweave-compatible marketplace',
          'Verifiable ownership on blockchain',
        ],
        notes: [
          'Cost is paid once and includes permanent storage',
          'No gas fees (unlike Ethereum)',
          'NFT can be transferred to any Arweave wallet',
        ],
      },
    });
  } catch (error: any) {
    console.error('NFT estimation error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to estimate NFT cost',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
