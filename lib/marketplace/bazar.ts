/**
 * BazAR Marketplace Integration
 * Creates listings directly via Arweave transactions
 * No need to use BazAR's website UI
 */

import Arweave from 'arweave';

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
});

export interface ListingParams {
  assetId: string;
  price: number; // in AR tokens
  currency: 'AR' | 'USD';
  duration?: number; // in days, 0 = no expiration
  walletAddress: string;
}

export interface ListingResult {
  listingId: string;
  transactionId: string;
  price: number;
  currency: string;
  expiresAt?: Date;
}

/**
 * Get current AR price in USD
 */
export async function getARPrice(): Promise<number> {
  try {
    const response = await fetch('https://api.redstone.finance/prices?symbol=AR&provider=redstone');
    const data = await response.json();
    return data[0]?.value || 0;
  } catch (error) {
    console.error('Failed to fetch AR price:', error);
    // Fallback price if API fails
    return 25; // Approximate AR price in USD
  }
}

/**
 * Convert USD to AR tokens
 */
export async function convertUSDtoAR(usdAmount: number): Promise<number> {
  const arPrice = await getARPrice();
  return usdAmount / arPrice;
}

/**
 * Convert AR tokens to USD
 */
export async function convertARtoUSD(arAmount: number): Promise<number> {
  const arPrice = await getARPrice();
  return arAmount * arPrice;
}

/**
 * Create a BazAR-compatible listing transaction
 * This creates an Arweave transaction with BazAR marketplace tags
 */
export async function createListingTransaction(
  params: ListingParams,
  jwk?: any // Optional: for server-side signing
): Promise<any> {
  console.log('📝 [BAZAR] Creating listing transaction...');
  
  // Convert price to AR if needed
  const priceInAR = params.currency === 'USD' 
    ? await convertUSDtoAR(params.price)
    : params.price;
  
  // Convert to Winston (smallest AR unit)
  const priceInWinston = arweave.ar.arToWinston(priceInAR.toString());
  
  console.log('💰 [BAZAR] Price:', {
    original: params.price,
    currency: params.currency,
    ar: priceInAR,
    winston: priceInWinston,
  });

  // Create transaction with marketplace tags
  const transaction = await arweave.createTransaction({
    data: JSON.stringify({
      assetId: params.assetId,
      price: priceInWinston,
      currency: 'AR',
      seller: params.walletAddress,
      createdAt: Date.now(),
      expiresAt: params.duration ? Date.now() + (params.duration * 24 * 60 * 60 * 1000) : null,
    }),
  }, jwk);

  // Add BazAR-compatible tags
  transaction.addTag('App-Name', 'BazAR');
  transaction.addTag('App-Version', '1.0');
  transaction.addTag('Type', 'Order');
  transaction.addTag('Order-Type', 'Sell');
  transaction.addTag('Asset-Id', params.assetId);
  transaction.addTag('Price', priceInWinston);
  transaction.addTag('Currency', 'AR');
  transaction.addTag('Seller', params.walletAddress);
  
  if (params.duration && params.duration > 0) {
    const expiresAt = Date.now() + (params.duration * 24 * 60 * 60 * 1000);
    transaction.addTag('Expires-At', expiresAt.toString());
  }

  console.log('✅ [BAZAR] Transaction created with tags:', transaction.tags);
  
  return transaction;
}

/**
 * Submit a signed listing transaction to Arweave
 */
export async function submitListingTransaction(transaction: any): Promise<string> {
  console.log('📤 [BAZAR] Submitting listing transaction...');
  
  try {
    const response = await arweave.transactions.post(transaction);
    
    if (response.status === 200) {
      console.log('✅ [BAZAR] Listing transaction submitted:', transaction.id);
      return transaction.id;
    } else {
      throw new Error(`Failed to submit transaction: ${response.status} ${response.statusText}`);
    }
  } catch (error: any) {
    console.error('❌ [BAZAR] Failed to submit listing:', error);
    throw error;
  }
}

/**
 * Query active listings for an NFT
 */
export async function getListingsForAsset(assetId: string): Promise<any[]> {
  const query = `
    query {
      transactions(
        tags: [
          { name: "App-Name", values: ["BazAR"] }
          { name: "Type", values: ["Order"] }
          { name: "Order-Type", values: ["Sell"] }
          { name: "Asset-Id", values: ["${assetId}"] }
        ]
        sort: HEIGHT_DESC
        first: 10
      ) {
        edges {
          node {
            id
            tags {
              name
              value
            }
            block {
              timestamp
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch('https://arweave.net/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();
    return result.data?.transactions?.edges || [];
  } catch (error) {
    console.error('Failed to query listings:', error);
    return [];
  }
}

/**
 * Cancel a listing (create cancellation transaction)
 */
export async function cancelListing(listingId: string, walletAddress: string): Promise<string> {
  const transaction = await arweave.createTransaction({
    data: JSON.stringify({
      listingId,
      cancelledAt: Date.now(),
    }),
  });

  transaction.addTag('App-Name', 'BazAR');
  transaction.addTag('Type', 'Order-Cancel');
  transaction.addTag('Order-Id', listingId);
  transaction.addTag('Seller', walletAddress);

  return transaction.id;
}
