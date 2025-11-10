'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit as limitQuery } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, DollarSign } from 'lucide-react';

interface Listing {
  id: string;
  assetId: string;
  seller: string;
  price: number;
  currency: string;
  status: string;
  createdAt: any;
  expiresAt: any;
}

interface NFTData {
  id: string;
  metadata: {
    name: string;
    description: string;
    image: string;
  };
  arweave?: {
    arweaveId: string;
  };
}

export default function ListedNFTsPage() {
  const [listings, setListings] = useState<Array<Listing & { nft?: NFTData }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      setLoading(true);
      console.log('📋 [MARKETPLACE] Loading active listings...');

      // Query marketplace_listings collection
      const listingsQuery = query(
        collection(db, 'marketplace_listings'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limitQuery(50)
      );

      const snapshot = await getDocs(listingsQuery);
      console.log(`📋 [MARKETPLACE] Found ${snapshot.size} listings`);

      const listingsData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const listing = { id: doc.id, ...doc.data() } as Listing;

          // Get NFT data
          try {
            const nftQuery = query(
              collection(db, 'nfts'),
              where('id', '==', listing.assetId),
              limitQuery(1)
            );
            const nftSnapshot = await getDocs(nftQuery);
            
            if (!nftSnapshot.empty) {
              const nftData = { id: nftSnapshot.docs[0].id, ...nftSnapshot.docs[0].data() } as NFTData;
              return { ...listing, nft: nftData };
            }
          } catch (error) {
            console.error('Error loading NFT for listing:', error);
          }

          return listing;
        })
      );

      setListings(listingsData);
      console.log('✅ [MARKETPLACE] Listings loaded:', listingsData.length);
    } catch (error) {
      console.error('❌ [MARKETPLACE] Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void-black">
      {/* Header */}
      <header className="border-b-2 border-data-cyan/30 bg-deep-space/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/marketplace"
              className="flex items-center gap-2 text-ash-gray hover:text-data-cyan transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Marketplace
            </Link>
            <h1 className="text-xl font-space-mono font-bold text-data-cyan uppercase tracking-wider">
              Listed NFTs
            </h1>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-space-mono font-bold text-data-cyan mb-3 uppercase" style={{ textShadow: '0 0 20px #6FCDDD' }}>
            🛒 Active Listings
          </h2>
          <p className="text-ash-gray font-rajdhani text-lg">
            Browse all NFTs currently for sale on the marketplace
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-data-cyan mx-auto mb-4"></div>
            <p className="text-ash-gray font-rajdhani">Loading listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 bg-deep-space/50 border-2 border-data-cyan/30 rounded-xl">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-2xl font-space-mono font-bold text-data-cyan mb-2">No Active Listings</h3>
            <p className="text-ash-gray font-rajdhani mb-6">Be the first to list an NFT for sale!</p>
            <Link 
              href="/gallery"
              className="cyberpunk-button inline-block px-6 py-3"
            >
              Go to Gallery
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/nft/${listing.assetId}`}
                className="group bg-gradient-to-br from-deep-space via-panel-dark to-deep-space border-2 border-data-cyan/30 hover:border-data-cyan rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(111,205,221,0.3)] hover:scale-[1.02]"
              >
                {/* NFT Image */}
                <div className="relative aspect-square bg-void-black overflow-hidden">
                  {listing.nft?.metadata?.image ? (
                    <img
                      src={listing.nft.metadata.image}
                      alt={listing.nft.metadata.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-2">🎨</div>
                        <p className="text-ash-gray text-sm font-rajdhani">No preview</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Price Badge */}
                  <div className="absolute top-4 right-4 bg-terminal-green/90 backdrop-blur-sm border-2 border-terminal-green px-4 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-void-black" />
                      <span className="font-space-mono font-bold text-void-black text-lg">
                        {listing.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* For Sale Badge */}
                  <div className="absolute top-4 left-4 bg-archive-amber/90 backdrop-blur-sm border-2 border-archive-amber px-3 py-1 rounded-lg">
                    <span className="font-rajdhani font-bold text-void-black text-xs uppercase">
                      For Sale
                    </span>
                  </div>
                </div>

                {/* NFT Info */}
                <div className="p-5">
                  <h3 className="font-space-mono font-bold text-pure-white text-lg mb-2 truncate group-hover:text-data-cyan transition-colors">
                    {listing.nft?.metadata?.name || 'Untitled NFT'}
                  </h3>
                  
                  {listing.nft?.metadata?.description && (
                    <p className="text-ash-gray text-sm font-rajdhani line-clamp-2 mb-4">
                      {listing.nft.metadata.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-data-cyan/20">
                    <div className="text-xs text-ash-gray font-jetbrains">
                      Listed {new Date(listing.createdAt?.toDate()).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-data-cyan font-rajdhani font-bold flex items-center gap-1">
                      View Details
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
