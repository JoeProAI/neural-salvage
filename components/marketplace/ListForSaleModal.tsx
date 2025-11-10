'use client';

import { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, AlertCircle, Loader2, ShoppingCart } from 'lucide-react';
import { useArweaveWallet } from '@/lib/hooks/useArweaveWallet';
import { getARPrice, convertUSDtoAR } from '@/lib/marketplace/bazar';
import Arweave from 'arweave';

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
});

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
  const [priceUSD, setPriceUSD] = useState<string>(''); // Empty - user sets their price
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
    if (!wallet.connected || !wallet.address) {
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

      console.log('📝 [LIST] Starting blockchain listing process...');
      console.log('📝 [LIST] NFT ID:', nftId);
      console.log('📝 [LIST] Price USD:', priceUSD);
      console.log('📝 [LIST] Price AR:', priceAR);
      console.log('📝 [LIST] Duration:', duration);
      console.log('📝 [LIST] Wallet address:', wallet.address);

      // Check if ArConnect is available
      console.log('🔍 [LIST] Step 1: Checking ArConnect availability...');
      if (!window.arweaveWallet) {
        throw new Error('ArConnect wallet not found. Please install ArConnect extension.');
      }
      console.log('✅ [LIST] ArConnect found');

      // Convert price to Winston (smallest AR unit)
      console.log('💰 [LIST] Step 2: Converting price to Winston...');
      const priceInWinston = (parseFloat(priceAR) * 1e12).toString();
      console.log('✅ [LIST] Price conversion complete:', {
        usd: priceUSD,
        ar: priceAR,
        winston: priceInWinston,
      });

      // Create listing data
      console.log('📦 [LIST] Step 3: Preparing listing data...');
      const listingData = {
        assetId: nftId,
        price: priceInWinston,
        seller: wallet.address,
        createdAt: Date.now(),
        expiresAt: duration > 0 ? Date.now() + (duration * 24 * 60 * 60 * 1000) : null,
      };
      console.log('✅ [LIST] Listing data prepared:', listingData);

      console.log('🔐 [LIST] Step 4: Creating transaction with Arweave.js...');
      // Create transaction using Arweave.js (unsigned)
      const tx = await arweave.createTransaction({
        data: JSON.stringify(listingData),
      });
      console.log('✅ [LIST] Transaction created:', tx.id);

      console.log('🏷️ [LIST] Step 5: Adding BazAR marketplace tags...');
      // Add BazAR-compatible tags
      tx.addTag('App-Name', 'BazAR');
      tx.addTag('App-Version', '1.0');
      tx.addTag('Type', 'Order');
      tx.addTag('Order-Type', 'Sell');
      tx.addTag('Asset-Id', nftId);
      tx.addTag('Price', priceInWinston);
      tx.addTag('Currency', 'AR');
      tx.addTag('Seller', wallet.address);
      
      if (duration > 0) {
        const expiresAt = Date.now() + (duration * 24 * 60 * 60 * 1000);
        tx.addTag('Expires-At', expiresAt.toString());
      }
      console.log('✅ [LIST] Tags added. Transaction tags:', tx.tags);

      console.log('✍️ [LIST] Step 6: Requesting signature from ArConnect wallet...');
      console.log('⏳ [LIST] Waiting for user to approve transaction in ArConnect popup...');
      
      // Sign and submit transaction with ArConnect
      const result = await window.arweaveWallet.dispatch(tx);
      console.log('✅ [LIST] Transaction signed and dispatched!');
      console.log('📋 [LIST] Result:', result);
      console.log('✅ [LIST] Transaction ID:', result.id);

      // Save to Firebase for fast loading (optional)
      try {
        await fetch('/api/marketplace/save-blockchain-listing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionId: result.id,
            assetId: nftId,
            price: parseFloat(priceUSD),
            priceAR: parseFloat(priceAR),
            seller: wallet.address,
            duration,
          }),
        });
        console.log('💾 [LIST] Cached listing in Firebase for fast loading');
      } catch (cacheError) {
        console.warn('⚠️ [LIST] Failed to cache in Firebase (not critical):', cacheError);
      }

      console.log('🎉 [LIST] NFT listed on blockchain! Will appear on BazAR in 2-3 minutes.');
      onSuccess(result.id);
    } catch (err: any) {
      console.error('❌ [LIST] Error:', err);
      console.error('❌ [LIST] Error type:', typeof err);
      console.error('❌ [LIST] Error message:', err.message);
      console.error('❌ [LIST] Full error object:', JSON.stringify(err, null, 2));
      
      // User-friendly error messages
      let errorMessage = 'Failed to create listing';
      
      if (err.message?.includes('User canceled') || err.message?.includes('rejected') || err.message?.includes('cancel')) {
        errorMessage = 'Transaction canceled. You must approve the transaction in ArConnect to list your NFT.';
      } else if (err.message?.includes('ArConnect') || err.message?.includes('arweaveWallet')) {
        errorMessage = 'ArConnect wallet not found. Please install ArConnect extension and connect your wallet.';
      } else if (err.message?.includes('insufficient') || err.message?.includes('balance')) {
        errorMessage = 'Insufficient AR balance. You need ~0.001 AR ($0.025) for gas fees. Fund your wallet and try again.';
      } else if (err.message?.includes('permission') || err.message?.includes('DISPATCH')) {
        errorMessage = 'Missing permissions. Please reconnect your wallet and approve all permissions.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Log helpful debug info
      console.log('🔍 [DEBUG] To fix this:');
      console.log('1. Check ArConnect is installed');
      console.log('2. Check wallet is connected');
      console.log('3. Check wallet has AR balance (need ~0.001 AR)');
      console.log('4. Check browser console for detailed error');
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
