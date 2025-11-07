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

      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-deep-space/95 via-void-black/98 to-deep-space/95 border-2 border-data-cyan/30 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(111,205,221,0.15)]">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-void-black via-deep-space to-void-black border-b-2 border-data-cyan/30 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-space-mono font-bold text-data-cyan uppercase tracking-wider" style={{ textShadow: '0 0 20px #6FCDDD' }}>Mint NFT on Arweave</h2>
            <p className="text-sm text-ash-gray mt-2 font-rajdhani">Create a real, permanent blockchain NFT • 200+ Year Storage</p>
          </div>
          <button
            onClick={onClose}
            className="text-ash-gray hover:text-archive-amber transition-colors p-2 hover:bg-archive-amber/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-data-cyan mx-auto" style={{ filter: 'drop-shadow(0 0 10px #6FCDDD)' }}></div>
              <p className="text-ash-gray mt-4 font-rajdhani uppercase tracking-wider">Calculating costs...</p>
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
                  <label className="block text-sm font-rajdhani font-semibold text-data-cyan mb-2 uppercase tracking-wider">
                    NFT Name
                  </label>
                  <input
                    type="text"
                    value={nftName}
                    onChange={(e) => setNftName(e.target.value)}
                    className="w-full bg-deep-space/80 border-2 border-data-cyan/30 rounded-lg px-4 py-3 text-pure-white placeholder-ash-gray/50 focus:outline-none focus:border-data-cyan focus:shadow-[0_0_20px_rgba(111,205,221,0.3)] transition-all font-inter"
                    placeholder="Enter NFT name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-rajdhani font-semibold text-data-cyan mb-2 uppercase tracking-wider">
                    Description (Optional)
                  </label>
                  <textarea
                    value={nftDescription}
                    onChange={(e) => setNftDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-deep-space/80 border-2 border-data-cyan/30 rounded-lg px-4 py-3 text-pure-white placeholder-ash-gray/50 focus:outline-none focus:border-data-cyan focus:shadow-[0_0_20px_rgba(111,205,221,0.3)] resize-none transition-all font-inter"
                    placeholder="Describe your NFT"
                  />
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-gradient-to-br from-deep-space/60 to-panel-dark/80 border-2 border-data-cyan/30 rounded-lg p-5" style={{ boxShadow: 'inset 0 2px 0 rgba(111, 205, 221, 0.1)' }}>
                <h3 className="text-lg font-space-mono font-bold text-archive-amber mb-4 uppercase tracking-wider" style={{ textShadow: '0 0 15px #E8A55C' }}>Cost Breakdown</h3>
                <div className="space-y-3 text-sm font-rajdhani">
                  <div className="flex justify-between items-center">
                    <span className="text-ash-gray font-medium">File Size:</span>
                    <span className="text-pure-white font-semibold">{estimate.fileSizeMB} MB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ash-gray font-medium">Arweave Storage:</span>
                    <span className="text-pure-white font-semibold">${estimate.costs.arweave.usd}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ash-gray font-medium">Platform Fee:</span>
                    <span className="text-pure-white font-semibold">${estimate.costs.platformFee.usd}</span>
                  </div>
                  <div className="border-t-2 border-data-cyan/30 pt-3 mt-3 flex justify-between items-center">
                    <span className="text-data-cyan font-bold text-base uppercase">Total Cost:</span>
                    <span className="text-archive-amber font-bold text-xl" style={{ textShadow: '0 0 15px #E8A55C' }}>${estimate.costs.total.usd}</span>
                  </div>
                  <p className="text-xs text-ash-gray/70 mt-2 font-jetbrains">
                    AR Price: ${estimate.arweavePrice.usd} USD
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-data-cyan/5 border-2 border-data-cyan/30 rounded-lg p-5">
                <h3 className="text-lg font-space-mono font-bold text-data-cyan mb-4 uppercase tracking-wider" style={{ textShadow: '0 0 15px #6FCDDD' }}>Why Arweave?</h3>
                <ul className="space-y-3">
                  {estimate.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-ash-gray font-rajdhani">
                      <Check className="w-5 h-5 text-terminal-green flex-shrink-0 mt-0.5" style={{ filter: 'drop-shadow(0 0 8px #7FB069)' }} />
                      <span className="text-pure-white">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Important Notes */}
              <div className="bg-archive-amber/5 border-2 border-archive-amber/30 rounded-lg p-5">
                <h3 className="text-lg font-space-mono font-bold text-archive-amber mb-3 uppercase tracking-wider" style={{ textShadow: '0 0 15px #E8A55C' }}>⚠️ Important</h3>
                <ul className="space-y-2 text-sm text-ash-gray font-rajdhani">
                  {estimate.notes.map((note, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-archive-amber font-bold text-lg">•</span>
                      <span className="text-pure-white">{note}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Wallet Connection */}
              {!wallet.connected ? (
                <button
                  onClick={wallet.connect}
                  disabled={wallet.connecting}
                  className="w-full bg-gradient-to-r from-data-cyan via-quantum-blue to-data-cyan text-void-black hover:shadow-[0_0_30px_rgba(111,205,221,0.6)] font-space-mono font-bold py-6 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center uppercase tracking-wider transform hover:scale-[1.02]"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                >
                  <Wallet className="w-5 h-5 mr-3" />
                  {wallet.connecting ? 'Connecting...' : 'Connect ArConnect Wallet'}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-terminal-green/10 border-2 border-terminal-green/40 rounded-lg p-4 flex items-center gap-3">
                    <div className="w-3 h-3 bg-terminal-green rounded-full animate-pulse" style={{ boxShadow: '0 0 15px #7FB069' }}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-terminal-green font-rajdhani font-bold text-sm uppercase tracking-wider">Wallet Connected</p>
                      <p className="text-ash-gray text-xs truncate font-jetbrains mt-1">{wallet.address}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleMint}
                    disabled={minting || !nftName}
                    className="cyberpunk-button w-full py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                  >
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-archive-amber via-data-cyan to-archive-amber opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10 flex items-center justify-center">
                      {minting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-void-black mr-3"></div>
                          <span className="font-space-mono font-bold uppercase tracking-wider">Minting NFT...</span>
                        </>
                      ) : (
                        <>
                          <span className="font-space-mono font-bold uppercase tracking-wider">
                            🎨 Mint NFT for ${Math.max(parseFloat(estimate.costs.total.usd), 2.99).toFixed(2)}
                          </span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              )}

              {/* Learn More */}
              <div className="text-center">
                <a
                  href="https://arweave.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-data-cyan hover:text-archive-amber transition-colors inline-flex items-center gap-2 font-rajdhani font-semibold uppercase tracking-wider hover:shadow-[0_0_15px_rgba(111,205,221,0.3)] px-4 py-2 rounded-lg"
                >
                  Learn more about Arweave <ExternalLink className="w-4 h-4" />
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
