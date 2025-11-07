'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { MediaAsset, LayoutType } from '@/types';
import Link from 'next/link';

function GalleryContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [layout, setLayout] = useState<LayoutType>('grid');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (searchParams.get('upload') === 'true') {
      setShowUpload(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      loadAssets();
    }
  }, [user]);

  const loadAssets = async () => {
    if (!user) return;

    try {
      const assetsQuery = query(
        collection(db, 'assets'),
        where('userId', '==', user.id),
        orderBy('uploadedAt', 'desc')
      );

      const snapshot = await getDocs(assetsQuery);
      const assetsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MediaAsset[];

      setAssets(assetsData);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (!user || uploadFiles.length === 0) return;

    setUploading(true);

    try {
      for (const file of uploadFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', user.id);
        formData.append('visibility', 'private');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }
      }

      // Reload assets
      await loadAssets();
      setUploadFiles([]);
      setShowUpload(false);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadAssets();
      return;
    }

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          userId: user?.id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAssets(data.results.map((r: any) => r.asset));
      }
    } catch (error) {
      console.error('Search error:', error);
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
              <Link href="/profile/nfts">
                <Button variant="ghost" className="text-data-cyan hover:text-archive-amber">My NFTs</Button>
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
        {/* Toolbar */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search your media with AI..."
              className="flex-1 px-4 py-2 bg-salvage-rust border border-salvage-glow rounded focus:border-neon-cyan focus:outline-none text-white"
            />
            <Button variant="neon" onClick={handleSearch}>
              Search
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={layout === 'grid' ? 'neon' : 'outline'}
                onClick={() => setLayout('grid')}
              >
                Grid
              </Button>
              <Button
                variant={layout === 'masonry' ? 'neon' : 'outline'}
                onClick={() => setLayout('masonry')}
              >
                Masonry
              </Button>
              <Button
                variant={layout === 'filmstrip' ? 'neon' : 'outline'}
                onClick={() => setLayout('filmstrip')}
              >
                Filmstrip
              </Button>
            </div>
            <Button variant="neon" onClick={() => setShowUpload(true)}>
              Upload Media
            </Button>
          </div>
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="metal-card p-8 rounded-lg max-w-2xl w-full">
              <h2 className="text-2xl font-bold text-white mb-4">Upload Media</h2>
              
              <div className="border-2 border-dashed border-salvage-glow rounded-lg p-12 text-center mb-4">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  accept="image/*,video/*,audio/*"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-6xl mb-4">📤</div>
                  <p className="text-white mb-2">
                    Click to select files or drag and drop
                  </p>
                  <p className="text-sm text-gray-400">
                    Images, videos, audio, and documents supported
                  </p>
                </label>
              </div>

              {uploadFiles.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-white font-bold mb-2">
                    Selected Files ({uploadFiles.length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {uploadFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-salvage-rust p-2 rounded"
                      >
                        <span className="text-sm text-white truncate">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="neon"
                  onClick={handleUpload}
                  disabled={uploading || uploadFiles.length === 0}
                  className="flex-1"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUpload(false);
                    setUploadFiles([]);
                  }}
                  disabled={uploading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Gallery */}
        {loadingAssets ? (
          <div className="text-center py-12 text-gray-400">
            Loading gallery...
          </div>
        ) : assets.length === 0 ? (
          <div className="metal-card p-12 rounded-lg text-center">
            <div className="text-6xl mb-4">📦</div>
            <h4 className="text-xl font-bold text-white mb-2">
              No assets found
            </h4>
            <p className="text-gray-400 mb-4">
              {searchQuery
                ? 'Try a different search query'
                : 'Start by uploading your first media file'}
            </p>
            {!searchQuery && (
              <Button variant="neon" onClick={() => setShowUpload(true)}>
                Upload Now
              </Button>
            )}
          </div>
        ) : (
          <div
            className={
              layout === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                : layout === 'masonry'
                ? 'columns-2 md:columns-3 lg:columns-4 gap-4'
                : 'flex gap-4 overflow-x-auto pb-4'
            }
          >
            {assets.map((asset) => (
              <Link key={asset.id} href={`/gallery/${asset.id}`}>
                <div
                  className={`metal-card rounded-lg overflow-hidden glow-hover cursor-pointer ${
                    layout === 'filmstrip' ? 'flex-shrink-0 w-64' : ''
                  } ${layout === 'masonry' ? 'mb-4' : ''}`}
                >
                  {asset.type === 'image' ? (
                    <img
                      src={asset.thumbnailUrl || asset.url}
                      alt={asset.filename}
                      className="w-full h-auto object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-square flex items-center justify-center bg-salvage-rust">
                      <div className="text-6xl">
                        {asset.type === 'video'
                          ? '🎥'
                          : asset.type === 'audio'
                          ? '🎵'
                          : '📄'}
                      </div>
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-sm text-white truncate">
                      {asset.filename}
                    </p>
                    {asset.aiAnalysis?.tags && (
                      <div className="flex gap-1 mt-2 flex-wrap">
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

export default function GalleryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-salvage-dark flex items-center justify-center"><p className="text-neon-cyan">Loading gallery...</p></div>}>
      <GalleryContent />
    </Suspense>
  );
}