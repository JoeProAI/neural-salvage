'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp, signInWithGoogle, signInWithGithub } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password, username);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    }
  };

  const handleGithubSignIn = async () => {
    try {
      await signInWithGithub();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with GitHub');
    }
  };

  return (
    <div className="min-h-screen bg-salvage-dark grid-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="metal-card p-8 rounded-lg space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold neon-text">Create Account</h1>
            <p className="text-gray-400">Join Neural Salvage today</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-salvage-rust border border-salvage-glow rounded focus:border-neon-cyan focus:outline-none text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-salvage-rust border border-salvage-glow rounded focus:border-neon-cyan focus:outline-none text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-salvage-rust border border-salvage-glow rounded focus:border-neon-cyan focus:outline-none text-white"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                At least 6 characters
              </p>
            </div>

            <Button
              type="submit"
              variant="neon"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-salvage-glow"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-salvage-metal text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
              className="w-full"
            >
              Google
            </Button>
            <Button
              variant="outline"
              onClick={handleGithubSignIn}
              className="w-full"
            >
              GitHub
            </Button>
          </div>

          <div className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-neon-cyan hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}