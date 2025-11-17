import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase/admin';
import { generateCoverArt, downloadImage } from '@/lib/ai/coverArtGenerator';

export async function POST(request: NextRequest) {
  try {
    const { assetId, userId } = await request.json();

    if (!assetId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get asset from Firestore
    const assetRef = adminDb().collection('assets').doc(assetId);
    const assetDoc = await assetRef.get();

    if (!assetDoc.exists) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    const asset = assetDoc.data();

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset data not found' },
        { status: 404 }
      );
    }

    // Check if user owns the asset
    if (asset.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Only generate for audio and documents
    if (asset.type !== 'audio' && asset.type !== 'document') {
      return NextResponse.json(
        { error: 'Cover art is only generated for audio and document files' },
        { status: 400 }
      );
    }

    // Check if already has thumbnail or embedded album art
    if (asset.thumbnailUrl) {
      console.log('✅ [COVER ART] Asset already has thumbnail/album art, skipping generation');
      return NextResponse.json(
        { message: 'Asset already has a thumbnail', thumbnailUrl: asset.thumbnailUrl },
        { status: 200 }
      );
    }

    console.log('🎨 [COVER ART] No existing cover, generating for asset:', assetId);

    // Generate cover art with AI
    const { imageUrl, prompt } = await generateCoverArt({
      title: asset.title || asset.filename || 'Untitled',
      type: asset.type,
      aiAnalysis: asset.aiAnalysis,
    });

    console.log('📥 [COVER ART] Downloading generated image...');

    // Download the image
    const imageBuffer = await downloadImage(imageUrl);

    // Upload to Firebase Storage
    const bucket = adminStorage().bucket();
    const coverPath = `users/${userId}/covers/${assetId}_cover.jpg`;
    const file = bucket.file(coverPath);

    await file.save(imageBuffer, {
      metadata: {
        contentType: 'image/jpeg',
        metadata: {
          generatedBy: 'ai-cover-generator',
          originalPrompt: prompt,
          assetId,
        },
      },
    });

    // Make it public
    await file.makePublic();

    // Get public URL
    const coverUrl = `https://storage.googleapis.com/${bucket.name}/${coverPath}`;

    console.log('✅ [COVER ART] Uploaded to:', coverUrl);

    // Update asset with cover URL
    await assetRef.update({
      thumbnailUrl: coverUrl,
      coverArt: {
        url: coverUrl,
        generatedAt: new Date(),
        prompt,
        generator: 'dall-e-3',
      },
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      thumbnailUrl: coverUrl,
      prompt,
    });
  } catch (error: any) {
    console.error('Cover art generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Cover art generation failed' },
      { status: 500 }
    );
  }
}
