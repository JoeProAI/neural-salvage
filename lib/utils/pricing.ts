/**
 * Dynamic Pricing Calculator
 * Calculates NFT mint prices based on file size
 * Accounts for AR storage cost, Stripe fees, and profit margin
 */

export interface PriceTier {
  name: string;
  maxSizeMB: number;
  arCost: number;
  usdPrice: number;
  description: string;
}

export const PRICE_TIERS: PriceTier[] = [
  {
    name: 'Tiny',
    maxSizeMB: 10,
    arCost: 0.05,
    usdPrice: 3.99, // Was 2.99, +$1 = 30% more profit
    description: 'Perfect for photos, documents, short audio'
  },
  {
    name: 'Small',
    maxSizeMB: 50,
    arCost: 0.15,
    usdPrice: 5.99, // Was 4.99, +$1 = 20% more profit
    description: 'Great for songs, presentations, images'
  },
  {
    name: 'Medium',
    maxSizeMB: 100,
    arCost: 0.30,
    usdPrice: 9.99, // Was 7.99, +$2 = 25% more profit
    description: 'Ideal for albums, HD photos, short videos'
  },
  {
    name: 'Large',
    maxSizeMB: 250,
    arCost: 0.75,
    usdPrice: 17.99, // Was 14.99, +$3 = 20% more profit
    description: 'Best for long videos, large collections'
  },
  {
    name: 'XL',
    maxSizeMB: 500,
    arCost: 1.50,
    usdPrice: 29.99, // Was 24.99, +$5 = 20% more profit
    description: 'For high-res videos, massive files'
  },
];

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number; // USD per month
  freeMints: number; // Free mints per month
  maxMintSizeMB: number; // Max file size for free mints
  aiAnalysisLimit: number; // Monthly AI analysis limit (0 = unlimited)
  coverArtLimit: number; // Monthly cover art limit (0 = unlimited)
  discount: number; // Discount on extra mints (0-1)
  features: string[];
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    freeMints: 0,
    maxMintSizeMB: 0,
    aiAnalysisLimit: 10,
    coverArtLimit: 5,
    discount: 0,
    features: [
      'Unlimited uploads',
      '10 AI analyses/month',
      '5 AI cover arts/month',
      'Marketplace access',
      'Connect wallet'
    ]
  },
  {
    id: 'beta',
    name: 'Beta',
    price: 0, // Free for beta users!
    freeMints: 999999, // Unlimited
    maxMintSizeMB: 500, // Any size
    aiAnalysisLimit: 0, // Unlimited
    coverArtLimit: 0, // Unlimited
    discount: 1.0, // 100% discount
    features: [
      '✨ BETA ACCESS - Everything FREE',
      'UNLIMITED NFT mints',
      'UNLIMITED AI analyses',
      'UNLIMITED cover art',
      'All file sizes supported',
      'Priority support',
      'Early access to features',
      'Beta tester badge',
      'Lifetime access (while beta)'
    ]
  },
  {
    id: 'creator',
    name: 'Creator',
    price: 12.99, // Was 9.99, +$3 = 30% more revenue
    freeMints: 5,
    maxMintSizeMB: 50, // Tiny/Small files only
    aiAnalysisLimit: 50,
    coverArtLimit: 25,
    discount: 0.15,
    features: [
      'Everything in Free',
      '5 free NFT mints/month',
      '50 AI analyses/month',
      '25 cover arts/month',
      '15% discount on extra mints',
      'Advanced AI prompts',
      'Collection organization',
      'Email support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 34.99, // Was 29.99, +$5 = 17% more revenue
    freeMints: 20,
    maxMintSizeMB: 100, // Up to Medium files
    aiAnalysisLimit: 0, // Unlimited
    coverArtLimit: 0, // Unlimited
    discount: 0.25,
    features: [
      'Everything in Creator',
      '20 free NFT mints/month',
      'UNLIMITED AI analyses',
      'UNLIMITED cover art',
      '25% discount on extra mints',
      'Bulk upload (50 files)',
      'Advanced analytics',
      'Priority support',
      'API access',
      'Custom branding'
    ]
  },
  {
    id: 'studio',
    name: 'Studio',
    price: 119.99, // Was 99.99, +$20 = 20% more revenue
    freeMints: 100,
    maxMintSizeMB: 500, // Any size
    aiAnalysisLimit: 0,
    coverArtLimit: 0,
    discount: 0.40,
    features: [
      'Everything in Pro',
      '100 free NFT mints/month',
      'White-label options',
      'Dedicated account manager',
      'Priority AI processing',
      'Team collaboration (5 seats)',
      '40% discount on extra mints',
      'Custom integrations',
      'Early access to features'
    ]
  }
];

/**
 * Calculate mint price based on file size
 */
