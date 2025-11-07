/**
 * Sync NFTs from Arweave to Firebase
 * Run this once to populate Firebase cache from blockchain
 * 
 * Usage: npx ts-node scripts/sync-nfts-from-arweave.ts <wallet-address>
 */

import { adminDb } from '../lib/firebase/admin';
import { queryNFTsBySignature, fetchNFTMetadata } from '../lib/nft/arweave-query';

async function syncNFTs(walletAddress: string, userId: string) {
  console.log('🔄 [SYNC] Starting NFT sync from Arweave to Firebase...');
  console.log('👛 [SYNC] Wallet:', walletAddress);
  console.log('👤 [SYNC] User ID:', userId);
  
  try {
    // Query Arweave for all NFTs
    console.log('⛓️ [SYNC] Querying Arweave blockchain...');
    const blockchainNFTs = await queryNFTsBySignature(walletAddress);
    console.log(`✅ [SYNC] Found ${blockchainNFTs.length} NFTs on blockchain`);
    
    if (blockchainNFTs.length === 0) {
      console.log('⚠️ [SYNC] No NFTs found for this wallet');
      return;
    }
    
    // Fetch full metadata for each
    console.log('📥 [SYNC] Fetching metadata for each NFT...');
    const nftsWithMetadata = await Promise.all(
      blockchainNFTs.map(async (nft) => {
        try {
          const metadata = await fetchNFTMetadata(nft.txId);
          return { ...nft, imageUrl: metadata?.image || nft.imageUrl };
        } catch (error) {
          console.warn(`⚠️ [SYNC] Failed to fetch metadata for ${nft.txId}:`, error);
          return nft;
        }
      })
    );
    
    // Save to Firebase
    console.log('💾 [SYNC] Saving to Firebase...');
    const batch = adminDb().batch();
    let savedCount = 0;
    
    for (const blockchainNFT of nftsWithMetadata) {
      const nftRef = adminDb().collection('nfts').doc(blockchainNFT.txId);
      
      // Check if already exists
      const existing = await nftRef.get();
      if (existing.exists) {
        console.log(`⏭️ [SYNC] NFT already in Firebase: ${blockchainNFT.txId.substring(0, 12)}...`);
        continue;
      }
      
      const nftData = {
        id: blockchainNFT.txId,
        assetId: '',
        userId: userId,
        blockchain: 'arweave',
        status: 'confirmed',
        arweave: {
          arweaveId: blockchainNFT.txId,
          arweaveUrl: blockchainNFT.manifestUrl,
          manifestId: blockchainNFT.txId,
          bundlrId: blockchainNFT.txId,
          uploadCost: 0,
          uploadedAt: new Date(blockchainNFT.timestamp * 1000),
          confirmedAt: new Date(blockchainNFT.timestamp * 1000),
        },
        metadata: {
          name: blockchainNFT.title || 'Untitled NFT',
          description: blockchainNFT.description || '',
          image: blockchainNFT.imageUrl || '',
          attributes: [],
        },
        metadataUri: `${blockchainNFT.manifestUrl}/metadata.json`,
        currentOwner: blockchainNFT.owner,
        originalMinter: blockchainNFT.creator,
        royaltyPercentage: parseInt(blockchainNFT.royalty) || 3,
        transfers: [],
        isVerified: true,
        verifiedAt: new Date(blockchainNFT.timestamp * 1000),
        createdAt: new Date(blockchainNFT.timestamp * 1000),
        updatedAt: new Date(),
      };
      
      batch.set(nftRef, nftData);
      savedCount++;
      console.log(`✅ [SYNC] Queued: ${blockchainNFT.title || 'Untitled'} (${blockchainNFT.txId.substring(0, 12)}...)`);
    }
    
    if (savedCount > 0) {
      await batch.commit();
      console.log(`🎉 [SYNC] Successfully saved ${savedCount} NFTs to Firebase!`);
    } else {
      console.log('ℹ️ [SYNC] All NFTs already synced');
    }
    
    console.log('✅ [SYNC] Sync complete!');
    
  } catch (error) {
    console.error('❌ [SYNC] Failed:', error);
    throw error;
  }
}

// Main
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: npx ts-node scripts/sync-nfts-from-arweave.ts <wallet-address> <user-id>');
  console.error('Example: npx ts-node scripts/sync-nfts-from-arweave.ts qtS7iC8WPctddWgflSkfXA8S-uNIGHP3CdaQimEYu0k abc123');
  process.exit(1);
}

const [walletAddress, userId] = args;

syncNFTs(walletAddress, userId)
  .then(() => {
    console.log('🎊 [SYNC] All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 [SYNC] Fatal error:', error);
    process.exit(1);
  });
