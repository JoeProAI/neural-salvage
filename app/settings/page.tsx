'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function SettingsContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingStripe, setLoadingStripe] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const stripeParam = searchParams.get('stripe');
    if (stripeParam === 'success') {
      alert('Stripe Connect setup successful!');
    } else if (stripeParam === 'refresh') {
      alert('Please complete the Stripe Connect setup');
    }
  }, [searchParams]);

  const handleStripeConnect = async () => {
    if (!user) return;

    setLoadingStripe(true);
    try {
      const response = await fetch('/api/marketplace/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();
      
      if (data.success) {
        window.location.href = data.onboardingUrl;
      } else {
        alert('Failed to start Stripe Connect setup');
      }
    } catch (error) {
      console.error('Stripe Connect error:', error);
      alert('Failed to connect to Stripe');
    } finally {
      setLoadingStripe(false);
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
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
          <p className="text-gray-400">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Account Settings */}
          <div className="metal-card p-6 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4">Account</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <p className="text-white">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Username</label>
                <p className="text-white">{user.username}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Plan</label>
                <p className="text-white">
                  {user.plan === 'pro' ? '⭐ Pro' : '🆓 Free'}
                </p>
              </div>
            </div>
          </div>

          {/* Stripe Connect */}
          <div className="metal-card p-6 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4">
              Seller Settings
            </h3>
            <p className="text-gray-400 mb-4">
              Connect your Stripe account to sell your media on the marketplace
            </p>
            
            {user.stripeAccountId ? (
              <div className="space-y-4">
                <div className="bg-neon-green/10 border border-neon-green p-4 rounded">
                  <p className="text-neon-green font-bold">
                    ✓ Stripe Connected
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    You can now sell your media on the marketplace
                  </p>
                </div>
                <Button variant="outline" onClick={handleStripeConnect}>
                  Manage Stripe Account
                </Button>
              </div>
            ) : (
              <Button
                variant="neon"
                onClick={handleStripeConnect}
                disabled={loadingStripe}
              >
                {loadingStripe ? 'Connecting...' : 'Connect Stripe Account'}
              </Button>
            )}
          </div>

          {/* AI Usage */}
          <div className="metal-card p-6 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4">AI Usage</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Monthly Limit</span>
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
              </div>
              <p className="text-sm text-gray-400">
                Resets on {new Date(user.aiUsage.resetDate).toLocaleDateString()}
              </p>
              {user.plan === 'free' && (
                <div className="bg-neon-orange/10 border border-neon-orange p-4 rounded">
                  <p className="text-neon-orange font-bold mb-2">
                    Upgrade to Pro
                  </p>
                  <p className="text-sm text-gray-400 mb-3">
                    Get unlimited AI analysis and advanced features
                  </p>
                  <Button variant="neon" size="sm">
                    Upgrade Now
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="metal-card p-6 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4">Privacy</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Public Profile</p>
                  <p className="text-sm text-gray-400">
                    Allow others to view your profile
                  </p>
                </div>
                <input type="checkbox" className="w-5 h-5" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Show in Marketplace</p>
                  <p className="text-sm text-gray-400">
                    Display your listings publicly
                  </p>
                </div>
                <input type="checkbox" className="w-5 h-5" defaultChecked />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="metal-card p-6 rounded-lg border-2 border-red-500/30">
            <h3 className="text-xl font-bold text-red-500 mb-4">Danger Zone</h3>
            <div className="space-y-4">
              <div>
                <p className="text-white font-medium mb-2">Delete Account</p>
                <p className="text-sm text-gray-400 mb-3">
                  Permanently delete your account and all associated data
                </p>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-salvage-dark flex items-center justify-center"><p className="text-neon-cyan">Loading...</p></div>}>
      <SettingsContent />
    </Suspense>
  );
}