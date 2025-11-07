/**
 * NFT Minting API - HYBRID MODEL
 * POST /api/nft/mint
 * 
 * Mints REAL blockchain NFTs on Arweave with:
 * - Platform-paid AR (from pool)
 * - User-signed ownership proof
 * - True decentralization + easy UX
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase/admin';
import { mintArweaveNFTHybridServer } from '@/lib/nft/arweave-hybrid';
import type { NFT, NFTMetadata, MintNFTRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: MintNFTRequest = await request.json();
    const { assetId, blockchain, metadata, royaltyPercentage = 10, walletAddress, userSignature } = body;

    // Validate inputs
    if (!assetId || !blockchain || !metadata || !walletAddress || !userSignature) {
      return NextResponse.json(
        { error: 'Missing required fields (need assetId, blockchain, metadata, walletAddress, userSignature)' },
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
    
    // Parse the storage path from the signed URL
    // URL format: https://storage.googleapis.com/BUCKET_NAME/PATH?params
    // We need just the PATH part
    let storagePath = asset.url;
    
    // Remove query parameters first
    if (storagePath.includes('?')) {
      storagePath = storagePath.split('?')[0];
    }
    
    // Extract path after bucket name
    // Format: https://storage.googleapis.com/nueral-salvage.firebasestorage.app/users/...
    const pathMatch = storagePath.match(/firebasestorage\.app\/(.+)$/);
    if (pathMatch) {
      storagePath = pathMatch[1];
    } else {
      // Fallback: try splitting on last occurrence of bucket name
      const parts = storagePath.split('/');
      const bucketIndex = parts.findIndex((p: string) => p.includes('firebasestorage.app'));
      if (bucketIndex >= 0 && bucketIndex < parts.length - 1) {
        storagePath = parts.slice(bucketIndex + 1).join('/');
      }
    }
    
    console.log('📦 [NFT MINT] Storage path extracted:', {
      originalUrl: asset.url,
      extractedPath: storagePath
    });
    
    const file = bucket.file(storagePath);
    const [fileBuffer] = await file.download();
    
    console.log('Asset downloaded:', {
      assetId,
      size: fileBuffer.length,
      mimeType: asset.mimeType,
    });

    // Prepare NFT metadata
    const nftMetadata: NFTMetadata = {
      name: metadata.name || asset.originalFilename,
      description: metadata.description || `Created by ${user?.username || 'Unknown'} on Neural Salvage`,
      image: '', // Will be set by hybrid mint
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

    // Mint the NFT on Arweave with user signature (platform pays AR)
    console.log('🎨 [API] Minting NFT with hybrid model (platform-paid, user-signed)...');
    const mintResult = await mintArweaveNFTHybridServer(
      fileBuffer,
      asset.mimeType,
      nftMetadata,
      walletAddress,
      userSignature,
      assetId
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

    // Clean up pending mint record (if exists)
    try {
      await adminDb().collection('pending_mints').doc(assetId).delete();
      console.log('✅ Cleaned up pending mint record for:', assetId);
    } catch (cleanupError) {
      console.warn('⚠️ Could not clean up pending mint record:', cleanupError);
      // Don't fail the whole mint if cleanup fails
    }

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
