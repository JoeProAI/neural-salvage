'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { NFT } from '@/types';
import Link from 'next/link';
import { ExternalLink, ArrowLeft, Copy, Check, ShoppingCart } from 'lucide-react';
import { ListForSaleModal } from '@/components/marketplace/ListForSaleModal';
import { MediaPlayer } from '@/components/nft/MediaPlayer';
import { getMediaInfo } from '@/lib/utils/mediaType';

export default function NFTDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const nftId = params.id as string;
  
  const [nft, setNft] = useState<NFT | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [listingSuccess, setListingSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      loadNFT();
    }
  }, [authLoading, nftId]);

  const loadNFT = async () => {
    try {
      setLoading(true);
      console.log('🔍 [NFT DETAIL] Loading NFT:', nftId);
      
      // Try Firebase first
      let foundInFirebase = false;
      try {
        const nftDoc = await getDoc(doc(db, 'nfts', nftId));
        
        if (nftDoc.exists()) {
          console.log('✅ [NFT DETAIL] Found in Firebase');
          setNft({ ...nftDoc.data(), id: nftDoc.id } as NFT);
          foundInFirebase = true;
        }
      } catch (firebaseError: any) {
        console.warn('⚠️ [NFT DETAIL] Firebase unavailable:', firebaseError.message);
      }
      
      if (!foundInFirebase) {
        console.log('⚠️ [NFT DETAIL] Not in Firebase, checking blockchain...');
        
        // Query blockchain by transaction ID
        try {
          const { queryNFTsBySignature, fetchNFTMetadata } = await import('@/lib/nft/arweave-query');
          
          // Fetch the transaction directly
          const metadata = await fetchNFTMetadata(nftId);
          
          if (metadata) {
            console.log('✅ [NFT DETAIL] Found on blockchain');
            
            // Create temporary NFT object from blockchain data
            setNft({
              id: nftId,
              assetId: '',
              userId: user?.id || '',
              blockchain: 'arweave',
              status: 'confirmed',
              arweave: {
                arweaveId: nftId,
                arweaveUrl: `https://arweave.net/${nftId}`,
                manifestId: nftId,
                bundlrId: nftId,
                uploadCost: 0,
                uploadedAt: new Date(),
                confirmedAt: new Date(),
              },
              metadata: {
                name: metadata.name || 'Untitled NFT',
                description: metadata.description || '',
                image: metadata.image || '',
                attributes: metadata.attributes || [],
              },
              metadataUri: `https://arweave.net/${nftId}`,
              currentOwner: '',
              originalMinter: '',
              royaltyPercentage: 3,
              transfers: [],
              isVerified: true,
              verifiedAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            } as NFT);
          } else {
            console.error('❌ [NFT DETAIL] NFT not found on blockchain either');
          }
        } catch (blockchainError) {
          console.error('❌ [NFT DETAIL] Blockchain query failed:', blockchainError);
        }
      }
    } catch (error) {
      console.error('❌ [NFT DETAIL] Error loading NFT:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-void-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-data-cyan mx-auto"></div>
          <p className="text-ash-gray mt-4 font-rajdhani">Loading NFT...</p>
        </div>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="min-h-screen bg-void-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-space-mono font-bold text-data-cyan mb-4">NFT Not Found</h1>
          <p className="text-ash-gray mb-6 font-rajdhani">This NFT doesn't exist or has been removed.</p>
          <Link href="/gallery" className="cyberpunk-button inline-block px-6 py-3">
            Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  const arweaveUrl = nft.arweave?.arweaveUrl || `https://arweave.net/${nft.arweave?.arweaveId}`;
  const viewBlockUrl = `https://viewblock.io/arweave/tx/${nft.arweave?.arweaveId}`;
  const bazarUrl = `https://bazar.arweave.dev/#/asset/${nft.arweave?.manifestId}`;

  return (
    <div className="min-h-screen bg-void-black">
      {/* Header */}
      <header className="border-b-2 border-data-cyan/30 bg-deep-space/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-data-cyan hover:text-archive-amber transition-colors font-rajdhani font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-xl font-space-mono font-bold text-data-cyan uppercase tracking-wider">
              NFT Details
            </h1>
            <div className="w-20"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column - Media */}
          <div className="space-y-6">
            {(() => {
              const mediaInfo = getMediaInfo(nft.metadata.image || '');
              
              // Show MediaPlayer for audio/video
              if (mediaInfo.type === 'audio' || mediaInfo.type === 'video') {
                return (
                  <div className="space-y-4">
                    <MediaPlayer
                      src={nft.metadata.image || ''}
                      type={mediaInfo.type}
                      title={nft.metadata.name}
                      showDownload={user?.id === nft.userId}
                    />
                    <div className="flex items-center justify-between">
                      <span className="bg-terminal-green/20 border-2 border-terminal-green text-terminal-green px-4 py-2 rounded-lg font-space-mono font-bold text-sm uppercase">
                        {nft.status}
                      </span>
                      <span className="text-data-cyan font-space-mono text-sm">
                        {mediaInfo.type === 'audio' ? '🎵 Audio NFT' : '🎬 Video NFT'}
                      </span>
                    </div>
                  </div>
                );
              }
              
              // Show image for everything else
              return (
                <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-data-cyan/30 bg-deep-space/80">
                  {nft.metadata.image && (
                    <img
                      src={nft.metadata.image}
                      alt={nft.metadata.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="bg-terminal-green/20 border-2 border-terminal-green text-terminal-green px-4 py-2 rounded-lg font-space-mono font-bold text-sm uppercase">
                      {nft.status}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <a
                href={arweaveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-data-cyan/20 to-quantum-blue/20 hover:from-data-cyan/30 hover:to-quantum-blue/30 border-2 border-data-cyan/40 hover:border-data-cyan rounded-lg p-4 flex items-center justify-center gap-2 transition-all group"
              >
                <ExternalLink className="w-5 h-5 text-data-cyan group-hover:scale-110 transition-transform" />
                <span className="font-rajdhani font-bold text-data-cyan">View on Arweave</span>
              </a>
              
              <a
                href={viewBlockUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-archive-amber/20 to-orange-500/20 hover:from-archive-amber/30 hover:to-orange-500/30 border-2 border-archive-amber/40 hover:border-archive-amber rounded-lg p-4 flex items-center justify-center gap-2 transition-all group"
              >
                <ExternalLink className="w-5 h-5 text-archive-amber group-hover:scale-110 transition-transform" />
                <span className="font-rajdhani font-bold text-archive-amber">ViewBlock</span>
              </a>
            </div>

            {/* List for Sale - New Button */}
            {listingSuccess ? (
              <div className="bg-terminal-green/10 border-2 border-terminal-green rounded-lg p-6 text-center">
                <Check className="w-12 h-12 text-terminal-green mx-auto mb-3" />
                <h3 className="text-terminal-green font-space-mono font-bold text-lg mb-2">
                  Listed Successfully!
                </h3>
                <p className="text-ash-gray font-rajdhani text-sm">
                  Your NFT is now for sale. It will appear on BazAR marketplace in 2-3 minutes.
                </p>
              </div>
            ) : (
              <button
                onClick={() => setShowListModal(true)}
                className="cyberpunk-button w-full py-4 flex items-center justify-center gap-3 text-lg"
              >
                <ShoppingCart className="w-6 h-6" />
                <span className="font-space-mono font-bold uppercase">List for Sale</span>
              </button>
            )}

            {/* Selling Info */}
            <div className="bg-quantum-blue/10 border-2 border-quantum-blue/30 rounded-lg p-6">
              <h3 className="text-quantum-blue font-space-mono font-bold text-sm uppercase tracking-wider mb-3">
                💰 How to Sell
              </h3>
              <div className="space-y-3 text-sm font-rajdhani text-pure-white/80">
                <div className="flex items-start gap-2">
                  <span className="text-quantum-blue font-bold">1.</span>
                  <span>Click "List for Sale" above and set your price in USD</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-quantum-blue font-bold">2.</span>
                  <span>Connect your wallet and sign the listing transaction</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-quantum-blue font-bold">3.</span>
                  <span>Your NFT appears on BazAR and other marketplaces</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-quantum-blue font-bold">4.</span>
                  <span>You earn 98% (after 2% platform fee) + future royalties</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-quantum-blue/20">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ash-gray">Example: Sell for $50</span>
                  <span className="text-terminal-green font-bold">You get $49</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-8">
            
            {/* Title & Description */}
            <div>
              <h2 className="text-4xl font-space-mono font-bold text-pure-white mb-4" style={{ textShadow: '0 0 20px rgba(255,255,255,0.3)' }}>
                {nft.metadata.name}
              </h2>
              {nft.metadata.description && (
                <p className="text-ash-gray font-rajdhani text-lg leading-relaxed">
                  {nft.metadata.description}
                </p>
              )}
            </div>

            {/* Pending Confirmation Notice */}
            {nft.status === 'pending' && (
              <div className="bg-archive-amber/10 border-2 border-archive-amber/40 rounded-lg p-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-archive-amber/20 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-3 border-archive-amber border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-archive-amber font-space-mono font-bold text-lg uppercase tracking-wider mb-2">
                      ⏳ Transaction Processing
                    </h3>
                    <p className="text-pure-white/90 font-rajdhani text-sm leading-relaxed mb-3">
                      Your NFT has been uploaded to Arweave and is waiting for blockchain confirmation. 
                      This typically takes <strong className="text-archive-amber">5-20 minutes</strong> as the network 
                      validates and permanently stores your data across the decentralized network.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-ash-gray">
                      <span>•</span>
                      <span>The NFT is already minted and owned by you</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-ash-gray">
                      <span>•</span>
                      <span>Refresh this page to check confirmation status</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-ash-gray">
                      <span>•</span>
                      <span>You can close this page safely</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmed Notice */}
            {nft.status === 'confirmed' && (
              <div className="bg-terminal-green/10 border-2 border-terminal-green/40 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-terminal-green/20 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-terminal-green" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-terminal-green font-space-mono font-bold text-sm uppercase tracking-wider">
                      ✅ Permanently Stored
                    </h3>
                    <p className="text-pure-white/80 font-rajdhani text-sm mt-1">
                      This NFT is confirmed on the Arweave blockchain and will be stored for 200+ years.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Owner Info */}
            <div className="bg-terminal-green/10 border-2 border-terminal-green/40 rounded-lg p-6">
              <h3 className="text-terminal-green font-space-mono font-bold text-sm uppercase tracking-wider mb-3">
                Ownership
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-ash-gray font-rajdhani">Current Owner:</span>
                  <span className="text-pure-white font-jetbrains text-sm">{nft.currentOwner.substring(0, 12)}...</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ash-gray font-rajdhani">Original Minter:</span>
                  <span className="text-pure-white font-jetbrains text-sm">{nft.originalMinter.substring(0, 12)}...</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ash-gray font-rajdhani">Blockchain:</span>
                  <span className="text-data-cyan font-space-mono font-bold uppercase">{nft.blockchain}</span>
                </div>
              </div>
            </div>

            {/* Royalty Info */}
            <div className="bg-archive-amber/10 border-2 border-archive-amber/40 rounded-lg p-6">
              <h3 className="text-archive-amber font-space-mono font-bold text-sm uppercase tracking-wider mb-3">
                💰 STAMP Royalties
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-ash-gray font-rajdhani">Total Royalty:</span>
                  <span className="text-pure-white font-space-mono font-bold">5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ash-gray font-rajdhani">Creator Share:</span>
                  <span className="text-terminal-green font-space-mono font-bold">3%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ash-gray font-rajdhani">Platform Share:</span>
                  <span className="text-data-cyan font-space-mono font-bold">2%</span>
                </div>
                <p className="text-xs text-ash-gray/70 font-rajdhani mt-3 pt-3 border-t border-archive-amber/20">
                  These royalties are enforced on all marketplace sales forever via STAMP protocol.
                </p>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="bg-deep-space/60 border-2 border-data-cyan/30 rounded-lg p-6">
              <h3 className="text-data-cyan font-space-mono font-bold text-sm uppercase tracking-wider mb-4">
                Blockchain Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-ash-gray text-xs font-rajdhani uppercase tracking-wider">Transaction ID</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 bg-void-black/50 border border-data-cyan/20 rounded px-3 py-2 text-pure-white font-jetbrains text-sm truncate">
                      {nft.arweave?.arweaveId}
                    </code>
                    <button
                      onClick={() => copyToClipboard(nft.arweave?.arweaveId || '')}
                      className="p-2 hover:bg-data-cyan/20 rounded transition-colors"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-terminal-green" />
                      ) : (
                        <Copy className="w-5 h-5 text-data-cyan" />
                      )}
                    </button>
                  </div>
                </div>

                {nft.arweave?.uploadCost && (
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-ash-gray font-rajdhani">Storage Cost:</span>
                    <span className="text-pure-white font-space-mono">{nft.arweave.uploadCost.toFixed(6)} AR</span>
                  </div>
                )}

                {nft.createdAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-ash-gray font-rajdhani">Minted:</span>
                    <span className="text-pure-white font-rajdhani">
                      {new Date(nft.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Attributes */}
            {nft.metadata.attributes && nft.metadata.attributes.length > 0 && (
              <div className="bg-deep-space/60 border-2 border-data-cyan/30 rounded-lg p-6">
                <h3 className="text-data-cyan font-space-mono font-bold text-sm uppercase tracking-wider mb-4">
                  Attributes
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {nft.metadata.attributes.map((attr, index) => (
                    <div key={index} className="bg-void-black/50 border border-data-cyan/20 rounded-lg p-4">
                      <div className="text-xs text-ash-gray font-rajdhani uppercase tracking-wider mb-1">
                        {attr.trait_type}
                      </div>
                      <div className="text-pure-white font-space-mono font-bold">
                        {attr.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* List for Sale Modal */}
      {showListModal && nft && (
        <ListForSaleModal
          nftId={nftId}
          nftName={nft.metadata.name}
          nftImage={nft.metadata.image}
          currentOwner={nft.currentOwner}
          onClose={() => setShowListModal(false)}
          onSuccess={(listingId) => {
            console.log('🎉 [NFT DETAIL] NFT listed successfully:', listingId);
            setShowListModal(false);
            setListingSuccess(true);
          }}
        />
      )}
    </div>
  );
}
