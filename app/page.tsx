'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-salvage-dark">
        <div className="text-neon-cyan text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-salvage-dark grid-bg">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo/Title */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-bold neon-text animate-pulse-glow">
              NEURAL SALVAGE
            </h1>
            <p className="text-xl md:text-2xl text-gray-400">
              AI-Powered Media Salvage Yard
            </p>
          </div>

          {/* Description */}
          <div className="metal-card p-8 rounded-lg space-y-4">
            <p className="text-lg text-gray-300">
              Upload, organize, explore, and sell your digital creations with
              cutting-edge AI understanding and semantic search.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <div className="p-4 bg-salvage-rust rounded border border-neon-cyan/30">
                <div className="text-neon-cyan text-2xl mb-2">🤖</div>
                <h3 className="font-bold text-white mb-2">AI Analysis</h3>
                <p className="text-sm text-gray-400">
                  Automatic tagging, captioning, and content understanding
                </p>
              </div>
              <div className="p-4 bg-salvage-rust rounded border border-neon-pink/30">
                <div className="text-neon-pink text-2xl mb-2">🔍</div>
                <h3 className="font-bold text-white mb-2">Smart Search</h3>
                <p className="text-sm text-gray-400">
                  Natural language semantic search across all your media
                </p>
              </div>
              <div className="p-4 bg-salvage-rust rounded border border-neon-green/30">
                <div className="text-neon-green text-2xl mb-2">💰</div>
                <h3 className="font-bold text-white mb-2">Marketplace</h3>
                <p className="text-sm text-gray-400">
                  Sell your creations with integrated Stripe payments
                </p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button variant="neon" size="lg" className="text-lg">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="text-lg">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="mt-16 grid md:grid-cols-2 gap-6 text-left">
            <div className="metal-card p-6 rounded-lg glow-hover">
              <h3 className="text-xl font-bold text-neon-cyan mb-3">
                📸 Multi-Format Support
              </h3>
              <p className="text-gray-400">
                Images, videos, audio, and documents - all analyzed and
                searchable with AI
              </p>
            </div>
            <div className="metal-card p-6 rounded-lg glow-hover">
              <h3 className="text-xl font-bold text-neon-cyan mb-3">
                🎨 Beautiful Layouts
              </h3>
              <p className="text-gray-400">
                Grid, Masonry, and Filmstrip views with lightbox modal for
                immersive browsing
              </p>
            </div>
            <div className="metal-card p-6 rounded-lg glow-hover">
              <h3 className="text-xl font-bold text-neon-cyan mb-3">
                📁 Smart Organization
              </h3>
              <p className="text-gray-400">
                Collections, AI auto-grouping, and drag-and-drop organization
              </p>
            </div>
            <div className="metal-card p-6 rounded-lg glow-hover">
              <h3 className="text-xl font-bold text-neon-cyan mb-3">
                🔒 Secure & Private
              </h3>
              <p className="text-gray-400">
                Firebase-powered authentication and storage with granular
                privacy controls
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-salvage-glow py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>© 2025 Neural Salvage. Built with Next.js, Firebase, and AI.</p>
        </div>
      </footer>
    </main>
  );
}