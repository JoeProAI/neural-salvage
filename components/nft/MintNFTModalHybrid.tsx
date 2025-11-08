'use client';

/**
 * Mint NFT Modal - HYBRID MODEL
 * Platform pays AR, user signs for ownership
 * Simple UX: Just pay $4.99 and sign!
 */

import { useState, useEffect } from 'react';
import { useArweaveWallet } from '@/lib/hooks/useArweaveWallet';
import { useAuth } from '@/contexts/AuthContext';
import { X, Wallet, Check, AlertCircle, Loader2, Shield } from 'lucide-react';
import { PermanenceWarningModal } from './PermanenceWarningModal';

interface AIAnalysis {
  caption?: string;
  summary?: string;
  tags?: string[];
  transcript?: string;
  keyTopics?: string[];
  documentType?: string;
  colors?: string[];
  ocr?: string;
}

interface MintNFTModalProps {
  assetId: string;
  assetName: string;
  assetDescription?: string;
  aiAnalysis?: AIAnalysis;
  onClose: () => void;
  onSuccess: (nftId: string) => void;
}

// Generate rich description from AI analysis
const generateRichDescription = (aiAnalysis?: AIAnalysis, manualDescription?: string): string => {
  if (manualDescription) return manualDescription;
  if (!aiAnalysis) return '';
  
  const parts: string[] = [];
  
  // Add caption or summary
  if (aiAnalysis.caption) {
    parts.push(aiAnalysis.caption);
  } else if (aiAnalysis.summary) {
    parts.push(aiAnalysis.summary);
  }
  
  // Add transcript excerpt
  if (aiAnalysis.transcript) {
    const excerpt = aiAnalysis.transcript.length > 200 
      ? aiAnalysis.transcript.substring(0, 200) + '...'
      : aiAnalysis.transcript;
    parts.push(`\n\nTranscript: ${excerpt}`);
  }
  
  // Add document type for documents
  if (aiAnalysis.documentType) {
    parts.push(`\n\nType: ${aiAnalysis.documentType}`);
  }
  
  // Add key topics
  if (aiAnalysis.keyTopics && aiAnalysis.keyTopics.length > 0) {
    parts.push(`\n\nTopics: ${aiAnalysis.keyTopics.join(', ')}`);
  }
  
  // Add tags
  if (aiAnalysis.tags && aiAnalysis.tags.length > 0) {
    parts.push(`\n\nTags: ${aiAnalysis.tags.join(', ')}`);
  }
  
  // Add OCR text if available
  if (aiAnalysis.ocr) {
    const ocrExcerpt = aiAnalysis.ocr.length > 150 
      ? aiAnalysis.ocr.substring(0, 150) + '...'
      : aiAnalysis.ocr;
    parts.push(`\n\nText: ${ocrExcerpt}`);
  }
  
  return parts.join('');
};

