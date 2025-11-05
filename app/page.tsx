'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're sure they're logged in
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Don't block rendering on auth loading - show page immediately
  return (
    <div className="min-h-screen bg-gradient-to-br from-salvage-dark via-salvage-metal to-salvage-dark">
      {/* Grid background overlay */}
      <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      
      {/* Navigation */}
      <nav className="relative bg-salvage-metal/95 backdrop-blur-md border-b-2 border-salvage-rust">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-retro-orange to-retro-yellow rounded-lg flex items-center justify-center animate-retro-glow">
              <span className="text-salvage-dark font-bold text-xl">⚡</span>
            </div>
            <span className="text-retro-cream font-bold text-xl tracking-wide">
              NEURAL SALVAGE
            </span>
          </div>
          
          {/* Nav Links */}
          <div className="hidden md:flex gap-8">
            <Link href="#features" className="text-retro-cream hover:text-retro-teal transition-colors font-medium">
              THE YARD
            </Link>
            <Link href="#how-it-works" className="text-retro-cream hover:text-retro-teal transition-colors font-medium">
              OPERATIONS
            </Link>
            <Link href="#pricing" className="text-retro-cream hover:text-retro-teal transition-colors font-medium">
              RATES
            </Link>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex gap-4">
            <Link 
              href="/auth/login" 
              className="text-retro-teal hover:text-retro-teal/80 transition-colors font-semibold"
            >
              ACCESS
            </Link>
            <Link 
              href="/auth/signup" 
              className="bg-gradient-to-r from-retro-orange to-retro-yellow text-salvage-dark px-6 py-2 rounded-lg font-bold hover:shadow-[0_0_20px_rgba(255,107,53,0.5)] transition-all"
            >
              ENTER →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-retro-teal/20 border border-retro-teal text-retro-teal px-4 py-2 rounded-full text-sm font-semibold mb-8 animate-float">
            <span className="w-2 h-2 bg-retro-teal rounded-full animate-pulse"></span>
            BLOCKCHAIN PRESERVATION SYSTEMS ONLINE
          </div>
          
          {/* Headline */}
          <h1 className="text-7xl font-bold text-retro-cream mb-6 leading-tight tracking-wide">
            OTHERWORLDLY
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-retro-orange via-retro-yellow to-retro-teal">
              ASSET SALVAGE
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-2xl text-salvage-dust mb-12 max-w-2xl leading-relaxed">
            Submit your digital assets for permanent on-chain preservation. 
            Our advanced recovery protocols ensure your data survives forever.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/auth/signup"
              className="bg-gradient-to-r from-retro-orange to-retro-yellow text-salvage-dark px-8 py-4 rounded-lg font-bold text-lg hover:shadow-[0_0_30px_rgba(255,107,53,0.6)] transform hover:scale-105 transition-all"
            >
              INITIATE SALVAGE →
            </Link>
            <Link 
              href="/dashboard"
              className="border-2 border-retro-teal text-retro-teal px-8 py-4 rounded-lg font-bold text-lg hover:bg-retro-teal/10 transition-all"
            >
              VIEW OPERATIONS
            </Link>
          </div>
          
          {/* Stats Row */}
          <div className="mt-16 grid grid-cols-3 gap-8">
            <div className="border-l-2 border-retro-orange pl-4">
              <div className="text-4xl font-bold text-retro-orange mb-2">200+</div>
              <div className="text-salvage-dust text-sm uppercase">Years Preserved</div>
            </div>
            <div className="border-l-2 border-retro-teal pl-4">
              <div className="text-4xl font-bold text-retro-teal mb-2">∞</div>
              <div className="text-salvage-dust text-sm uppercase">Decentralized</div>
            </div>
            <div className="border-l-2 border-retro-purple pl-4">
              <div className="text-4xl font-bold text-retro-purple mb-2">⛓️</div>
              <div className="text-salvage-dust text-sm uppercase">On-Chain Certified</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="relative max-w-7xl mx-auto px-6 py-24">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-retro-cream mb-4">RECOVERY PROTOCOLS</h2>
          <p className="text-salvage-dust text-xl">Advanced systems for permanent asset preservation</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-salvage-metal border-2 border-salvage-rust rounded-xl p-8 hover:border-retro-teal hover:shadow-[0_0_20px_rgba(0,207,193,0.3)] transition-all duration-300 group">
            <div className="w-12 h-12 bg-gradient-to-br from-retro-orange to-retro-yellow rounded-lg flex items-center justify-center mb-4 group-hover:animate-float">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-bold text-retro-cream mb-3">
              SEMANTIC RECOVERY
            </h3>
            <p className="text-salvage-dust">
              Locate any salvaged asset instantly using neural search protocols. Our AI understands context, not just keywords.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-salvage-metal border-2 border-salvage-rust rounded-xl p-8 hover:border-retro-purple hover:shadow-[0_0_20px_rgba(155,89,182,0.3)] transition-all duration-300 group">
            <div className="w-12 h-12 bg-gradient-to-br from-retro-purple to-retro-teal rounded-lg flex items-center justify-center mb-4 group-hover:animate-float">
              <span className="text-2xl">⛓️</span>
            </div>
            <h3 className="text-xl font-bold text-retro-cream mb-3">
              BLOCKCHAIN CERTIFICATION
            </h3>
            <p className="text-salvage-dust">
              Transform assets into permanent on-chain NFTs. Stored on Arweave for 200+ years with mathematical guarantee.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-retro-purple/20 border border-retro-purple text-retro-purple px-3 py-1 rounded-full text-xs font-bold">
              <span className="w-2 h-2 bg-retro-purple rounded-full animate-pulse"></span>
              PERMANENT
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-salvage-metal border-2 border-salvage-rust rounded-xl p-8 hover:border-retro-teal hover:shadow-[0_0_20px_rgba(0,207,193,0.3)] transition-all duration-300 group">
            <div className="w-12 h-12 bg-gradient-to-br from-retro-teal to-glow-cyan rounded-lg flex items-center justify-center mb-4 group-hover:animate-float">
              <span className="text-2xl">🔐</span>
            </div>
            <h3 className="text-xl font-bold text-retro-cream mb-3">
              MILITARY-GRADE SECURITY
            </h3>
            <p className="text-salvage-dust">
              Enterprise encryption with distributed backup systems. Your assets are protected against all known threats.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative border-t-2 border-salvage-rust bg-salvage-dark/50">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-retro-cream mb-4">SALVAGE OPERATIONS</h2>
            <p className="text-salvage-dust text-xl">Simple protocols, powerful preservation</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-retro-orange to-retro-yellow rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-salvage-dark">
                1
              </div>
              <h3 className="text-2xl font-bold text-retro-orange mb-4">SUBMIT</h3>
              <p className="text-salvage-dust text-lg">
                Upload your digital assets to our secure recovery facility. Unlimited storage included.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-retro-teal to-glow-cyan rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-salvage-dark">
                2
              </div>
              <h3 className="text-2xl font-bold text-retro-teal mb-4">PRESERVE</h3>
              <p className="text-salvage-dust text-lg">
                One-click blockchain certification. Transform your assets into permanent on-chain NFTs.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-retro-purple to-glow-magenta rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-retro-cream">
                3
              </div>
              <h3 className="text-2xl font-bold text-retro-purple mb-4">OWN FOREVER</h3>
              <p className="text-salvage-dust text-lg">
                Your certified assets survive for 200+ years. Sell, transfer, or keep them permanently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="bg-gradient-to-br from-salvage-metal via-salvage-rust to-salvage-metal border-2 border-retro-teal rounded-2xl p-16 text-center shadow-[0_0_50px_rgba(0,207,193,0.2)] relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          
          <div className="relative z-10">
            {/* Warning Banner */}
            <div className="inline-flex items-center gap-2 bg-glow-amber/20 border border-glow-amber text-glow-amber px-4 py-2 rounded-full text-sm font-bold mb-8">
              <span>⚠️</span>
              LIMITED SPOTS AVAILABLE
            </div>

            <h2 className="text-5xl font-bold text-retro-cream mb-6">
              INITIATE SALVAGE PROTOCOL
            </h2>
            <p className="text-xl text-salvage-dust mb-12 max-w-2xl mx-auto">
              Join the network of professionals preserving digital assets for eternity. Your data deserves to outlive you.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                href="/auth/signup"
                className="bg-gradient-to-r from-retro-orange to-retro-yellow text-salvage-dark px-10 py-5 rounded-lg font-bold text-xl hover:shadow-[0_0_40px_rgba(255,107,53,0.8)] transform hover:scale-105 transition-all"
              >
                BEGIN OPERATIONS →
              </Link>
              <Link 
                href="/dashboard"
                className="border-2 border-retro-cream text-retro-cream px-10 py-5 rounded-lg font-bold text-xl hover:bg-retro-cream/10 transition-all"
              >
                VIEW DEMO
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap gap-8 justify-center text-sm">
              <div className="flex items-center gap-2 text-salvage-dust">
                <span className="text-retro-teal text-xl">✓</span>
                <span>200+ YEAR GUARANTEE</span>
              </div>
              <div className="flex items-center gap-2 text-salvage-dust">
                <span className="text-retro-teal text-xl">✓</span>
                <span>BLOCKCHAIN CERTIFIED</span>
              </div>
              <div className="flex items-center gap-2 text-salvage-dust">
                <span className="text-retro-teal text-xl">✓</span>
                <span>FREE STORAGE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t-2 border-salvage-rust bg-salvage-metal">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo & Copyright */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-retro-orange to-retro-yellow rounded-lg flex items-center justify-center">
                <span className="text-salvage-dark font-bold">⚡</span>
              </div>
              <div>
                <div className="text-retro-cream font-bold">NEURAL SALVAGE</div>
                <div className="text-salvage-dust text-xs">© 2025 · Otherworldly Asset Recovery</div>
              </div>
            </div>
            
            {/* Links */}
            <div className="flex gap-8 text-salvage-dust">
              <Link href="/privacy" className="hover:text-retro-teal transition-colors">PRIVACY PROTOCOLS</Link>
              <Link href="/terms" className="hover:text-retro-teal transition-colors">TERMS</Link>
              <Link href="/contact" className="hover:text-retro-teal transition-colors">TRANSMIT</Link>
            </div>
          </div>
          
          {/* Tech Badge */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-salvage-dark border border-salvage-rust text-salvage-dust px-4 py-2 rounded-lg text-xs font-mono">
              <span className="w-2 h-2 bg-retro-teal rounded-full animate-pulse"></span>
              POWERED BY ARWEAVE BLOCKCHAIN · PERMANENT STORAGE GUARANTEED
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}