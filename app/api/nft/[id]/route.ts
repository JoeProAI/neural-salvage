/**
 * NFT Details API
 * GET /api/nft/[id]
 * 
 * Returns details about a minted NFT
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyNFT } from '@/lib/nft/arweave';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const nftId = params.id;

    // Get NFT from Firestore
    const nftDoc = await adminDb().collection('nfts').doc(nftId).get();

    if (!nftDoc.exists) {
      return NextResponse.json(
        { error: 'NFT not found' },
        { status: 404 }
      );
    }

    const nft = nftDoc.data();

    if (!nft) {
      return NextResponse.json(
        { error: 'NFT data is invalid' },
        { status: 400 }
      );
    }

    // Get associated asset
    const assetDoc = await adminDb().collection('assets').doc(nft.assetId).get();
    const asset = assetDoc.exists ? assetDoc.data() : null;

    // Get owner info
    const userDoc = await adminDb().collection('users').doc(nft.userId).get();
    const user = userDoc.exists ? userDoc.data() : null;

    // Verify NFT on blockchain if it's Arweave
    let blockchainVerified = false;
    if (nft.blockchain === 'arweave' && nft.arweave?.arweaveId) {
      blockchainVerified = await verifyNFT(nft.arweave.arweaveId);
    }

    return NextResponse.json({
      success: true,
      nft: {
        ...nft,
        blockchainVerified,
        asset: asset ? {
          id: asset.id,
          filename: asset.filename,
          type: asset.type,
          url: asset.url,
          thumbnailUrl: asset.thumbnailUrl,
        } : null,
        creator: user ? {
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
        } : null,
      },
    });
  } catch (error: any) {
    console.error('NFT fetch error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch NFT',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
