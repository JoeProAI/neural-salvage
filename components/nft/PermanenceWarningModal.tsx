'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface PermanenceWarningModalProps {
  onAccept: () => void;
  onCancel: () => void;
}

export function PermanenceWarningModal({ onAccept, onCancel }: PermanenceWarningModalProps) {
  const [agreed, setAgreed] = useState(false);
  const [understoodPermanence, setUnderstoodPermanence] = useState(false);
  const [understoodResponsibility, setUnderstoodResponsibility] = useState(false);

  const canProceed = agreed && understoodPermanence && understoodResponsibility;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-salvage-dark border-2 border-neon-cyan rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>

        <div className="space-y-6">
          {/* Warning Icon */}
          <div className="flex items-center justify-center">
            <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-full p-4">
              <svg
                className="w-16 h-16 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-neon-cyan mb-2">
              ⚠️ PERMANENT BLOCKCHAIN MINTING
            </h2>
            <p className="text-gray-300 text-sm">
              Read carefully before proceeding
            </p>
          </div>

          {/* Warning Content */}
          <div className="bg-salvage-rust/20 border border-yellow-500/50 rounded-lg p-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-yellow-400">
                🔒 This Action is IRREVERSIBLE
              </h3>
              <p className="text-gray-300 text-sm">
                Once your NFT is minted on the Arweave blockchain, it will be stored{' '}
                <span className="text-neon-cyan font-bold">permanently</span> across
                200,000+ nodes worldwide for <span className="text-neon-cyan font-bold">200+ years</span>.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-yellow-400">
                🚫 You CANNOT Delete It
              </h3>
              <p className="text-gray-300 text-sm">
                Unlike regular files, blockchain NFTs cannot be deleted, edited, or removed.
                The image and metadata will exist forever on the permaweb.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-yellow-400">
                👁️ It Will Be Public
              </h3>
              <p className="text-gray-300 text-sm">
                Anyone with the link can view your NFT. While we don't advertise it,
                it's technically accessible to anyone on the internet forever.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-red-400">
                ⛔ Prohibited Content
              </h3>
              <p className="text-gray-300 text-sm">
                Absolutely NO illegal content:
              </p>
              <ul className="list-disc list-inside text-gray-300 text-sm space-y-1 ml-4">
                <li>Child sexual abuse material (CSAM)</li>
                <li>Non-consensual intimate imagery (revenge porn)</li>
                <li>Content that violates laws</li>
                <li>Spam or bot-generated junk</li>
              </ul>
              <p className="text-gray-400 text-xs mt-2">
                We're chill about art/creative content. Just no illegal stuff or spam.
              </p>
              <p className="text-red-400 text-xs mt-1 font-bold">
                ⚠️ Violators will be banned and reported to authorities.
              </p>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 bg-salvage-rust/10 border border-gray-700 rounded-lg p-4">
            <label className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={understoodPermanence}
                onChange={(e) => setUnderstoodPermanence(e.target.checked)}
                className="mt-1 w-5 h-5 accent-neon-cyan"
              />
              <span className="text-sm text-gray-300 group-hover:text-white">
                I understand this NFT will be <span className="text-neon-cyan font-bold">permanently stored</span> on
                the blockchain and cannot be deleted.
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={understoodResponsibility}
                onChange={(e) => setUnderstoodResponsibility(e.target.checked)}
                className="mt-1 w-5 h-5 accent-neon-cyan"
              />
              <span className="text-sm text-gray-300 group-hover:text-white">
                I take full responsibility for the content I'm minting and confirm it does{' '}
                <span className="text-red-400 font-bold">NOT contain prohibited material</span>.
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 accent-neon-cyan"
              />
              <span className="text-sm text-gray-300 group-hover:text-white">
                I agree to the{' '}
                <a href="/terms" target="_blank" className="text-neon-cyan hover:underline">
                  Terms of Service
                </a>{' '}
                and understand that violations may result in account termination and legal action.
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              ❌ Cancel
            </Button>
            <Button
              variant="neon"
              className={`flex-1 ${!canProceed ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={onAccept}
              disabled={!canProceed}
            >
              ✅ I Understand - Proceed to Mint
            </Button>
          </div>

          {/* Fine Print */}
          <p className="text-xs text-gray-500 text-center">
            By proceeding, you acknowledge that Neural Salvage uses AI moderation and
            reserves the right to ban users who violate our policies.
          </p>
        </div>
      </div>
    </div>
  );
}
