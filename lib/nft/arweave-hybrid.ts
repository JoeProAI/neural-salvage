/**
 * Hybrid Arweave NFT Service
 * BEST OF BOTH WORLDS - Platform pays AR, User signs for ownership
 * 
 * This approach provides:
 * - Easy UX: User doesn't need AR in wallet
 * - True ownership: User's signature proves on-chain ownership
 * - Low cost: Platform pays ~$0.05 AR per mint
 * - Profitability: $4.99 - $0.05 = $4.94 profit per mint
 * - Marketplace compatible: STAMP protocol ready (Phase 2)
 */

import Bundlr from '@bundlr-network/client';
import type { NFTMetadata } from '@/types';

/**
 * Initialize Bundlr with platform wallet
 * Platform funds all transactions from AR pool
 */
export async function initBundlr(): Promise<any> {
  try {
    const privateKey = process.env.ARWEAVE_PRIVATE_KEY;
    
    if (!privateKey) {
      throw new Error('ARWEAVE_PRIVATE_KEY not configured');
    }

    // Parse JWK if it's a string
    const key = typeof privateKey === 'string' ? JSON.parse(privateKey) : privateKey;
    
    console.log('🔧 [BUNDLR] Initializing with platform wallet...');
    
    const bundlr = new Bundlr('https://node2.bundlr.network', 'arweave', key);
    
    // Check balance
    const balance = await bundlr.getLoadedBalance();
    const balanceInAR = bundlr.utils.fromAtomic(balance).toString();
    
    console.log('💰 [BUNDLR] Platform wallet balance:', balanceInAR, 'AR');
    
    // Auto-fund if balance is too low (keep it small)
    const minimumBalance = 0.01; // AR
    if (parseFloat(balanceInAR) < minimumBalance) {
      console.log(`⚠️ [BUNDLR] Balance below minimum (${minimumBalance} AR), funding...`);
      const fundAmount = bundlr.utils.toAtomic('0.05'); // Fund with 0.05 AR
      console.log(`💸 [BUNDLR] Funding with 0.05 AR...`);
      await bundlr.fund(fundAmount);
      console.log('✅ [BUNDLR] Wallet funded');
    }
    
    return bundlr;
  } catch (error) {
    console.error('❌ [BUNDLR] Initialization failed:', error);
    throw new Error('Failed to initialize Bundlr');
  }
}

/**
 * Get user's ownership signature via ArConnect
 * This proves the user authorizes the mint and owns the NFT
 */
export async function getUserOwnershipSignature(
  arconnect: any,
  assetId: string,
  metadata: { name: string; description: string }
): Promise<{
  signature: string;
  message: string;
  timestamp: number;
}> {
  try {
    console.log('✍️ [SIGNATURE] Requesting user ownership proof...');
    
    const timestamp = Date.now();
    const message = JSON.stringify({
      action: 'mint-nft',
      platform: 'Neural-Salvage',
      assetId,
      name: metadata.name,
      description: metadata.description,
      timestamp,
      statement: 'I authorize the minting of this NFT and claim ownership'
    });
    
    // User signs the message via ArConnect
    const signature = await arconnect.signature(Buffer.from(message), {
      name: 'RSA-PSS',
      saltLength: 32,
    });
    
    console.log('✅ [SIGNATURE] User signature obtained');
    
    return {
      signature: Buffer.from(signature).toString('base64'),
      message,
      timestamp
    };
  } catch (error: any) {
    console.error('❌ [SIGNATURE] Failed to get user signature:', error);
    if (error.message?.includes('User cancelled') || error.message?.includes('rejected')) {
      throw new Error('Signature cancelled by user');
    }
    throw new Error('Failed to get ownership signature: ' + error.message);
  }
}

/**
 * Upload data to Arweave with platform-paid transaction
 * Includes user's signature for ownership proof
 */
