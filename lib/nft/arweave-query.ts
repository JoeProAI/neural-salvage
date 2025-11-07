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
 */
export async function fetchNFTMetadata(manifestId: string) {
  try {
    // Fetch the manifest
    const manifestResponse = await fetch(`https://arweave.net/${manifestId}`);
    const manifest = await manifestResponse.json();

    // Get metadata URL from manifest
    const metadataPath = manifest.paths?.['metadata.json']?.id;
    if (!metadataPath) {
      throw new Error('No metadata found in manifest');
    }

    // Fetch metadata
    const metadataResponse = await fetch(`https://arweave.net/${metadataPath}`);
    const metadata = await metadataResponse.json();

    // Get image URL
    const imagePath = manifest.paths?.['asset']?.id || manifest.paths?.['image']?.id;
    const imageUrl = imagePath ? `https://arweave.net/${imagePath}` : undefined;

    return {
      ...metadata,
      image: imageUrl || metadata.image,
      manifestUrl: `https://arweave.net/${manifestId}`,
      metadataUrl: `https://arweave.net/${metadataPath}`,
    };
  } catch (error) {
    console.error('❌ Failed to fetch NFT metadata:', error);
    return null;
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
 */
export async function queryNFTsBySignature(
  walletAddress: string
): Promise<ArweaveNFTResult[]> {
  try {
    console.log('🔍 [ARWEAVE QUERY] Fetching NFTs signed by:', walletAddress);

    const query = `
      query GetNFTsBySignature($creator: String!) {
        transactions(
          tags: [
            { name: "Protocol-Name", values: ["STAMP"] }
            { name: "App-Name", values: ["Neural-Salvage"] }
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

    const response = await fetch('https://arweave.net/graphql', {
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
    });

    const result = await response.json();
    const edges = result.data?.transactions?.edges || [];

    console.log(`✅ [ARWEAVE QUERY] Found ${edges.length} NFTs by signature`);

    return edges.map((edge: any) => {
      const node = edge.node;
      const tags = node.tags;
      const getTag = (name: string) => 
        tags.find((t: any) => t.name === name)?.value || '';

      return {
        id: node.id,
        txId: node.id,
        owner: node.owner.address,
        title: getTag('Title'),
        description: getTag('Description'),
        creator: walletAddress,
        royalty: getTag('Royalty'),
        timestamp: node.block?.timestamp || Date.now() / 1000,
        blockHeight: node.block?.height || 0,
        manifestUrl: `https://arweave.net/${node.id}`,
        tags: tags,
      };
    });
  } catch (error) {
    console.error('❌ [ARWEAVE QUERY] Failed to query by signature:', error);
    return [];
  }
}
