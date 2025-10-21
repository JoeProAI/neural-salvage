'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { MediaAsset } from '@/types';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalStorage: 0,
    aiAnalyzed: 0,
    forSale: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

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
        orderBy('uploadedAt', 'desc'),
        limit(12)
      );

      const snapshot = await getDocs(assetsQuery);
      const assetsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MediaAsset[];

      setAssets(assetsData);

      // Calculate stats
      const totalAssets = assetsData.length;
      const totalStorage = assetsData.reduce((sum, asset) => sum + asset.size, 0);
      const aiAnalyzed = assetsData.filter((asset) => asset.aiAnalysis).length;
      const forSale = assetsData.filter((asset) => asset.forSale).length;

      setStats({
        totalAssets,
        totalStorage,
        aiAnalyzed,
        forSale,
      });
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
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
      <header className="border-b border-salvage-glow bg-salvage-metal">
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
              <Link href="/profile">
                <Button variant="ghost">Profile</Button>
              </Link>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.username}!
          </h2>
          <p className="text-gray-400">
            Manage your digital salvage yard
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="metal-card p-6 rounded-lg">
            <div className="text-neon-cyan text-3xl font-bold mb-2">
              {stats.totalAssets}
            </div>
            <div className="text-gray-400 text-sm">Total Assets</div>
          </div>
          <div className="metal-card p-6 rounded-lg">
            <div className="text-neon-pink text-3xl font-bold mb-2">
              {(stats.totalStorage / 1024 / 1024).toFixed(1)} MB
            </div>
            <div className="text-gray-400 text-sm">Storage Used</div>
          </div>
          <div className="metal-card p-6 rounded-lg">
            <div className="text-neon-green text-3xl font-bold mb-2">
              {stats.aiAnalyzed}
            </div>
            <div className="text-gray-400 text-sm">AI Analyzed</div>
          </div>
          <div className="metal-card p-6 rounded-lg">
            <div className="text-neon-orange text-3xl font-bold mb-2">
              {stats.forSale}
            </div>
            <div className="text-gray-400 text-sm">For Sale</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/gallery?upload=true">
              <div className="metal-card p-6 rounded-lg glow-hover cursor-pointer">
                <div className="text-4xl mb-3">📤</div>
                <h4 className="font-bold text-white mb-2">Upload Media</h4>
                <p className="text-sm text-gray-400">
                  Add new images, videos, or documents
                </p>
              </div>
            </Link>
            <Link href="/gallery?search=true">
              <div className="metal-card p-6 rounded-lg glow-hover cursor-pointer">
                <div className="text-4xl mb-3">🔍</div>
                <h4 className="font-bold text-white mb-2">Search Assets</h4>
                <p className="text-sm text-gray-400">
                  Find media with AI-powered search
                </p>
              </div>
            </Link>
            <Link href="/collections">
              <div className="metal-card p-6 rounded-lg glow-hover cursor-pointer">
                <div className="text-4xl mb-3">📁</div>
                <h4 className="font-bold text-white mb-2">Organize</h4>
                <p className="text-sm text-gray-400">
                  Create and manage collections
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Assets */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Recent Assets</h3>
            <Link href="/gallery">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          {loadingAssets ? (
            <div className="text-center py-12 text-gray-400">
              Loading assets...
            </div>
          ) : assets.length === 0 ? (
            <div className="metal-card p-12 rounded-lg text-center">
              <div className="text-6xl mb-4">📦</div>
              <h4 className="text-xl font-bold text-white mb-2">
                No assets yet
              </h4>
              <p className="text-gray-400 mb-4">
                Start by uploading your first media file
              </p>
              <Link href="/gallery?upload=true">
                <Button variant="neon">Upload Now</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {assets.map((asset) => (
                <Link key={asset.id} href={`/gallery/${asset.id}`}>
                  <div className="metal-card rounded-lg overflow-hidden glow-hover cursor-pointer aspect-square">
                    {asset.type === 'image' ? (
                      <img
                        src={asset.thumbnailUrl || asset.url}
                        alt={asset.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-salvage-rust">
                        <div className="text-4xl">
                          {asset.type === 'video' ? '🎥' : 
                           asset.type === 'audio' ? '🎵' : '📄'}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* AI Usage */}
        <div className="mt-8 metal-card p-6 rounded-lg">
          <h3 className="text-lg font-bold text-white mb-4">AI Usage</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Current Usage</span>
              <span className="text-white">
                {user.aiUsage.current} / {user.aiUsage.limit}
              </span>
            </div>
            <div className="w-full bg-salvage-rust rounded-full h-2">
              <div
                className="bg-neon-cyan h-2 rounded-full transition-all"
                style={{
                  width: `${(user.aiUsage.current / user.aiUsage.limit) * 100}%`,
                }}
              />
            </div>
            <div className="text-xs text-gray-500">
              Resets on {new Date(user.aiUsage.resetDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}