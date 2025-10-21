'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [twitter, setTwitter] = useState('');
  const [github, setGithub] = useState('');
  const [website, setWebsite] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setBio(user.bio || '');
      setTwitter(user.socialLinks?.twitter || '');
      setGithub(user.socialLinks?.github || '');
      setWebsite(user.socialLinks?.website || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        displayName,
        bio,
        socialLinks: {
          twitter,
          github,
          website,
        },
        updatedAt: new Date(),
      });

      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Profile</h2>
            <p className="text-gray-400">Manage your public profile</p>
          </div>
          {!editing ? (
            <Button variant="neon" onClick={() => setEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="neon" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="metal-card p-8 rounded-lg space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-salvage-rust border-2 border-neon-cyan flex items-center justify-center text-4xl">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                '👤'
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{user.username}</h3>
              <p className="text-gray-400">{user.email}</p>
              <p className="text-sm text-neon-cyan mt-1">
                {user.plan === 'pro' ? '⭐ Pro Member' : '🆓 Free Plan'}
              </p>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={!editing}
                className="w-full px-4 py-2 bg-salvage-rust border border-salvage-glow rounded focus:border-neon-cyan focus:outline-none text-white disabled:opacity-50"
                placeholder="Your display name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={!editing}
                className="w-full px-4 py-2 bg-salvage-rust border border-salvage-glow rounded focus:border-neon-cyan focus:outline-none text-white disabled:opacity-50"
                rows={4}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="border-t border-salvage-glow pt-4">
              <h4 className="text-lg font-bold text-white mb-4">Social Links</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Twitter
                  </label>
                  <input
                    type="text"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    disabled={!editing}
                    className="w-full px-4 py-2 bg-salvage-rust border border-salvage-glow rounded focus:border-neon-cyan focus:outline-none text-white disabled:opacity-50"
                    placeholder="https://twitter.com/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    GitHub
                  </label>
                  <input
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    disabled={!editing}
                    className="w-full px-4 py-2 bg-salvage-rust border border-salvage-glow rounded focus:border-neon-cyan focus:outline-none text-white disabled:opacity-50"
                    placeholder="https://github.com/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Website
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    disabled={!editing}
                    className="w-full px-4 py-2 bg-salvage-rust border border-salvage-glow rounded focus:border-neon-cyan focus:outline-none text-white disabled:opacity-50"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className="border-t border-salvage-glow pt-4">
            <h4 className="text-lg font-bold text-white mb-4">Account Stats</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Member Since</p>
                <p className="text-white font-bold">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">AI Usage</p>
                <p className="text-white font-bold">
                  {user.aiUsage.current} / {user.aiUsage.limit}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Link */}
        <div className="mt-6 text-center">
          <Link href="/settings">
            <Button variant="outline">Go to Settings</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}