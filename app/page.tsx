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
          <div className="absolute inset-0 pointer-events-none z-[10]">
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

            {/* Stat Cards with Code-Based Icons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mb-14" style={{ transformStyle: 'preserve-3d', transform: 'translateZ(68px)' }}>
              {[
                { value: '200+', label: 'Years Storage', iconType: 'vault' },
                { value: '∞', label: 'Permanence', iconType: 'energy' },
                { value: '100%', label: 'Decentralized', iconType: 'network' }
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
                  
                  {/* Code-based SVG Icons */}
                  <div className="mb-5 flex justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-[360deg]">
                    {stat.iconType === 'vault' && (
                      <svg width="80" height="80" viewBox="0 0 80 80" className="transition-all duration-500">
                        <defs>
                          <linearGradient id="vaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#6FCDDD', stopOpacity: 0.8 }} />
                            <stop offset="100%" style={{ stopColor: '#E8A55C', stopOpacity: 0.6 }} />
                          </linearGradient>
                        </defs>
                        <rect x="10" y="10" width="60" height="60" fill="none" stroke="url(#vaultGrad)" strokeWidth="2" rx="4" />
                        <circle cx="40" cy="40" r="18" fill="none" stroke="#6FCDDD" strokeWidth="2.5" />
                        <circle cx="40" cy="40" r="12" fill="none" stroke="#E8A55C" strokeWidth="2" />
                        <line x1="40" y1="28" x2="40" y2="35" stroke="#6FCDDD" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="40" y1="45" x2="40" y2="52" stroke="#6FCDDD" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="28" y1="40" x2="35" y2="40" stroke="#6FCDDD" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="45" y1="40" x2="52" y2="40" stroke="#6FCDDD" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="40" cy="40" r="3" fill="#E8A55C" style={{ filter: 'drop-shadow(0 0 8px #E8A55C)' }} />
                      </svg>
                    )}
                    {stat.iconType === 'energy' && (
                      <svg width="80" height="80" viewBox="0 0 80 80" className="transition-all duration-500">
                        <defs>
                          <radialGradient id="energyGlow">
                            <stop offset="0%" style={{ stopColor: '#6FCDDD', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#6FCDDD', stopOpacity: 0 }} />
                          </radialGradient>
                        </defs>
                        <circle cx="40" cy="40" r="28" fill="url(#energyGlow)" opacity="0.3" className="animate-pulse" />
                        <circle cx="40" cy="40" r="20" fill="none" stroke="#6FCDDD" strokeWidth="2" opacity="0.6" />
                        <circle cx="40" cy="40" r="14" fill="none" stroke="#E8A55C" strokeWidth="2" opacity="0.8" />
                        <path d="M 40 25 L 35 40 L 45 40 L 40 55 Z" fill="#6FCDDD" style={{ filter: 'drop-shadow(0 0 12px #6FCDDD)' }} />
                        <circle cx="40" cy="40" r="3" fill="#E8A55C" opacity="0.8" />
                      </svg>
                    )}
                    {stat.iconType === 'network' && (
                      <svg width="80" height="80" viewBox="0 0 80 80" className="transition-all duration-500">
                        <defs>
                          <linearGradient id="netGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: '#6FCDDD' }} />
                            <stop offset="100%" style={{ stopColor: '#E8A55C' }} />
                          </linearGradient>
                        </defs>
                        <circle cx="40" cy="20" r="5" fill="#6FCDDD" style={{ filter: 'drop-shadow(0 0 6px #6FCDDD)' }} />
                        <circle cx="20" cy="40" r="5" fill="#6FCDDD" style={{ filter: 'drop-shadow(0 0 6px #6FCDDD)' }} />
                        <circle cx="60" cy="40" r="5" fill="#6FCDDD" style={{ filter: 'drop-shadow(0 0 6px #6FCDDD)' }} />
                        <circle cx="30" cy="60" r="5" fill="#E8A55C" style={{ filter: 'drop-shadow(0 0 6px #E8A55C)' }} />
                        <circle cx="50" cy="60" r="5" fill="#E8A55C" style={{ filter: 'drop-shadow(0 0 6px #E8A55C)' }} />
                        <line x1="40" y1="20" x2="20" y2="40" stroke="url(#netGrad)" strokeWidth="1.5" opacity="0.6" />
                        <line x1="40" y1="20" x2="60" y2="40" stroke="url(#netGrad)" strokeWidth="1.5" opacity="0.6" />
                        <line x1="20" y1="40" x2="30" y2="60" stroke="url(#netGrad)" strokeWidth="1.5" opacity="0.6" />
                        <line x1="60" y1="40" x2="50" y2="60" stroke="url(#netGrad)" strokeWidth="1.5" opacity="0.6" />
                        <line x1="30" y1="60" x2="50" y2="60" stroke="url(#netGrad)" strokeWidth="1.5" opacity="0.6" />
                        <circle cx="40" cy="40" r="25" fill="none" stroke="#6FCDDD" strokeWidth="1" opacity="0.2" strokeDasharray="4 4" />
                      </svg>
                    )}
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
            <div className="text-center relative z-[100]" style={{ transformStyle: 'preserve-3d', transform: 'translateZ(85px)' }}>
              <div className="max-w-2xl mx-auto mb-9 relative z-[100]">
                <Link 
                  href="/auth/signup"
                  className="cyberpunk-button inline-block relative z-[100] cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                >
                  GET STARTED
                </Link>
              </div>
              
              <div className="flex gap-9 justify-center flex-wrap relative z-[100]">
                <Link 
                  href="/auth/signup"
                  className="font-rajdhani text-lg text-data-cyan uppercase tracking-[0.12em] font-semibold relative group cursor-pointer z-[100]"
                  style={{ pointerEvents: 'auto' }}
                >
                  Sign Up
                  <span className="absolute bottom-[-5px] left-0 w-0 h-[2px] bg-archive-amber group-hover:w-full transition-all duration-400 pointer-events-none"
                    style={{ boxShadow: '0 0 12px #E8A55C' }}
                  />
                </Link>
                <Link 
                  href="/auth/login"
                  className="font-rajdhani text-lg text-data-cyan uppercase tracking-[0.12em] font-semibold relative group cursor-pointer z-[100]"
                  style={{ pointerEvents: 'auto' }}
                >
                  Sign In
                  <span className="absolute bottom-[-5px] left-0 w-0 h-[2px] bg-archive-amber group-hover:w-full transition-all duration-400 pointer-events-none"
                    style={{ boxShadow: '0 0 12px #E8A55C' }}
                  />
                </Link>
                <Link 
                  href="/dashboard"
                  className="font-rajdhani text-lg text-data-cyan uppercase tracking-[0.12em] font-semibold relative group cursor-pointer z-[100]"
                  style={{ pointerEvents: 'auto' }}
                >
                  View Demo
                  <span className="absolute bottom-[-5px] left-0 w-0 h-[2px] bg-archive-amber group-hover:w-full transition-all duration-400 pointer-events-none"
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
