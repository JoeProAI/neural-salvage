/**
 * Arweave NFT Service
 * Handles real blockchain NFT minting on Arweave using Bundlr
 * 
 * This is NOT fake - these are real, permanent NFTs
 */

import { default as Bundlr } from '@bundlr-network/client';
import type { NFTMetadata } from '@/types';

// Bundlr configuration
const BUNDLR_NODE = 'https://node2.bundlr.network';
const BUNDLR_CURRENCY = 'arweave';

/**
 * Initialize Bundlr client with user's wallet
 * User must have ArConnect wallet installed
 */
export async function initBundlr(walletPrivateKey?: string) {
  try {
    // For server-side uploads, use platform wallet
    if (walletPrivateKey) {
      console.log('🔑 [BUNDLR] Initializing with wallet key...');
      
      // Validate key format
      if (!walletPrivateKey || walletPrivateKey.trim().length === 0) {
        throw new Error('ARWEAVE_PRIVATE_KEY is empty');
      }
      
      // Try to parse as JSON to validate JWK format
      let jwk;
      try {
        jwk = typeof walletPrivateKey === 'string' 
          ? JSON.parse(walletPrivateKey) 
          : walletPrivateKey;
          
        console.log('✅ [BUNDLR] JWK parsed successfully');
      } catch (parseError) {
        console.error('❌ [BUNDLR] Failed to parse JWK:', parseError);
        throw new Error('ARWEAVE_PRIVATE_KEY is not valid JSON. Expected JWK format.');
      }
      
      // Validate required JWK fields
      const requiredFields = ['kty', 'n', 'e', 'd', 'p', 'q', 'dp', 'dq', 'qi'];
      const missingFields = requiredFields.filter(field => !jwk[field]);
      if (missingFields.length > 0) {
        throw new Error(`Invalid JWK: missing fields: ${missingFields.join(', ')}`);
      }
      
      console.log('✅ [BUNDLR] JWK validation passed');
      
      const bundlr = new Bundlr(
        BUNDLR_NODE,
        BUNDLR_CURRENCY,
        jwk
      );
      
      console.log('⏳ [BUNDLR] Connecting to network...');
      await bundlr.ready();
      console.log('✅ [BUNDLR] Connected successfully');
      
      // Check Bundlr balance and auto-fund if needed
      const balance = await bundlr.getLoadedBalance();
      const balanceInAR = bundlr.utils.fromAtomic(balance).toString();
      console.log(`💰 [BUNDLR] Current balance: ${balanceInAR} AR`);
      
      // If balance is too low, fund it with 0.5 AR
      const minimumBalance = 0.1; // AR
      if (parseFloat(balanceInAR) < minimumBalance) {
        console.log(`⚠️ [BUNDLR] Balance below minimum (${minimumBalance} AR), funding...`);
        
        const fundAmount = bundlr.utils.toAtomic('0.5'); // Fund with 0.5 AR
        console.log(`💸 [BUNDLR] Funding with 0.5 AR...`);
        
        const fundTx = await bundlr.fund(fundAmount);
        console.log(`✅ [BUNDLR] Funded successfully! TX: ${fundTx.id}`);
        
        // Wait for balance to update (Bundlr needs time to confirm)
        console.log(`⏳ [BUNDLR] Waiting for balance confirmation...`);
        
        let newBalanceInAR = '0';
        let retries = 0;
        const maxRetries = 10;
        
        while (parseFloat(newBalanceInAR) < minimumBalance && retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          const newBalance = await bundlr.getLoadedBalance();
          newBalanceInAR = bundlr.utils.fromAtomic(newBalance).toString();
          retries++;
          console.log(`💰 [BUNDLR] Balance check ${retries}/${maxRetries}: ${newBalanceInAR} AR`);
        }
        
        if (parseFloat(newBalanceInAR) < minimumBalance) {
          throw new Error(`Bundlr funding failed to confirm after ${maxRetries} attempts. Balance: ${newBalanceInAR} AR`);
        }
        
        console.log(`✅ [BUNDLR] Balance confirmed: ${newBalanceInAR} AR`);
      } else {
        console.log(`✅ [BUNDLR] Balance sufficient for minting`);
      }
      
      return bundlr;
    }
    
    // For client-side, user connects their wallet
    // This will be handled in the frontend with ArConnect
    throw new Error('Wallet required for client-side minting');
  } catch (error: any) {
    console.error('❌ [BUNDLR] Initialization failed:', {
      error: error.message,
      stack: error.stack,
      keyProvided: !!walletPrivateKey,
      keyLength: walletPrivateKey?.length
    });
    throw error;
  }
}

/**
 * Get current Arweave price in USD
 * Used to show users the cost before minting
 */
export async function getArweavePrice(): Promise<number> {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=arweave&vs_currencies=usd');
    const data = await response.json();
    return data.arweave.usd;
  } catch (error) {
    console.error('Failed to get Arweave price:', error);
    // Default to $10 if API fails
    return 10;
  }
}

/**
 * Calculate cost to upload data to Arweave
 * @param sizeInBytes File size in bytes
 * @returns Cost in AR tokens and USD
 */
export async function calculateUploadCost(sizeInBytes: number): Promise<{
  ar: string;
  usd: string;
}> {
  try {
    // Estimate: ~$5-10 per GB
    // More accurate: Query Bundlr price feed
    const bytesPerAR = 10737418240; // ~10GB per AR (approximate)
    const arCost = sizeInBytes / bytesPerAR;
    const arPrice = await getArweavePrice();
    const usdCost = arCost * arPrice;
    
    return {
      ar: arCost.toFixed(6),
      usd: usdCost.toFixed(2),
    };
  } catch (error) {
    console.error('Failed to calculate upload cost:', error);
    return { ar: '0.001', usd: '0.10' };
  }
}

