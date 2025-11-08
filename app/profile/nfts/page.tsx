'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { NFT } from '@/types';
import Link from 'next/link';
import { ExternalLink, Image as ImageIcon, Music, Video, FileText } from 'lucide-react';
import { queryNFTsByWallet, queryNFTsBySignature, fetchNFTMetadata, type ArweaveNFTResult } from '@/lib/nft/arweave-query';
import { getMediaInfo, getMediaIcon } from '@/lib/utils/mediaType';

export default function NFTGalleryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [blockchainNFTs, setBlockchainNFTs] = useState<ArweaveNFTResult[]>([]);

  // Check for connected wallet
  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window !== 'undefined' && (window as any).arweaveWallet) {
        try {
          const address = await (window as any).arweaveWallet.getActiveAddress();
          setWalletAddress(address);
          console.log('👛 [NFT GALLERY] Wallet connected:', address);
        } catch (error) {
          console.log('👛 [NFT GALLERY] No wallet connected');
        }
      }
    };
    checkWallet();
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      // Small delay to ensure wallet is checked first
      const timer = setTimeout(() => {
        loadNFTs();
      }, 100);
      return () => clearTimeout(timer);
    } else if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router, walletAddress]);

  const loadNFTs = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('🔍 [NFT GALLERY] Loading NFTs from multiple sources...');
      
      // Source 1: Firebase cache (fast but optional)
      let firebaseNFTs: NFT[] = [];
      try {
        console.log('📦 [NFT GALLERY] Loading from Firebase cache...');
        const nftsQuery = query(
          collection(db, 'nfts'),
          where('userId', '==', user.id)
          // No orderBy to avoid requiring composite index
        );
        
        const snapshot = await getDocs(nftsQuery);
        firebaseNFTs = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        })) as NFT[];
        
        // Sort client-side instead
        firebaseNFTs.sort((a, b) => {
          const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
          const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
          return bTime - aTime; // Descending
        });
        
        console.log('✅ [FIREBASE] Loaded', firebaseNFTs.length, 'cached NFTs');
      } catch (firebaseError: any) {
        console.warn('⚠️ [FIREBASE] Cache unavailable (will use blockchain only):', firebaseError.message);
        console.log('💡 [FIREBASE] This is OK - blockchain is the source of truth!');
      }
      
      // Source 2: Arweave blockchain (source of truth - ALWAYS runs)
      let blockchainNFTs: ArweaveNFTResult[] = [];
      if (walletAddress) {
        console.log('⛓️ [BLOCKCHAIN] Querying Arweave for wallet:', walletAddress);
        try {
          // Query by Creator tag (ownership signature)
          const rawBlockchainNFTs = await queryNFTsBySignature(walletAddress);
          console.log('✅ [BLOCKCHAIN] Found', rawBlockchainNFTs.length, 'NFTs on-chain');
          
          // Fetch full metadata for each NFT (includes image URLs)
          blockchainNFTs = await Promise.all(
            rawBlockchainNFTs.map(async (nft) => {
              try {
                const fullMetadata = await fetchNFTMetadata(nft.txId);
                return {
                  ...nft,
                  imageUrl: fullMetadata?.image || nft.imageUrl,
                  metadataUrl: fullMetadata?.metadataUrl,
                };
              } catch (error) {
                console.warn('⚠️ Failed to fetch metadata for', nft.txId);
                return nft;
              }
            })
          );
          
          console.log('📸 [BLOCKCHAIN] Loaded metadata with images');
          setBlockchainNFTs(blockchainNFTs);
        } catch (error) {
          console.error('❌ [BLOCKCHAIN] Query failed:', error);
        }
      } else {
        console.log('⚠️ [BLOCKCHAIN] No wallet connected - showing cached NFTs only');
      }
      
      // Merge results: blockchain is source of truth, Firebase supplements
      const merged = new Map<string, NFT>();
      
      console.log('🔄 [MERGE] Merging Firebase cache with blockchain data...');
      
      // First, add all blockchain NFTs (source of truth)
      blockchainNFTs.forEach(blockchainNFT => {
        const nftId = blockchainNFT.txId;
        
        // Check if we have this in Firebase cache
        const cached = firebaseNFTs.find(
          fb => fb.arweave?.manifestId === nftId || fb.arweave?.arweaveId === nftId || fb.id === nftId
        );
        
        if (cached) {
          // Merge: Use blockchain data but keep Firebase assetId/userId
          console.log('✅ [MERGE] Found in both - using blockchain data:', nftId.substring(0, 12) + '...');
          
          // Parse timestamp safely
          const timestamp = blockchainNFT.timestamp ? blockchainNFT.timestamp * 1000 : Date.now();
          const confirmedDate = new Date(timestamp);
          
          merged.set(nftId, {
            ...cached,
            id: nftId, // Use blockchain ID for routing
            status: 'confirmed', // Blockchain confirms it
            metadata: {
              ...cached.metadata,
              image: blockchainNFT.imageUrl || cached.metadata.image, // Prefer blockchain image
            },
            arweave: cached.arweave ? {
              ...cached.arweave,
              arweaveId: nftId,
              manifestId: nftId,
              confirmedAt: confirmedDate,
            } : {
              arweaveId: nftId,
              arweaveUrl: blockchainNFT.manifestUrl,
              manifestId: nftId,
              bundlrId: nftId,
              uploadCost: 0,
              uploadedAt: confirmedDate,
              confirmedAt: confirmedDate,
            },
          });
        } else {
          // New NFT found on blockchain but not in cache
          console.log('🆕 [MERGE] Found only on blockchain:', nftId.substring(0, 12) + '...');
          
          // Parse timestamp safely
          const timestamp = blockchainNFT.timestamp ? blockchainNFT.timestamp * 1000 : Date.now();
          const createdDate = new Date(timestamp);
          
          // Parse royalty safely
          const royalty = blockchainNFT.royalty ? parseInt(blockchainNFT.royalty) : 3;
          console.log(`💰 [MERGE] Royalty for ${nftId.substring(0, 12)}: ${royalty}% (raw: ${blockchainNFT.royalty})`);
          
          merged.set(nftId, {
            id: nftId,
            assetId: '',
            userId: user.id,
            blockchain: 'arweave',
            status: 'confirmed',
            arweave: {
              arweaveId: nftId,
              arweaveUrl: blockchainNFT.manifestUrl,
              manifestId: nftId,
              bundlrId: nftId,
              uploadCost: 0,
              uploadedAt: createdDate,
              confirmedAt: createdDate,
            },
            metadata: {
              name: blockchainNFT.title || 'Untitled NFT',
              description: blockchainNFT.description || '',
              image: blockchainNFT.imageUrl || '',
              attributes: [],
            },
            metadataUri: blockchainNFT.metadataUrl || `${blockchainNFT.manifestUrl}/metadata.json`,
            currentOwner: blockchainNFT.owner,
            originalMinter: blockchainNFT.creator,
            royaltyPercentage: royalty,
            transfers: [],
            isVerified: true,
            verifiedAt: createdDate,
            createdAt: createdDate,
            updatedAt: new Date(),
          });
        }
      });
      
      // Add any Firebase-only NFTs (pending mints not yet confirmed)
      firebaseNFTs.forEach(firebaseNFT => {
        const fbId = firebaseNFT.arweave?.manifestId || firebaseNFT.arweave?.arweaveId || firebaseNFT.id;
        if (!merged.has(fbId)) {
          console.log('📦 [MERGE] Found only in cache (pending?):', fbId.substring(0, 12) + '...');
          merged.set(fbId, firebaseNFT);
        }
      });
      
      const allNFTs = Array.from(merged.values()).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      console.log('📊 [NFT GALLERY] Final count:', {
        firebase: firebaseNFTs.length,
        blockchain: blockchainNFTs.length,
        total: allNFTs.length,
      });
      
      setNfts(allNFTs);
    } catch (error) {
      console.error('❌ [NFT GALLERY] Error loading NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-void-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-data-cyan mx-auto"></div>
          <p className="text-ash-gray mt-4 font-rajdhani">Loading your NFT collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void-black">
      {/* Header */}
      <header className="border-b-2 border-data-cyan/30 bg-deep-space/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-space-mono font-bold text-data-cyan uppercase tracking-wider" style={{ textShadow: '0 0 20px #6FCDDD' }}>
                My NFT Collection
              </h1>
              <p className="text-ash-gray mt-2 font-rajdhani">
                {nfts.length} NFT{nfts.length !== 1 ? 's' : ''} minted • Stored permanently on Arweave
              </p>
            </div>
            <Link
              href="/gallery"
              className="cyberpunk-button px-6 py-3"
            >
              <span className="font-space-mono font-bold uppercase text-sm">Back to Gallery</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Pending Confirmation Banner */}
        {nfts.some(nft => nft.status === 'pending') && (
          <div className="mb-8 bg-archive-amber/10 border-2 border-archive-amber/40 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-archive-amber/20 rounded-full flex items-center justify-center">
                <div className="w-5 h-5 border-3 border-archive-amber border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="flex-1">
                <h3 className="text-archive-amber font-space-mono font-bold text-lg uppercase tracking-wider mb-2">
                  ⏳ Some NFTs Are Processing
                </h3>
                <p className="text-pure-white/90 font-rajdhani leading-relaxed mb-2">
                  You have {nfts.filter(n => n.status === 'pending').length} NFT(s) waiting for Arweave blockchain confirmation. 
                  This typically takes <strong className="text-archive-amber">5-20 minutes</strong> as the network validates 
                  and permanently stores your data.
                </p>
                <div className="flex items-center gap-2 text-xs text-ash-gray">
                  <span>•</span>
                  <span>Your NFTs are already minted and owned by you</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-ash-gray">
                  <span>•</span>
                  <span>Refresh this page to check the latest status</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {nfts.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="inline-block p-8 bg-data-cyan/10 border-2 border-data-cyan/30 rounded-full mb-6">
              <ImageIcon className="w-16 h-16 text-data-cyan" />
            </div>
            <h2 className="text-2xl font-space-mono font-bold text-pure-white mb-4">
              No NFTs Yet
            </h2>
            <p className="text-ash-gray font-rajdhani text-lg mb-8 max-w-md mx-auto">
              You haven't minted any NFTs yet. Upload some amazing content and mint your first NFT!
            </p>
            <Link
              href="/gallery"
              className="cyberpunk-button inline-block px-8 py-4 text-lg"
            >
              <span className="font-space-mono font-bold uppercase">Upload & Mint</span>
            </Link>
          </div>
        ) : (
          /* NFT Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nfts.map((nft) => (
              <Link
                key={nft.id}
                href={`/nft/${nft.arweave?.manifestId || nft.arweave?.arweaveId || nft.id}`}
                className="group relative bg-deep-space/60 border-2 border-data-cyan/30 hover:border-data-cyan rounded-xl overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(111,205,221,0.3)] hover:scale-[1.02]"
              >
                {/* Image */}
                <div className="aspect-square bg-void-black/50 relative overflow-hidden">
                  {nft.metadata.image ? (
                    <img
                      src={nft.metadata.image}
                      alt={nft.metadata.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-ash-gray/30" />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-lg font-space-mono font-bold text-xs uppercase ${
                      nft.status === 'confirmed' 
                        ? 'bg-terminal-green/20 border-2 border-terminal-green text-terminal-green'
                        : 'bg-archive-amber/20 border-2 border-archive-amber text-archive-amber'
                    }`}>
                      {nft.status}
                    </span>
                    
                    {/* Media Type Badge */}
                    {(() => {
                      const mediaInfo = getMediaInfo(nft.metadata.image || '');
                      if (mediaInfo.type === 'audio') {
                        return (
                          <span className="px-3 py-1 rounded-lg bg-quantum-blue/20 border-2 border-quantum-blue text-quantum-blue font-space-mono font-bold text-xs flex items-center gap-1">
                            <Music className="w-3 h-3" />
                            AUDIO
                          </span>
                        );
                      }
                      if (mediaInfo.type === 'video') {
                        return (
                          <span className="px-3 py-1 rounded-lg bg-data-cyan/20 border-2 border-data-cyan text-data-cyan font-space-mono font-bold text-xs flex items-center gap-1">
                            <Video className="w-3 h-3" />
                            VIDEO
                          </span>
                        );
                      }
                      if (mediaInfo.type === 'pdf') {
                        return (
                          <span className="px-3 py-1 rounded-lg bg-archive-amber/20 border-2 border-archive-amber text-archive-amber font-space-mono font-bold text-xs flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            PDF
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-void-black via-void-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="flex items-center gap-2 text-data-cyan">
                      <span className="font-rajdhani font-bold">View Details</span>
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-space-mono font-bold text-pure-white truncate mb-2 group-hover:text-data-cyan transition-colors">
                    {nft.metadata.name}
                  </h3>
                  
                  {nft.metadata.description && (
                    <p className="text-ash-gray font-rajdhani text-sm line-clamp-2 mb-3">
                      {nft.metadata.description}
                    </p>
                  )}

                  {/* Quick Stats */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-ash-gray font-rajdhani">Blockchain:</span>
                      <span className="text-data-cyan font-space-mono font-bold uppercase">{nft.blockchain}</span>
                    </div>
                    {nft.royaltyPercentage && (
                      <div className="flex items-center gap-1">
                        <span className="text-ash-gray font-rajdhani">Royalty:</span>
                        <span className="text-archive-amber font-space-mono font-bold">{nft.royaltyPercentage}%</span>
                      </div>
                    )}
                  </div>

                  {/* Minted Date */}
                  {nft.createdAt && (
                    <div className="mt-3 pt-3 border-t border-data-cyan/20">
                      <span className="text-xs text-ash-gray font-rajdhani">
                        Minted {(() => {
                          try {
                            const date = nft.createdAt instanceof Date 
                              ? nft.createdAt 
                              : new Date(nft.createdAt);
                            return isNaN(date.getTime()) ? 'Recently' : date.toLocaleDateString();
                          } catch (e) {
                            return 'Recently';
                          }
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Info Banner */}
        {nfts.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-data-cyan/10 via-quantum-blue/10 to-data-cyan/10 border-2 border-data-cyan/30 rounded-xl p-8">
            <h3 className="text-data-cyan font-space-mono font-bold text-xl mb-4 uppercase tracking-wider">
              💰 Your NFTs Earn Royalties Forever!
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-space-mono font-bold text-terminal-green mb-2">3%</div>
                <div className="text-ash-gray font-rajdhani">
                  You earn 3% on every resale of your NFTs, automatically enforced by STAMP protocol.
                </div>
              </div>
              <div>
                <div className="text-3xl font-space-mono font-bold text-archive-amber mb-2">200+</div>
                <div className="text-ash-gray font-rajdhani">
                  Years of permanent storage on Arweave. Your NFTs will outlive generations.
                </div>
              </div>
              <div>
                <div className="text-3xl font-space-mono font-bold text-data-cyan mb-2">∞</div>
                <div className="text-ash-gray font-rajdhani">
                  Unlimited trading across all STAMP-compatible marketplaces like BazAR.
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-data-cyan/20">
              <a
                href="https://bazar.arweave.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-data-cyan hover:text-archive-amber transition-colors font-rajdhani font-bold"
              >
                <span>List your NFTs for sale on BazAR</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
