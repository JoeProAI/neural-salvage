'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Check } from 'lucide-react';

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSubscribe = async () => {
    if (!user) {
      router.push('/auth/login?redirect=/pricing');
      return;
    }

    try {
      const response = await fetch('/api/payment/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
        }),
      });

      const data = await response.json();

      if (data.isBetaUser) {
        alert('You already have beta access with all Pro features for free!');
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Subscribe error:', error);
      alert(`Subscription failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-salvage-dark">
      {/* Header */}
      <header className="border-b border-salvage-glow bg-salvage-metal">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold neon-text">NEURAL SALVAGE</h1>
            </Link>
            {user && (
              <Link href="/dashboard">
                <Button variant="outline">← Back to Dashboard</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Pricing Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-400">
            Start free, upgrade when you need more power
          </p>
        </div>

        {/* Beta User Banner */}
        {user?.isBetaUser && (
          <div className="max-w-4xl mx-auto mb-8 bg-retro-purple/20 border-2 border-retro-purple rounded-lg p-6 text-center">
            <h3 className="text-2xl font-bold text-retro-purple mb-2">
              🎉 You're a Beta User!
            </h3>
            <p className="text-white">
              You have free access to all Pro features. Thank you for being an early supporter!
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="metal-card p-8 rounded-lg border-2 border-salvage-glow">
            <h3 className="text-2xl font-bold text-neon-cyan mb-2">Free</h3>
            <div className="text-4xl font-bold text-white mb-6">
              $0<span className="text-lg text-gray-400">/month</span>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-0.5" />
                <span>Unlimited uploads</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-0.5" />
                <span>Unlimited storage</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-0.5" />
                <span>Collections & gallery</span>
              </li>
              <li className="flex items-start gap-2 text-gray-400">
                <span className="w-5 h-5 text-center flex-shrink-0">×</span>
                <span>0 AI analyses</span>
              </li>
              <li className="flex items-start gap-2 text-gray-400">
                <span className="w-5 h-5 text-center flex-shrink-0">×</span>
                <span>0 NFT mints</span>
              </li>
            </ul>

            <Button
              variant="outline"
              className="w-full"
              disabled={user?.plan === 'free'}
            >
              {user?.plan === 'free' ? 'Current Plan' : 'Get Started'}
            </Button>
          </div>

          {/* Pay-Per-Use Plan */}
          <div className="metal-card p-8 rounded-lg border-2 border-retro-orange">
            <h3 className="text-2xl font-bold text-retro-orange mb-2">Pay-Per-Use</h3>
            <div className="text-4xl font-bold text-white mb-6">
              As You Go
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-5 h-5 text-retro-orange flex-shrink-0 mt-0.5" />
                <span>Everything in Free</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-5 h-5 text-retro-orange flex-shrink-0 mt-0.5" />
                <span>$0.10 per AI analysis</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-5 h-5 text-retro-orange flex-shrink-0 mt-0.5" />
                <span>$1.00 per NFT mint</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-5 h-5 text-retro-orange flex-shrink-0 mt-0.5" />
                <span>No commitment</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-5 h-5 text-retro-orange flex-shrink-0 mt-0.5" />
                <span>Pay only for what you use</span>
              </li>
            </ul>

            <Link href="/dashboard">
              <Button
                className="w-full bg-retro-orange hover:bg-retro-orange/90"
              >
                Start Using
              </Button>
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="metal-card p-8 rounded-lg border-2 border-retro-purple relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-retro-purple text-white px-4 py-1 text-sm font-bold transform rotate-12 translate-x-8 translate-y-4">
              BEST VALUE
            </div>
            
            <h3 className="text-2xl font-bold text-retro-purple mb-2">Pro</h3>
            <div className="text-4xl font-bold text-white mb-6">
              $9.99<span className="text-lg text-gray-400">/month</span>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-5 h-5 text-retro-purple flex-shrink-0 mt-0.5" />
                <span>Everything in Free</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-5 h-5 text-retro-purple flex-shrink-0 mt-0.5" />
                <span><strong>Unlimited</strong> AI analyses</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-5 h-5 text-retro-purple flex-shrink-0 mt-0.5" />
                <span><strong>10 free</strong> NFT mints/month</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-5 h-5 text-retro-purple flex-shrink-0 mt-0.5" />
                <span>$0.50 per additional mint</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-5 h-5 text-retro-purple flex-shrink-0 mt-0.5" />
                <span>Priority support</span>
              </li>
            </ul>

            <Button
              onClick={handleSubscribe}
              className="w-full bg-retro-purple hover:bg-retro-purple/90"
              disabled={user?.plan === 'pro' || user?.isBetaUser}
            >
              {user?.plan === 'pro' ? 'Current Plan' : user?.isBetaUser ? 'Beta User' : 'Upgrade to Pro'}
            </Button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Frequently Asked Questions
          </h3>
          <div className="space-y-6">
            <div className="metal-card p-6 rounded-lg">
              <h4 className="text-lg font-bold text-neon-cyan mb-2">
                What's the difference between pay-per-use and Pro?
              </h4>
              <p className="text-gray-300">
                Pay-per-use is great if you only occasionally need AI or NFTs. Pro is better value if you use AI more than 100 times/month or mint more than 10 NFTs/month.
              </p>
            </div>

            <div className="metal-card p-6 rounded-lg">
              <h4 className="text-lg font-bold text-neon-cyan mb-2">
                Can I cancel my Pro subscription anytime?
              </h4>
              <p className="text-gray-300">
                Yes! Cancel anytime from your account settings. You'll keep Pro access until the end of your billing period.
              </p>
            </div>

            <div className="metal-card p-6 rounded-lg">
              <h4 className="text-lg font-bold text-neon-cyan mb-2">
                Are NFTs really permanent?
              </h4>
              <p className="text-gray-300">
                Yes! We use Arweave blockchain which guarantees storage for 200+ years through economic incentives. Your NFTs will outlive you.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
