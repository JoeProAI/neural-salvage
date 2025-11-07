/**
 * User-Signed Arweave NFT Service
 * TRUE DECENTRALIZATION - User's wallet signs all transactions
 * 
 * This replaces the custodial Bundlr approach with direct Arweave transactions
 * signed by the user's ArConnect wallet.
 */

import Arweave from 'arweave';
import type { NFTMetadata } from '@/types';

// Initialize Arweave client
const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
});

/**
 * Calculate cost to upload data to Arweave
 * Returns cost in AR and USD
 */
export async function calculateArweaveCost(
  dataSize: number
): Promise<{
  arCost: number;
  usdCost: number;
  arPrice: number;
}> {
  try {
    // Get current AR price from Redstone oracle
    const priceResponse = await fetch('https://api.redstone.finance/prices?symbols=AR&provider=redstone');
    const priceData = await priceResponse.json();
    const arPriceUSD = priceData[0]?.value || 5.5; // Fallback to $5.5 if API fails

    // Calculate storage cost
    // Arweave uses Winston (1 AR = 1,000,000,000,000 Winston)
    const winstonCost = await arweave.transactions.getPrice(dataSize);
    const arCost = parseFloat(arweave.ar.winstonToAr(winstonCost));
    const usdCost = arCost * arPriceUSD;

    console.log('💰 [ARWEAVE COST]', {
      dataSize: `${(dataSize / 1024 / 1024).toFixed(2)} MB`,
      arCost: `${arCost.toFixed(6)} AR`,
      usdCost: `$${usdCost.toFixed(2)}`,
      arPrice: `$${arPriceUSD.toFixed(2)}`
    });

    return {
      arCost,
      usdCost,
      arPrice: arPriceUSD
    };
  } catch (error) {
    console.error('Failed to calculate Arweave cost:', error);
    throw new Error('Failed to calculate upload cost');
  }
}

/**
 * Check if user has enough AR in their wallet
 */
export async function checkWalletBalance(
  walletAddress: string,
  requiredAR: number
): Promise<{
  balance: number;
  hasEnough: boolean;
  shortfall: number;
}> {
  try {
    const winstonBalance = await arweave.wallets.getBalance(walletAddress);
    const balance = parseFloat(arweave.ar.winstonToAr(winstonBalance));
    const hasEnough = balance >= requiredAR;
    const shortfall = hasEnough ? 0 : requiredAR - balance;

    console.log('👛 [WALLET CHECK]', {
      address: walletAddress.substring(0, 12) + '...',
      balance: `${balance.toFixed(6)} AR`,
      required: `${requiredAR.toFixed(6)} AR`,
      hasEnough
    });

    return { balance, hasEnough, shortfall };
  } catch (error) {
    console.error('Failed to check wallet balance:', error);
    throw new Error('Failed to check wallet balance');
  }
}

/**
 * Upload asset to Arweave using user's wallet
 * User signs the transaction via ArConnect
 */
export async function uploadAssetUserSigned(
  data: Buffer,
  contentType: string,
  tags: { name: string; value: string }[],
  arconnect: any
): Promise<{
  txId: string;
  url: string;
  cost: number;
}> {
  try {
    console.log('📤 [ARWEAVE UPLOAD] Starting user-signed upload...');

    // Create transaction
    const transaction = await arweave.createTransaction({ data }, 'use_wallet');
    
    // Add content type
    transaction.addTag('Content-Type', contentType);
    
    // Add custom tags
    tags.forEach(tag => {
      transaction.addTag(tag.name, tag.value);
    });

    // Calculate cost
    const cost = parseFloat(arweave.ar.winstonToAr(transaction.reward));
    
    console.log('📝 [ARWEAVE TX] Transaction created', {
      size: `${(data.length / 1024).toFixed(2)} KB`,
      cost: `${cost.toFixed(6)} AR`,
      tags: tags.length
    });

    // Sign transaction using ArConnect
    console.log('✍️ [ARWEAVE SIGN] Requesting user signature...');
    await arconnect.sign(transaction);
    
    console.log('✅ [ARWEAVE SIGNED] Transaction signed by user');

    // Submit transaction
    console.log('🚀 [ARWEAVE SUBMIT] Submitting to network...');
    const response = await arweave.transactions.post(transaction);

    if (response.status !== 200 && response.status !== 202) {
      throw new Error(`Transaction failed with status ${response.status}`);
    }

    const txId = transaction.id;
    const url = `https://arweave.net/${txId}`;

    console.log('✅ [ARWEAVE SUCCESS] Upload complete', {
      txId: txId.substring(0, 12) + '...',
      url
    });

    return { txId, url, cost };
  } catch (error: any) {
    console.error('❌ [ARWEAVE ERROR] Upload failed:', error);
    if (error.message?.includes('User cancelled')) {
      throw new Error('Transaction cancelled by user');
    }
    throw new Error('Failed to upload to Arweave: ' + error.message);
  }
}