export async function uploadWithPlatformAR(
  bundlr: any,
  data: Buffer,
  contentType: string,
  tags: { name: string; value: string }[],
  userSignature?: {
    signature: string;
    message: string;
    walletAddress: string;
  }
): Promise<{
  txId: string;
  url: string;
  cost: number;
}> {
  try {
    console.log('📤 [UPLOAD] Starting platform-funded upload...');
    
    // Build all tags
    const allTags = [
      { name: 'Content-Type', value: contentType },
      ...tags,
    ];
    
    // Add user ownership proof if provided
    if (userSignature) {
      allTags.push(
        { name: 'Creator', value: userSignature.walletAddress },
        { name: 'User-Signature', value: userSignature.signature },
        { name: 'Signed-Message', value: userSignature.message },
        { name: 'Ownership-Proof', value: 'user-signed' }
      );
      console.log('🔐 [UPLOAD] Added user ownership signature to tags');
    }
    
    console.log('📋 [UPLOAD] Uploading with', allTags.length, 'tags');
    
    // Upload to Arweave via Bundlr (correct API)
    const transaction = await bundlr.upload(data, {
      tags: allTags,
    });
    
    const txId = transaction.id;
    const url = `https://arweave.net/${txId}`;
    const cost = parseFloat(bundlr.utils.fromAtomic(transaction.reward));
    
    console.log('✅ [UPLOAD] Complete:', {
      txId: txId.substring(0, 12) + '...',
      cost: cost.toFixed(6) + ' AR'
    });
    
    return { txId, url, cost };
  } catch (error) {
    console.error('❌ [UPLOAD] Failed:', error);
    throw new Error('Upload failed: ' + (error as Error).message);
  }
}

/**
 * Create Arweave Atomic NFT with hybrid model:
 * - Platform pays AR from pool
 * - User signs to prove ownership
 * - On-chain ownership proof via signature tags
 * - STAMP protocol ready (Phase 2)
 */
export async function mintArweaveNFTHybrid(
  assetBuffer: Buffer,
  assetMimeType: string,
  metadata: NFTMetadata,
  creatorAddress: string,
  arconnect: any,
  assetId: string
): Promise<{
  assetId: string;
  assetUrl: string;
  metadataId: string;
  metadataUrl: string;
  manifestId: string;
  manifestUrl: string;
  totalCost: number;
  userSignature: string;
}> {
  try {
    console.log('🎨 [NFT MINT HYBRID] Starting platform-funded, user-signed mint...');
    
    // Step 1: Get user's ownership signature
    console.log('📝 [NFT MINT] Step 1: Getting user ownership signature...');
    const ownershipProof = await getUserOwnershipSignature(
      arconnect,
      assetId,
      {
        name: metadata.name || 'Untitled',
        description: metadata.description || ''
      }
    );
    
    // Step 2: Initialize platform Bundlr
    console.log('🔧 [NFT MINT] Step 2: Initializing platform wallet...');
    const bundlr = await initBundlr();
    
    // Step 3: Upload asset with ownership proof
    console.log('📸 [NFT MINT] Step 3: Uploading asset (platform pays)...');
    const assetUpload = await uploadWithPlatformAR(
      bundlr,
      assetBuffer,
      assetMimeType,
      [
        { name: 'App-Name', value: 'Neural-Salvage' },
        { name: 'Type', value: 'nft-asset' },
      ],
      {
        signature: ownershipProof.signature,
        message: ownershipProof.message,
        walletAddress: creatorAddress
      }
    );
    
    // Step 4: Upload metadata
    console.log('📋 [NFT MINT] Step 4: Uploading metadata...');
    const fullMetadata: NFTMetadata = {
      ...metadata,
      image: assetUpload.url,
      external_url: metadata.external_url || `https://neural-salvage.com/nft/${assetUpload.txId}`,
      attributes: [
        ...(metadata.attributes || []),
        { trait_type: 'Owner', value: creatorAddress },
        { trait_type: 'Signature', value: ownershipProof.signature },
        { trait_type: 'Signed At', value: new Date(ownershipProof.timestamp).toISOString() },
        { trait_type: 'Platform', value: 'Neural-Salvage' },
        { trait_type: 'Ownership Proof', value: 'user-signed' },
      ],
    };
    
    const metadataBuffer = Buffer.from(JSON.stringify(fullMetadata, null, 2));
    const metadataUpload = await uploadWithPlatformAR(
      bundlr,
      metadataBuffer,
      'application/json',
      [
        { name: 'App-Name', value: 'Neural-Salvage' },
        { name: 'Type', value: 'nft-metadata' },
      ],
      {
        signature: ownershipProof.signature,
        message: ownershipProof.message,
        walletAddress: creatorAddress
      }
    );
    
    // Step 5: Create manifest
    console.log('🔗 [NFT MINT] Step 5: Creating manifest...');
    const manifest = {
      manifest: 'arweave/paths',
      version: '0.2.0',
      index: {
        path: 'metadata.json',
      },
      paths: {
        'metadata.json': {
          id: metadataUpload.txId,
        },
        'asset': {
          id: assetUpload.txId,
        },
      },
    };
    
    const manifestBuffer = Buffer.from(JSON.stringify(manifest));
    const manifestUpload = await uploadWithPlatformAR(
      bundlr,
      manifestBuffer,
      'application/x.arweave-manifest+json',
      [
        { name: 'App-Name', value: 'Neural-Salvage' },
        { name: 'Type', value: 'nft-manifest' },
        { name: 'NFT-Standard', value: 'atomic' },
      ],
      {
        signature: ownershipProof.signature,
        message: ownershipProof.message,
        walletAddress: creatorAddress
      }
    );
    
    const totalCost = assetUpload.cost + metadataUpload.cost + manifestUpload.cost;
    
    console.log('🎉 [NFT MINT HYBRID] SUCCESS!', {
      owner: creatorAddress.substring(0, 12) + '...',
      manifestId: manifestUpload.txId.substring(0, 12) + '...',
      platformPaid: totalCost.toFixed(6) + ' AR',
      userSigned: '✅'
    });
    
    return {
      assetId: assetUpload.txId,
      assetUrl: assetUpload.url,
      metadataId: metadataUpload.txId,
      metadataUrl: metadataUpload.url,
      manifestId: manifestUpload.txId,
      manifestUrl: manifestUpload.url,
      totalCost,
      userSignature: ownershipProof.signature,
    };
  } catch (error) {
    console.error('❌ [NFT MINT HYBRID] Failed:', error);
    throw error;
  }
}

