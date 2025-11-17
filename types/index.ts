// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  socialLinks?: {
    x?: string;
    github?: string;
    website?: string;
  };
  stripeAccountId?: string; // For marketplace (selling)
  stripeCustomerId?: string; // For subscriptions (buying)
  stripeSubscriptionId?: string;
  stripeSubscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing';
  subscriptionTier: 'free' | 'beta' | 'creator' | 'pro' | 'studio'; // New subscription tiers
  plan: 'free' | 'pro'; // Legacy field, deprecated
  
  // Beta Access System
  isBetaUser?: boolean; // MAIN FLAG - Beta users get everything free!
  betaAccess?: boolean; // Alternative flag name (same as isBetaUser)
  betaAccessGrantedBy?: string; // Admin who granted access
  betaAccessGrantedAt?: Date; // When beta was granted
  betaReason?: string; // Why they have beta (e.g., 'seed_investor', 'early_supporter')
  betaNotes?: string; // Optional notes about beta access
  
  // Usage tracking for monthly limits
  monthlyUsage: {
    period: string; // 'YYYY-MM' format
    mintsUsed: number; // NFT mints this month
    aiAnalysisUsed: number; // AI analyses this month
    coverArtUsed: number; // Cover arts generated this month
    resetDate: Date; // When monthly limits reset
  };
  
  // Storage quotas
  quotas: {
    salvage: {
      used: number; // Current salvage items
      limit: number; // Max salvage items (20 free, 200 pro, unlimited enterprise)
    };
    nft: {
      used: number; // Current NFT slots used
      limit: number; // Max NFT slots (5 free, 50 pro, unlimited enterprise)
    };
  };
  
  // Legacy AI usage (deprecated)
  aiUsage?: {
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
  
  // Space allocation (NEW!)
  space: 'salvage' | 'nft' | 'gallery'; // Where this item lives
  // 'salvage' = rough/flawed, subscriber-only
  // 'nft' = polished, minted or mint-ready
  // 'gallery' = default public gallery (legacy)
  spaceMovedAt?: Date; // When it was moved to current space
  
  // AI Analysis
  aiAnalysis?: {
    caption?: string;
    summary?: string; // 2-3 sentence summary (for audio/video)
    tags: string[];
    colors?: string[];
    nsfw?: boolean;
    nsfwScore?: number;
    ocr?: string;
    transcript?: string;
    embedding?: number[];
    analyzedAt: Date;
  };
  
  // AI-Generated Cover Art (for audio and documents)
  coverArt?: {
    url: string;
    generatedAt: Date;
    prompt: string;
    generator: string;
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
  iconUrl?: string; // AI-generated collection icon
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

// NFT Minting Request - HYBRID MODEL
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
  userSignature: {                // User's ownership signature (hybrid model)
    signature: string;
    message: string;
    timestamp: number;
  };
}