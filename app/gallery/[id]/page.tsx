'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { MediaAsset } from '@/types';
import Link from 'next/link';

export default function AssetDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const assetId = params.id as string;
  
  const [asset, setAsset] = useState<MediaAsset | null>(null);
  const [loadingAsset, setLoadingAsset] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newTags, setNewTags] = useState('');
  const [forSale, setForSale] = useState(false);
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (assetId) {
      loadAsset();
    }
  }, [assetId]);

  const loadAsset = async () => {
    try {
      const assetDoc = await getDoc(doc(db, 'assets', assetId));
      
      if (assetDoc.exists()) {
        const assetData = { id: assetDoc.id, ...assetDoc.data() } as MediaAsset;
        setAsset(assetData);
        setForSale(assetData.forSale);
        setPrice(assetData.price?.toString() || '');
        setNewTags(assetData.aiAnalysis?.tags?.join(', ') || '');
      } else {
        alert('Asset not found');
        router.push('/gallery');
      }
    } catch (error) {
      console.error('Error loading asset:', error);
    } finally {
      setLoadingAsset(false);
    }
  };

  const handleSave = async () => {
    if (!asset) return;

    try {
      const tags = newTags.split(',').map((t) => t.trim()).filter(Boolean);
      
      await updateDoc(doc(db, 'assets', assetId), {
        'aiAnalysis.tags': tags,
        forSale,
        price: forSale ? parseFloat(price) : null,
        updatedAt: new Date(),
      });

      setEditing(false);
      loadAsset();
      alert('Asset updated successfully!');
    } catch (error) {
      console.error('Error updating asset:', error);
      alert('Failed to update asset');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      await deleteDoc(doc(db, 'assets', assetId));
      router.push('/gallery');
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Failed to delete asset');
    }
  };

  if (loading || loadingAsset || !asset) {
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
              <Link href="/gallery">
                <Button variant="ghost">← Back to Gallery</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Media Display */}
          <div className="metal-card p-4 rounded-lg">
            {asset.type === 'image' ? (
              <img
                src={asset.url}
                alt={asset.filename}
                className="w-full h-auto rounded"
              />
            ) : asset.type === 'video' ? (
              <video
                src={asset.url}
                controls
                className="w-full h-auto rounded"
              />
            ) : asset.type === 'audio' ? (
              <div className="aspect-square flex flex-col items-center justify-center bg-salvage-rust rounded">
                <div className="text-8xl mb-4">🎵</div>
                <audio src={asset.url} controls className="w-full px-4" />
              </div>
            ) : (
              <div className="aspect-square flex items-center justify-center bg-salvage-rust rounded">
                <div className="text-8xl">📄</div>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="space-y-6">
            <div className="metal-card p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">
                {asset.filename}
              </h2>

              {/* AI Analysis */}
              {asset.aiAnalysis && (
                <div className="space-y-4 mb-6">
                  {asset.aiAnalysis.caption && (
                    <div>
                      <h3 className="text-sm font-bold text-neon-cyan mb-2">
                        AI Caption
                      </h3>
                      <p className="text-gray-300">{asset.aiAnalysis.caption}</p>
                    </div>
                  )}

                  {asset.aiAnalysis.tags && asset.aiAnalysis.tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-neon-cyan mb-2">
                        Tags
                      </h3>
                      {editing ? (
                        <input
                          type="text"
                          value={newTags}
                          onChange={(e) => setNewTags(e.target.value)}
                          className="w-full px-4 py-2 bg-salvage-rust border border-salvage-glow rounded focus:border-neon-cyan focus:outline-none text-white"
                          placeholder="tag1, tag2, tag3"
                        />
                      ) : (
                        <div className="flex gap-2 flex-wrap">
                          {asset.aiAnalysis.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="bg-neon-cyan/20 text-neon-cyan px-3 py-1 rounded text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {asset.aiAnalysis.colors && asset.aiAnalysis.colors.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-neon-cyan mb-2">
                        Color Palette
                      </h3>
                      <div className="flex gap-2">
                        {asset.aiAnalysis.colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-12 h-12 rounded border-2 border-white/20"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {asset.aiAnalysis.ocr && (
                    <div>
                      <h3 className="text-sm font-bold text-neon-cyan mb-2">
                        Extracted Text
                      </h3>
                      <p className="text-gray-300 text-sm bg-salvage-rust p-3 rounded">
                        {asset.aiAnalysis.ocr}
                      </p>
                    </div>
                  )}

                  {asset.aiAnalysis.transcript && (
                    <div>
                      <h3 className="text-sm font-bold text-neon-cyan mb-2">
                        Transcript
                      </h3>
                      <p className="text-gray-300 text-sm bg-salvage-rust p-3 rounded max-h-40 overflow-y-auto">
                        {asset.aiAnalysis.transcript}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* File Info */}
              <div className="border-t border-salvage-glow pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Type</span>
                  <span className="text-white">{asset.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Size</span>
                  <span className="text-white">
                    {(asset.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                {asset.dimensions && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Dimensions</span>
                    <span className="text-white">
                      {asset.dimensions.width} × {asset.dimensions.height}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Uploaded</span>
                  <span className="text-white">
                    {new Date(asset.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Marketplace Settings */}
              {editing && (
                <div className="border-t border-salvage-glow pt-4 mt-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={forSale}
                      onChange={(e) => setForSale(e.target.checked)}
                      className="w-5 h-5"
                    />
                    <label className="text-white">List for sale</label>
                  </div>

                  {forSale && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Price (USD)
                      </label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-2 bg-salvage-rust border border-salvage-glow rounded focus:border-neon-cyan focus:outline-none text-white"
                        placeholder="29.99"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-salvage-glow pt-4 mt-4 space-y-2">
                {!editing ? (
                  <>
                    <Button
                      variant="neon"
                      className="w-full"
                      onClick={() => setEditing(true)}
                    >
                      Edit Asset
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(asset.url, '_blank')}
                    >
                      Download
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleDelete}
                    >
                      Delete
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="neon"
                      className="w-full"
                      onClick={handleSave}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setEditing(false);
                        setNewTags(asset.aiAnalysis?.tags?.join(', ') || '');
                        setForSale(asset.forSale);
                        setPrice(asset.price?.toString() || '');
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}