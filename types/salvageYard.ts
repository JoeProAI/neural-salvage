/**
 * Salvage Yard Type Definitions
 * For subscription-based access to unminted content
 */

export interface SalvageYard {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  coverImage: string;
  avatarUrl: string;
  subscriptionPrice: number; // monthly in USD
  isActive: boolean;
  subscriberCount: number;
  contentCount: number;
  totalEarnings: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface SalvageContent {
  id: string;
  creatorId: string;
  assetId: string;
  title: string;
  description: string;
  mediaType: 'image' | 'audio' | 'video' | 'pdf';
  fileUrl: string;
  thumbnailUrl: string;
  fileSize: number;
  uploadedAt: Date | string;
  isMinted: boolean;
  mintedNFTId: string | null;
  viewCount: number;
  likeCount: number;
  isTeaser: boolean; // Free preview content
}

export interface SalvageSubscription {
  id: string;
  subscriberId: string;
  creatorId: string;
  status: 'active' | 'canceled' | 'expired' | 'past_due';
  priceUSD: number;
  startDate: Date | string;
  endDate: Date | string | null;
  renewalDate: Date | string;
  paymentMethod: 'stripe' | 'crypto';
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  autoRenew: boolean;
  createdAt: Date | string;
}

export interface SalvagePayment {
  id: string;
  subscriptionId: string;
  subscriberId: string;
  creatorId: string;
  amount: number;
  currency: 'USD';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentDate: Date | string;
  stripePaymentId: string;
  platformFee: number; // 10% platform cut
  creatorEarnings: number; // 90% to creator
}

export interface SalvageAnalytics {
  id: string;
  creatorId: string;
  date: string; // YYYY-MM-DD
  views: number;
  newSubscribers: number;
  revenue: number;
  contentAdded: number;
  engagement: number;
  subscriberChurn: number;
}

export interface SalvageYardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  subscribers: number;
  contentItems: number;
  avgViewsPerItem: number;
  conversionRate: number;
  churnRate: number;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  isPopular?: boolean;
}
