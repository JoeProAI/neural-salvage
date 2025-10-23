/**
 * PostHog Analytics Service
 * Product analytics and feature tracking
 */

import posthog from 'posthog-js';

// Identify user
export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    posthog.identify(userId, properties);
  }
}

// Track events
export function trackPostHogEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    posthog.capture(eventName, properties);
  }
}

// Set user properties
export function setUserProperties(properties: Record<string, any>) {
  if (typeof window !== 'undefined') {
    posthog.people.set(properties);
  }
}

// Track NFT mint
export function trackNFTMint(params: {
  assetId: string;
  nftId: string;
  cost: number;
  blockchain: string;
}) {
  trackPostHogEvent('nft_minted', {
    asset_id: params.assetId,
    nft_id: params.nftId,
    cost: params.cost,
    blockchain: params.blockchain,
  });
}

// Track asset upload
export function trackAssetUploaded(params: {
  assetId: string;
  type: string;
  size: number;
}) {
  trackPostHogEvent('asset_uploaded', {
    asset_id: params.assetId,
    asset_type: params.type,
    file_size: params.size,
  });
}

// Track marketplace action
export function trackMarketplaceAction(action: string, params: Record<string, any>) {
  trackPostHogEvent(`marketplace_${action}`, params);
}

// Track feature usage
export function trackFeature(feature: string, action?: string) {
  trackPostHogEvent('feature_used', {
    feature,
    action: action || 'clicked',
  });
}

// Create feature flag check
export function isFeatureEnabled(flagKey: string): boolean {
  if (typeof window !== 'undefined') {
    return posthog.isFeatureEnabled(flagKey) || false;
  }
  return false;
}

// Reset on logout
export function resetPostHog() {
  if (typeof window !== 'undefined') {
    posthog.reset();
  }
}
