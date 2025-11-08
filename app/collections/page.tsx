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
      // Generate a cool AI icon for the collection
      const response = await fetch('/api/ai/generate-collection-icon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionName: newCollectionName,
          description: newCollectionDesc,
          userId: user.id,
        }),
      });

      let iconUrl = '';
      if (response.ok) {
        const data = await response.json();
        iconUrl = data.iconUrl || '';
      }

      await addDoc(collection(db, 'collections'), {
        userId: user.id,
        name: newCollectionName,
        description: newCollectionDesc,
        iconUrl,
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

  const handleDeleteCollection = async (collectionId: string, collectionName: string) => {
    if (!confirm(`Are you sure you want to delete "${collectionName}"? This will only remove the collection, not the actual gallery items.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'collections', collectionId));
      loadCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Failed to delete collection');
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
              <div key={coll.id} className="metal-card rounded-lg overflow-hidden glow-hover group relative">
                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteCollection(coll.id, coll.name);
                  }}
                  className="absolute top-2 right-2 z-10 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete collection"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

                <Link href={`/collections/${coll.id}`} className="block">
                  {/* Cover Image or AI Icon */}
                  <div className="aspect-square bg-gradient-to-br from-salvage-rust to-deep-space flex items-center justify-center relative overflow-hidden">
                    {coll.iconUrl ? (
                      <img
                        src={coll.iconUrl}
                        alt={coll.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-7xl">📁</div>
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
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
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}