'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { MediaAsset } from '@/types';
import Link from 'next/link';

export default function MarketplacePage() {
  const [listings, setListings] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'audio'>('all');

  useEffect(() => {
    loadListings();
  }, [filter]);

  const loadListings = async () => {
    setLoading(true);
    try {
      let listingsQuery = query(
        collection(db, 'assets'),
        where('forSale', '==', true),
        where('sold', '==', false),
        where('visibility', '==', 'public'),
        orderBy('uploadedAt', 'desc'),
        limit(50)
      );

      if (filter !== 'all') {
        listingsQuery = query(
          collection(db, 'assets'),
          where('forSale', '==', true),
          where('sold', '==', false),
          where('visibility', '==', 'public'),
          where('type', '==', filter),
          orderBy('uploadedAt', 'desc'),
          limit(50)
        );
      }

      const snapshot = await getDocs(listingsQuery);
      const listingsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MediaAsset[];

      setListings(listingsData);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-salvage-dark">
      {/* Header */}
      <header className="border-b border-salvage-glow bg-salvage-metal sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold neon-text">NEURAL SALVAGE</h1>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/gallery">
                <Button variant="ghost">Gallery</Button>
              </Link>
              <Link href="/collections">
                <Button variant="ghost">Collections</Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="ghost">Marketplace</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold neon-text mb-2">Marketplace</h2>
          <p className="text-gray-400">
            Discover and purchase unique digital creations
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={filter === 'all' ? 'neon' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'image' ? 'neon' : 'outline'}
            onClick={() => setFilter('image')}
          >
            Images
          </Button>
          <Button
            variant={filter === 'video' ? 'neon' : 'outline'}
            onClick={() => setFilter('video')}
          >
            Videos
          </Button>
          <Button
            variant={filter === 'audio' ? 'neon' : 'outline'}
            onClick={() => setFilter('audio')}
          >
            Audio
          </Button>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            Loading marketplace...
          </div>
        ) : listings.length === 0 ? (
          <div className="metal-card p-12 rounded-lg text-center">
            <div className="text-6xl mb-4">🏪</div>
            <h4 className="text-xl font-bold text-white mb-2">
              No listings available
            </h4>
            <p className="text-gray-400">
              Check back later for new items
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((asset) => (
              <Link key={asset.id} href={`/marketplace/${asset.id}`}>
                <div className="metal-card rounded-lg overflow-hidden glow-hover cursor-pointer">
                  {/* Media Preview */}
                  {asset.thumbnailUrl || asset.coverArt?.url ? (
                    /* Show thumbnail/cover art if available */
                    <div className="aspect-square">
                      <img
                        src={asset.thumbnailUrl || asset.coverArt?.url}
                        alt={asset.filename}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Failed to load cover art:', asset.thumbnailUrl);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : asset.type === 'image' ? (
                    /* Show full image for images without thumbnail */
                    <div className="aspect-square">
                      <img
                        src={asset.url}
                        alt={asset.filename}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    /* Fallback emoji for media without cover art */
                    <div className="aspect-square flex items-center justify-center bg-salvage-rust">
                      <div className="text-6xl">
                        {asset.type === 'video'
                          ? '🎥'
                          : asset.type === 'audio'
                          ? '🎵'
                          : '📄'}
                      </div>
                    </div>
                  )}

                  {/* Info */}
                  <div className="p-4 space-y-2">
                    <h3 className="text-white font-bold truncate">
                      {asset.filename}
                    </h3>
                    
                    {asset.aiAnalysis?.caption && (
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {asset.aiAnalysis.caption}
                      </p>
                    )}

                    {asset.aiAnalysis?.tags && (
                      <div className="flex gap-1 flex-wrap">
                        {asset.aiAnalysis.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs bg-neon-cyan/20 text-neon-cyan px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between pt-2 border-t border-salvage-glow">
                      <span className="text-2xl font-bold text-neon-green">
                        ${asset.price?.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {asset.license || 'personal'}
                      </span>
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