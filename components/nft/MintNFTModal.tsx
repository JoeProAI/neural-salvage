'use client';

/**
 * Mint NFT Modal
 * Allows users to mint their assets as REAL blockchain NFTs on Arweave
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useArweaveWallet } from '@/lib/hooks/useArweaveWallet';
import { useAuth } from '@/contexts/AuthContext';
import { X, Wallet, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { PermanenceWarningModal } from './PermanenceWarningModal';

interface MintNFTModalProps {
  assetId: string;
  assetName: string;
  assetDescription?: string;
  onClose: () => void;
  onSuccess: (nftId: string) => void;
}

interface CostEstimate {
  assetId: string;
  fileSize: number;
  fileSizeMB: string;
  blockchain: string;
  costs: {
    arweave: { ar: string; usd: string };
    platformFee: { usd: string };
    total: { usd: string };
  };
  arweavePrice: { usd: string };
  benefits: string[];
  notes: string[];
}

export function MintNFTModal({ assetId, assetName, assetDescription, onClose, onSuccess }: MintNFTModalProps) {
  const { user } = useAuth();
  const wallet = useArweaveWallet();
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);
  const [estimate, setEstimate] = useState<CostEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nftName, setNftName] = useState(assetName);
  const [nftDescription, setNftDescription] = useState(assetDescription || '');
  const [showWarning, setShowWarning] = useState(false);
  const [warningAccepted, setWarningAccepted] = useState(false);

  useEffect(() => {
    fetchEstimate();
  }, [assetId]);

  const fetchEstimate = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/nft/estimate?assetId=${assetId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get estimate');
      }

      if (data.alreadyMinted) {
        setError('This asset is already minted as an NFT');
        return;
      }

      setEstimate(data.estimate);
    } catch (err: any) {
      console.error('Estimate error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMint = async () => {
    // Show warning modal if not yet accepted
    if (!warningAccepted) {
      setShowWarning(true);
      return;
    }

    console.log('🎨 [NFT MINT] Starting mint process...', {
      assetId,
      assetName,
      nftName,
      walletConnected: wallet.connected,
      walletAddress: wallet.address,
      estimatedCost: estimate?.costs?.total?.usd
    });

    try {
      if (!wallet.connected) {
        console.log('⚠️ [NFT MINT] Wallet not connected, requesting connection...');
        await wallet.connect();
        return;
      }

      setMinting(true);
      setError(null);

      // Get userId from auth context
      if (!user?.id) {
        throw new Error('You must be logged in to mint NFTs');
      }
      const userId = user.id;
      console.log('✅ [NFT MINT] User authenticated:', { userId: userId.substring(0, 8) + '...' });

      // Enforce Stripe minimum of $0.50, default to $2.99
      const estimatedPrice = estimate?.costs?.total?.usd ? parseFloat(estimate.costs.total.usd) : 2.99;
      const mintPrice = Math.max(estimatedPrice, 2.99);
      
      console.log('💰 [NFT MINT] Price calculation:', {
        estimatedPrice,
        finalPrice: mintPrice,
        enforceMinimum: mintPrice !== estimatedPrice
      });

      // Check if payment is required
      console.log('💳 [NFT MINT] Checking payment requirements...');
      const paymentResponse = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'nft_mint',
          assetId,
          userId,
          price: mintPrice,
        }),
      });

      const paymentData = await paymentResponse.json();
      console.log('💳 [NFT MINT] Payment check response:', {
        isBetaUser: paymentData.isBetaUser,
        isPro: paymentData.isPro,
        freeMintUsed: paymentData.freeMintUsed,
        hasCheckoutUrl: !!paymentData.checkoutUrl
      });

      // Beta users and Pro users (with free mints left) get free minting
      if (paymentData.isBetaUser || paymentData.isPro || paymentData.freeMintUsed) {
        console.log('✅ [NFT MINT] Free mint approved, proceeding to blockchain...');
        
        // Proceed directly to mint
        const response = await fetch('/api/nft/mint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assetId,
            blockchain: 'arweave',
            metadata: {
              name: nftName,
              description: nftDescription,
            },
            royaltyPercentage: 10,
            walletAddress: wallet.address,
          }),
        });

        const data = await response.json();
        console.log('🎯 [NFT MINT] Mint API response:', {
          success: response.ok,
          status: response.status,
          hasNFT: !!data.nft
        });

        if (!response.ok) {
          console.error('❌ [NFT MINT] Mint failed:', data.error);
          throw new Error(data.error || 'Failed to mint NFT');
        }

        // Success!
        console.log('🎉 [NFT MINT] SUCCESS! NFT minted:', {
          nftId: data.nft.id,
          txId: data.nft.txId,
          viewUrl: data.nft.viewUrl
        });
        onSuccess(data.nft.id);
      } else if (paymentData.checkoutUrl) {
        // Redirect to payment
        console.log('💰 [NFT MINT] Payment required, redirecting to Stripe...', {
          checkoutUrl: paymentData.checkoutUrl
        });
        window.location.href = paymentData.checkoutUrl;
      } else {
        console.error('❌ [NFT MINT] Payment setup failed - no checkout URL and not free');
        throw new Error('Payment setup failed');
      }
    } catch (err: any) {
      console.error('❌ [NFT MINT] Error:', err);
      setError(err.message);
    } finally {
      setMinting(false);
      console.log('🏁 [NFT MINT] Process completed');
    }
  };

  return (
    <>
      {showWarning && (
        <PermanenceWarningModal
          onAccept={() => {
            setWarningAccepted(true);
            setShowWarning(false);
            // Auto-trigger mint after accepting
            setTimeout(() => handleMint(), 100);
          }}
          onCancel={() => {
            setShowWarning(false);
            onClose(); // Close the entire mint modal
          }}
        />
      )}

      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-salvage-dark border border-neon-cyan/30 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-salvage-dark border-b border-neon-cyan/30 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-neon-cyan">Mint NFT on Arweave</h2>
            <p className="text-sm text-gray-400 mt-1">Create a real, permanent blockchain NFT</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan mx-auto"></div>
              <p className="text-gray-400 mt-4">Calculating costs...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium">Error</p>
                <p className="text-red-300 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {estimate && !loading && (
            <>
              {/* NFT Details Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    NFT Name
                  </label>
                  <input
                    type="text"
                    value={nftName}
                    onChange={(e) => setNftName(e.target.value)}
                    className="w-full bg-salvage-metal border-2 border-neon-cyan/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan"
                    placeholder="Enter NFT name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={nftDescription}
                    onChange={(e) => setNftDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-salvage-metal border-2 border-neon-cyan/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan resize-none"
                    placeholder="Describe your NFT"
                  />
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-salvage-metal border border-neon-cyan/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Cost Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">File Size:</span>
                    <span className="text-white">{estimate.fileSizeMB} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Arweave Storage:</span>
                    <span className="text-white">${estimate.costs.arweave.usd}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Platform Fee:</span>
                    <span className="text-white">${estimate.costs.platformFee.usd}</span>
                  </div>
                  <div className="border-t border-neon-cyan/30 pt-2 mt-2 flex justify-between">
                    <span className="text-neon-cyan font-semibold">Total Cost:</span>
                    <span className="text-neon-cyan font-bold text-lg">${estimate.costs.total.usd}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    AR Price: ${estimate.arweavePrice.usd} USD
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-neon-cyan/5 border border-neon-cyan/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-neon-cyan mb-3">Why Arweave?</h3>
                <ul className="space-y-2">
                  {estimate.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-neon-cyan flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Important Notes */}
              <div className="bg-yellow-500/5 border border-yellow-500/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Important</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  {estimate.notes.map((note, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-yellow-400">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Wallet Connection */}
              {!wallet.connected ? (
                <button
                  onClick={wallet.connect}
                  disabled={wallet.connecting}
                  className="w-full bg-neon-cyan text-black hover:bg-neon-cyan/90 font-bold py-6 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  {wallet.connecting ? 'Connecting...' : 'Connect ArConnect Wallet'}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-green-400 font-medium text-sm">Wallet Connected</p>
                      <p className="text-green-300 text-xs truncate">{wallet.address}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleMint}
                    disabled={minting || !nftName}
                    className="w-full bg-neon-cyan text-black hover:bg-neon-cyan/90 font-bold py-6 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {minting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                        Minting NFT...
                      </>
                    ) : (
                      <>Mint NFT for ${Math.max(parseFloat(estimate.costs.total.usd), 2.99).toFixed(2)}</>
                    )}
                  </button>
                </div>
              )}

              {/* Learn More */}
              <div className="text-center">
                <a
                  href="https://arweave.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-neon-cyan hover:underline inline-flex items-center gap-1"
                >
                  Learn more about Arweave <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
