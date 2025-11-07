/**
 * Arweave NFT Query Service
 * Query NFTs directly from Arweave blockchain by wallet address
 * Firebase is just a cache - blockchain is the source of truth!
 */

import Arweave from 'arweave';

// Initialize Arweave client
const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
});

/**
 * GraphQL query to find all NFTs owned by a wallet address
 */
const NFT_QUERY = `
  query GetNFTsByOwner($owner: String!, $cursor: String) {
    transactions(
      owners: [$owner]
      tags: [
        { name: "Protocol-Name", values: ["STAMP"] }
        { name: "App-Name", values: ["Neural-Salvage"] }
        { name: "Type", values: ["nft-manifest"] }
      ]
      first: 100
      after: $cursor
    ) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          owner {
            address
          }
          tags {
            name
            value
          }
          block {
            timestamp
            height
          }
        }
      }
    }
  }
`;

export interface ArweaveNFTResult {
  id: string;
  txId: string;
  owner: string;
  title: string;
  description: string;
  creator: string;
  royalty: string;
  platformRoyalty?: string;
  timestamp: number;
  blockHeight: number;
  manifestUrl: string;
  metadataUrl?: string;
  imageUrl?: string;
  tags: { name: string; value: string }[];
}

/**
 * Query Arweave for all NFTs owned by a wallet address
 * This is the SOURCE OF TRUTH - Firebase is just cache
 */
