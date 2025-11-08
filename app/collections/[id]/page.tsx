'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Collection, MediaAsset } from '@/types';
import Link from 'next/link';

export default function CollectionDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const collectionId = params?.id as string;

  const [collectionData, setCollectionData] = useState<Collection | null>(null);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loadingCollection, setLoadingCollection] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && collectionId) {
      loadCollection();
    }
  }, [user, collectionId]);

  const loadCollection = async () => {
    if (!user || !collectionId) return;

    try {
      // Load collection
      const collectionDoc = await getDoc(doc(db, 'collections', collectionId));
      
      if (!collectionDoc.exists()) {
        router.push('/collections');
        return;
      }

      const coll = { id: collectionDoc.id, ...collectionDoc.data() } as Collection;

      // Verify ownership
      if (coll.userId !== user.id) {
        router.push('/collections');
        return;
      }

      setCollectionData(coll);

      // Load assets in this collection
      if (coll.assetIds.length > 0) {
        const assetsQuery = query(
          collection(db, 'assets'),
          where('userId', '==', user.id)
        );
        const snapshot = await getDocs(assetsQuery);
        const allAssets = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as MediaAsset[];

        // Filter to only assets in this collection
        const collectionAssets = allAssets.filter(asset => 
          coll.assetIds.includes(asset.id)
        );
        setAssets(collectionAssets);
      }
    } catch (error) {
      console.error('Error loading collection:', error);
    } finally {
      setLoadingCollection(false);
    }
  };

  const handleRemoveAsset = async (assetId: string) => {
    if (!collectionData) return;

    try {
      const updatedAssetIds = collectionData.assetIds.filter(id => id !== assetId);
      
      await updateDoc(doc(db, 'collections', collectionId), {
        assetIds: updatedAssetIds,
        updatedAt: new Date(),
      });

      setCollectionData({
        ...collectionData,
        assetIds: updatedAssetIds,
      });

      setAssets(assets.filter(asset => asset.id !== assetId));
    } catch (error) {
      console.error('Error removing asset:', error);
      alert('Failed to remove asset from collection');
    }
  };

  if (loading || !user || loadingCollection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-salvage-dark">
        <div className="text-neon-cyan text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!collectionData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-salvage-dark">
      {/* Header */}
      <header className="border-b border-salvage-glow bg-salvage-metal">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/collections">
              <Button variant="ghost">← Back to Collections</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Collection Header */}
      <div className="bg-gradient-to-b from-salvage-metal to-salvage-dark border-b border-salvage-glow">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-start gap-8">
            {/* Collection Icon */}
            <div className="w-48 h-48 rounded-lg overflow-hidden shadow-xl flex-shrink-0 bg-gradient-to-br from-salvage-rust to-deep-space">
              {collectionData.iconUrl ? (
                <img
                  src={collectionData.iconUrl}
                  alt={collectionData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">
                  📁
                </div>
              )}
            </div>

            {/* Collection Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-4">
                {collectionData.name}
              </h1>
              
              {collectionData.description && (
                <p className="text-gray-400 text-lg mb-6">
                  {collectionData.description}
                </p>
              )}

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Items:</span>
                  <span className="text-neon-cyan font-bold">
                    {collectionData.assetIds.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Visibility:</span>
                  <span className="text-neon-cyan font-bold capitalize">
                    {collectionData.visibility}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {assets.length === 0 ? (
          <div className="metal-card p-12 rounded-lg text-center">
            <div className="text-6xl mb-4">📭</div>
            <h4 className="text-xl font-bold text-white mb-2">
              No items in this collection
            </h4>
            <p className="text-gray-400 mb-4">
              Go to your gallery and add items to this collection
            </p>
            <Link href="/gallery">
              <Button variant="neon">Go to Gallery</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {assets.map((asset) => (
              <div key={asset.id} className="metal-card rounded-lg overflow-hidden group relative">
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveAsset(asset.id)}
                  className="absolute top-2 right-2 z-10 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove from collection"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <Link href={`/gallery/${asset.id}`} className="block">
                  {/* Asset Preview */}
                  {asset.thumbnailUrl || asset.coverArt?.url ? (
                    <div className="aspect-square">
                      <img
                        src={asset.thumbnailUrl || asset.coverArt?.url}
                        alt={asset.filename}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : asset.type === 'image' ? (
                    <div className="aspect-square">
                      <img
                        src={asset.url}
                        alt={asset.filename}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
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
                  <div className="p-3">
                    <p className="text-sm text-white truncate">
                      {asset.title || asset.filename}
                    </p>
                    {asset.aiAnalysis?.tags && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {asset.aiAnalysis.tags.slice(0, 2).map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs bg-neon-cyan/20 text-neon-cyan px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
