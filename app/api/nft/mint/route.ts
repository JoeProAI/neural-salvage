/**
 * NFT Minting API
 * POST /api/nft/mint
 * 
 * Mints REAL blockchain NFTs on Arweave
 * This is NOT a fake certificate - it's permanent blockchain storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase/admin';
import { initBundlr, mintArweaveNFT } from '@/lib/nft/arweave';
import type { NFT, NFTMetadata, MintNFTRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: MintNFTRequest = await request.json();
    const { assetId, blockchain, metadata, royaltyPercentage = 10, walletAddress } = body;

    // Validate inputs
    if (!assetId || !blockchain || !metadata || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Only Arweave is supported for now
    if (blockchain !== 'arweave') {
      return NextResponse.json(
        { error: 'Only Arweave NFTs are currently supported' },
        { status: 400 }
      );
    }

    // Get asset from Firestore
    const assetRef = adminDb().collection('assets').doc(assetId);
    const assetDoc = await assetRef.get();

    if (!assetDoc.exists) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    const asset = assetDoc.data();
    const userId = asset?.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'Asset has no owner' },
        { status: 400 }
      );
    }

    // Check if already minted
    if (asset?.isNFT) {
      return NextResponse.json(
        { error: 'Asset is already minted as NFT' },
        { status: 400 }
      );
    }

    // Get user info
    const userDoc = await adminDb().collection('users').doc(userId).get();
    const user = userDoc.data();

    // Download asset from Firebase Storage
    const bucket = adminStorage().bucket();
    const file = bucket.file(asset.url.split('.com/')[1]); // Extract path from URL
    
    const [fileBuffer] = await file.download();
    
    console.log('Asset downloaded:', {
      assetId,
      size: fileBuffer.length,
      mimeType: asset.mimeType,
    });

    // Initialize Bundlr (for now, using platform wallet)
    // TODO: Support user's own wallet via ArConnect
    const bundlrPrivateKey = process.env.ARWEAVE_PRIVATE_KEY;
    
    if (!bundlrPrivateKey) {
      return NextResponse.json(
        { error: 'Arweave wallet not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const bundlr = await initBundlr(bundlrPrivateKey);

    // Prepare NFT metadata
    const nftMetadata: NFTMetadata = {
      name: metadata.name || asset.originalFilename,
      description: metadata.description || `Created by ${user?.username || 'Unknown'} on Neural Salvage`,
      image: '', // Will be set by mintArweaveNFT
      external_url: `${process.env.NEXT_PUBLIC_APP_URL}/asset/${assetId}`,
      attributes: [
        {
          trait_type: 'Creator',
          value: user?.username || 'Unknown',
        },
        {
          trait_type: 'Type',
          value: asset.type,
        },
        {
          trait_type: 'File Size',
          value: `${(asset.size / 1024 / 1024).toFixed(2)} MB`,
        },
        ...(metadata.attributes || []),
      ],
      properties: {
        files: [
          {
            uri: '', // Will be set by mintArweaveNFT
            type: asset.mimeType,
          },
        ],
        category: asset.type as 'image' | 'video' | 'audio',
        creators: [
          {
            address: walletAddress,
            share: 100,
          },
        ],
      },
    };

    // Mint the NFT on Arweave
    console.log('Minting NFT on Arweave...');
    const mintResult = await mintArweaveNFT(
      bundlr,
      fileBuffer,
      asset.mimeType,
      nftMetadata,
      walletAddress
    );

    // Create NFT document in Firestore
    const nftId = `nft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const nft: NFT = {
      id: nftId,
      assetId,
      userId,
      blockchain: 'arweave',
      status: 'confirmed',
      arweave: {
        arweaveId: mintResult.manifestId,
        arweaveUrl: mintResult.manifestUrl,
        manifestId: mintResult.manifestId,
        bundlrId: mintResult.manifestId,
        uploadCost: mintResult.totalCost,
        uploadedAt: now,
        confirmedAt: now,
      },
      metadata: {
        ...nftMetadata,
        image: mintResult.assetUrl,
      },
      metadataUri: mintResult.metadataUrl,
      currentOwner: walletAddress,
      originalMinter: walletAddress,
      royaltyPercentage,
      transfers: [],
      isVerified: true,
      verifiedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    // Save NFT to Firestore
    await adminDb().collection('nfts').doc(nftId).set(nft);

    // Update asset to mark as NFT
    await assetRef.update({
      isNFT: true,
      nftId,
      updatedAt: now,
    });

    console.log('NFT minted successfully:', {
      nftId,
      arweaveId: mintResult.manifestId,
      cost: mintResult.totalCost,
    });

    return NextResponse.json({
      success: true,
      nft: {
        id: nftId,
        arweaveId: mintResult.manifestId,
        arweaveUrl: mintResult.manifestUrl,
        metadataUrl: mintResult.metadataUrl,
        assetUrl: mintResult.assetUrl,
        cost: mintResult.totalCost,
        blockchain: 'arweave',
      },
      message: 'NFT minted successfully on Arweave blockchain',
    });
  } catch (error: any) {
    console.error('NFT minting error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to mint NFT',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