export function calculateMintPrice(fileSizeBytes: number): {
  tier: PriceTier;
  basePrice: number;
  stripeFee: number;
  totalPrice: number;
  arCost: number;
  platformProfit: number;
} {
  const fileSizeMB = fileSizeBytes / (1024 * 1024);
  
  // Find appropriate tier
  let tier = PRICE_TIERS[PRICE_TIERS.length - 1]; // Default to XL
  for (const t of PRICE_TIERS) {
    if (fileSizeMB <= t.maxSizeMB) {
      tier = t;
      break;
    }
  }
  
  const basePrice = tier.usdPrice;
  const stripeFee = (basePrice * 0.029) + 0.30; // Stripe: 2.9% + $0.30
  const totalPrice = basePrice;
  const arCost = tier.arCost;
  const platformProfit = basePrice - stripeFee - arCost;
  
  return {
    tier,
    basePrice,
    stripeFee,
    totalPrice,
    arCost,
    platformProfit
  };
}

/**
 * Calculate discounted price for subscribers
 */
export function calculateSubscriberPrice(
  fileSizeBytes: number,
  subscriptionTier: SubscriptionTier
): {
  originalPrice: number;
  discount: number;
  finalPrice: number;
  saved: number;
} {
  const pricing = calculateMintPrice(fileSizeBytes);
  const discount = subscriptionTier.discount;
  const finalPrice = pricing.totalPrice * (1 - discount);
  const saved = pricing.totalPrice - finalPrice;
  
  return {
    originalPrice: pricing.totalPrice,
    discount,
    finalPrice,
    saved
  };
}

/**
 * Check if mint is free with subscription
 */
export function isMintFreeWithSubscription(
  fileSizeBytes: number,
  subscriptionTier: SubscriptionTier,
  mintsUsedThisMonth: number
): boolean {
  if (subscriptionTier.id === 'free') return false;
  
  const fileSizeMB = fileSizeBytes / (1024 * 1024);
  
  // Check if user has free mints remaining
  if (mintsUsedThisMonth >= subscriptionTier.freeMints) return false;
  
  // Check if file size is within free tier limit
  if (fileSizeMB > subscriptionTier.maxMintSizeMB) return false;
  
  return true;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get subscription tier by ID
 */
export function getSubscriptionTier(tierId: string): SubscriptionTier {
  return SUBSCRIPTION_TIERS.find(t => t.id === tierId) || SUBSCRIPTION_TIERS[0];
}

/**
 * Calculate subscription value/savings
 */
export function calculateSubscriptionValue(
  tier: SubscriptionTier,
  averageMintsPerMonth: number,
  averageFileSizeMB: number
): {
  monthlyCost: number;
  freeMintValue: number;
  discountValue: number;
  featureValue: number;
  totalValue: number;
  savings: number;
  roi: number;
} {
  const monthlyCost = tier.price;
  
  // Value of free mints
  const avgMintPrice = averageFileSizeMB <= 10 ? 2.99 : 
                       averageFileSizeMB <= 50 ? 4.99 : 7.99;
  const freeMintValue = tier.freeMints * avgMintPrice;
  
  // Value of discounts on extra mints
  const extraMints = Math.max(0, averageMintsPerMonth - tier.freeMints);
  const discountValue = extraMints * avgMintPrice * tier.discount;
  
  // Value of features (AI analysis, cover art)
  const aiValue = tier.aiAnalysisLimit === 0 ? 100 : tier.aiAnalysisLimit * 1; // $1 per analysis
  const coverArtValue = tier.coverArtLimit === 0 ? 100 : tier.coverArtLimit * 5; // $5 per cover
  const featureValue = aiValue + coverArtValue;
  
  const totalValue = freeMintValue + discountValue + featureValue;
  const savings = totalValue - monthlyCost;
  const roi = monthlyCost > 0 ? (totalValue / monthlyCost) : 0;
  
  return {
    monthlyCost,
    freeMintValue,
    discountValue,
    featureValue,
    totalValue,
    savings,
    roi
  };
}

/**
 * Get marketplace price suggestion based on asset type
 */
export function suggestMarketplacePrice(assetType: string, fileSizeBytes: number): {
  min: number;
  suggested: number;
  max: number;
  reasoning: string;
} {
  const fileSizeMB = fileSizeBytes / (1024 * 1024);
  
  switch (assetType) {
    case 'audio':
      return {
        min: 5,
        suggested: 15,
        max: 50,
        reasoning: 'Music tracks typically sell for $5-50 depending on quality and exclusivity'
      };
    
    case 'image':
      if (fileSizeMB > 10) {
        return {
          min: 25,
          suggested: 75,
          max: 200,
          reasoning: 'High-resolution images can command premium prices'
        };
      }
      return {
        min: 10,
        suggested: 30,
        max: 100,
        reasoning: 'Digital art typically sells for $10-100'
      };
    
    case 'video':
      return {
        min: 25,
        suggested: 100,
        max: 500,
        reasoning: 'Video content is valuable - price based on length and quality'
      };
    
    case 'document':
      return {
        min: 5,
        suggested: 20,
        max: 100,
        reasoning: 'Documents like eBooks or guides typically sell for $5-100'
      };
    
    default:
      return {
        min: 10,
        suggested: 30,
        max: 100,
        reasoning: 'General digital assets typically sell for $10-100'
      };
  }
}
