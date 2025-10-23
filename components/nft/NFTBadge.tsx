'use client';

/**
 * NFT Badge Component
 * Displays on assets that have been minted as NFTs
 */

import { Shield, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface NFTBadgeProps {
  nftId: string;
  blockchain: 'arweave' | 'ethereum' | 'polygon' | 'solana';
  arweaveUrl?: string;
  small?: boolean;
}

const blockchainInfo = {
  arweave: {
    name: 'Arweave',
    color: 'from-purple-500 to-pink-500',
    icon: '◈',
  },
  ethereum: {
    name: 'Ethereum',
    color: 'from-blue-500 to-purple-500',
    icon: 'Ξ',
  },
  polygon: {
    name: 'Polygon',
    color: 'from-purple-500 to-indigo-500',
    icon: '⬡',
  },
  solana: {
    name: 'Solana',
    color: 'from-green-500 to-teal-500',
    icon: '◉',
  },
};

export function NFTBadge({ nftId, blockchain, arweaveUrl, small = false }: NFTBadgeProps) {
  const info = blockchainInfo[blockchain];

  if (small) {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r ${info.color} text-white text-xs font-semibold`}
        title={`Minted on ${info.name}`}
      >
        <Shield className="w-3 h-3" />
        <span>NFT</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r ${info.color} text-white shadow-lg`}>
      <Shield className="w-5 h-5" />
      <div className="flex flex-col">
        <span className="text-xs font-medium opacity-90">Real NFT on</span>
        <span className="text-sm font-bold">{info.name}</span>
      </div>
      {arweaveUrl && (
        <a
          href={arweaveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 hover:scale-110 transition-transform"
          title="View on Arweave"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}
