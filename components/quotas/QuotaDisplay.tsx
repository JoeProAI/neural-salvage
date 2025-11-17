'use client';

/**
 * Quota Display Component
 * Shows salvage and NFT space usage
 */

import { User } from '@/types';
import { getQuotaPercentage, formatQuota, getQuotaStatus } from '@/lib/quotas/quotaManager';
import { Package, Image } from 'lucide-react';

interface QuotaDisplayProps {
  user: User;
  className?: string;
}

export function QuotaDisplay({ user, className = '' }: QuotaDisplayProps) {
  const salvagePercentage = getQuotaPercentage(
    user.quotas.salvage.used,
    user.quotas.salvage.limit
  );
  const nftPercentage = getQuotaPercentage(
    user.quotas.nft.used,
    user.quotas.nft.limit
  );

  const salvageStatus = getQuotaStatus(salvagePercentage);
  const nftStatus = getQuotaStatus(nftPercentage);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {/* Salvage Space */}
      <div className="metal-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Package className="w-6 h-6 text-salvage-rust" />
          <div>
            <h3 className="text-lg font-space-mono font-bold text-pure-white uppercase">
              Salvage Space
            </h3>
            <p className="text-xs text-ash-gray font-rajdhani">
              Rough drafts & experiments
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="w-full bg-void-black/50 rounded-full h-3 overflow-hidden border border-salvage-rust/30">
            <div
              className={`h-full transition-all duration-300 ${
                salvageStatus.status === 'full'
                  ? 'bg-red-500'
                  : salvageStatus.status === 'critical'
                  ? 'bg-archive-amber'
                  : salvageStatus.status === 'warning'
                  ? 'bg-yellow-500'
                  : 'bg-salvage-rust'
              }`}
              style={{ width: `${Math.min(salvagePercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center">
          <span className="text-2xl font-space-mono font-bold text-salvage-rust">
            {formatQuota(user.quotas.salvage.used, user.quotas.salvage.limit)}
          </span>
          <span className="text-sm text-ash-gray font-rajdhani">
            {salvagePercentage}% used
          </span>
        </div>

        {salvageStatus.status === 'full' && (
          <p className="text-xs text-red-400 mt-2 font-rajdhani">
            ⚠️ Salvage space full! Upgrade or clear items.
          </p>
        )}
      </div>

      {/* NFT Space */}
      <div className="metal-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Image className="w-6 h-6 text-data-cyan" />
          <div>
            <h3 className="text-lg font-space-mono font-bold text-pure-white uppercase">
              NFT Space
            </h3>
            <p className="text-xs text-ash-gray font-rajdhani">
              Polished & mint-ready
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="w-full bg-void-black/50 rounded-full h-3 overflow-hidden border border-data-cyan/30">
            <div
              className={`h-full transition-all duration-300 ${
                nftStatus.status === 'full'
                  ? 'bg-red-500'
                  : nftStatus.status === 'critical'
                  ? 'bg-archive-amber'
                  : nftStatus.status === 'warning'
                  ? 'bg-yellow-500'
                  : 'bg-data-cyan'
              }`}
              style={{ width: `${Math.min(nftPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center">
          <span className="text-2xl font-space-mono font-bold text-data-cyan">
            {formatQuota(user.quotas.nft.used, user.quotas.nft.limit)}
          </span>
          <span className="text-sm text-ash-gray font-rajdhani">
            {nftPercentage}% used
          </span>
        </div>

        {nftStatus.status === 'full' && (
          <p className="text-xs text-red-400 mt-2 font-rajdhani">
            ⚠️ NFT space full! Upgrade or mint existing items.
          </p>
        )}
      </div>
    </div>
  );
}
