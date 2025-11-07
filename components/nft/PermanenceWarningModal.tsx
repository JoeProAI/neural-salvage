'use client';

import { useState } from 'react';
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
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-gradient-to-br from-deep-space/98 via-void-black to-deep-space/98 border-2 border-archive-amber rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-[0_0_80px_rgba(232,165,92,0.3)]">
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 text-ash-gray hover:text-archive-amber transition-colors p-2 hover:bg-archive-amber/10 rounded-lg"
        >
          <X size={28} />
        </button>

        <div className="space-y-6">
          {/* Warning Icon */}
          <div className="flex items-center justify-center">
            <div className="bg-archive-amber/20 border-2 border-archive-amber rounded-full p-4 animate-pulse" style={{ boxShadow: '0 0 30px rgba(232, 165, 92, 0.4)' }}>
              <svg
                className="w-16 h-16 text-archive-amber"
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
            <h2 className="text-3xl font-space-mono font-bold text-archive-amber mb-3 uppercase tracking-wider" style={{ textShadow: '0 0 25px #E8A55C' }}>
              ⚠️ PERMANENT BLOCKCHAIN MINTING
            </h2>
            <p className="text-ash-gray text-base font-rajdhani uppercase tracking-wider">
              Read carefully before proceeding
            </p>
          </div>

          {/* Warning Content */}
          <div className="bg-archive-amber/5 border-2 border-archive-amber/40 rounded-lg p-6 space-y-5">
            <div className="space-y-2">
              <h3 className="text-lg font-space-mono font-bold text-archive-amber uppercase tracking-wider">
                🔒 This Action is IRREVERSIBLE
              </h3>
              <p className="text-pure-white text-sm font-rajdhani leading-relaxed">
                Once your NFT is minted on the Arweave blockchain, it will be stored{' '}
                <span className="text-data-cyan font-bold">permanently</span> across
                200,000+ nodes worldwide for <span className="text-data-cyan font-bold">200+ years</span>.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-space-mono font-bold text-archive-amber uppercase tracking-wider">
                🚫 You CANNOT Delete It
              </h3>
              <p className="text-pure-white text-sm font-rajdhani leading-relaxed">
                Unlike regular files, blockchain NFTs cannot be deleted, edited, or removed.
                The image and metadata will exist forever on the permaweb.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-space-mono font-bold text-archive-amber uppercase tracking-wider">
                👁️ It Will Be Public
              </h3>
              <p className="text-pure-white text-sm font-rajdhani leading-relaxed">
                Anyone with the link can view your NFT. While we don't advertise it,
                it's technically accessible to anyone on the internet forever.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-space-mono font-bold text-red-400 uppercase tracking-wider">
                ⛔ Prohibited Content
              </h3>
              <p className="text-pure-white text-sm font-rajdhani leading-relaxed">
                Absolutely NO illegal content:
              </p>
              <ul className="list-disc list-inside text-pure-white text-sm space-y-1 ml-4 font-rajdhani">
                <li>Child sexual abuse material (CSAM)</li>
                <li>Non-consensual intimate imagery (revenge porn)</li>
                <li>Content that violates laws</li>
                <li>Spam or bot-generated junk</li>
              </ul>
              <p className="text-ash-gray text-xs mt-2 font-rajdhani">
                We're chill about art/creative content. Just no illegal stuff or spam.
              </p>
              <p className="text-red-400 text-xs mt-1 font-bold">
                ⚠️ Violators will be banned and reported to authorities.
              </p>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-4 bg-deep-space/60 border-2 border-data-cyan/30 rounded-lg p-5">
            <label className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={understoodPermanence}
                onChange={(e) => setUnderstoodPermanence(e.target.checked)}
                className="mt-1 w-5 h-5 accent-data-cyan cursor-pointer"
              />
              <span className="text-sm text-ash-gray group-hover:text-pure-white transition-colors font-rajdhani">
                I understand this NFT will be <span className="text-data-cyan font-bold">permanently stored</span> on
                the blockchain and cannot be deleted.
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={understoodResponsibility}
                onChange={(e) => setUnderstoodResponsibility(e.target.checked)}
                className="mt-1 w-5 h-5 accent-data-cyan cursor-pointer"
              />
              <span className="text-sm text-ash-gray group-hover:text-pure-white transition-colors font-rajdhani">
                I take full responsibility for the content I'm minting and confirm it does{' '}
                <span className="text-red-400 font-bold">NOT contain prohibited material</span>.
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 accent-data-cyan cursor-pointer"
              />
              <span className="text-sm text-ash-gray group-hover:text-pure-white transition-colors font-rajdhani">
                I agree to the{' '}
                <a href="/terms" target="_blank" className="text-data-cyan hover:text-archive-amber transition-colors hover:underline">
                  Terms of Service
                </a>{' '}
                and understand that violations may result in account termination and legal action.
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 bg-deep-space/80 border-2 border-ash-gray/30 text-ash-gray hover:text-pure-white hover:border-ash-gray/60 font-space-mono font-bold py-4 px-6 rounded-lg transition-all uppercase tracking-wider"
            >
              ❌ Cancel
            </button>
            <button
              onClick={onAccept}
              disabled={!canProceed}
              className={`flex-1 cyberpunk-button py-4 px-6 font-space-mono font-bold uppercase tracking-wider ${!canProceed ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              ✅ I Understand - Proceed to Mint
            </button>
          </div>

          {/* Fine Print */}
          <p className="text-xs text-ash-gray/70 text-center font-rajdhani">
            By proceeding, you acknowledge that Neural Salvage uses AI moderation and
            reserves the right to ban users who violate our policies.
          </p>
        </div>
      </div>
    </div>
  );
}
