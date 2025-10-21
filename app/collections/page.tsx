'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Collection } from '@/types';
import Link from 'next/link';

export default function CollectionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadCollections();
    }
  }, [user]);

  const loadCollections = async () => {
    if (!user) return;

    try {
      const collectionsQuery = query(
        collection(db, 'collections'),
        where('userId', '==', user.id)
      );

      const snapshot = await getDocs(collectionsQuery);
      const collectionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Collection[];

      setCollections(collectionsData);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoadingCollections(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!user || !newCollectionName.trim()) return;

    try {
      await addDoc(collection(db, 'collections'), {
        userId: user.id,
        name: newCollectionName,
        description: newCollectionDesc,
        assetIds: [],
        visibility: 'private',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setNewCollectionName('');
      setNewCollectionDesc('');
      setShowCreate(false);
      loadCollections();
    } catch (error) {
      console.error('Error creating collection:', error);
      alert('Failed to create collection');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-salvage-dark">
        <div className="text-neon-cyan text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Collections</h2>
            <p className="text-gray-400">
              Organize your media into collections
            </p>
          </div>
          <Button variant="neon" onClick={() => setShowCreate(true)}>
            Create Collection
          </Button>
        </div>

        {/* Create Collection Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="metal-card p-8 rounded-lg max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-4">
                Create Collection
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Collection Name
                  </label>
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    className="w-full px-4 py-2 bg-salvage-rust border border-salvage-glow rounded focus:border-neon-cyan focus:outline-none text-white"
                    placeholder="My Collection"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={newCollectionDesc}
                    onChange={(e) => setNewCollectionDesc(e.target.value)}
                    className="w-full px-4 py-2 bg-salvage-rust border border-salvage-glow rounded focus:border-neon-cyan focus:outline-none text-white"
                    rows={3}
                    placeholder="Describe your collection..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="neon"
                    onClick={handleCreateCollection}
                    disabled={!newCollectionName.trim()}
                    className="flex-1"
                  >
                    Create
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreate(false);
                      setNewCollectionName('');
                      setNewCollectionDesc('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Collections Grid */}
        {loadingCollections ? (
          <div className="text-center py-12 text-gray-400">
            Loading collections...
          </div>
        ) : collections.length === 0 ? (
          <div className="metal-card p-12 rounded-lg text-center">
            <div className="text-6xl mb-4">📁</div>
            <h4 className="text-xl font-bold text-white mb-2">
              No collections yet
            </h4>
            <p className="text-gray-400 mb-4">
              Create your first collection to organize your media
            </p>
            <Button variant="neon" onClick={() => setShowCreate(true)}>
              Create Collection
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {collections.map((coll) => (
              <Link key={coll.id} href={`/collections/${coll.id}`}>
                <div className="metal-card rounded-lg overflow-hidden glow-hover cursor-pointer">
                  {/* Cover Image */}
                  <div className="aspect-square bg-salvage-rust flex items-center justify-center">
                    <div className="text-6xl">📁</div>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-2">
                    <h3 className="text-white font-bold truncate">
                      {coll.name}
                    </h3>
                    
                    {coll.description && (
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {coll.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-salvage-glow">
                      <span className="text-sm text-gray-400">
                        {coll.assetIds.length} items
                      </span>
                      <span className="text-xs text-gray-500">
                        {coll.visibility}
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