/**
 * Server-side NFT minting with pre-generated user signature
 * Used by API route - signature comes from client
 */
export async function mintArweaveNFTHybridServer(
  assetBuffer: Buffer,
  assetMimeType: string,
  metadata: NFTMetadata,
  creatorAddress: string,
  userSignature: {
    signature: string;
    message: string;
    timestamp: number;
  },
  assetId: string
): Promise<{
  assetId: string;
  assetUrl: string;
  metadataId: string;
  metadataUrl: string;
  manifestId: string;
  manifestUrl: string;
  totalCost: number;
  userSignature: string;
}> {
  try {
    console.log('🎨 [NFT MINT SERVER] Starting platform-funded mint with user signature...');
    
    // Step 1: Initialize platform Bundlr
    console.log('🔧 [NFT MINT] Step 1: Initializing platform wallet...');
    const bundlr = await initBundlr();
    
    // Step 2: Upload asset with ownership proof
    console.log('📸 [NFT MINT] Step 2: Uploading asset (platform pays)...');
    const assetUpload = await uploadWithPlatformAR(
      bundlr,
      assetBuffer,
      assetMimeType,
      [
        { name: 'App-Name', value: 'Neural-Salvage' },
        { name: 'Type', value: 'nft-asset' },
      ],
      {
        signature: userSignature.signature,
        message: userSignature.message,
        walletAddress: creatorAddress
      }
    );
    
    // Step 3: Upload metadata
    console.log('📋 [NFT MINT] Step 3: Uploading metadata...');
    const fullMetadata: NFTMetadata = {
      ...metadata,
      image: assetUpload.url,
      external_url: metadata.external_url || `https://neural-salvage.com/nft/${assetUpload.txId}`,
      attributes: [
        ...(metadata.attributes || []),
        { trait_type: 'Owner', value: creatorAddress },
        { trait_type: 'Signature', value: userSignature.signature },
        { trait_type: 'Signed At', value: new Date(userSignature.timestamp).toISOString() },
        { trait_type: 'Platform', value: 'Neural-Salvage' },
        { trait_type: 'Ownership Proof', value: 'user-signed' },
      ],
    };
    
    const metadataBuffer = Buffer.from(JSON.stringify(fullMetadata, null, 2));
    const metadataUpload = await uploadWithPlatformAR(
      bundlr,
      metadataBuffer,
      'application/json',
      [
        { name: 'App-Name', value: 'Neural-Salvage' },
        { name: 'Type', value: 'nft-metadata' },
      ],
      {
        signature: userSignature.signature,
        message: userSignature.message,
        walletAddress: creatorAddress
      }
    );
    
    // Step 4: Create manifest
    console.log('🔗 [NFT MINT] Step 4: Creating manifest...');
    const manifest = {
      manifest: 'arweave/paths',
      version: '0.2.0',
      index: {
        path: 'metadata.json',
      },
      paths: {
        'metadata.json': {
          id: metadataUpload.txId,
        },
        'asset': {
          id: assetUpload.txId,
        },
      },
    };
    
    const manifestBuffer = Buffer.from(JSON.stringify(manifest));
    const manifestUpload = await uploadWithPlatformAR(
      bundlr,
      manifestBuffer,
      'application/x.arweave-manifest+json',
      [
        { name: 'App-Name', value: 'Neural-Salvage' },
        { name: 'Type', value: 'nft-manifest' },
        { name: 'NFT-Standard', value: 'atomic' },
      ],
      {
        signature: userSignature.signature,
        message: userSignature.message,
        walletAddress: creatorAddress
      }
    );
    
    const totalCost = assetUpload.cost + metadataUpload.cost + manifestUpload.cost;
    
    console.log('🎉 [NFT MINT SERVER] SUCCESS!', {
      owner: creatorAddress.substring(0, 12) + '...',
      manifestId: manifestUpload.txId.substring(0, 12) + '...',
      platformPaid: totalCost.toFixed(6) + ' AR',
      userSigned: '✅'
    });
    
    return {
      assetId: assetUpload.txId,
      assetUrl: assetUpload.url,
      metadataId: metadataUpload.txId,
      metadataUrl: metadataUpload.url,
      manifestId: manifestUpload.txId,
      manifestUrl: manifestUpload.url,
      totalCost,
      userSignature: userSignature.signature,
    };
  } catch (error) {
    console.error('❌ [NFT MINT SERVER] Failed:', error);
    throw error;
  }
}

