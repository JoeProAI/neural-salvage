'use client';

import { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, AlertCircle, Loader2, ShoppingCart } from 'lucide-react';
import { useArweaveWallet } from '@/lib/hooks/useArweaveWallet';
import { getARPrice, convertUSDtoAR } from '@/lib/marketplace/bazar';

interface ListForSaleModalProps {
  nftId: string;
  nftName: string;
  nftImage: string;
  currentOwner: string;
  onClose: () => void;
  onSuccess: (listingId: string) => void;
}

export function ListForSaleModal({
  nftId,
  nftName,
  nftImage,
  currentOwner,
  onClose,
  onSuccess,
}: ListForSaleModalProps) {
  const wallet = useArweaveWallet();
  const [priceUSD, setPriceUSD] = useState<string>('50');
  const [priceAR, setPriceAR] = useState<string>('0');
  const [arPrice, setArPrice] = useState<number>(25);
  const [duration, setDuration] = useState<number>(0); // 0 = no expiration
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch AR price on mount
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const price = await getARPrice();
        setArPrice(price);
        updateARPrice(priceUSD, price);
      } catch (error) {
        console.error('Failed to fetch AR price:', error);
      }
    };
    fetchPrice();
  }, []);

  const updateARPrice = (usd: string, currentARPrice?: number) => {
    const usdValue = parseFloat(usd) || 0;
    const priceToUse = currentARPrice || arPrice;
    const ar = usdValue / priceToUse;
    setPriceAR(ar.toFixed(4));
  };

  const handleUSDChange = (value: string) => {
    setPriceUSD(value);
    updateARPrice(value);
  };

  const handleListForSale = async () => {
    if (!wallet.connected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!priceUSD || parseFloat(priceUSD) <= 0) {
      setError('Please enter a valid price');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📝 [LIST] Creating listing...', {
        nftId,
        priceUSD,
        priceAR,
        duration,
      });

      // Call API to create listing
      const response = await fetch('/api/marketplace/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: nftId,
          price: parseFloat(priceUSD),
          currency: 'USD',
          duration,
          walletAddress: wallet.address,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create listing');
      }

      const data = await response.json();
      console.log('✅ [LIST] Listing created:', data);

      // Now sign the transaction with user's wallet
      if (wallet.connected && data.transaction) {
        console.log('🔐 [LIST] Requesting signature from wallet...');
        
        try {
          // Sign transaction with ArConnect or Wanderer
          await (window as any).arweaveWallet.sign(data.transaction);
          
          // Submit to Arweave
          const submitResponse = await fetch('/api/marketplace/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transaction: data.transaction }),
          });

          if (!submitResponse.ok) {
            throw new Error('Failed to submit listing');
          }

          const submitData = await submitResponse.json();
          console.log('🎉 [LIST] Listing submitted successfully!', submitData.transactionId);

          onSuccess(submitData.transactionId);
        } catch (signError: any) {
          console.error('❌ [LIST] User rejected signature:', signError);
          throw new Error('You must sign the transaction to list your NFT');
        }
      }
    } catch (err: any) {
      console.error('❌ [LIST] Error:', err);
      setError(err.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-deep-space border-2 border-data-cyan rounded-xl shadow-[0_0_30px_rgba(111,205,221,0.3)]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-data-cyan/30">
          <h2 className="text-2xl font-space-mono font-bold text-data-cyan uppercase">
            List for Sale
          </h2>
          <button
            onClick={onClose}
            className="text-ash-gray hover:text-data-cyan transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* NFT Preview */}
          <div className="flex items-center gap-4 p-4 bg-void-black/50 border border-data-cyan/20 rounded-lg">
            {nftImage && (
              <img
                src={nftImage}
                alt={nftName}
                className="w-16 h-16 object-cover rounded-lg border-2 border-data-cyan/30"
              />
            )}
            <div className="flex-1">
              <h3 className="font-space-mono font-bold text-pure-white truncate">
                {nftName}
              </h3>
              <p className="text-sm text-ash-gray font-rajdhani">
                {nftId.substring(0, 12)}...
              </p>
            </div>
          </div>

          {/* Price Input */}
          <div>
            <label className="block text-sm font-rajdhani font-bold text-ash-gray mb-2">
              Set Price
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-terminal-green" />
              <input
                type="number"
                value={priceUSD}
                onChange={(e) => handleUSDChange(e.target.value)}
                placeholder="50"
                min="0"
                step="0.01"
                className="w-full pl-10 pr-16 py-3 bg-void-black border-2 border-data-cyan/30 focus:border-data-cyan rounded-lg text-pure-white font-space-mono text-lg outline-none transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-terminal-green font-space-mono font-bold">
                USD
              </span>
            </div>
            <p className="mt-2 text-sm text-ash-gray font-rajdhani">
              ≈ {priceAR} AR (${arPrice.toFixed(2)} per AR)
            </p>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-rajdhani font-bold text-ash-gray mb-3">
              <Calendar className="inline w-4 h-4 mr-2" />
              Listing Duration
            </label>
            <div className="space-y-2">
              {[
                { value: 7, label: '7 days' },
                { value: 30, label: '30 days' },
                { value: 90, label: '90 days' },
                { value: 0, label: 'No expiration' },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 p-3 bg-void-black/50 border border-data-cyan/20 rounded-lg cursor-pointer hover:border-data-cyan/50 transition-colors"
                >
                  <input
                    type="radio"
                    name="duration"
                    value={option.value}
                    checked={duration === option.value}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-4 h-4 text-data-cyan"
                  />
                  <span className="font-rajdhani text-pure-white">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Fees Info */}
          <div className="p-4 bg-quantum-blue/10 border border-quantum-blue/30 rounded-lg">
            <h4 className="font-rajdhani font-bold text-quantum-blue mb-2">
              Fee Breakdown
            </h4>
            <div className="space-y-1 text-sm font-rajdhani text-ash-gray">
              <div className="flex justify-between">
                <span>Sale Price:</span>
                <span className="text-pure-white">${priceUSD}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee (2%):</span>
                <span className="text-archive-amber">-${(parseFloat(priceUSD) * 0.02).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-terminal-green">
                <span>You Receive:</span>
                <span>${(parseFloat(priceUSD) * 0.98).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-error-red/10 border border-error-red/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-error-red flex-shrink-0 mt-0.5" />
              <p className="text-sm text-error-red font-rajdhani">{error}</p>
            </div>
          )}

          {/* Wallet Connection Warning */}
          {!wallet.connected && (
            <div className="p-4 bg-archive-amber/10 border border-archive-amber/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-archive-amber flex-shrink-0 mt-0.5" />
              <p className="text-sm text-archive-amber font-rajdhani">
                Connect your wallet to list this NFT for sale
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-void-black border-2 border-ash-gray/30 text-ash-gray rounded-lg font-rajdhani font-bold uppercase hover:border-ash-gray hover:text-pure-white transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleListForSale}
              disabled={loading || !wallet.connected || !priceUSD || parseFloat(priceUSD) <= 0}
              className="flex-1 cyberpunk-button px-6 py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-space-mono font-bold uppercase">Listing...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span className="font-space-mono font-bold uppercase">List for Sale</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
