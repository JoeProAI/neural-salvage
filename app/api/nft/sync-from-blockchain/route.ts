import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import admin from 'firebase-admin';

/**
 * Sync NFT from Arweave blockchain to Firebase
 * This allows blockchain-loaded NFTs to be listed and managed
 */
export async function POST(request: NextRequest) {
  try {
    const { nftId, metadata, userId } = await request.json();

    if (!nftId || !metadata) {
      return NextResponse.json(
        { error: 'Missing required fields: nftId, metadata' },
        { status: 400 }
      );
    }

    console.log('🔄 [SYNC] Syncing NFT from blockchain to Firebase:', nftId);

    const now = admin.firestore.Timestamp.now();

    // Create NFT document in Firebase
    const nftData = {
      id: nftId,
      assetId: '', // Unknown from blockchain
      userId: userId || '',
      blockchain: 'arweave',
      status: 'confirmed',
      arweave: {
        arweaveId: nftId,
        arweaveUrl: `https://arweave.net/${nftId}`,
        manifestId: nftId,
        bundlrId: nftId,
        uploadCost: 0,
        uploadedAt: now,
        confirmedAt: now,
      },
      metadata: {
        name: metadata.name || 'Untitled NFT',
        description: metadata.description || '',
        image: metadata.image || '',
        attributes: metadata.attributes || [],
      },
      metadataUri: `https://arweave.net/${nftId}`,
      currentOwner: metadata.owner || '',
      originalMinter: metadata.creator || '',
      royaltyPercentage: 3,
      transfers: [],
      isVerified: true,
      verifiedAt: now,
      createdAt: now,
      updatedAt: now,
      syncedFromBlockchain: true, // Flag to indicate this was synced
    };

    // Check if already exists
    const existingDoc = await adminDb().collection('nfts').doc(nftId).get();
    
    if (existingDoc.exists) {
      console.log('ℹ️ [SYNC] NFT already exists in Firebase, updating...');
      await adminDb().collection('nfts').doc(nftId).update({
        metadata: nftData.metadata,
        updatedAt: now,
        syncedFromBlockchain: true,
      });
    } else {
      console.log('✅ [SYNC] Creating new NFT document in Firebase');
      await adminDb().collection('nfts').doc(nftId).set(nftData);
    }

    return NextResponse.json({
      success: true,
      message: 'NFT synced from blockchain to Firebase',
      nftId,
    });
  } catch (error: any) {
    console.error('❌ [SYNC] Error syncing NFT:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to sync NFT from blockchain',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
