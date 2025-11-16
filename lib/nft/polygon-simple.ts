/**
 * Simplified Polygon NFT Minting (Production Cloud Version)
 * No user wallet signatures required - platform handles everything
 */

import { ethers } from 'ethers';

// Minimal contract ABI
const NFT_ABI = [
  "function mintNFT(address to, string memory metadataURI, string memory arweaveId, address royaltyRecipient, uint96 royaltyPercentage) public returns (uint256)",
  "function totalSupply() public view returns (uint256)",
  "event NFTMinted(uint256 indexed tokenId, address indexed minter, string tokenURI, string arweaveId)",
];

export interface SimpleMintParams {
  recipientAddress: string;
  metadataURI: string;
  arweaveId: string;
}

export interface SimpleMintResult {
  success: boolean;
  tokenId: string;
  transactionHash: string;
  openseaUrl: string;
  polygonscanUrl: string;
  gasUsed: string;
  gasCostMATIC: string;
}

/**
 * Mint NFT on Polygon (simple version for production)
 */
export async function mintPolygonNFT(params: SimpleMintParams): Promise<SimpleMintResult> {
  try {
    console.log('🔷 [POLYGON] Starting mint...');
    
    // Get env vars
    const rpcUrl = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com';
    const privateKey = process.env.POLYGON_PRIVATE_KEY;
    const contractAddress = process.env.POLYGON_NFT_CONTRACT;
    
    if (!privateKey) throw new Error('POLYGON_PRIVATE_KEY not set');
    if (!contractAddress) throw new Error('POLYGON_NFT_CONTRACT not set');
    
    // Connect to Polygon
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, NFT_ABI, wallet);
    
    console.log('🔷 [POLYGON] Connected to contract:', contractAddress);
    
    // Mint NFT (5% royalty = 500 basis points)
    const tx = await contract.mintNFT(
      params.recipientAddress,
      params.metadataURI,
      params.arweaveId,
      params.recipientAddress, // Royalties go to recipient
      500 // 5%
    );
    
    console.log('🔷 [POLYGON] Transaction sent:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('✅ [POLYGON] Confirmed in block:', receipt.blockNumber);
    
    // Get token ID from event
    const mintEvent = receipt.logs
      .map((log: any) => {
        try {
          return contract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((event: any) => event?.name === 'NFTMinted');
    
    const tokenId = mintEvent?.args?.tokenId?.toString() || '0';
    
    // Calculate gas cost
    const gasCostWei = receipt.gasUsed * (receipt.gasPrice || 0n);
    const gasCostMATIC = ethers.formatEther(gasCostWei);
    
    console.log('🎨 [POLYGON] Token ID:', tokenId);
    console.log('⛽ [POLYGON] Gas cost:', gasCostMATIC, 'MATIC');
    
    return {
      success: true,
      tokenId,
      transactionHash: receipt.hash,
      openseaUrl: `https://opensea.io/assets/matic/${contractAddress}/${tokenId}`,
      polygonscanUrl: `https://polygonscan.com/tx/${receipt.hash}`,
      gasUsed: receipt.gasUsed.toString(),
      gasCostMATIC,
    };
  } catch (error: any) {
    console.error('❌ [POLYGON] Mint failed:', error);
    throw new Error(`Polygon mint failed: ${error.message}`);
  }
}

/**
 * Upload metadata JSON to Arweave and return URL
 * (Uses existing Arweave service)
 */
export async function uploadMetadataToArweave(metadata: object): Promise<string> {
  const metadataJson = JSON.stringify(metadata, null, 2);
  const metadataBuffer = Buffer.from(metadataJson);
  
  // Use existing Bundlr upload
  const Bundlr = (await import('@bundlr-network/client')).default;
  const privateKey = process.env.ARWEAVE_PRIVATE_KEY;
  
  if (!privateKey) throw new Error('ARWEAVE_PRIVATE_KEY not set');
  
  const key = typeof privateKey === 'string' ? JSON.parse(privateKey) : privateKey;
  const bundlr = new Bundlr('https://node2.bundlr.network', 'arweave', key);
  
  const tx = await bundlr.upload(metadataBuffer, {
    tags: [
      { name: 'Content-Type', value: 'application/json' },
      { name: 'App-Name', value: 'Neural-Salvage' },
      { name: 'Type', value: 'nft-metadata' },
    ],
  });
  
  return `https://arweave.net/${tx.id}`;
}
