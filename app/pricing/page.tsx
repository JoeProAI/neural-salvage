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
            Simple, Realistic Pricing
          </h2>
          <p className="text-xl text-gray-400 mb-2">
            Pay in USD with credit card • No crypto needed
          </p>
          <p className="text-sm text-gray-500">
            File size-based pricing: $3.99-$29.99 per mint • Never pay more than your file needs
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

        <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Free Plan */}
          <div className="metal-card p-6 rounded-lg border-2 border-salvage-glow">
            <h3 className="text-xl font-bold text-neon-cyan mb-2">Free</h3>
            <div className="text-3xl font-bold text-white mb-4">
              $0<span className="text-base text-gray-400">/mo</span>
            </div>
            
            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-4 h-4 text-neon-cyan flex-shrink-0 mt-0.5" />
                <span>Unlimited uploads</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-4 h-4 text-neon-cyan flex-shrink-0 mt-0.5" />
                <span>10 AI analyses/mo</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-4 h-4 text-neon-cyan flex-shrink-0 mt-0.5" />
                <span>5 cover arts/mo</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-4 h-4 text-neon-cyan flex-shrink-0 mt-0.5" />
                <span>Marketplace access</span>
              </li>
              <li className="flex items-start gap-2 text-gray-400 text-xs">
                <span>💰 Pay per mint: $3.99-29.99</span>
              </li>
            </ul>

            <Button
              variant="outline"
              className="w-full text-sm"
              disabled={user?.plan === 'free'}
            >
              {user?.plan === 'free' ? 'Current Plan' : 'Get Started'}
            </Button>
          </div>

          {/* Creator Plan */}
          <div className="metal-card p-6 rounded-lg border-2 border-retro-orange">
            <h3 className="text-xl font-bold text-retro-orange mb-2">Creator</h3>
            <div className="text-3xl font-bold text-white mb-4">
              $12.99<span className="text-base text-gray-400">/mo</span>
            </div>
            
            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-4 h-4 text-retro-orange flex-shrink-0 mt-0.5" />
                <span><strong>5 free mints</strong>/month</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-4 h-4 text-retro-orange flex-shrink-0 mt-0.5" />
                <span>50 AI analyses/mo</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-4 h-4 text-retro-orange flex-shrink-0 mt-0.5" />
                <span>25 cover arts/mo</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-4 h-4 text-retro-orange flex-shrink-0 mt-0.5" />
                <span>15% off extra mints</span>
              </li>
              <li className="flex items-start gap-2 text-gray-400 text-xs">
                <span>Perfect for artists</span>
              </li>
            </ul>

            <Button
              onClick={handleSubscribe}
              className="w-full bg-retro-orange hover:bg-retro-orange/90 text-sm"
            >
              Subscribe
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="metal-card p-6 rounded-lg border-2 border-retro-purple relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-retro-purple text-white px-3 py-1 text-xs font-bold transform rotate-12 translate-x-6 translate-y-2">
              POPULAR
            </div>
            
            <h3 className="text-xl font-bold text-retro-purple mb-2">Pro</h3>
            <div className="text-3xl font-bold text-white mb-4">
              $34.99<span className="text-base text-gray-400">/mo</span>
            </div>
            
            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-4 h-4 text-retro-purple flex-shrink-0 mt-0.5" />
                <span><strong>20 free mints</strong>/month</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-4 h-4 text-retro-purple flex-shrink-0 mt-0.5" />
                <span><strong>Unlimited</strong> AI analyses</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-4 h-4 text-retro-purple flex-shrink-0 mt-0.5" />
                <span><strong>Unlimited</strong> cover art</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-4 h-4 text-retro-purple flex-shrink-0 mt-0.5" />
                <span>25% off extra mints</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-4 h-4 text-retro-purple flex-shrink-0 mt-0.5" />
                <span>Bulk tools + API</span>
              </li>
            </ul>

            <Button
              onClick={handleSubscribe}
              className="w-full bg-retro-purple hover:bg-retro-purple/90 text-sm"
              disabled={user?.plan === 'pro' || user?.isBetaUser}
            >
              {user?.plan === 'pro' ? 'Current Plan' : 'Subscribe'}
            </Button>
          </div>

          {/* Studio Plan */}
          <div className="metal-card p-6 rounded-lg border-2 border-neon-cyan relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-neon-cyan text-void-black px-3 py-1 text-xs font-bold transform rotate-12 translate-x-6 translate-y-2">
              STUDIO
            </div>
            
            <h3 className="text-xl font-bold text-neon-cyan mb-2">Studio</h3>
            <div className="text-3xl font-bold text-white mb-4">
              $119.99<span className="text-base text-gray-400">/mo</span>
            </div>
            
            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-4 h-4 text-neon-cyan flex-shrink-0 mt-0.5" />
                <span><strong>100 free mints</strong>/month</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-4 h-4 text-neon-cyan flex-shrink-0 mt-0.5" />
                <span><strong>Everything</strong> unlimited</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-4 h-4 text-neon-cyan flex-shrink-0 mt-0.5" />
                <span>40% off extra mints</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-4 h-4 text-neon-cyan flex-shrink-0 mt-0.5" />
                <span>Team collaboration</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-4 h-4 text-neon-cyan flex-shrink-0 mt-0.5" />
                <span>Account manager</span>
              </li>
            </ul>

            <Button
              onClick={handleSubscribe}
              className="w-full bg-neon-cyan text-void-black hover:bg-neon-cyan/90 text-sm font-bold"
            >
              Contact Sales
            </Button>
          </div>
        </div>

        {/* File Size Pricing Table */}
        <div className="max-w-4xl mx-auto mt-16 bg-deep-space/60 border-2 border-data-cyan/30 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-white mb-4 text-center">
            💰 Pay-Per-Mint Pricing (File Size Based)
          </h3>
          <p className="text-gray-400 text-center mb-6">
            Only pay for what you need - larger files cost more to store permanently on blockchain
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-void-black/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-neon-cyan mb-1">$3.99</div>
              <div className="text-xs text-gray-400">0-10 MB</div>
              <div className="text-xs text-gray-500 mt-1">Photos, docs</div>
            </div>
            <div className="bg-void-black/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-neon-cyan mb-1">$5.99</div>
              <div className="text-xs text-gray-400">10-50 MB</div>
              <div className="text-xs text-gray-500 mt-1">Songs, images</div>
            </div>
            <div className="bg-void-black/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-neon-cyan mb-1">$9.99</div>
              <div className="text-xs text-gray-400">50-100 MB</div>
              <div className="text-xs text-gray-500 mt-1">Albums, HD</div>
            </div>
            <div className="bg-void-black/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-neon-cyan mb-1">$17.99</div>
              <div className="text-xs text-gray-400">100-250 MB</div>
              <div className="text-xs text-gray-500 mt-1">Long videos</div>
            </div>
            <div className="bg-void-black/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-neon-cyan mb-1">$29.99</div>
              <div className="text-xs text-gray-400">250-500 MB</div>
              <div className="text-xs text-gray-500 mt-1">Massive files</div>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">
            Subscribers get discounts: Creator 15% off • Pro 25% off • Studio 40% off • Beta users: 100% FREE!
          </p>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Frequently Asked Questions
          </h3>
          <div className="space-y-6">
            <div className="metal-card p-6 rounded-lg">
              <h4 className="text-lg font-bold text-neon-cyan mb-2">
                How do I pay? Do I need cryptocurrency?
              </h4>
              <p className="text-gray-300">
                <strong>No crypto needed!</strong> Pay with credit card (Stripe). We handle all the blockchain complexity behind the scenes. You just pay in USD, sign with your free ArConnect wallet to prove ownership, and get your NFT. That's it!
              </p>
            </div>

            <div className="metal-card p-6 rounded-lg">
              <h4 className="text-lg font-bold text-neon-cyan mb-2">
                Why does a larger file cost more?
              </h4>
              <p className="text-gray-300">
                Arweave charges based on data size for permanent blockchain storage. A 5 MB song costs ~$0.05 in AR to store forever, while a 200 MB video costs ~$1. We pass along the real cost plus a small platform fee. This keeps pricing fair and transparent.
              </p>
            </div>

            <div className="metal-card p-6 rounded-lg">
              <h4 className="text-lg font-bold text-neon-cyan mb-2">
                Which plan should I choose?
              </h4>
              <p className="text-gray-300">
                <strong>Free:</strong> Exploring the platform, casual use<br/>
                <strong>Creator ($9.99/mo):</strong> Mint 5+ NFTs/month - saves $15-20+<br/>
                <strong>Pro ($29.99/mo):</strong> Mint 10+ NFTs/month + unlimited AI - saves $60-100+<br/>
                <strong>Studio ($99.99/mo):</strong> Professional teams minting 20+ NFTs/month - saves $300+
              </p>
            </div>

            <div className="metal-card p-6 rounded-lg">
              <h4 className="text-lg font-bold text-neon-cyan mb-2">
                Are marketplace prices reasonable?
              </h4>
              <p className="text-gray-300">
                You set your own prices! We suggest $5-50 for music, $10-200 for art, $25-500 for videos. The goal is to respect artists while staying accessible to collectors. Mint costs $2.99-24.99, so price accordingly to make profit!
              </p>
            </div>

            <div className="metal-card p-6 rounded-lg">
              <h4 className="text-lg font-bold text-neon-cyan mb-2">
                Can I cancel my subscription anytime?
              </h4>
              <p className="text-gray-300">
                Yes! Cancel anytime from your account settings. You'll keep access until the end of your billing period, and any unused free mints for that month are still yours to use.
              </p>
            </div>

            <div className="metal-card p-6 rounded-lg">
              <h4 className="text-lg font-bold text-neon-cyan mb-2">
                Are NFTs really permanent?
              </h4>
              <p className="text-gray-300">
                Yes! We use Arweave blockchain which guarantees storage for 200+ years through economic incentives. Your NFTs are stored across thousands of nodes worldwide. They will outlive all of us.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
