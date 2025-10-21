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