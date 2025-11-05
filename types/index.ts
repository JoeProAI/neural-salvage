// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    website?: string;
  };
  stripeAccountId?: string;
  plan: 'free' | 'pro';
  aiUsage: {
    current: number;
    limit: number;
    resetDate: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Media Asset Types
export type MediaType = 'image' | 'video' | 'audio' | 'document';

export interface MediaAsset {
  id: string;
  userId: string;
  filename: string;
  originalFilename: string;
  title?: string; // User-editable title
  description?: string; // User-editable description
  type: MediaType;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // for video/audio
  uploadedAt: Date;
  updatedAt: Date;
  
  // AI Analysis
  aiAnalysis?: {
    caption?: string;
    tags: string[];
    colors?: string[];
    nsfw?: boolean;
    nsfwScore?: number;
    ocr?: string;
    transcript?: string;
    embedding?: number[];
    analyzedAt: Date;
  };
  
  // Organization
  collectionIds: string[];
  visibility: 'private' | 'public';
  
  // Marketplace
  forSale: boolean;
  price?: number;
  license?: 'personal' | 'commercial' | 'exclusive';
  sold: boolean;
  
  // Metadata
  metadata: {
    camera?: string;
    location?: string;
    customFields?: Record<string, any>;
  };
  
  // NFT - Link to blockchain NFT if minted
  nftId?: string;                 // Reference to NFT document
  isNFT: boolean;                 // True if minted as NFT
}

// Collection Types
export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coverImageId?: string;
  assetIds: string[];
  visibility: 'private' | 'public';
  createdAt: Date;
  updatedAt: Date;
}

// AI Job Types
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type JobType = 'analyze_image' | 'analyze_video' | 'generate_embedding' | 'transcribe_audio';

export interface AIJob {
  id: string;
  userId: string;
  assetId: string;
  type: JobType;
  status: JobStatus;
  progress: number;
  result?: any;
  error?: string;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// Sale Types
export interface Sale {
  id: string;
  assetId: string;
  sellerId: string;
  buyerId: string;
  amount: number;
  platformFee: number;
  sellerAmount: number;
  stripePaymentIntentId: string;
  status: 'pending' | 'completed' | 'refunded';
  deliveryUrl?: string;
  deliveryExpiresAt?: Date;
  createdAt: Date;
  completedAt?: Date;
}

// Search Types
export interface SearchFilters {
  type?: MediaType[];
  tags?: string[];
  colors?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  forSale?: boolean;
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface SearchResult {
  asset: MediaAsset;
  score: number;
  highlights?: string[];
}

// Upload Types
export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  assetId?: string;
  error?: string;
}

// AI Provider Types
export type AIProvider = 'openai' | 'xai';

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}

// Layout Types
export type LayoutType = 'grid' | 'masonry' | 'filmstrip';

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'sale' | 'purchase' | 'ai_complete' | 'system';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

// NFT Types - Real Blockchain NFTs
export type BlockchainType = 'arweave' | 'ethereum' | 'polygon' | 'solana';
export type NFTStatus = 'pending' | 'uploading' | 'minting' | 'confirmed' | 'failed';

export interface ArweaveNFT {
  // Arweave-specific fields
  arweaveId: string;              // Transaction ID on Arweave
  arweaveUrl: string;             // https://arweave.net/{txId}
  manifestId?: string;            // Manifest transaction ID (for collections)
  bundlrId?: string;              // Bundlr upload ID
  uploadCost: number;             // Cost in AR tokens
  uploadedAt: Date;
  confirmedAt?: Date;
}

export interface EthereumNFT {
  // Ethereum/Polygon-specific fields
  contractAddress: string;
  tokenId: string;
  chain: 'ethereum' | 'polygon';
  transactionHash: string;
  blockNumber?: number;
  gasUsed?: string;
  mintedAt: Date;
  confirmedAt?: Date;
}

export interface SolanaNFT {
  // Solana-specific fields
  mintAddress: string;
  metadataAddress: string;
  masterEditionAddress?: string;
  transactionSignature: string;
  slot?: number;
  mintedAt: Date;
  confirmedAt?: Date;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;                  // URI to asset
  external_url?: string;          // Link to Neural Salvage page
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties?: {
    files: Array<{
      uri: string;
      type: string;
    }>;
    category: 'image' | 'video' | 'audio';
    creators?: Array<{
      address: string;
      share: number;
    }>;
  };
}

export interface NFT {
  id: string;                     // Internal NFT ID
  assetId: string;                // Link to MediaAsset
  userId: string;                 // Owner
  blockchain: BlockchainType;
  status: NFTStatus;
  
  // Blockchain-specific data
  arweave?: ArweaveNFT;
  ethereum?: EthereumNFT;
  solana?: SolanaNFT;
  
  // Metadata
  metadata: NFTMetadata;
  metadataUri: string;            // URI to metadata JSON
  
  // Ownership & Trading
  currentOwner: string;           // Wallet address
  originalMinter: string;         // Creator wallet
  royaltyPercentage: number;      // Creator royalty (0-100)
  
  // Transfer history
  transfers: Array<{
    from: string;
    to: string;
    price?: number;
    currency?: string;
    transactionHash: string;
    timestamp: Date;
  }>;
  
  // Verification
  isVerified: boolean;
  verifiedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// NFT Minting Request
export interface MintNFTRequest {
  assetId: string;
  blockchain: BlockchainType;
  metadata: {
    name: string;
    description: string;
    attributes?: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
  royaltyPercentage?: number;     // Default 10%
  walletAddress: string;          // User's wallet
}