/**
 * Upload file to Arweave permanently
 * @param fileBuffer File data as buffer
 * @param mimeType MIME type of file
 * @param tags Additional Arweave tags
 * @returns Arweave transaction ID
 */
export async function uploadToArweave(
  bundlr: any,
  fileBuffer: Buffer,
  mimeType: string,
  tags: Array<{ name: string; value: string }>
): Promise<{
  txId: string;
  url: string;
  cost: number;
}> {
  try {
    console.log('Uploading to Arweave...', {
      size: fileBuffer.length,
      mimeType,
      tagsCount: tags.length,
    });
    
    // Add content type tag
    const allTags = [
      { name: 'Content-Type', value: mimeType },
      ...tags,
    ];
    
    // Upload to Arweave via Bundlr
    const transaction = await bundlr.upload(fileBuffer, {
      tags: allTags,
    });
    
    const txId = transaction.id;
    const url = `https://arweave.net/${txId}`;
    
    console.log('Upload successful:', { txId, url });
    
    return {
      txId,
      url,
      cost: parseFloat(bundlr.utils.fromAtomic(transaction.reward)),
    };
  } catch (error) {
    console.error('Failed to upload to Arweave:', error);
    throw error;
  }
}

/**
 * Upload NFT metadata to Arweave
 * Metadata must be stored on-chain for the NFT to be valid
 */
export async function uploadMetadata(
  bundlr: any,
  metadata: NFTMetadata
): Promise<{
  metadataId: string;
  metadataUrl: string;
}> {
  try {
    const metadataBuffer = Buffer.from(JSON.stringify(metadata, null, 2));
    
    const transaction = await bundlr.upload(metadataBuffer, {
      tags: [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'App-Name', value: 'Neural-Salvage' },
        { name: 'Type', value: 'nft-metadata' },
      ],
    });
    
    return {
      metadataId: transaction.id,
      metadataUrl: `https://arweave.net/${transaction.id}`,
    };
  } catch (error) {
    console.error('Failed to upload metadata:', error);
    throw error;
  }
}

/**
 * Create Arweave Atomic NFT
 * This is a REAL NFT - asset + metadata in permanent storage
 * 
 * Atomic NFT = Asset data + NFT metadata in single Arweave manifest
 */
export async function mintArweaveNFT(
  bundlr: any,
  assetBuffer: Buffer,
  assetMimeType: string,
  metadata: NFTMetadata,
  creatorAddress: string
): Promise<{
  assetId: string;
  assetUrl: string;
  metadataId: string;
  metadataUrl: string;
  manifestId: string;
  manifestUrl: string;
  totalCost: number;
}> {
  try {
    console.log('Minting Arweave Atomic NFT...');
    
    // Step 1: Upload asset to Arweave
    const assetUpload = await uploadToArweave(
      bundlr,
      assetBuffer,
      assetMimeType,
      [
        { name: 'App-Name', value: 'Neural-Salvage' },
        { name: 'Type', value: 'nft-asset' },
        { name: 'Creator', value: creatorAddress },
      ]
    );
    
    // Step 2: Update metadata with asset URL
    const fullMetadata: NFTMetadata = {
      ...metadata,
      image: assetUpload.url,
      external_url: metadata.external_url || `https://neural-salvage.com/nft/${assetUpload.txId}`,
    };
    
    // Step 3: Upload metadata
    const metadataUpload = await uploadMetadata(bundlr, fullMetadata);
    
    // Step 4: Create manifest (links asset + metadata)
    const manifest = {
      manifest: 'arweave/paths',
      version: '0.2.0',
      index: {
        path: 'metadata.json',
      },
      paths: {
        'metadata.json': {
          id: metadataUpload.metadataId,
        },
        'asset': {
          id: assetUpload.txId,
        },
      },
    };
    
    const manifestBuffer = Buffer.from(JSON.stringify(manifest));
    const manifestUpload = await uploadToArweave(
      bundlr,
      manifestBuffer,
      'application/x.arweave-manifest+json',
      [
        { name: 'App-Name', value: 'Neural-Salvage' },
        { name: 'Type', value: 'nft-manifest' },
        { name: 'NFT-Standard', value: 'atomic' },
        { name: 'Creator', value: creatorAddress },
      ]
    );
    
    const totalCost = assetUpload.cost + metadataUpload.metadataId.length / 1000000; // Approximate
    
    console.log('NFT minted successfully!', {
      manifestId: manifestUpload.txId,
      totalCost,
    });
    
    return {
      assetId: assetUpload.txId,
      assetUrl: assetUpload.url,
      metadataId: metadataUpload.metadataId,
      metadataUrl: metadataUpload.metadataUrl,
      manifestId: manifestUpload.txId,
      manifestUrl: manifestUpload.url,
      totalCost,
    };
  } catch (error) {
    console.error('Failed to mint Arweave NFT:', error);
    throw error;
  }
}

/**
 * Verify an NFT exists on Arweave
 * Returns true if the transaction is confirmed on-chain
 */
export async function verifyNFT(txId: string): Promise<boolean> {
  try {
    const response = await fetch(`https://arweave.net/tx/${txId}/status`);
    const data = await response.json();
    return data.confirmed !== null;
  } catch (error) {
    console.error('Failed to verify NFT:', error);
    return false;
  }
}

/**
 * Get NFT data from Arweave
 * Fetches the actual on-chain data
 */
export async function getNFTData(txId: string): Promise<any> {
  try {
    const response = await fetch(`https://arweave.net/${txId}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to get NFT data:', error);
    throw error;
  }
}
