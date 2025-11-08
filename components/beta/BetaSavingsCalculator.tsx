'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types';
import { calculateMintPrice, formatCurrency, getSubscriptionTier } from '@/lib/utils/pricing';
import { TrendingUp, Award, Sparkles } from 'lucide-react';

interface BetaSavingsCalculatorProps {
  user: User;
}

export function BetaSavingsCalculator({ user }: BetaSavingsCalculatorProps) {
  const [savings, setSavings] = useState({
    totalMintsUsed: 0,
    totalAISaved: 0,
    totalCoverArtSaved: 0,
    totalMintingSaved: 0,
    totalSaved: 0,
    monthlyValue: 0
  });

  useEffect(() => {
    if (!user?.isBetaUser && !user?.betaAccess) return;

    // Get usage stats
    const mintsUsed = user.monthlyUsage?.mintsUsed || 0;
    const aiUsed = user.monthlyUsage?.aiAnalysisUsed || 0;
    const coverArtUsed = user.monthlyUsage?.coverArtUsed || 0;

    // Calculate what they WOULD have paid

    // 1. Minting costs (assume average file size of 10 MB = $3.99)
    const avgMintPrice = 3.99;
    const mintingSaved = mintsUsed * avgMintPrice;

    // 2. AI analysis costs (would be $1.99 each if pay-per-use)
    const aiAnalysisCost = 1.99;
    const aiSaved = Math.max(0, aiUsed - 10) * aiAnalysisCost; // Free tier gets 10

    // 3. Cover art costs (would be $4.99 each if pay-per-use)
    const coverArtCost = 4.99;
    const coverArtSaved = Math.max(0, coverArtUsed - 5) * coverArtCost; // Free tier gets 5

    // 4. Total saved this month
    const totalSaved = mintingSaved + aiSaved + coverArtSaved;

    // 5. Monthly value (what subscription they'd need)
    let monthlyValue = 0;
    if (mintsUsed >= 20 || aiUsed > 50) {
      monthlyValue = 34.99; // Pro tier
    } else if (mintsUsed >= 5 || aiUsed > 10) {
      monthlyValue = 12.99; // Creator tier
    }

    setSavings({
      totalMintsUsed: mintsUsed,
      totalAISaved: aiSaved,
      totalCoverArtSaved: coverArtSaved,
      totalMintingSaved: mintingSaved,
      totalSaved,
      monthlyValue
    });
  }, [user]);

  if (!user?.isBetaUser && !user?.betaAccess) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-500/50 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-purple-500/30">
        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-purple-300 font-space-mono">
            Beta User Value Report
          </h3>
          <p className="text-sm text-gray-400 font-rajdhani">
            See what you're saving with beta access
          </p>
        </div>
      </div>

      {/* This Month's Usage */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wider font-rajdhani">
          This Month's Activity
        </h4>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-void-black/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-neon-cyan mb-1">
              {savings.totalMintsUsed}
            </div>
            <div className="text-xs text-gray-400">NFTs Minted</div>
          </div>
          <div className="bg-void-black/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-terminal-green mb-1">
              {user.monthlyUsage?.aiAnalysisUsed || 0}
            </div>
            <div className="text-xs text-gray-400">AI Analyses</div>
          </div>
          <div className="bg-void-black/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-archive-amber mb-1">
              {user.monthlyUsage?.coverArtUsed || 0}
            </div>
            <div className="text-xs text-gray-400">Cover Arts</div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown: What You'd Pay */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wider font-rajdhani flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          What This Would Cost Without Beta
        </h4>

        <div className="bg-void-black/50 rounded-lg p-4 space-y-3">
          {/* NFT Minting */}
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-300 font-rajdhani">
                NFT Minting ({savings.totalMintsUsed} × ~$3.99 avg)
              </div>
              <div className="text-xs text-gray-500">
                Based on average 10 MB file size
              </div>
            </div>
            <div className="text-lg font-bold text-neon-cyan font-space-mono">
              {formatCurrency(savings.totalMintingSaved)}
            </div>
          </div>

          {/* AI Analysis */}
          {savings.totalAISaved > 0 && (
            <div className="flex justify-between items-center pt-2 border-t border-gray-700">
              <div>
                <div className="text-sm text-gray-300 font-rajdhani">
                  AI Analysis ({Math.max(0, (user.monthlyUsage?.aiAnalysisUsed || 0) - 10)} × $1.99)
                </div>
                <div className="text-xs text-gray-500">
                  Beyond 10 free analyses
                </div>
              </div>
              <div className="text-lg font-bold text-terminal-green font-space-mono">
                {formatCurrency(savings.totalAISaved)}
              </div>
            </div>
          )}

          {/* Cover Art */}
          {savings.totalCoverArtSaved > 0 && (
            <div className="flex justify-between items-center pt-2 border-t border-gray-700">
              <div>
                <div className="text-sm text-gray-300 font-rajdhani">
                  Cover Art ({Math.max(0, (user.monthlyUsage?.coverArtUsed || 0) - 5)} × $4.99)
                </div>
                <div className="text-xs text-gray-500">
                  Beyond 5 free cover arts
                </div>
              </div>
              <div className="text-lg font-bold text-archive-amber font-space-mono">
                {formatCurrency(savings.totalCoverArtSaved)}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center pt-3 border-t-2 border-purple-500/50">
            <div className="text-base font-bold text-purple-300 font-rajdhani uppercase">
              Total Pay-Per-Use Cost
            </div>
            <div className="text-2xl font-bold text-purple-400 font-space-mono">
              {formatCurrency(savings.totalSaved)}
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Comparison */}
      {savings.monthlyValue > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wider font-rajdhani flex items-center gap-2">
            <Award className="w-4 h-4" />
            Subscription Equivalent
          </h4>

          <div className="bg-void-black/50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-300 font-rajdhani">
                  {savings.monthlyValue === 34.99 ? 'Pro Tier' : 'Creator Tier'} Subscription
                </div>
                <div className="text-xs text-gray-500">
                  Closest paid plan for your usage
                </div>
              </div>
              <div className="text-lg font-bold text-purple-400 font-space-mono">
                {formatCurrency(savings.monthlyValue)}/mo
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Total Savings Badge */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-2 border-purple-500 rounded-lg p-6 text-center">
        <div className="text-sm text-purple-300 mb-2 font-rajdhani font-bold uppercase tracking-wider">
          🎉 Your Beta Savings This Month
        </div>
        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2 font-space-mono">
          {formatCurrency(Math.max(savings.totalSaved, savings.monthlyValue))}
        </div>
        <div className="text-xs text-gray-400 font-rajdhani">
          {user.betaAccessGrantedAt 
            ? `Beta access granted ${new Date(user.betaAccessGrantedAt).toLocaleDateString()}`
            : 'Thank you for being a beta tester!'}
        </div>
      </div>

      {/* Feedback Section */}
      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
        <h4 className="text-sm font-bold text-purple-400 mb-2 font-rajdhani">
          💬 We Value Your Feedback!
        </h4>
        <p className="text-xs text-gray-400 mb-3 font-rajdhani">
          As a beta user, your opinion on pricing matters. Based on your usage this month:
        </p>
        <div className="space-y-2 text-xs text-gray-300 font-rajdhani">
          <div className="flex items-start gap-2">
            <span className="text-purple-400">•</span>
            <span>
              Would you pay <strong className="text-purple-300">{formatCurrency(savings.totalSaved)}</strong> for this month's usage?
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">•</span>
            <span>
              Is the <strong className="text-purple-300">{savings.monthlyValue === 34.99 ? 'Pro' : 'Creator'}</strong> subscription 
              ({formatCurrency(savings.monthlyValue)}/mo) fair for your needs?
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">•</span>
            <span>
              What would be a reasonable price for {savings.totalMintsUsed} NFT mints?
            </span>
          </div>
        </div>
        <div className="mt-4 text-center">
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold font-rajdhani uppercase tracking-wider transition-colors">
            Share Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
