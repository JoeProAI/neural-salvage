import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { mintArweaveNFTHybrid } from '@/lib/nft/arweave-hybrid';
import { mintNFTOnPolygon, createOpenSeaMetadata } from '@/lib/nft/polygon';
import admin from 'firebase-admin';

/**
 * Dual-Chain NFT Minting API
 * 
 * Mints NFT on BOTH:
 * 1. Arweave - for permanent storage
 * 2. Polygon - for OpenSea marketplace access
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetId, userId, metadata, userWalletAddress } = body;

    console.log('🎨 [DUAL-CHAIN MINT] Starting dual-chain minting process...');
    console.log('🎨 [DUAL-CHAIN MINT] Asset ID:', assetId);
    console.log('🎨 [DUAL-CHAIN MINT] User ID:', userId);

    // Validate inputs
    if (!assetId || !userId || !metadata) {
      return NextResponse.json(
        { error: 'Missing required fields: assetId, userId, metadata' },
        { status: 400 }
      );
    }

    // Get asset from Firebase
    const assetDoc = await adminDb().collection('assets').doc(assetId).get();
    if (!assetDoc.exists) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    const asset = assetDoc.data();
    console.log('📦 [DUAL-CHAIN MINT] Asset type:', asset?.type);

    // STEP 1: Mint on Arweave (permanent storage)
    console.log('');
    console.log('🔶 [STEP 1/2] Minting on Arweave for permanent storage...');
    
    const arweaveResult = await mintArweaveNFTHybrid({
      assetId,
      userId,
      metadata: {
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        attributes: metadata.attributes || [],
        external_url: metadata.external_url,
      },
    });

    console.log('✅ [ARWEAVE] Minted successfully!');
    console.log('   Transaction ID:', arweaveResult.arweaveId);
    console.log('   Asset URL:', arweaveResult.assetUrl);
    console.log('   Metadata URL:', arweaveResult.metadataUrl);

    // STEP 2: Mint on Polygon (marketplace access)
    console.log('');
    console.log('🔷 [STEP 2/2] Minting on Polygon for OpenSea access...');

    // Create OpenSea-compatible metadata
    const openSeaMetadata = createOpenSeaMetadata(arweaveResult.assetUrl, {
      name: metadata.name,
      description: metadata.description,
      attributes: metadata.attributes,
      animation_url: asset?.type === 'audio' || asset?.type === 'video' 
        ? arweaveResult.assetUrl 
        : undefined,
      external_url: `${process.env.NEXT_PUBLIC_APP_URL}/nft/${arweaveResult.arweaveId}`,
    });

    // Upload OpenSea metadata to Arweave too (for decentralization)
    const metadataResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/nft/upload-metadata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metadata: openSeaMetadata }),
    });

    if (!metadataResponse.ok) {
      throw new Error('Failed to upload OpenSea metadata');
    }

    const { metadataUrl } = await metadataResponse.json();
    console.log('📋 [METADATA] OpenSea metadata uploaded:', metadataUrl);

    // Mint on Polygon
    const polygonResult = await mintNFTOnPolygon({
      recipientAddress: userWalletAddress || userId, // Use wallet address or fallback to userId
      metadataURI: metadataUrl,
      arweaveId: arweaveResult.arweaveId,
      royaltyPercentage: 500, // 5% royalty
    });

    console.log('✅ [POLYGON] Minted successfully!');
    console.log('   Token ID:', polygonResult.tokenId);
    console.log('   OpenSea URL:', polygonResult.openseaUrl);
    console.log('   Transaction:', polygonResult.transactionHash);

    // STEP 3: Save combined NFT data to Firebase
    console.log('');
    console.log('💾 [FIREBASE] Saving dual-chain NFT data...');

    const now = admin.firestore.Timestamp.now();
    const nftId = arweaveResult.arweaveId; // Use Arweave ID as primary ID

    const nftData = {
      id: nftId,
      assetId,
      userId,
      blockchain: 'dual-chain', // NEW: indicates both Arweave + Polygon
      status: 'confirmed',
      
      // Arweave data
      arweave: {
        arweaveId: arweaveResult.arweaveId,
        arweaveUrl: `https://arweave.net/${arweaveResult.arweaveId}`,
        assetUrl: arweaveResult.assetUrl,
        metadataUrl: arweaveResult.metadataUrl,
        manifestId: arweaveResult.arweaveId,
        uploadCost: arweaveResult.uploadCost || 0,
        uploadedAt: now,
        confirmedAt: now,
      },
      
      // Polygon data (NEW!)
      polygon: {
        tokenId: polygonResult.tokenId,
        contractAddress: polygonResult.contractAddress,
        transactionHash: polygonResult.transactionHash,
        openseaUrl: polygonResult.openseaUrl,
        polygonscanUrl: polygonResult.polygonscanUrl,
        chainId: 137, // Polygon mainnet
        network: 'polygon',
        mintedAt: now,
      },
      
      // Metadata
      metadata: {
        name: metadata.name,
        description: metadata.description,
        image: arweaveResult.assetUrl,
        attributes: metadata.attributes || [],
        external_url: `${process.env.NEXT_PUBLIC_APP_URL}/nft/${nftId}`,
      },
      
      // NFT info
      metadataUri: metadataUrl,
      currentOwner: userWalletAddress || userId,
      originalMinter: userId,
      royaltyPercentage: 5,
      transfers: [],
      isVerified: true,
      verifiedAt: now,
      createdAt: now,
      updatedAt: now,
      
      // Marketplace flags
      isListed: false,
      availableOn: ['opensea', 'rarible', 'internal'], // NEW: marketplace availability
    };

    await adminDb().collection('nfts').doc(nftId).set(nftData);
    console.log('✅ [FIREBASE] NFT data saved');

    // Update asset with NFT ID
    await adminDb().collection('assets').doc(assetId).update({
      nftId,
      mintedAt: now,
      status: 'minted',
    });

    console.log('');
    console.log('🎉 [DUAL-CHAIN MINT] Complete!');
    console.log('   🔶 Arweave: Permanent storage');
    console.log('   🔷 Polygon: OpenSea marketplace');
    console.log('   📱 View on OpenSea:', polygonResult.openseaUrl);

    return NextResponse.json({
      success: true,
      message: 'NFT minted on both Arweave and Polygon!',
      nft: {
        id: nftId,
        arweave: {
          transactionId: arweaveResult.arweaveId,
          url: arweaveResult.assetUrl,
        },
        polygon: {
          tokenId: polygonResult.tokenId,
          openseaUrl: polygonResult.openseaUrl,
          transactionHash: polygonResult.transactionHash,
        },
      },
    });
  } catch (error: any) {
    console.error('❌ [DUAL-CHAIN MINT] Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Dual-chain mint failed',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