export async function queryNFTsByWallet(
  walletAddress: string
): Promise<ArweaveNFTResult[]> {
  try {
    console.log('🔍 [ARWEAVE QUERY] Fetching NFTs for wallet:', walletAddress);

    const response = await fetch('https://arweave.net/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: NFT_QUERY,
        variables: {
          owner: walletAddress,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL query failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      console.error('❌ [ARWEAVE QUERY] GraphQL errors:', result.errors);
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    const edges = result.data?.transactions?.edges || [];
    console.log(`✅ [ARWEAVE QUERY] Found ${edges.length} NFTs on blockchain`);

    // Parse NFT data from transaction tags
    const nfts: ArweaveNFTResult[] = edges.map((edge: any) => {
      const node = edge.node;
      const tags = node.tags;

      // Extract tag values
      const getTag = (name: string) => 
        tags.find((t: any) => t.name === name)?.value || '';

      const creators = tags.filter((t: any) => t.name === 'Creator');
      const royalties = tags.filter((t: any) => t.name === 'Royalty');

      return {
        id: node.id,
        txId: node.id,
        owner: node.owner.address,
        title: getTag('Title'),
        description: getTag('Description'),
        creator: creators[0]?.value || node.owner.address,
        royalty: royalties[0]?.value || '0',
        platformRoyalty: royalties[1]?.value || undefined,
        timestamp: node.block?.timestamp || Date.now() / 1000,
        blockHeight: node.block?.height || 0,
        manifestUrl: `https://arweave.net/${node.id}`,
        tags: tags,
      };
    });

    console.log('📊 [ARWEAVE QUERY] Parsed NFT details:', {
      count: nfts.length,
      titles: nfts.map(n => n.title),
    });

    return nfts;
  } catch (error) {
    console.error('❌ [ARWEAVE QUERY] Failed to query NFTs:', error);
    throw error;
  }
}

/**
 * Get detailed NFT metadata from Arweave
 * Handles both manifest-based NFTs and direct image NFTs
 */
export async function fetchNFTMetadata(manifestId: string) {
  try {
    console.log('📥 [METADATA] Fetching for:', manifestId.substring(0, 12) + '...');
    
    // Try to fetch as manifest first
    const manifestResponse = await fetch(`https://arweave.net/${manifestId}`);
    const contentType = manifestResponse.headers.get('content-type');
    
    // Check if it's an image (not a manifest)
    if (contentType?.includes('image')) {
      console.log('🖼️ [METADATA] Transaction is an image, not a manifest');
      return {
        image: `https://arweave.net/${manifestId}`,
        manifestUrl: `https://arweave.net/${manifestId}`,
        isDirectImage: true,
      };
    }
    
    // Try to parse as JSON manifest
    const text = await manifestResponse.text();
    let manifest;
    try {
      manifest = JSON.parse(text);
    } catch (parseError) {
      console.warn('⚠️ [METADATA] Not valid JSON, treating as direct asset');
      return {
        image: `https://arweave.net/${manifestId}`,
        manifestUrl: `https://arweave.net/${manifestId}`,
        isDirectImage: true,
      };
    }

    // It's a proper manifest - extract metadata and image
    console.log('📋 [METADATA] Manifest structure:', Object.keys(manifest));
    console.log('📂 [METADATA] Paths:', manifest.paths ? Object.keys(manifest.paths) : 'No paths');
    console.log('🔍 [METADATA] Full manifest:', JSON.stringify(manifest).substring(0, 300));
    
    const metadataPath = manifest.paths?.['metadata.json']?.id;
    if (!metadataPath) {
      console.warn('⚠️ [METADATA] No manifest paths - this IS the metadata');
      
      // This transaction IS the metadata.json itself
      // Check for image URL in the metadata
      let imageUrl = manifest.image;
      
      // If image field exists and is an Arweave ID (not full URL)
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `https://arweave.net/${imageUrl}`;
      }
      
      // Also try to extract from paths if they exist
      const imagePath = 
        manifest.paths?.['asset']?.id || 
        manifest.paths?.['image']?.id ||
        manifest.paths?.['image.png']?.id ||
        manifest.paths?.['image.jpg']?.id;
      
      if (imagePath) {
        imageUrl = `https://arweave.net/${imagePath}`;
      }
      
      console.log('🔍 [METADATA] Image URL:', imageUrl ? imageUrl.substring(0, 40) + '...' : 'None');
      
      return {
        ...manifest, // Include all metadata fields (name, description, etc.)
        image: imageUrl || `https://arweave.net/${manifestId}`,
        manifestUrl: `https://arweave.net/${manifestId}`,
        isMetadataOnly: true,
      };
    }

    // Fetch metadata
    const metadataResponse = await fetch(`https://arweave.net/${metadataPath}`);
    const metadata = await metadataResponse.json();

    // Get image URL
    const imagePath = manifest.paths?.['asset']?.id || manifest.paths?.['image']?.id;
    const imageUrl = imagePath ? `https://arweave.net/${imagePath}` : undefined;

    console.log('✅ [METADATA] Successfully loaded metadata and image');
    
    return {
      ...metadata,
      image: imageUrl || metadata.image,
      manifestUrl: `https://arweave.net/${manifestId}`,
      metadataUrl: `https://arweave.net/${metadataPath}`,
    };
  } catch (error: any) {
    console.error('❌ [METADATA] Failed to fetch:', error.message);
    // Return basic structure with direct link
    return {
      image: `https://arweave.net/${manifestId}`,
      manifestUrl: `https://arweave.net/${manifestId}`,
      error: error.message,
    };
  }
}

/**
 * Check if NFT exists on Arweave by transaction ID
 */
export async function verifyNFTExists(txId: string): Promise<boolean> {
  try {
    const response = await fetch(`https://arweave.net/tx/${txId}/status`);
    const status = await response.json();
    return status.confirmed !== undefined;
  } catch (error) {
    console.error('❌ Failed to verify NFT:', error);
    return false;
  }
}

/**
 * Query NFTs signed by a specific wallet (ownership proof)
 * Checks for ownership signature in tags
 * Works with both old (pre-STAMP) and new (STAMP) NFTs
 */
/**
 * Fetch with retry logic for transient network errors
 */
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 [RETRY] Attempt ${attempt}/${maxRetries}...`);
      const response = await fetch(url, options);
      
      // Check for server errors
      if (response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      return response;
    } catch (error: any) {
      lastError = error;
      console.warn(`⚠️ [RETRY] Attempt ${attempt} failed:`, error.message);
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`⏳ [RETRY] Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

export async function queryNFTsBySignature(
  walletAddress: string
): Promise<ArweaveNFTResult[]> {
  try {
    console.log('🔍 [ARWEAVE QUERY] Fetching NFTs signed by:', walletAddress);

    // Query for Neural-Salvage NFTs where user is Creator
    // Works for both STAMP and pre-STAMP NFTs
    const query = `
      query GetNFTsBySignature($creator: String!) {
        transactions(
          tags: [
            { name: "App-Name", values: ["Neural-Salvage"] }
            { name: "Type", values: ["nft-manifest"] }
            { name: "Creator", values: [$creator] }
          ]
          first: 100
        ) {
          edges {
            node {
              id
              owner {
                address
              }
              tags {
                name
                value
              }
              block {
                timestamp
                height
              }
            }
          }
        }
      }
    `;

    const response = await fetchWithRetry('https://arweave.net/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          creator: walletAddress,
        },
      }),
    }, 3);

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error(`Arweave gateway error: Received ${contentType} instead of JSON (likely 504)`);
    }

    const result = await response.json();
    
    if (result.errors) {
      console.error('❌ [ARWEAVE QUERY] GraphQL errors:', result.errors);
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }
    
    const edges = result.data?.transactions?.edges || [];

    console.log(`✅ [ARWEAVE QUERY] Found ${edges.length} NFTs by signature`);
    console.log(`📋 [ARWEAVE QUERY] Transaction IDs:`, edges.map((e: any) => e.node.id));

    return edges.map((edge: any) => {
      const node = edge.node;
      const tags = node.tags;
      const getTag = (name: string) => 
        tags.find((t: any) => t.name === name)?.value || '';

      // Extract all creators and royalties (for STAMP split)
      const creators = tags.filter((t: any) => t.name === 'Creator').map((t: any) => t.value);
      const royalties = tags.filter((t: any) => t.name === 'Royalty').map((t: any) => t.value);
      
      // Extract image URL from tags (for manifests that don't have paths)
      const imageTag = getTag('Image') || getTag('Asset-Id') || getTag('image');
      const imageUrl = imageTag ? `https://arweave.net/${imageTag}` : undefined;
      
      if (imageTag) {
        console.log(`🖼️ [QUERY] Found image in tags for ${node.id.substring(0, 12)}: ${imageTag.substring(0, 12)}...`);
      } else {
        console.log(`⚠️ [QUERY] No image tag found for ${node.id.substring(0, 12)}. Available tags:`, tags.map((t: any) => t.name).join(', '));
      }

      return {
        id: node.id,
        txId: node.id,
        owner: node.owner.address,
        title: getTag('Title') || getTag('Title') || 'Untitled NFT',
        description: getTag('Description') || '',
        creator: walletAddress,
        royalty: royalties[0] || '5', // Default 5% if not specified
        platformRoyalty: royalties[1] || undefined,
        timestamp: node.block?.timestamp || Date.now() / 1000,
        blockHeight: node.block?.height || 0,
        manifestUrl: `https://arweave.net/${node.id}`,
        imageUrl: imageUrl, // Extract from tags
        tags: tags,
      };
    });
  } catch (error) {
    console.error('❌ [ARWEAVE QUERY] Failed to query by signature:', error);
    return [];
  }
}
