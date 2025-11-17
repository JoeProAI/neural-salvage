/**
 * Quota Management System
 * Handles salvage and NFT space quotas based on user tier
 */

import { User } from '@/types';

export interface QuotaLimits {
  salvage: number;
  nft: number;
}

/**
 * Get quota limits based on subscription tier
 */
export function getQuotaLimits(tier: User['subscriptionTier']): QuotaLimits {
  switch (tier) {
    case 'free':
      return {
        salvage: 20,   // 20 salvage items
        nft: 5,        // 5 NFT slots
      };
    
    case 'beta':
      return {
        salvage: 200,  // Beta users get Pro limits for free
        nft: 50,
      };
    
    case 'creator':
    case 'pro':
      return {
        salvage: 200,  // 200 salvage items
        nft: 50,       // 50 NFT slots
      };
    
    case 'studio':
      return {
        salvage: 999999, // Unlimited
        nft: 999999,     // Unlimited
      };
    
    default:
      return {
        salvage: 20,
        nft: 5,
      };
  }
}

/**
 * Initialize quotas for new user
 */
export function initializeQuotas(tier: User['subscriptionTier']) {
  const limits = getQuotaLimits(tier);
  return {
    salvage: {
      used: 0,
      limit: limits.salvage,
    },
    nft: {
      used: 0,
      limit: limits.nft,
    },
  };
}

/**
 * Check if user can add item to space
 */
export function canAddToSpace(
  user: User,
  space: 'salvage' | 'nft'
): { allowed: boolean; reason?: string } {
  const quota = user.quotas[space];
  
  if (!quota) {
    return {
      allowed: false,
      reason: 'Quota not initialized',
    };
  }
  
  if (quota.used >= quota.limit) {
    return {
      allowed: false,
      reason: `${space === 'salvage' ? 'Salvage' : 'NFT'} space full (${quota.used}/${quota.limit})`,
    };
  }
  
  return { allowed: true };
}

/**
 * Get percentage of quota used
 */
export function getQuotaPercentage(used: number, limit: number): number {
  if (limit === 999999) return 0; // Unlimited
  return Math.round((used / limit) * 100);
}

/**
 * Get quota status with color coding
 */
export function getQuotaStatus(percentage: number): {
  color: string;
  status: 'safe' | 'warning' | 'critical' | 'full';
} {
  if (percentage >= 100) {
    return { color: 'red', status: 'full' };
  } else if (percentage >= 90) {
    return { color: 'orange', status: 'critical' };
  } else if (percentage >= 75) {
    return { color: 'yellow', status: 'warning' };
  } else {
    return { color: 'green', status: 'safe' };
  }
}

/**
 * Format quota display
 */
export function formatQuota(used: number, limit: number): string {
  if (limit === 999999) {
    return `${used} items`;
  }
  return `${used}/${limit}`;
}