/**
 * Create Arweave Atomic NFT with user's wallet
 * All transactions are signed by the user
 * 
 * Returns transaction IDs for:
 * - Asset upload
 * - Metadata upload
 * - Manifest (links asset + metadata)
 */
export async function mintArweaveNFTUserSigned(
  assetBuffer: Buffer,
  assetMimeType: string,
  metadata: NFTMetadata,
  creatorAddress: string,
  arconnect: any
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
    console.log('🎨 [NFT MINT] Starting user-signed Arweave Atomic NFT mint...');

    // Step 1: Upload asset
    console.log('📸 [NFT MINT] Step 1: Uploading asset...');
    const assetUpload = await uploadAssetUserSigned(
      assetBuffer,
      assetMimeType,
      [
        { name: 'App-Name', value: 'Neural-Salvage' },
        { name: 'Type', value: 'nft-asset' },
        { name: 'Creator', value: creatorAddress },
      ],
      arconnect
    );

    // Step 2: Upload metadata
    console.log('📋 [NFT MINT] Step 2: Uploading metadata...');
    const fullMetadata: NFTMetadata = {
      ...metadata,
      image: assetUpload.url,
      external_url: metadata.external_url || `https://neural-salvage.com/nft/${assetUpload.txId}`,
    };

    const metadataBuffer = Buffer.from(JSON.stringify(fullMetadata, null, 2));
    const metadataUpload = await uploadAssetUserSigned(
      metadataBuffer,
      'application/json',
      [
        { name: 'App-Name', value: 'Neural-Salvage' },
        { name: 'Type', value: 'nft-metadata' },
      ],
      arconnect
    );

    // Step 3: Create manifest
    console.log('🔗 [NFT MINT] Step 3: Creating manifest...');
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
    const manifestUpload = await uploadAssetUserSigned(
      manifestBuffer,
      'application/x.arweave-manifest+json',
      [
        { name: 'App-Name', value: 'Neural-Salvage' },
        { name: 'Type', value: 'nft-manifest' },
        { name: 'NFT-Standard', value: 'atomic' },
        { name: 'Creator', value: creatorAddress },
      ],
      arconnect
    );

    const totalCost = assetUpload.cost + metadataUpload.cost + manifestUpload.cost;

    console.log('🎉 [NFT MINT] SUCCESS! Atomic NFT created', {
      assetId: assetUpload.txId.substring(0, 12) + '...',
      metadataId: metadataUpload.txId.substring(0, 12) + '...',
      manifestId: manifestUpload.txId.substring(0, 12) + '...',
      totalCost: `${totalCost.toFixed(6)} AR`
    });

    return {
      assetId: assetUpload.txId,
      assetUrl: assetUpload.url,
      metadataId: metadataUpload.txId,
      metadataUrl: metadataUpload.url,
      manifestId: manifestUpload.txId,
      manifestUrl: manifestUpload.url,
      totalCost,
    };
  } catch (error) {
    console.error('❌ [NFT MINT] Failed:', error);
    throw error;
  }
}

/**
 * Get transaction status
 */
export async function getTransactionStatus(txId: string): Promise<{
  confirmed: boolean;
  confirmations: number;
  blockHeight?: number;
}> {
  try {
    const status = await arweave.transactions.getStatus(txId);
    
    return {
      confirmed: (status.confirmed?.number_of_confirmations ?? 0) > 0,
      confirmations: status.confirmed?.number_of_confirmations ?? 0,
      blockHeight: status.confirmed?.block_height,
    };
  } catch (error) {
    console.error('Failed to get transaction status:', error);
    return {
      confirmed: false,
      confirmations: 0,
    };
  }
}