/**
 * Calculate cost estimate for hybrid minting
 * Platform pays AR, user pays $4.99 service fee
 */
export async function estimateMintCost(
  fileSizeMB: number
): Promise<{
  arCost: number;
  arCostUSD: number;
  serviceFee: number;
  totalToUser: number;
  platformCost: number;
  platformProfit: number;
}> {
  try {
    // Get AR price from Redstone oracle
    const priceResponse = await fetch('https://api.redstone.finance/prices?symbols=AR&provider=redstone');
    const priceData = await priceResponse.json();
    const arPriceUSD = priceData[0]?.value || 5.5;
    
    // Estimate AR cost (rough estimate: ~0.01 AR per MB)
    const estimatedAR = fileSizeMB * 0.01;
    const arCostUSD = estimatedAR * arPriceUSD;
    
    // Service fee
    const serviceFee = 4.99;
    
    // User only sees service fee (AR is included)
    const totalToUser = serviceFee;
    
    // Platform costs
    const platformCost = arCostUSD;
    const stripeFee = serviceFee * 0.029 + 0.30; // Stripe: 2.9% + $0.30
    const platformProfit = serviceFee - stripeFee - platformCost;
    
    return {
      arCost: estimatedAR,
      arCostUSD,
      serviceFee,
      totalToUser,
      platformCost,
      platformProfit
    };
  } catch (error) {
    console.error('Failed to estimate cost:', error);
    // Fallback values
    return {
      arCost: 0.01,
      arCostUSD: 0.055,
      serviceFee: 4.99,
      totalToUser: 4.99,
      platformCost: 0.055,
      platformProfit: 4.50
    };
  }
}
