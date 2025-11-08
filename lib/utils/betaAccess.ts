/**
 * Beta Access Helper Functions
 * Check if user has beta access and handle beta-specific logic
 */

import { User } from '@/types';
import { getSubscriptionTier, SUBSCRIPTION_TIERS } from './pricing';

/**
 * Check if user has beta access
 */
export function isBetaUser(user: User | null | undefined): boolean {
  if (!user) return false;
  
  // Check both isBetaUser and betaAccess flags (for compatibility)
  return user.isBetaUser === true || user.betaAccess === true;
}

/**
 * Get effective subscription tier (beta overrides everything)
 */
export function getEffectiveSubscriptionTier(user: User | null | undefined): string {
  if (!user) return 'free';
  
  // Beta users always get beta tier (unlimited everything)
  if (isBetaUser(user)) return 'beta';
  
  // Otherwise return their actual subscription tier
  return user.subscriptionTier || 'free';
}

/**
 * Check if user has access to a feature
 */
export function hasFeatureAccess(
  user: User | null | undefined,
  requiredTier: 'free' | 'creator' | 'pro' | 'studio' = 'free'
): boolean {
  if (!user) return requiredTier === 'free';
  
  // Beta users always have access
  if (isBetaUser(user)) return true;
  
  const tierLevels = { free: 0, beta: 999, creator: 1, pro: 2, studio: 3 };
  const userTier = user.subscriptionTier || 'free';
  const userLevel = tierLevels[userTier] || 0;
  const requiredLevel = tierLevels[requiredTier] || 0;
  
  return userLevel >= requiredLevel;
}

/**
 * Check if user can mint (has credits or beta access)
 */
export function canMintNFT(
  user: User | null | undefined,
  fileSizeBytes: number
): {
  canMint: boolean;
  isFree: boolean;
  reason: string;
} {
  if (!user) {
    return {
      canMint: false,
      isFree: false,
      reason: 'Please log in to mint NFTs'
    };
  }

  // Beta users can always mint for free
  if (isBetaUser(user)) {
    return {
      canMint: true,
      isFree: true,
      reason: 'Beta access - unlimited free mints'
    };
  }

  const tier = getSubscriptionTier(user.subscriptionTier || 'free');
  const usage = user.monthlyUsage || { mintsUsed: 0 };
  const fileSizeMB = fileSizeBytes / (1024 * 1024);

  // Check if user has free mints remaining
  if (usage.mintsUsed < tier.freeMints) {
    // Check if file size is within tier limit
    if (fileSizeMB <= tier.maxMintSizeMB) {
      return {
        canMint: true,
        isFree: true,
        reason: `Free mint ${usage.mintsUsed + 1}/${tier.freeMints} this month`
      };
    } else {
      return {
        canMint: true,
        isFree: false,
        reason: `File too large for free tier (${fileSizeMB.toFixed(1)} MB > ${tier.maxMintSizeMB} MB)`
      };
    }
  }

  // No free mints left, must pay
  return {
    canMint: true,
    isFree: false,
    reason: tier.discount > 0 
      ? `${(tier.discount * 100)}% subscriber discount applied`
      : 'Pay-per-mint pricing'
  };
}

/**
 * Get AI usage limit for user
 */
export function getAIUsageLimit(user: User | null | undefined): {
  analysisLimit: number;
  coverArtLimit: number;
  isUnlimited: boolean;
} {
  if (!user) {
    return {
      analysisLimit: 10,
      coverArtLimit: 5,
      isUnlimited: false
    };
  }

  // Beta users get unlimited
  if (isBetaUser(user)) {
    return {
      analysisLimit: 0, // 0 = unlimited
      coverArtLimit: 0,
      isUnlimited: true
    };
  }

  const tier = getSubscriptionTier(user.subscriptionTier || 'free');
  
  return {
    analysisLimit: tier.aiAnalysisLimit,
    coverArtLimit: tier.coverArtLimit,
    isUnlimited: tier.aiAnalysisLimit === 0 && tier.coverArtLimit === 0
  };
}

/**
 * Format beta access info for display
 */
export function getBetaAccessInfo(user: User | null | undefined): {
  hasBeta: boolean;
  grantedBy?: string;
  grantedAt?: Date;
  reason?: string;
  notes?: string;
} | null {
  if (!user || !isBetaUser(user)) return null;

  return {
    hasBeta: true,
    grantedBy: user.betaAccessGrantedBy,
    grantedAt: user.betaAccessGrantedAt,
    reason: user.betaReason,
    notes: user.betaNotes
  };
}
