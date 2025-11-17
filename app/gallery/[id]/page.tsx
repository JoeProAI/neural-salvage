'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { MediaAsset, Collection } from '@/types';
import Link from 'next/link';
import { MintNFTModalHybrid } from '@/components/nft/MintNFTModalHybrid';

export default function AssetDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const assetId = params.id as string;
  
  const [asset, setAsset] = useState<MediaAsset | null>(null);
  const [loadingAsset, setLoadingAsset] = useState(true);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newTags, setNewTags] = useState('');
  const [forSale, setForSale] = useState(false);
  const [price, setPrice] = useState('');
  const [showMintModal, setShowMintModal] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [nftData, setNftData] = useState<any>(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (assetId) {
      loadAsset();
    }
  }, [assetId]);

  // Check for payment success and auto-trigger actions
  useEffect(() => {
    const payment = searchParams.get('payment');
    const action = searchParams.get('action');

    if (payment === 'success' && asset && user) {
      console.log('✅ [GALLERY] Payment success detected, action:', action);
      
      if (action === 'analyze') {
        // Auto-trigger AI analysis BEFORE cleaning URL
        console.log('🤖 [GALLERY] Triggering AI analysis...');
        triggerAIAnalysis().then(() => {
          console.log('✅ [GALLERY] AI analysis complete, cleaning URL');
          // Clean up URL after analysis completes
          router.replace(`/gallery/${assetId}`);
        }).catch((error) => {
          console.error('❌ [GALLERY] AI analysis failed:', error);
          // Clean up URL even on error
          router.replace(`/gallery/${assetId}`);
        });
      } else if (action === 'mint') {
        // Auto-open NFT mint modal (payment already complete, will auto-mint)
        setShowMintModal(true);
        console.log('✅ [GALLERY] Payment successful - opening mint modal to complete NFT');
        // Clean up URL
        router.replace(`/gallery/${assetId}`);
      } else {
        // Clean up URL for other cases
        router.replace(`/gallery/${assetId}`);
      }
    }
  }, [searchParams, asset, user, assetId]);

  const loadAsset = async () => {
    try {
      const assetDoc = await getDoc(doc(db, 'assets', assetId));
      
      if (assetDoc.exists()) {
        const assetData = { id: assetDoc.id, ...assetDoc.data() } as MediaAsset;
        
        console.log('🔍 [GALLERY] Loading asset:', {
          id: assetData.id,
          filename: assetData.filename,
          type: assetData.type,
          hasAiAnalysis: !!assetData.aiAnalysis,
          aiAnalysis: assetData.aiAnalysis
        });
        
        setAsset(assetData);
        setTitle(assetData.title || assetData.filename);
        // For audio files, check transcript field; for others use caption
        const aiDescription = assetData.description || 
                            assetData.aiAnalysis?.caption || 
                            assetData.aiAnalysis?.transcript || '';
        
        console.log('📝 [GALLERY] Setting description:', {
          fromDatabase: assetData.description,
          fromCaption: assetData.aiAnalysis?.caption,
          fromTranscript: assetData.aiAnalysis?.transcript,
          final: aiDescription
        });
        
        setDescription(aiDescription);
        setForSale(assetData.forSale);
        setPrice(assetData.price?.toString() || '');
        const tagsString = assetData.aiAnalysis?.tags?.join(', ') || '';
        console.log('🏷️ [GALLERY] Setting tags:', assetData.aiAnalysis?.tags, '→', tagsString);
        setNewTags(tagsString);
        
        // Load NFT data if asset is minted
        if (assetData.isNFT && assetData.nftId) {
          try {
            const response = await fetch(`/api/nft/${assetData.nftId}`);
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.nft) {
                setNftData(data.nft);
                console.log('NFT data loaded:', data.nft);
              }
            }
          } catch (nftError) {
            console.error('Error loading NFT data:', nftError);
          }
        }
      } else {
        alert('Asset not found');
        router.push('/gallery');
      }
    } catch (error) {
      console.error('Error loading asset:', error);
    } finally {
      setLoadingAsset(false);
    }
  };

  const handleSave = async () => {
    if (!asset) return;

    try {
      const tags = newTags.split(',').map((t) => t.trim()).filter(Boolean);
      
      await updateDoc(doc(db, 'assets', assetId), {
        title,
        description,
        'aiAnalysis.tags': tags,
        forSale,
        price: forSale ? parseFloat(price) : null,
        updatedAt: new Date(),
      });

      setEditing(false);
      loadAsset();
      alert('Asset updated successfully!');
    } catch (error) {
      console.error('Error updating asset:', error);
      alert('Failed to update asset');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      await deleteDoc(doc(db, 'assets', assetId));
      router.push('/gallery');
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Failed to delete asset');
    }
  };

  // Trigger AI analysis after payment (no payment check needed)
  const triggerAIAnalysis = async () => {
    if (!asset || !user) return;

    try {
      setGeneratingAI(true);

      // Call AI analysis API directly (payment already completed)
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: asset.id,
          userId: user.id,
          imageUrl: asset.url,
          type: asset.type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'AI generation failed');
      }

      // Update local state with AI results
      const aiAnalysis = data.analysis;
      
      // For audio, use transcript as the description
      const aiDescription = aiAnalysis.caption || aiAnalysis.transcript || '';
      
      // Generate smart title from description (first sentence or first 50 chars)
      let smartTitle = title;
      if (aiDescription && (!title || title === asset.filename)) {
        const firstSentence = aiDescription.split('.')[0];
        smartTitle = firstSentence.length > 50 
          ? firstSentence.substring(0, 47) + '...'
          : firstSentence;
      }
      
      setTitle(smartTitle);
      setDescription(aiDescription);
      setNewTags(aiAnalysis.tags?.join(', ') || newTags);
      
      console.log('✅ [GALLERY] Updated UI with:', {
        title: smartTitle,
        description: aiDescription,
        tags: aiAnalysis.tags
      });

      await loadAsset();

      alert('✨ AI analysis complete! Your payment was processed successfully.');
    } catch (error: any) {
      console.error('AI generation error:', error);
      alert(`AI generation failed: ${error.message}`);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!asset || !user) return;

    try {
      setGeneratingAI(true);

      // Determine price based on file size (for audio files)
      let price = 1.99; // Default: $1.99 (images, videos < 25MB)
      
      if (asset.type === 'audio') {
        // Get file size for tiered pricing
        try {
          const headResponse = await fetch(asset.url, { method: 'HEAD' });
          const fileSize = parseInt(headResponse.headers.get('content-length') || '0');
          const sizeMB = fileSize / (1024 * 1024);
          
          if (sizeMB > 100) {
            price = 5.99; // $5.99 for very large files (100+ MB)
          } else if (sizeMB > 25) {
            price = 3.99; // $3.99 for large files (25-100 MB, uses Deepgram)
          }
          // else: $1.99 for small files (< 25 MB, uses Whisper)
        } catch (e) {
          console.warn('Could not determine file size, using default price');
        }
      }

      // Check if payment is required
      const paymentResponse = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ai_analysis',
          assetId: asset.id,
          userId: user.id,
          price,
        }),
      });

      const paymentData = await paymentResponse.json();

      // Beta users, Pro users, and already-paid users get free AI
      if (paymentData.isBetaUser || paymentData.isPro || paymentData.freeMintUsed) {
        // Proceed directly to AI analysis
        const response = await fetch('/api/ai/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assetId: asset.id,
            userId: user.id,
            imageUrl: asset.url,
            type: asset.type,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'AI generation failed');
        }

        // Update local state with AI results
        const aiAnalysis = data.analysis;
        
        // Generate smart title from caption (first sentence or first 50 chars)
        let smartTitle = title;
        if (aiAnalysis.caption && (!title || title === asset.filename)) {
          const firstSentence = aiAnalysis.caption.split('.')[0];
          smartTitle = firstSentence.length > 50 
            ? firstSentence.substring(0, 47) + '...'
            : firstSentence;
        }
        
        setTitle(smartTitle);
        setDescription(aiAnalysis.caption || description);
        setNewTags(aiAnalysis.tags?.join(', ') || newTags);

        await loadAsset();

        const message = paymentData.isBetaUser 
          ? '✨ AI analysis complete! (Beta user - free)' 
          : paymentData.isPro
          ? '✨ AI analysis complete! (Pro plan - included)'
          : '✨ AI analysis re-generated! (Already paid)';
        alert(message);
      } else if (paymentData.checkoutUrl) {
        // Redirect to payment
        window.location.href = paymentData.checkoutUrl;
      } else {
        throw new Error('Payment setup failed');
      }
    } catch (error: any) {
      console.error('AI generation error:', error);
      alert(`AI generation failed: ${error.message}`);
    } finally {
      setGeneratingAI(false);
    }
  };

  if (loading || loadingAsset || !asset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-salvage-dark">
        <div className="text-neon-cyan text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  const handleGenerateCover = async () => {
    if (!asset || !user || generatingCover) return;
    
    // Check if valid type for cover generation
    if (asset.type !== 'audio' && asset.type !== 'document') {
      alert('Cover art can only be generated for audio tracks and documents');
      return;
    }
    
    try {
      setGeneratingCover(true);
      
      const response = await fetch('/api/ai/generate-cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: asset.id,
          userId: user.id,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Cover art generation failed');
      }
      
      alert('🎨 Cover art generated successfully!');
      await loadAsset(); // Reload to show new cover
      
    } catch (error: any) {
      console.error('Cover art generation error:', error);
      alert(error.message || 'Failed to generate cover art');
    } finally {
      setGeneratingCover(false);
    }
  };

  return (
    <div className="min-h-screen bg-salvage-dark">
      {/* Header */}
      <header className="border-b border-salvage-glow bg-salvage-metal sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold neon-text">NEURAL SALVAGE</h1>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/gallery">
                <Button variant="ghost">← Back to Gallery</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Media Display */}
          <div className="metal-card p-4 rounded-lg">
            {asset.type === 'image' ? (
              <img
                src={asset.url}
                alt={asset.filename}
                className="w-full h-auto rounded"
              />
            ) : asset.type === 'video' ? (
              <video
                src={asset.url}
                controls
                className="w-full h-auto rounded"
              />
            ) : asset.type === 'audio' ? (
              <div className="relative aspect-square flex flex-col items-center justify-center bg-salvage-rust rounded overflow-hidden">
                {/* Cover Art or Fallback */}
                {asset.thumbnailUrl || asset.coverArt?.url ? (
                  <img 
                    src={asset.thumbnailUrl || asset.coverArt?.url} 
                    alt={`${asset.filename} cover art`}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Failed to load cover art:', asset.thumbnailUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-8xl mb-4">🎵</div>
                )}
                {/* Audio Player Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4">
                  <audio src={asset.url} controls className="w-full" />
                </div>
              </div>
            ) : asset.type === 'document' ? (
              <div className="relative aspect-square flex items-center justify-center bg-salvage-rust rounded overflow-hidden">
                {/* Cover Art or Fallback */}
                {asset.thumbnailUrl || asset.coverArt?.url ? (
                  <img 
                    src={asset.thumbnailUrl || asset.coverArt?.url} 
                    alt={`${asset.filename} cover`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Failed to load cover art:', asset.thumbnailUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-8xl">📄</div>
                )}
              </div>
            ) : (
              <div className="aspect-square flex items-center justify-center bg-salvage-rust rounded">
                <div className="text-8xl">📄</div>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="space-y-6">
            <div className="metal-card p-6 rounded-lg">
              {/* Title */}
              <div className="mb-6">
                {editing ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-2xl font-bold bg-salvage-rust border-2 border-salvage-glow rounded px-4 py-2 text-white focus:border-retro-teal focus:outline-none"
                    placeholder="Asset title"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-white">
                    {title || asset.filename}
                  </h2>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-retro-teal mb-2">Description</h3>
                {editing ? (
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-salvage-rust border-2 border-salvage-glow rounded px-4 py-2 text-white focus:border-retro-teal focus:outline-none resize-none"
                    placeholder="Describe this asset..."
                  />
                ) : description ? (
                  <p className="text-gray-300">{description}</p>
                ) : (
                  <p className="text-gray-500 italic">No description yet</p>
                )}
              </div>

              {/* AI Analysis */}
              {asset.aiAnalysis && (
                <div className="space-y-4 mb-6">
                  {asset.aiAnalysis.caption && (
                    <div>
                      <h3 className="text-sm font-bold text-neon-cyan mb-2">
                        AI Caption
                      </h3>
                      <p className="text-gray-300">{asset.aiAnalysis.caption}</p>
                    </div>
                  )}

                  {asset.aiAnalysis.tags && asset.aiAnalysis.tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-neon-cyan mb-2">
                        Tags
                      </h3>
                      {editing ? (
                        <input
                          type="text"
                          value={newTags}
                          onChange={(e) => setNewTags(e.target.value)}
                          className="w-full px-4 py-2 bg-salvage-rust border border-salvage-glow rounded focus:border-neon-cyan focus:outline-none text-white"
                          placeholder="tag1, tag2, tag3"
                        />
                      ) : (
                        <div className="flex gap-2 flex-wrap">
                          {asset.aiAnalysis.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="bg-neon-cyan/20 text-neon-cyan px-3 py-1 rounded text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {asset.aiAnalysis.colors && asset.aiAnalysis.colors.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-neon-cyan mb-2">
                        Color Palette
                      </h3>
                      <div className="flex gap-2">
                        {asset.aiAnalysis.colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-12 h-12 rounded border-2 border-white/20"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {asset.aiAnalysis.ocr && (
                    <div>
                      <h3 className="text-sm font-bold text-neon-cyan mb-2">
                        Extracted Text
                      </h3>
                      <p className="text-gray-300 text-sm bg-salvage-rust p-3 rounded">
                        {asset.aiAnalysis.ocr}
                      </p>
                    </div>
                  )}

                  {asset.aiAnalysis.transcript && (
                    <div>
                      <h3 className="text-sm font-bold text-neon-cyan mb-2">
                        Transcript
                      </h3>
                      <p className="text-gray-300 text-sm bg-salvage-rust p-3 rounded max-h-40 overflow-y-auto">
                        {asset.aiAnalysis.transcript}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* File Info */}
              <div className="border-t border-salvage-glow pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Type</span>
                  <span className="text-white">{asset.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Size</span>
                  <span className="text-white">
                    {(asset.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                {asset.dimensions && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Dimensions</span>
                    <span className="text-white">
                      {asset.dimensions.width} × {asset.dimensions.height}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Uploaded</span>
                  <span className="text-white">
                    {asset.uploadedAt 
                      ? (() => {
                          try {
                            const timestamp = asset.uploadedAt as any;
                            const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
                            return date.toLocaleDateString();
                          } catch {
                            return 'Unknown';
                          }
                        })()
                      : 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Marketplace Settings */}
              {editing && (
                <div className="border-t border-salvage-glow pt-4 mt-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={forSale}
                      onChange={(e) => setForSale(e.target.checked)}
                      className="w-5 h-5"
                    />
                    <label className="text-white">List for sale</label>
                  </div>

                  {forSale && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Price (USD)
                      </label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-2 bg-salvage-rust border border-salvage-glow rounded focus:border-neon-cyan focus:outline-none text-white"
                        placeholder="29.99"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-salvage-glow pt-4 mt-4 space-y-2">
                {!editing ? (
                  <>
                    {!asset.isNFT && (
                      <Button
                        variant="neon"
                        className="w-full bg-gradient-to-r from-retro-purple to-retro-teal hover:opacity-90 text-white font-bold"
                        onClick={() => setShowMintModal(true)}
                      >
                        ⛓️ Mint as NFT on Arweave
                      </Button>
                    )}
                    {asset.isNFT && (
                      <div className="space-y-3">
                        <div className="w-full bg-retro-purple/20 border-2 border-retro-purple text-retro-purple px-4 py-3 rounded-lg text-center font-bold">
                          ✅ Minted as NFT on Arweave
                        </div>
                        
                        {/* Blockchain Confirmation Notice */}
                        <div className="bg-archive-amber/10 border-2 border-archive-amber/50 rounded-lg p-3">
                          <p className="text-archive-amber text-xs font-rajdhani font-bold uppercase tracking-wider mb-1">
                            ⏱️ Blockchain Confirmation
                          </p>
                          <p className="text-ash-gray text-xs font-rajdhani leading-relaxed">
                            NFT transactions can take <strong className="text-pure-white">up to 20 minutes</strong> to fully confirm on the Arweave blockchain. 
                            Your NFT is permanent and secure - just be patient!
                          </p>
                        </div>
                        
                        {nftData ? (
                          <>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant="neon"
                                className="w-full bg-gradient-to-r from-neon-cyan to-retro-purple hover:opacity-90 text-white font-bold"
                                onClick={() => window.open(nftData.metadata?.image || `https://arweave.net/${nftData.arweave?.manifestId}`, '_blank')}
                                disabled={!nftData.metadata?.image && !nftData.arweave?.manifestId}
                              >
                                🖼️ View Image
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
                                onClick={() => window.open(`https://viewblock.io/arweave/tx/${nftData.arweave?.manifestId}`, '_blank')}
                                disabled={!nftData.arweave?.manifestId}
                              >
                                🔍 Transaction
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {nftData.metadataUri && (
                                <Button
                                  variant="ghost"
                                  className="w-full text-sm text-gray-400 hover:text-white"
                                  onClick={() => window.open(nftData.metadataUri, '_blank')}
                                >
                                  📄 Metadata
                                </Button>
                              )}
                              {nftData.arweave?.arweaveUrl && (
                                <Button
                                  variant="ghost"
                                  className="w-full text-sm text-gray-400 hover:text-white"
                                  onClick={() => window.open(nftData.arweave.arweaveUrl, '_blank')}
                                >
                                  📦 Manifest
                                </Button>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 text-center">
                              NFT ID: {asset.nftId}
                            </div>
                          </>
                        ) : (
                          <div className="space-y-2">
                            <div className="w-full text-center text-gray-400 text-sm py-2">
                              Loading NFT details...
                            </div>
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => loadAsset()}
                            >
                              🔄 Retry Loading
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    <Button
                      className="w-full bg-retro-orange hover:bg-retro-orange/90 text-white font-semibold"
                      onClick={handleGenerateAI}
                      disabled={generatingAI}
                    >
                      {generatingAI ? '🤖 Generating...' : '✨ Generate AI Description & Tags'}
                    </Button>
                    
                    {/* Generate Cover Art Button - for audio and documents */}
                    {(asset.type === 'audio' || asset.type === 'document') && (
                      <Button
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
                        onClick={handleGenerateCover}
                        disabled={generatingCover}
                      >
                        {generatingCover ? '🎨 Generating Cover...' : '🎨 Generate Edgy AI Cover Art'}
                      </Button>
                    )}
                    
                    <Button
                      className="w-full bg-gradient-to-r from-data-cyan to-quantum-blue hover:opacity-90 text-white font-semibold"
                      onClick={async () => {
                        setShowCollectionModal(true);
                        setLoadingCollections(true);
                        try {
                          const collectionsQuery = query(
                            collection(db, 'collections'),
                            where('userId', '==', user!.id)
                          );
                          const snapshot = await getDocs(collectionsQuery);
                          const collsData = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data(),
                          })) as Collection[];
                          setCollections(collsData);
                        } catch (error) {
                          console.error('Error loading collections:', error);
                        } finally {
                          setLoadingCollections(false);
                        }
                      }}
                    >
                      📁 Add to Collection
                    </Button>
                    
                    <Button
                      variant="neon"
                      className="w-full"
                      onClick={() => setEditing(true)}
                    >
                      ✏️ Edit Asset
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        // Use Arweave URL if NFT is minted, otherwise Firebase
                        const downloadUrl = asset.isNFT && nftData?.metadata?.image 
                          ? nftData.metadata.image 
                          : asset.url;
                        window.open(downloadUrl, '_blank');
                      }}
                    >
                      {asset.isNFT ? '⬇️ Download from Blockchain' : 'Download'}
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleDelete}
                    >
                      Delete
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="neon"
                      className="w-full"
                      onClick={handleSave}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setEditing(false);
                        setTitle(asset.title || asset.filename);
                        setDescription(asset.description || asset.aiAnalysis?.caption || '');
                        setNewTags(asset.aiAnalysis?.tags?.join(', ') || '');
                        setForSale(asset.forSale);
                        setPrice(asset.price?.toString() || '');
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add to Collection Modal */}
      {showCollectionModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="metal-card p-8 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              Add to Collection
            </h2>

            {loadingCollections ? (
              <div className="text-center py-8 text-gray-400">
                Loading collections...
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">
                  You haven't created any collections yet
                </p>
                <Link href="/collections">
                  <Button variant="neon">Create Collection</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2 mb-6">
                {collections.map((coll) => {
                  const isInCollection = coll.assetIds.includes(assetId);
                  return (
                    <button
                      key={coll.id}
                      onClick={async () => {
                        try {
                          if (isInCollection) {
                            // Remove from collection
                            const updatedAssetIds = coll.assetIds.filter(id => id !== assetId);
                            await updateDoc(doc(db, 'collections', coll.id), {
                              assetIds: updatedAssetIds,
                              updatedAt: new Date(),
                            });
                          } else {
                            // Add to collection
                            await updateDoc(doc(db, 'collections', coll.id), {
                              assetIds: arrayUnion(assetId),
                              updatedAt: new Date(),
                            });
                          }
                          
                          // Reload collections to update UI
                          const collectionsQuery = query(
                            collection(db, 'collections'),
                            where('userId', '==', user!.id)
                          );
                          const snapshot = await getDocs(collectionsQuery);
                          const collsData = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data(),
                          })) as Collection[];
                          setCollections(collsData);
                        } catch (error) {
                          console.error('Error updating collection:', error);
                          alert('Failed to update collection');
                        }
                      }}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        isInCollection
                          ? 'bg-terminal-green/10 border-terminal-green text-terminal-green'
                          : 'bg-salvage-rust border-salvage-glow text-white hover:border-neon-cyan'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-bold">{coll.name}</div>
                          <div className="text-xs opacity-70">
                            {coll.assetIds.length} items
                          </div>
                        </div>
                        {isInCollection && (
                          <div className="text-2xl">✓</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => setShowCollectionModal(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Mint NFT Modal */}
      {showMintModal && asset && (
        <MintNFTModalHybrid
          assetId={asset.id}
          assetName={asset.title || asset.filename}
          assetDescription={asset.description || ''}
          assetType={asset.type}
          onClose={() => {
            setShowMintModal(false);
            loadAsset(); // Reload to show updated NFT status
          }}
          aiAnalysis={asset.aiAnalysis}
        />
      )}
    </div>
  );
}