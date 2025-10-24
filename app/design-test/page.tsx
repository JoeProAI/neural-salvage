'use client';

export default function DesignTestPage() {
  return (
    <div className="min-h-screen bg-neural-black text-neural-white p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4 border-b border-neural-gray-800 pb-8">
          <h1 className="text-4xl font-bold text-neural-white">
            Design System
          </h1>
          <p className="text-lg text-neural-gray-400">
            Professional component library and utilities
          </p>
        </div>

        {/* Color Palette */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-neural-white">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-24 bg-neural-black border border-neural-gray-800 rounded-lg" />
              <p className="text-sm text-neural-gray-400">neural-black</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 bg-neural-dark border border-neural-gray-800 rounded-lg" />
              <p className="text-sm text-neural-gray-400">neural-dark</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 bg-neural-blue rounded-lg" />
              <p className="text-sm text-neural-gray-400">neural-blue</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 bg-neural-cyan rounded-lg" />
              <p className="text-sm text-neural-gray-400">neural-cyan</p>
            </div>
          </div>
        </section>

        {/* Neural Card */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-neural-white">Card Component</h2>
          <p className="text-sm text-neural-gray-600">Hover to see interaction feedback</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="neural-card p-6 space-y-3">
              <div className="w-12 h-12 bg-neural-blue/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-neural-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Fast Performance</h3>
              <p className="text-neural-gray-400">
                Lightning-fast asset management with instant search and retrieval.
              </p>
            </div>
            <div className="neural-card p-6 space-y-3">
              <div className="w-12 h-12 bg-neural-blue/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-neural-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Secure Storage</h3>
              <p className="text-neural-gray-400">
                Enterprise-grade security with encrypted storage and backup.
              </p>
            </div>
            <div className="neural-card p-6 space-y-3">
              <div className="w-12 h-12 bg-neural-blue/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-neural-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Blockchain NFTs</h3>
              <p className="text-neural-gray-400">
                Permanent storage on Arweave with verifiable ownership.
              </p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-neural-white">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <button className="neural-button">
              Primary Action
            </button>
            <button className="bg-neural-purple text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 hover:bg-neural-purple/80 active:scale-95">
              Secondary Action
            </button>
            <button className="bg-transparent border border-neural-blue text-neural-blue font-medium px-6 py-3 rounded-lg transition-all duration-200 hover:bg-neural-blue/10 active:scale-95">
              Outline Button
            </button>
          </div>
        </section>

        {/* Glass Morphism */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-neural-white">Glass Effect</h2>
          <div className="relative h-64 bg-neural-medium border border-neural-gray-800 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="neural-glass p-8 rounded-xl space-y-2 max-w-md">
                <h3 className="text-2xl font-bold">Navigation Bar Example</h3>
                <p className="text-neural-gray-400 text-sm">
                  Subtle backdrop blur for elevated surfaces like navigation and modals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Loading Skeletons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-neural-white">Loading States</h2>
          <div className="space-y-3">
            <div className="neural-skeleton h-12 w-3/4" />
            <div className="neural-skeleton h-8 w-1/2" />
            <div className="neural-skeleton h-8 w-2/3" />
          </div>
        </section>

        {/* Animations */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-neural-white">Animations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-neural-dark p-6 rounded-lg border border-neural-gray-800 animate-neural-pulse">
              <p className="text-center text-neural-gray-400">Neural Pulse</p>
            </div>
            <div className="bg-neural-dark p-6 rounded-lg animate-neural-glow">
              <p className="text-center text-neural-gray-400">Neural Glow</p>
            </div>
            <div className="bg-neural-dark p-6 rounded-lg border border-neural-gray-800">
              <div className="w-full h-2 bg-neural-blue/20 rounded overflow-hidden">
                <div className="h-full bg-neural-blue animate-neural-flow" />
              </div>
              <p className="text-center text-neural-gray-400 mt-2">Neural Flow</p>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-neural-white">Typography</h2>
          <div className="space-y-3 bg-neural-dark p-6 rounded-lg border border-neural-gray-800">
            <h1 className="text-4xl font-bold text-neural-white">Page Title</h1>
            <h2 className="text-2xl font-semibold text-neural-gray-100">Section Heading</h2>
            <h3 className="text-xl font-medium text-neural-gray-200">Subsection</h3>
            <p className="text-base text-neural-gray-400">
              Body text with proper contrast. Clean, readable, professional.
            </p>
            <p className="text-sm text-neural-gray-600">
              Metadata and captions use smaller, muted text
            </p>
          </div>
        </section>

        {/* Status Colors */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-neural-white">Status Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-neural-success/10 border border-neural-success/30 p-4 rounded-lg">
              <p className="text-neural-success font-medium">Success</p>
            </div>
            <div className="bg-neural-warning/10 border border-neural-warning/30 p-4 rounded-lg">
              <p className="text-neural-warning font-medium">Warning</p>
            </div>
            <div className="bg-neural-error/10 border border-neural-error/30 p-4 rounded-lg">
              <p className="text-neural-error font-medium">Error</p>
            </div>
            <div className="bg-neural-info/10 border border-neural-info/30 p-4 rounded-lg">
              <p className="text-neural-info font-medium">Info</p>
            </div>
          </div>
        </section>

        {/* Back to Dashboard */}
        <div className="pt-8 border-t border-neural-gray-800">
          <a
            href="/dashboard"
            className="inline-flex items-center text-neural-blue hover:text-neural-cyan transition-colors"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