export function MintNFTModalHybrid({ assetId, assetName, assetDescription, aiAnalysis, onClose, onSuccess }: MintNFTModalProps) {
  const { user } = useAuth();
  const wallet = useArweaveWallet();
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nftName, setNftName] = useState(assetName);
  const [nftDescription, setNftDescription] = useState(generateRichDescription(aiAnalysis, assetDescription));
  const [showWarning, setShowWarning] = useState(false);
  const [warningAccepted, setWarningAccepted] = useState(false);
  const [step, setStep] = useState<'connect' | 'payment' | 'signature' | 'minting'>('connect');

  // Check if returning from payment
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success' && urlParams.get('action') === 'mint') {
      // Restore saved data
      const storageKey = `nft-mint-${assetId}`;
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        try {
          const { warningAccepted: accepted, nftName: savedName, nftDescription: savedDesc } = JSON.parse(savedData);
          if (accepted) {
            setWarningAccepted(true);
            if (savedName) setNftName(savedName);
            if (savedDesc) setNftDescription(savedDesc);
            localStorage.removeItem(storageKey);
            // Move to signature step
            setStep('signature');
          }
        } catch (e) {
          console.error('Failed to parse saved mint data:', e);
        }
      }
    }
  }, [assetId]);

  const handleInitialMint = () => {
    // Show warning modal first
    if (!warningAccepted) {
      setShowWarning(true);
      return;
    }
    
    // Move to wallet connection
    if (!wallet.connected) {
      setStep('connect');
    } else {
      handlePayment();
    }
  };

  const handlePayment = async () => {
    try {
      setError(null);
      
      if (!user?.id) {
        throw new Error('You must be logged in to mint NFTs');
      }

      // Save state before payment
      const storageKey = `nft-mint-${assetId}`;
      localStorage.setItem(storageKey, JSON.stringify({
        warningAccepted: true,
        nftName,
        nftDescription,
        timestamp: Date.now()
      }));

      // Check if payment is required
      const paymentResponse = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'nft_mint',
          assetId,
          userId: user.id,
          price: 4.99, // Fixed price - platform covers AR
        }),
      });

      const paymentData = await paymentResponse.json();

      // Beta users and Pro users get free minting
      if (paymentData.isBetaUser || paymentData.isPro || paymentData.freeMintUsed) {
        console.log('✅ [NFT MINT] Free mint approved');
        setStep('signature');
      } else if (paymentData.checkoutUrl) {
        console.log('💰 [NFT MINT] Redirecting to payment...');
        window.location.href = paymentData.checkoutUrl;
      } else {
        throw new Error('Payment setup failed');
      }
    } catch (err: any) {
      console.error('❌ [NFT MINT] Error:', err);
      setError(err.message);
    }
  };

  const handleGetSignature = async () => {
    try {
      setMinting(true);
      setError(null);
      setStep('signature');

      console.log('✍️ [NFT MINT] Requesting user signature...');
      console.log('📋 [NFT MINT] Wallet address:', wallet.address);

      // Check ArConnect availability
      if (!(window as any).arweaveWallet) {
        throw new Error('ArConnect not found. Please install ArConnect extension.');
      }

      // Ensure we have SIGN_TRANSACTION permission
      try {
        const permissions = await (window as any).arweaveWallet.getPermissions();
        console.log('🔑 [NFT MINT] Current permissions:', permissions);
        
        if (!permissions.includes('SIGN_TRANSACTION') && !permissions.includes('ACCESS_ADDRESS')) {
          console.log('⚠️ [NFT MINT] Missing permissions, requesting...');
          await (window as any).arweaveWallet.connect(['ACCESS_ADDRESS', 'SIGN_TRANSACTION']);
          console.log('✅ [NFT MINT] Permissions granted');
        }
      } catch (permErr) {
        console.warn('⚠️ [NFT MINT] Permission check failed:', permErr);
        // Try to reconnect with proper permissions
        await (window as any).arweaveWallet.connect(['ACCESS_ADDRESS', 'SIGN_TRANSACTION']);
      }

      // Create simple message for user to sign
      const timestamp = Date.now();
      const message = JSON.stringify({
        action: 'mint-nft',
        platform: 'Neural-Salvage',
        assetId,
        name: nftName,
        description: nftDescription,
        timestamp,
        statement: 'I authorize the minting of this NFT and claim ownership'
      });

      console.log('📝 [NFT MINT] Message to sign:', message);

      // Request signature from ArConnect using simpler signMessage API with timeout
      let signatureBase64: string;
      
      // Create a promise with timeout
      const signaturePromise = new Promise<string>(async (resolve, reject) => {
        try {
          console.log('🔐 [NFT MINT] Requesting signature from ArConnect...');
          
          // Try the newer signMessage API first
          const signatureResult = await (window as any).arweaveWallet.signMessage(
            new TextEncoder().encode(message)
          );
          
          // Convert to base64
          if (typeof signatureResult === 'string') {
            resolve(signatureResult);
          } else {
            resolve(btoa(String.fromCharCode(...new Uint8Array(signatureResult))));
          }
          
          console.log('✅ [NFT MINT] Signature obtained via signMessage');
        } catch (signError) {
          console.log('⚠️ [NFT MINT] signMessage failed, trying signature API...', signError);
          
          try {
            // Fallback to older signature API
            const signature = await (window as any).arweaveWallet.signature(
              new TextEncoder().encode(message),
              {
                name: 'RSA-PSS',
                saltLength: 32,
              }
            );
            resolve(btoa(String.fromCharCode(...new Uint8Array(signature))));
            console.log('✅ [NFT MINT] Signature obtained via signature API');
          } catch (fallbackError) {
            reject(fallbackError);
          }
        }
      });

      // Add 60 second timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Signature request timed out after 60 seconds. Please try again.')), 60000);
      });

      signatureBase64 = await Promise.race([signaturePromise, timeoutPromise]);
      
      console.log('🔐 [NFT MINT] Signature length:', signatureBase64.length);
      
      // Proceed to mint
      await handleMint({
        signature: signatureBase64,
        message,
        timestamp
      });

    } catch (err: any) {
      console.error('❌ [NFT MINT] Signature error:', err);
      console.error('❌ [NFT MINT] Error details:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      
      if (err.message?.includes('User cancelled') || err.message?.includes('rejected') || err.message?.includes('denied')) {
        setError('❌ Signature cancelled. You must approve the ArConnect popup to prove ownership of this NFT.');
      } else if (err.message?.includes('timed out')) {
        setError('⏱️ Signature request timed out. Please check for an ArConnect popup window and try again. You may need to click the ArConnect extension icon.');
      } else if (err.message?.includes('ArConnect not found')) {
        setError('❌ ArConnect wallet not found. Please install the ArConnect browser extension and refresh the page.');
      } else if (err.message?.includes('permission')) {
        setError('🔐 Missing permissions. Please reconnect your ArConnect wallet and grant signature permissions.');
      } else {
        setError('❌ Failed to get signature: ' + err.message + '. Try: 1) Check ArConnect popup, 2) Click the button again, or 3) Disconnect and reconnect your wallet below.');
      }
      setMinting(false);
      // Stay on signature step, don't revert to payment
      setStep('signature');
    }
  };

  const handleMint = async (userSignature: { signature: string; message: string; timestamp: number }) => {
    try {
      setStep('minting');
      console.log('🎨 [NFT MINT] Starting mint with signature...');

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
          userSignature,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mint NFT');
      }

      console.log('🎉 [NFT MINT] SUCCESS!');
      console.log('📊 [NFT MINT] Mint Result:', {
        nftId: data.nft.id,
        arweaveId: data.nft.arweaveId,
        arweaveUrl: data.nft.arweaveUrl,
        metadataUrl: data.nft.metadataUrl,
        assetUrl: data.nft.assetUrl,
        cost: data.nft.cost
      });
      console.log('🔗 [NFT MINT] View on Arweave:', data.nft.arweaveUrl);
      console.log('🔗 [NFT MINT] View Asset:', data.nft.assetUrl);
      console.log('🔗 [NFT MINT] View Metadata:', data.nft.metadataUrl);
      
      onSuccess(data.nft.id);
    } catch (err: any) {
      console.error('❌ [NFT MINT] Mint error:', err);
      setError(err.message);
      setMinting(false);
      setStep('signature');
    }
  };

  return (
    <>
      {showWarning && (
        <PermanenceWarningModal
          onAccept={() => {
            setWarningAccepted(true);
            setShowWarning(false);
            if (wallet.connected) {
              handlePayment();
            } else {
              setStep('connect');
            }
          }}
          onCancel={() => {
            setShowWarning(false);
            onClose();
          }}
        />
      )}

      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-deep-space/95 via-void-black/98 to-deep-space/95 border-2 border-data-cyan/30 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(111,205,221,0.15)]">
          
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-void-black via-deep-space to-void-black border-b-2 border-data-cyan/30 p-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-space-mono font-bold text-data-cyan uppercase tracking-wider" style={{ textShadow: '0 0 20px #6FCDDD' }}>
                Mint NFT - Hybrid Model
              </h2>
              <p className="text-sm text-ash-gray mt-2 font-rajdhani">
                Platform covers blockchain fees • You own it forever
              </p>
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
            
            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border-2 border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-rajdhani font-semibold">Error</p>
                  <p className="text-red-300 text-sm font-rajdhani mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* NFT Details */}
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
                  disabled={minting}
                />
              </div>

              <div>
                <label className="block text-sm font-rajdhani font-semibold text-data-cyan mb-2 uppercase tracking-wider">
                  Description {aiAnalysis && !assetDescription && '(AI-Generated)'}
                </label>
                {aiAnalysis && !assetDescription && (
                  <p className="text-xs text-terminal-green mb-2 font-rajdhani">
                    ✨ Auto-filled from AI analysis. Edit as needed.
                  </p>
                )}
                <textarea
                  value={nftDescription}
                  onChange={(e) => setNftDescription(e.target.value)}
                  rows={8}
                  className="w-full bg-deep-space/80 border-2 border-data-cyan/30 rounded-lg px-4 py-3 text-pure-white placeholder-ash-gray/50 focus:outline-none focus:border-data-cyan focus:shadow-[0_0_20px_rgba(111,205,221,0.3)] resize-y transition-all font-inter text-sm leading-relaxed"
                  placeholder="Describe your NFT (or let AI do it for you)"
                  disabled={minting}
                />
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-gradient-to-br from-deep-space/60 to-panel-dark/80 border-2 border-archive-amber/30 rounded-lg p-6" style={{ boxShadow: 'inset 0 2px 0 rgba(232, 165, 92, 0.1)' }}>
              <h3 className="text-xl font-space-mono font-bold text-archive-amber mb-4 uppercase tracking-wider" style={{ textShadow: '0 0 15px #E8A55C' }}>
                Simple Pricing
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-ash-gray font-rajdhani font-medium">Service Fee:</span>
                  <span className="text-pure-white font-space-mono font-bold">$4.99</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="text-ash-gray font-rajdhani font-medium">Blockchain Storage:</span>
                  <span className="text-terminal-green font-space-mono font-bold">✓ Included</span>
                </div>
                <div className="border-t-2 border-archive-amber/30 pt-3 mt-3 flex justify-between items-center">
                  <span className="text-data-cyan font-space-mono font-bold text-xl uppercase">Total:</span>
                  <span className="text-archive-amber font-space-mono font-bold text-2xl" style={{ textShadow: '0 0 15px #E8A55C' }}>$4.99</span>
                </div>
                <p className="text-xs text-ash-gray/70 mt-2 font-rajdhani text-center">
                  We cover all blockchain fees (~$0.05 AR) • 200+ year storage guaranteed
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-data-cyan/5 border-2 border-data-cyan/30 rounded-lg p-5">
              <h3 className="text-lg font-space-mono font-bold text-data-cyan mb-4 uppercase tracking-wider">Why This is Special</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm font-rajdhani">
                  <Check className="w-5 h-5 text-terminal-green flex-shrink-0 mt-0.5" />
                  <span className="text-pure-white">No crypto needed - we cover blockchain fees</span>
                </li>
                <li className="flex items-start gap-3 text-sm font-rajdhani">
                  <Shield className="w-5 h-5 text-data-cyan flex-shrink-0 mt-0.5" />
                  <span className="text-pure-white">You sign to prove ownership - truly yours</span>
                </li>
                <li className="flex items-start gap-3 text-sm font-rajdhani">
                  <Check className="w-5 h-5 text-terminal-green flex-shrink-0 mt-0.5" />
                  <span className="text-pure-white">Permanent storage - 200+ years on Arweave</span>
                </li>
                <li className="flex items-start gap-3 text-sm font-rajdhani">
                  <Check className="w-5 h-5 text-terminal-green flex-shrink-0 mt-0.5" />
                  <span className="text-pure-white">Sell on external marketplaces (BazAR, Pianity)</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            {!wallet.connected ? (
              <button
                onClick={wallet.connect}
                disabled={wallet.connecting}
                className="w-full bg-gradient-to-r from-data-cyan via-quantum-blue to-data-cyan text-void-black hover:shadow-[0_0_30px_rgba(111,205,221,0.6)] font-space-mono font-bold py-6 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center uppercase tracking-wider transform hover:scale-[1.02]"
              >
                <Wallet className="w-5 h-5 mr-3" />
                {wallet.connecting ? 'Connecting...' : 'Connect ArConnect Wallet'}
              </button>
            ) : step === 'connect' || step === 'payment' ? (
              <button
                onClick={handleInitialMint}
                disabled={minting || !nftName}
                className="cyberpunk-button w-full py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                <div className="relative z-10 flex items-center justify-center">
                  <span className="font-space-mono font-bold uppercase tracking-wider">
                    🎨 Mint NFT for $4.99
                  </span>
                </div>
              </button>
            ) : step === 'signature' ? (
              <>
                {/* Signature Help Message */}
                <div className="bg-data-cyan/10 border-2 border-data-cyan/40 rounded-lg p-4 mb-4">
                  <p className="text-data-cyan font-rajdhani font-bold text-sm uppercase tracking-wider mb-2">
                    💎 Final Step: Prove Ownership
                  </p>
                  <p className="text-ash-gray text-xs font-rajdhani leading-relaxed">
                    Click below to sign with ArConnect. This proves you own this NFT (no blockchain fees!). 
                    A popup will appear - approve it to continue.
                  </p>
                </div>
                
                <button
                  onClick={handleGetSignature}
                  disabled={minting}
                  className="cyberpunk-button w-full py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <div className="relative z-10 flex items-center justify-center">
                    {minting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        <span className="font-space-mono font-bold uppercase tracking-wider">Waiting for Signature...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5 mr-3" />
                        <span className="font-space-mono font-bold uppercase tracking-wider">Sign to Prove Ownership</span>
                      </>
                    )}
                  </div>
                </button>
                
                {minting && (
                  <p className="text-xs text-archive-amber font-rajdhani mt-3 text-center">
                    ⏳ Check ArConnect popup and approve the signature request
                  </p>
                )}
              </>
            ) : (
              <div className="bg-terminal-green/10 border-2 border-terminal-green/40 rounded-lg p-6 text-center space-y-3">
                <Loader2 className="w-12 h-12 text-terminal-green mx-auto animate-spin" />
                <div>
                  <p className="text-terminal-green font-space-mono font-bold text-lg uppercase">Minting Your NFT...</p>
                  <p className="text-ash-gray text-sm font-rajdhani mt-2">Uploading to Arweave blockchain</p>
                </div>
                <div className="bg-archive-amber/10 border-2 border-archive-amber/50 rounded-lg p-4 mt-4">
                  <p className="text-archive-amber text-sm font-rajdhani font-bold uppercase tracking-wider mb-2">
                    ⏱️ Blockchain Confirmation Time
                  </p>
                  <p className="text-pure-white text-sm font-rajdhani leading-relaxed mb-2">
                    <strong>Upload:</strong> 30-60 seconds
                  </p>
                  <p className="text-pure-white text-sm font-rajdhani leading-relaxed font-bold">
                    <strong>Full Confirmation:</strong> UP TO 20 MINUTES
                  </p>
                  <p className="text-ash-gray text-xs font-rajdhani leading-relaxed mt-2">
                    Your NFT will show as "Pending" until the Arweave blockchain mines the block. 
                    This is completely normal for decentralized NFTs!
                  </p>
                </div>
              </div>
            )}

            {/* Wallet Status */}
            {wallet.connected && (
              <>
                {/* Wallet Ownership Warning */}
                <div className="bg-archive-amber/10 border-2 border-archive-amber/40 rounded-lg p-4">
                  <p className="text-archive-amber font-rajdhani font-bold text-xs uppercase tracking-wider mb-2">
                    ⚠️ Important: Check Your Wallet
                  </p>
                  <p className="text-ash-gray text-xs font-rajdhani leading-relaxed">
                    This NFT will be permanently tied to the wallet address below. Make sure this is YOUR wallet before minting!
                  </p>
                </div>

                <div className="bg-terminal-green/10 border-2 border-terminal-green/40 rounded-lg p-4 flex items-center gap-3">
                  <div className="w-3 h-3 bg-terminal-green rounded-full animate-pulse" style={{ boxShadow: '0 0 15px #7FB069' }}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-terminal-green font-rajdhani font-bold text-sm uppercase tracking-wider">Wallet Connected</p>
                    <p className="text-ash-gray text-xs truncate font-jetbrains mt-1">{wallet.address}</p>
                  </div>
                <button
                  onClick={() => {
                    wallet.disconnect();
                    onClose();
                  }}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border-2 border-red-500/50 hover:border-red-500 text-red-400 hover:text-red-300 rounded-lg font-rajdhani font-bold text-xs uppercase tracking-wider transition-all"
                  title="Disconnect wallet and reconnect with new permissions"
                >
                  Disconnect
                </button>
              </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
