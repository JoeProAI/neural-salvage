/**
 * Polygon NFT Minting Integration
 * Dual-chain minting: Arweave (storage) + Polygon (marketplace)
 */

import { ethers } from 'ethers';

// Contract ABI (minimal interface)
const NFT_CONTRACT_ABI = [
  "function mintNFT(address to, string memory metadataURI, string memory arweaveId, address royaltyRecipient, uint96 royaltyPercentage) public returns (uint256)",
  "function totalSupply() public view returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "event NFTMinted(uint256 indexed tokenId, address indexed minter, string tokenURI, string arweaveId)",
];

export interface PolygonMintParams {
  recipientAddress: string;
  metadataURI: string;
  arweaveId: string;
  royaltyRecipient?: string;
  royaltyPercentage?: number; // In basis points (500 = 5%)
}

export interface PolygonMintResult {
  success: boolean;
  tokenId: string;
  transactionHash: string;
  openseaUrl: string;
  polygonscanUrl: string;
  contractAddress: string;
  gasUsed?: string;
  gasCost?: string;
}

/**
 * Get Polygon provider
 */
function getPolygonProvider(): ethers.JsonRpcProvider {
  const rpcUrl = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com';
  return new ethers.JsonRpcProvider(rpcUrl);
}

/**
 * Get contract signer (platform wallet)
 */
function getContractSigner(): ethers.Wallet {
  const privateKey = process.env.POLYGON_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('POLYGON_PRIVATE_KEY not set in environment variables');
  }
  
  const provider = getPolygonProvider();
  return new ethers.Wallet(privateKey, provider);
}

/**
 * Get NFT contract instance
 */
function getNFTContract(): ethers.Contract {
  const contractAddress = process.env.POLYGON_NFT_CONTRACT;
  if (!contractAddress) {
    throw new Error('POLYGON_NFT_CONTRACT not set in environment variables');
  }
  
  const signer = getContractSigner();
  return new ethers.Contract(contractAddress, NFT_CONTRACT_ABI, signer);
}

/**
 * Mint NFT on Polygon
 */
