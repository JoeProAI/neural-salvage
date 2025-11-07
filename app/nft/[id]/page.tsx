'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { NFT } from '@/types';
import Link from 'next/link';
import { ExternalLink, ArrowLeft, Copy, Check, ShoppingCart } from 'lucide-react';

export default function NFTDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const nftId = params.id as string;
  
  const [nft, setNft] = useState<NFT | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      loadNFT();
    }
  }, [authLoading, nftId]);

  const loadNFT = async () => {
    try {
      setLoading(true);
      const nftDoc = await getDoc(doc(db, 'nfts', nftId));
      
      if (nftDoc.exists()) {
        setNft({ ...nftDoc.data(), id: nftDoc.id } as NFT);
      } else {
        console.error('NFT not found');
      }
    } catch (error) {
      console.error('Error loading NFT:', error);
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
          
          {/* Left Column - Image/Media */}
          <div className="space-y-6">
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

            {/* List on BazAR */}
            <a
              href={bazarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cyberpunk-button w-full py-4 flex items-center justify-center gap-3 text-lg"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="font-space-mono font-bold uppercase">List for Sale on BazAR</span>
            </a>
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
    </div>
  );
}
