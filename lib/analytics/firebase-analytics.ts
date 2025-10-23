/**
 * Firebase Analytics Service
 * Track user behavior and events
 */

import { getAnalytics, logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { app } from '@/lib/firebase/client';

let analytics: ReturnType<typeof getAnalytics> | null = null;

// Initialize analytics (client-side only)
export function initAnalytics() {
  if (typeof window !== 'undefined' && !analytics) {
    analytics = getAnalytics(app);
  }
  return analytics;
}

// Track custom events
export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    const analyticsInstance = analytics || initAnalytics();
    if (analyticsInstance) {
      logEvent(analyticsInstance, eventName, params);
    }
  }
}

// Track page views
export function trackPageView(pagePath: string, pageTitle?: string) {
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle || pagePath,
  });
}

// Track user signup
export function trackSignup(method: string) {
  trackEvent('sign_up', {
    method,
  });
}

// Track asset upload
export function trackAssetUpload(params: {
  assetId: string;
  type: string;
  size: number;
  mimeType: string;
}) {
  trackEvent('asset_uploaded', {
    asset_id: params.assetId,
    asset_type: params.type,
    file_size: params.size,
    mime_type: params.mimeType,
  });
}

// Track NFT mint start
export function trackMintStart(params: {
  assetId: string;
  estimatedCost: number;
}) {
  trackEvent('mint_started', {
    asset_id: params.assetId,
    estimated_cost: params.estimatedCost,
  });
}

// Track NFT mint success
export function trackMintSuccess(params: {
  assetId: string;
  nftId: string;
  arweaveId: string;
  actualCost: number;
  blockchain: string;
}) {
  trackEvent('mint_success', {
    asset_id: params.assetId,
    nft_id: params.nftId,
    arweave_id: params.arweaveId,
    actual_cost: params.actualCost,
    blockchain: params.blockchain,
    value: params.actualCost, // For revenue tracking
    currency: 'USD',
  });
}

// Track NFT mint failure
export function trackMintFailure(params: {
  assetId: string;
  error: string;
}) {
  trackEvent('mint_failed', {
    asset_id: params.assetId,
    error_message: params.error,
  });
}

// Track marketplace listing
export function trackListingCreated(params: {
  nftId: string;
  price: number;
}) {
  trackEvent('listing_created', {
    nft_id: params.nftId,
    price: params.price,
    currency: 'USD',
  });
}

// Track marketplace purchase
export function trackPurchase(params: {
  nftId: string;
  price: number;
  sellerId: string;
  buyerId: string;
}) {
  trackEvent('purchase', {
    nft_id: params.nftId,
    value: params.price,
    currency: 'USD',
    seller_id: params.sellerId,
    buyer_id: params.buyerId,
  });
}

// Track search
export function trackSearch(query: string, resultsCount: number) {
  trackEvent('search', {
    search_term: query,
    results_count: resultsCount,
  });
}

// Track feature usage
export function trackFeatureUsage(feature: string, action?: string) {
  trackEvent('feature_used', {
    feature_name: feature,
    action: action || 'used',
  });
}

// Set user ID (after login)
export function setAnalyticsUserId(userId: string) {
  if (typeof window !== 'undefined') {
    const analyticsInstance = analytics || initAnalytics();
    if (analyticsInstance) {
      setUserId(analyticsInstance, userId);
    }
  }
}

// Set user properties
export function setAnalyticsUserProperties(properties: Record<string, any>) {
  if (typeof window !== 'undefined') {
    const analyticsInstance = analytics || initAnalytics();
    if (analyticsInstance) {
      setUserProperties(analyticsInstance, properties);
    }
  }
}

// Track errors
export function trackError(error: Error, context?: string) {
  trackEvent('error', {
    error_message: error.message,
    error_stack: error.stack,
    context: context || 'unknown',
  });
}