export async function mintNFTOnPolygon(
  params: PolygonMintParams
): Promise<PolygonMintResult> {
  try {
    console.log('🔷 [POLYGON] Starting NFT mint...');
    console.log('🔷 [POLYGON] Recipient:', params.recipientAddress);
    console.log('🔷 [POLYGON] Metadata URI:', params.metadataURI);
    console.log('🔷 [POLYGON] Arweave ID:', params.arweaveId);

    const contract = getNFTContract();
    const contractAddress = await contract.getAddress();

    // Default royalty: 5% (500 basis points)
    const royaltyRecipient = params.royaltyRecipient || params.recipientAddress;
    const royaltyPercentage = params.royaltyPercentage || 500;

    console.log('🔷 [POLYGON] Sending transaction...');
    
    // Mint NFT transaction
    const tx = await contract.mintNFT(
      params.recipientAddress,
      params.metadataURI,
      params.arweaveId,
      royaltyRecipient,
      royaltyPercentage
    );

    console.log('🔷 [POLYGON] Transaction sent:', tx.hash);
    console.log('🔷 [POLYGON] Waiting for confirmation...');

    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    console.log('✅ [POLYGON] Transaction confirmed in block:', receipt.blockNumber);

    // Extract token ID from event logs
    const mintEvent = receipt.logs
      .map((log: any) => {
        try {
          return contract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((event: any) => event?.name === 'NFTMinted');

    if (!mintEvent) {
      throw new Error('NFTMinted event not found in transaction logs');
    }

    const tokenId = mintEvent.args.tokenId.toString();
    console.log('🎨 [POLYGON] Token ID:', tokenId);

    // Calculate gas cost
    const gasUsed = receipt.gasUsed.toString();
    const gasPrice = receipt.gasPrice || 0n;
    const gasCostWei = receipt.gasUsed * gasPrice;
    const gasCostMatic = ethers.formatEther(gasCostWei);

    console.log('⛽ [POLYGON] Gas used:', gasUsed);
    console.log('💰 [POLYGON] Gas cost:', gasCostMatic, 'MATIC');

    // Generate URLs
    const openseaUrl = `https://opensea.io/assets/matic/${contractAddress}/${tokenId}`;
    const polygonscanUrl = `https://polygonscan.com/tx/${receipt.hash}`;

    console.log('🔗 [POLYGON] OpenSea:', openseaUrl);
    console.log('🔗 [POLYGON] PolygonScan:', polygonscanUrl);

    return {
      success: true,
      tokenId,
      transactionHash: receipt.hash,
      openseaUrl,
      polygonscanUrl,
      contractAddress,
      gasUsed,
      gasCost: gasCostMatic,
    };
  } catch (error: any) {
    console.error('❌ [POLYGON] Mint failed:', error);
    throw new Error(`Polygon mint failed: ${error.message}`);
  }
}

/**
 * Get current gas price estimate
 */
export async function estimateGasCost(): Promise<{
  gasPrice: string;
  estimatedCostMATIC: string;
  estimatedCostUSD: string;
}> {
  try {
    const provider = getPolygonProvider();
    const feeData = await provider.getFeeData();
    
    const gasPrice = feeData.gasPrice || 0n;
    const gasPriceGwei = ethers.formatUnits(gasPrice, 'gwei');
    
    // Estimate ~200,000 gas for mint
    const estimatedGas = 200000n;
    const estimatedCostWei = gasPrice * estimatedGas;
    const estimatedCostMATIC = ethers.formatEther(estimatedCostWei);
    
    // Rough MATIC to USD conversion (update with real price feed)
    const maticPriceUSD = 0.80; // ~$0.80 per MATIC
    const estimatedCostUSD = (parseFloat(estimatedCostMATIC) * maticPriceUSD).toFixed(4);
    
    return {
      gasPrice: gasPriceGwei,
      estimatedCostMATIC,
      estimatedCostUSD,
    };
  } catch (error: any) {
    console.error('❌ [POLYGON] Gas estimation failed:', error);
    return {
      gasPrice: '0',
      estimatedCostMATIC: '0',
      estimatedCostUSD: '0',
    };
  }
}

/**
 * Create OpenSea-compatible metadata JSON
 * @param arweaveUrl URL to asset on Arweave
 * @param nftMetadata NFT metadata from your system
 */
export function createOpenSeaMetadata(
  arweaveUrl: string,
  nftMetadata: {
    name: string;
    description: string;
    attributes?: Array<{ trait_type: string; value: string | number }>;
    animation_url?: string;
    external_url?: string;
  }
): object {
  return {
    name: nftMetadata.name,
    description: nftMetadata.description,
    image: arweaveUrl, // OpenSea will fetch from Arweave!
    animation_url: nftMetadata.animation_url,
    external_url: nftMetadata.external_url || process.env.NEXT_PUBLIC_APP_URL,
    attributes: nftMetadata.attributes || [],
    // Arweave provenance
    properties: {
      arweave_tx: arweaveUrl.split('/').pop(),
      blockchain: 'arweave',
      storage: 'permanent',
    },
  };
}

/**
 * Get total supply of minted NFTs
 */
export async function getTotalSupply(): Promise<number> {
  try {
    const contract = getNFTContract();
    const supply = await contract.totalSupply();
    return Number(supply);
  } catch (error) {
    console.error('❌ [POLYGON] Failed to get total supply:', error);
    return 0;
  }
}

/**
 * Get token metadata URI
 */
export async function getTokenURI(tokenId: string): Promise<string> {
  try {
    const contract = getNFTContract();
    return await contract.tokenURI(tokenId);
  } catch (error) {
    console.error('❌ [POLYGON] Failed to get token URI:', error);
    throw error;
  }
}
