'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-gray-400 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-semibold text-black">Neural Salvage</div>
          <div className="flex gap-6">
            <Link href="/auth/login" className="text-gray-600 hover:text-black">
              Sign in
            </Link>
            <Link 
              href="/auth/signup" 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-16">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-white -z-10" />
        <div className="max-w-3xl">
          <h1 className="text-6xl font-bold text-black mb-6">
            Organize your media assets. The professional way.
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Upload, search, and manage your digital assets with intelligent tagging 
            and semantic search. Turn your media into permanent NFTs on Arweave.
          </p>
          <div className="flex gap-4">
            <Link 
              href="/auth/signup"
              className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Start for free
            </Link>
            <Link 
              href="/dashboard"
              className="border border-gray-300 text-black px-6 py-3 rounded-md font-medium hover:border-gray-400"
            >
              View demo
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-xl font-semibold text-black mb-3">
              Instant Search
            </h3>
            <p className="text-gray-600">
              Find any asset with natural language search. Powered by semantic understanding.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-black mb-3">
              Blockchain NFTs
            </h3>
            <p className="text-gray-600">
              Mint your assets as permanent NFTs on Arweave. Truly own your digital creations.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-black mb-3">
              Secure Storage
            </h3>
            <p className="text-gray-600">
              Enterprise-grade security with Firebase. Your assets are encrypted and backed up.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-4xl font-bold text-black mb-2">Fast</div>
              <div className="text-gray-600">Lightning-quick asset retrieval</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-black mb-2">Permanent</div>
              <div className="text-gray-600">NFTs stored forever on Arweave</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-black mb-2">Simple</div>
              <div className="text-gray-600">Intuitive interface, powerful features</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-16 text-center shadow-xl">
          <h2 className="text-4xl font-bold mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join professionals who trust Neural Salvage for their media asset management.
          </p>
          <Link 
            href="/auth/signup"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-md font-semibold hover:bg-blue-50 transition-colors"
          >
            Create your account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex justify-between items-center">
            <div className="text-gray-600">
              © 2025 Neural Salvage. All rights reserved.
            </div>
            <div className="flex gap-8 text-gray-600">
              <Link href="/privacy" className="hover:text-black">Privacy</Link>
              <Link href="/terms" className="hover:text-black">Terms</Link>
              <Link href="/contact" className="hover:text-black">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}