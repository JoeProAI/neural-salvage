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

  return (
    <div className="min-h-screen bg-void-black text-pure-white relative overflow-x-hidden" style={{ perspective: '1800px' }}>
      {/* Star Field Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-pure-white rounded-full animate-twinkle"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${Math.random() * 4 + 5}s`,
            }}
          />
        ))}
      </div>

      {/* 3D Stage Container */}
      <div className="relative min-h-screen flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
        
        {/* 3D Floor Panels */}
        <div 
          className="fixed bottom-[-200px] left-1/2 -translate-x-1/2 w-[120%] grid grid-cols-8 gap-3 z-[4] opacity-35"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'rotateX(72deg)',
            height: '380px'
          }}
        >
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-[180px] border border-data-cyan/20 animate-panel-pulse"
              style={{
                background: 'linear-gradient(170deg, rgba(61, 90, 128, 0.15) 0%, rgba(15, 20, 30, 0.35) 100%)',
                borderRadius: '3px 5px 4px 6px',
                animationDelay: `${i * 0.3}s`,
                transformStyle: 'preserve-3d'
              }}
            />
          ))}
        </div>

        {/* Main Content Platform */}
        <div className="relative w-[92%] max-w-[1300px] mx-auto" style={{ transformStyle: 'preserve-3d' }}>
          
          {/* Holographic Corners */}
          <div className="absolute inset-0 pointer-events-none z-[5]">
            {/* Top Left */}
            <div 
              className="absolute top-[-35px] left-[-45px] w-[130px] h-[110px] border-r-2 border-b-2 border-data-cyan animate-bracket-glow"
              style={{ 
                transformStyle: 'preserve-3d',
                transform: 'translateZ(55px) rotate(-1deg)'
              }}
            >
              <div className="absolute bottom-[-4px] right-[-4px] w-[18px] h-[18px] bg-data-cyan rounded-br-[60%]" style={{ boxShadow: '0 0 25px #6FCDDD' }} />
            </div>
            
            {/* Top Right */}
            <div 
              className="absolute top-[-30px] right-[-35px] w-[105px] h-[125px] border-l-2 border-b-2 border-data-cyan animate-bracket-glow"
              style={{ 
                transformStyle: 'preserve-3d',
                transform: 'translateZ(48px) rotate(0.8deg)',
                animationDelay: '1.2s'
              }}
            >
              <div className="absolute bottom-[-4px] left-[-4px] w-[18px] h-[18px] bg-data-cyan rounded-bl-[55%]" style={{ boxShadow: '0 0 25px #6FCDDD' }} />
            </div>
            
            {/* Bottom Left */}
            <div 
              className="absolute bottom-[-38px] left-[-40px] w-[115px] h-[120px] border-r-2 border-t-2 border-archive-amber animate-bracket-glow"
              style={{ 
                transformStyle: 'preserve-3d',
                transform: 'translateZ(52px) rotate(0.5deg)',
                animationDelay: '2.4s'
              }}
            >
              <div className="absolute top-[-4px] right-[-4px] w-[18px] h-[18px] bg-archive-amber rounded-tr-[65%]" style={{ boxShadow: '0 0 25px #E8A55C' }} />
            </div>
            
            {/* Bottom Right */}
            <div 
              className="absolute bottom-[-42px] right-[-38px] w-[125px] h-[108px] border-l-2 border-t-2 border-archive-amber animate-bracket-glow"
              style={{ 
                transformStyle: 'preserve-3d',
                transform: 'translateZ(50px) rotate(-0.7deg)',
                animationDelay: '0.8s'
              }}
            >
              <div className="absolute top-[-4px] left-[-4px] w-[18px] h-[18px] bg-archive-amber rounded-tl-[58%]" style={{ boxShadow: '0 0 25px #E8A55C' }} />
            </div>
          </div>

          {/* Main Content Card */}
          <div 
            className="relative bg-gradient-to-br from-deep-space/94 via-panel-dark/97 to-deep-space/95 border-2 border-data-cyan/28 rounded-xl p-16 backdrop-blur-xl"
            style={{
              transformStyle: 'preserve-3d',
              transform: 'translateZ(75px)',
              boxShadow: '0 35px 70px rgba(0, 0, 0, 0.75), 0 0 90px rgba(111, 205, 221, 0.12), inset 0 2px 0 rgba(255, 255, 255, 0.08)'
            }}
          >
            {/* Shimmer Line */}
            <div 
              className="absolute top-0 h-[2px] bg-gradient-to-r from-transparent via-data-cyan via-archive-amber to-transparent animate-slide-shimmer"
              style={{ left: '5%', right: '15%' }}
            />
          
            {/* Complex Spinning Logo */}
            <div className="text-center mb-14" style={{ transformStyle: 'preserve-3d', transform: 'translateZ(95px)' }}>
              <div className="w-28 h-28 mx-auto mb-7 animate-complex-rotate" style={{ transformStyle: 'preserve-3d', filter: 'drop-shadow(0 0 28px #6FCDDD)' }}>
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="44" stroke="#6FCDDD" strokeWidth="1.5" fill="none" strokeDasharray="12 4 8 6"/>
                  <path d="M 50 16 L 73 31 L 73 61 L 50 76 L 27 61 L 27 31 Z" fill="rgba(232, 165, 92, 0.08)" stroke="#E8A55C" strokeWidth="1.8"/>
                  <path d="M 50 32 L 63 46 L 52 62 L 37 47 Z" fill="#6FCDDD" opacity="0.75"/>
                  <text x="49" y="59" fontFamily="Space Mono" fontSize="26" fontWeight="700" fill="#0A0E14" textAnchor="middle">N</text>
                  <line x1="50" y1="6" x2="50" y2="16" stroke="#E8A55C" strokeWidth="2.5"/>
                  <line x1="48" y1="84" x2="52" y2="94" stroke="#E8A55C" strokeWidth="2"/>
                  <circle cx="85" cy="50" r="2" fill="#6FCDDD" opacity="0.8"/>
                  <circle cx="15" cy="48" r="3" fill="#E8A55C" opacity="0.6"/>
                </svg>
              </div>
              
              <h1 className="font-space-mono text-6xl font-bold text-pure-white uppercase tracking-[0.18em] leading-tight mb-5"
                style={{ textShadow: '0 0 35px #E8A55C, 0 6px 12px rgba(0, 0, 0, 0.8), 0 3px 0 #A67C52' }}
              >
                NEURAL<br />SALVAGE
              </h1>
              
              <p className="font-rajdhani text-xl text-data-cyan uppercase tracking-[0.38em] font-medium"
                style={{ textShadow: '0 0 22px #6FCDDD' }}
              >
                Digital Preservation
              </p>
            </div>

            {/* Hero Content */}
            <div className="max-w-3xl mx-auto text-center mb-14" style={{ transformStyle: 'preserve-3d', transform: 'translateZ(88px)' }}>
              <h2 className="font-rajdhani text-5xl font-semibold text-pure-white mb-7 leading-tight"
                style={{ textShadow: '0 3px 12px rgba(0, 0, 0, 0.8)' }}
              >
                Store Your NFTs for <span className="text-archive-amber" style={{ textShadow: '0 0 35px #E8A55C' }}>200+ Years</span>
              </h2>
              
              <p className="text-xl text-ash-gray leading-relaxed"
                style={{ textShadow: '0 2px 6px rgba(0, 0, 0, 0.8)' }}
              >
                Secure and reliable NFT storage on the Arweave network to safeguard 
                your digital assets for centuries to come. Permanent. Decentralized. Unstoppable.
              </p>
            </div>

            {/* Stat Cards with Wild Hover */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mb-14" style={{ transformStyle: 'preserve-3d', transform: 'translateZ(68px)' }}>
              {[
                { value: '200+', label: 'Years Storage', icon: '✓' },
                { value: '∞', label: 'Permanence', icon: '⚡' },
                { value: '100%', label: 'Decentralized', icon: '🌐' }
              ].map((stat, i) => (
                <div
                  key={i}
                  className="relative bg-gradient-to-br from-deep-space/75 to-panel-dark/88 border-2 border-data-cyan/28 rounded-lg p-10 text-center cursor-pointer group"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: 'translateZ(68px) rotate(0.3deg)',
                    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-data-cyan to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="text-5xl mb-5 transition-all duration-500 group-hover:scale-125 group-hover:rotate-[360deg]"
                    style={{ filter: 'drop-shadow(0 4px 12px rgba(111, 205, 221, 0.3))' }}
                  >
                    {stat.icon}
                  </div>
                  <div className="font-space-mono text-6xl font-bold text-archive-amber mb-3 transition-all duration-500 group-hover:scale-110"
                    style={{ textShadow: '0 0 22px #E8A55C' }}
                  >
                    {stat.value}
                  </div>
                  <div className="font-rajdhani text-base text-data-cyan uppercase tracking-[0.14em] font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="text-center" style={{ transformStyle: 'preserve-3d', transform: 'translateZ(85px)' }}>
              <div className="max-w-2xl mx-auto mb-9">
                <div className="flex gap-5 bg-void-black/45 p-3 rounded-xl border-2 border-data-cyan/28 backdrop-blur-sm"
                  style={{ boxShadow: 'inset 0 3px 12px rgba(0, 0, 0, 0.5), 0 0 35px rgba(111, 205, 221, 0.08)' }}
                >
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 bg-void-black/85 border border-data-cyan/30 rounded-lg px-6 py-5 font-inter text-pure-white outline-none focus:border-data-cyan focus:shadow-[0_0_25px_rgba(111,205,221,0.3)] transition-all"
                  />
                  <button className="cyberpunk-button">
                    GET STARTED
                  </button>
                </div>
              </div>
              
              <div className="flex gap-9 justify-center flex-wrap">
                <Link 
                  href="/auth/login"
                  className="font-rajdhani text-lg text-data-cyan uppercase tracking-[0.12em] font-semibold relative group"
                >
                  Sign In
                  <span className="absolute bottom-[-5px] left-0 w-0 h-[2px] bg-archive-amber group-hover:w-full transition-all duration-400"
                    style={{ boxShadow: '0 0 12px #E8A55C' }}
                  />
                </Link>
                <Link 
                  href="/dashboard"
                  className="font-rajdhani text-lg text-data-cyan uppercase tracking-[0.12em] font-semibold relative group"
                >
                  View Demo
                  <span className="absolute bottom-[-5px] left-0 w-0 h-[2px] bg-archive-amber group-hover:w-full transition-all duration-400"
                    style={{ boxShadow: '0 0 12px #E8A55C' }}
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Network Status Badge */}
        <div 
          className="fixed bottom-9 left-1/2 -translate-x-1/2 bg-deep-space/94 border-2 border-terminal-green/42 rounded-full px-7 py-4 flex items-center gap-4 z-[100] backdrop-blur-xl"
          style={{
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.8), 0 0 35px rgba(127, 176, 105, 0.18)',
            transform: 'translateX(-50%) translateZ(45px)'
          }}
        >
          <div className="w-[13px] h-[13px] bg-terminal-green rounded-full animate-pulse-glow"
            style={{ boxShadow: '0 0 18px #7FB069, inset 0 0 6px rgba(255, 255, 255, 0.5)' }}
          />
          <span className="font-jetbrains text-sm text-terminal-green uppercase tracking-[0.12em]">
            ARWEAVE NETWORK ONLINE
          </span>
        </div>
      </div>
    </div>
  );
}
