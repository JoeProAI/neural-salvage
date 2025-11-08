/**
 * NFT Cost Estimation API
 * GET /api/nft/estimate?assetId=xxx
 * 
 * Returns cost estimate for minting an asset as NFT
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { calculateUploadCost, getArweavePrice } from '@/lib/nft/arweave';
import { calculateMintPrice, PRICE_TIERS } from '@/lib/utils/pricing';

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

    // Calculate costs using NEW pricing model
    const fileSize = asset.size;
    const fileSizeMB = fileSize / (1024 * 1024);
    
    // Get price based on file size (our new tiered pricing)
    const pricing = calculateMintPrice(fileSize); // Base price, no discount
    
    // Get actual AR cost for transparency
    const arweavePrice = await getArweavePrice();
    const uploadCost = await calculateUploadCost(fileSize);
    const actualARCostUSD = parseFloat(uploadCost.usd);

    return NextResponse.json({
      success: true,
      estimate: {
        assetId,
        fileSize,
        fileSizeMB: fileSizeMB.toFixed(2),
        blockchain: 'arweave',
        costs: {
          arweave: {
            ar: uploadCost.ar,
            usd: actualARCostUSD.toFixed(2), // Show actual AR cost
          },
          platformFee: {
            usd: pricing.platformProfit.toFixed(2), // Our profit
          },
          total: {
            usd: pricing.totalPrice.toFixed(2), // NEW PRICING: $3.99-$29.99
          },
        },
        pricing: {
          tier: pricing.tier.name,
          tierDescription: pricing.tier.description,
          basePrice: pricing.basePrice.toFixed(2),
          discount: 0,
          finalPrice: pricing.totalPrice.toFixed(2),
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
