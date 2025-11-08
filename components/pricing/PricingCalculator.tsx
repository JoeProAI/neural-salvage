'use client';

import { useState, useEffect } from 'react';
import { calculateMintPrice, formatFileSize, formatCurrency, calculateSubscriberPrice, isMintFreeWithSubscription, getSubscriptionTier } from '@/lib/utils/pricing';

interface PricingCalculatorProps {
  fileSizeBytes: number;
  fileName: string;
  userSubscriptionTier?: 'free' | 'creator' | 'pro' | 'studio';
  mintsUsedThisMonth?: number;
}

export function PricingCalculator({
  fileSizeBytes,
  fileName,
  userSubscriptionTier = 'free',
  mintsUsedThisMonth = 0
}: PricingCalculatorProps) {
  const pricing = calculateMintPrice(fileSizeBytes);
  const subscription = getSubscriptionTier(userSubscriptionTier);
  const isFree = isMintFreeWithSubscription(fileSizeBytes, subscription, mintsUsedThisMonth);
  const discountedPricing = userSubscriptionTier !== 'free' 
    ? calculateSubscriberPrice(fileSizeBytes, subscription)
    : null;

  return (
    <div className="bg-deep-space/80 border-2 border-data-cyan/30 rounded-lg p-6 space-y-4">
      {/* File Info */}
      <div className="flex items-center justify-between pb-4 border-b border-data-cyan/20">
        <div>
          <p className="text-ash-gray text-sm font-rajdhani">File Name</p>
          <p className="text-pure-white font-space-mono text-sm truncate max-w-xs">{fileName}</p>
        </div>
        <div className="text-right">
          <p className="text-ash-gray text-sm font-rajdhani">File Size</p>
          <p className="text-data-cyan font-space-mono font-bold">{formatFileSize(fileSizeBytes)}</p>
        </div>
      </div>

      {/* Pricing Tier */}
      <div className="bg-void-black/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-ash-gray font-rajdhani">Pricing Tier</span>
          <span className="bg-data-cyan/20 text-data-cyan px-3 py-1 rounded-full font-space-mono font-bold text-sm">
            {pricing.tier.name}
          </span>
        </div>
        <p className="text-ash-gray/70 text-xs font-rajdhani">{pricing.tier.description}</p>
      </div>

      {/* Free with Subscription */}
      {isFree && (
        <div className="bg-terminal-green/10 border-2 border-terminal-green rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-terminal-green/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-terminal-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-terminal-green font-space-mono font-bold uppercase text-sm tracking-wider">
                Free with your {subscription.name} plan!
              </p>
              <p className="text-ash-gray text-xs font-rajdhani mt-1">
                {subscription.freeMints - mintsUsedThisMonth} free mints remaining this month
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Discounted Price for Subscribers */}
      {!isFree && userSubscriptionTier !== 'free' && discountedPricing && (
        <div className="bg-archive-amber/10 border-2 border-archive-amber/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-ash-gray font-rajdhani">Subscriber Discount</span>
            <span className="text-archive-amber font-space-mono font-bold">
              {(discountedPricing.discount * 100)}% OFF
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ash-gray text-xs line-through">{formatCurrency(discountedPricing.originalPrice)}</p>
              <p className="text-terminal-green font-space-mono font-bold text-2xl">
                {formatCurrency(discountedPricing.finalPrice)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-terminal-green text-xs font-rajdhani">You save</p>
              <p className="text-terminal-green font-space-mono font-bold">
                {formatCurrency(discountedPricing.saved)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Regular Price */}
      {!isFree && userSubscriptionTier === 'free' && (
        <div className="bg-void-black/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-ash-gray font-rajdhani">Mint Price</span>
            <span className="text-data-cyan font-space-mono font-bold text-3xl">
              {formatCurrency(pricing.totalPrice)}
            </span>
          </div>
          <p className="text-ash-gray/70 text-xs font-rajdhani">
            One-time payment • Stored permanently on Arweave
          </p>
        </div>
      )}

      {/* Cost Breakdown */}
      {!isFree && (
        <details className="group">
          <summary className="cursor-pointer text-data-cyan text-sm font-space-mono font-bold uppercase tracking-wider hover:text-archive-amber transition-colors">
            View Cost Breakdown
          </summary>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-ash-gray font-rajdhani">Arweave Storage</span>
              <span className="text-pure-white font-jetbrains">${pricing.arCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ash-gray font-rajdhani">Payment Processing</span>
              <span className="text-pure-white font-jetbrains">${pricing.stripeFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ash-gray font-rajdhani">Platform Service</span>
              <span className="text-pure-white font-jetbrains">${pricing.platformProfit.toFixed(2)}</span>
            </div>
            <div className="border-t border-data-cyan/20 pt-2 flex justify-between items-center font-bold">
              <span className="text-data-cyan font-space-mono">Total</span>
              <span className="text-data-cyan font-space-mono">
                {formatCurrency(discountedPricing?.finalPrice || pricing.totalPrice)}
              </span>
            </div>
          </div>
        </details>
      )}

      {/* Payment Method Info */}
      <div className="bg-quantum-blue/10 border border-quantum-blue/30 rounded-lg p-3">
        <p className="text-quantum-blue text-xs font-rajdhani font-bold uppercase tracking-wider mb-1">
          💳 Payment Method
        </p>
        <p className="text-ash-gray/80 text-xs font-rajdhani">
          {isFree 
            ? 'Just sign with your ArConnect wallet to claim your free mint'
            : 'Pay with credit card via Stripe • No crypto needed • ArConnect signature required for ownership proof'
          }
        </p>
      </div>

      {/* Upgrade Suggestion */}
      {!isFree && userSubscriptionTier === 'free' && pricing.totalPrice >= 4.99 && (
        <div className="bg-archive-amber/10 border border-archive-amber/30 rounded-lg p-3">
          <p className="text-archive-amber text-xs font-space-mono font-bold uppercase mb-1">
            💡 Save with Creator Plan
          </p>
          <p className="text-ash-gray/80 text-xs font-rajdhani">
            Get 5 free mints/month + 15% off for just $9.99/month. This mint would be FREE!
          </p>
        </div>
      )}
    </div>
  );
}
