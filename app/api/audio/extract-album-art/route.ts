import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase/admin';
import { parseBuffer } from 'music-metadata';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Extract embedded album art from audio files
 */
export async function POST(request: NextRequest) {
  try {
    const { assetId, userId } = await request.json();

    if (!assetId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('🎵 [ALBUM ART] Extracting for asset:', assetId);

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

    // Only for audio files
    if (asset.type !== 'audio') {
      return NextResponse.json(
        { error: 'Album art extraction is only for audio files' },
        { status: 400 }
      );
    }

    // Check if already has thumbnail
    if (asset.thumbnailUrl) {
      console.log('✅ [ALBUM ART] Asset already has thumbnail, skipping');
      return NextResponse.json(
        { message: 'Asset already has a thumbnail', thumbnailUrl: asset.thumbnailUrl },
        { status: 200 }
      );
    }

    console.log('📥 [ALBUM ART] Downloading audio file...');

    // Download audio file from Firebase Storage
    const bucket = adminStorage().bucket();
    const audioFile = bucket.file(asset.storagePath || asset.url);
    
    const [audioBuffer] = await audioFile.download();

    console.log('🔍 [ALBUM ART] Parsing metadata...');

    // Parse audio metadata
    const metadata = await parseBuffer(audioBuffer, asset.mimeType);

    // Check if album art exists
    if (!metadata.common.picture || metadata.common.picture.length === 0) {
      console.log('⚠️ [ALBUM ART] No embedded album art found');
      return NextResponse.json(
        { message: 'No embedded album art found' },
        { status: 200 }
      );
    }

    const picture = metadata.common.picture[0];
    console.log('🖼️ [ALBUM ART] Found embedded art:', {
      format: picture.format,
      size: picture.data.length,
    });

    // Upload album art to Firebase Storage
    const albumArtPath = `users/${userId}/album-art/${assetId}_album.${picture.format?.split('/')[1] || 'jpg'}`;
    const albumArtFile = bucket.file(albumArtPath);

    await albumArtFile.save(picture.data, {
      metadata: {
        contentType: picture.format || 'image/jpeg',
        metadata: {
          extractedFrom: assetId,
          originalFormat: picture.format,
          description: picture.description || 'Embedded album art',
        },
      },
    });

    // Make it public
    await albumArtFile.makePublic();

    // Get public URL
    const albumArtUrl = `https://storage.googleapis.com/${bucket.name}/${albumArtPath}`;

    console.log('✅ [ALBUM ART] Uploaded to:', albumArtUrl);

    // Update asset with album art URL
    await assetRef.update({
      thumbnailUrl: albumArtUrl,
      albumArt: {
        url: albumArtUrl,
        extractedAt: new Date(),
        format: picture.format,
        description: picture.description,
      },
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      thumbnailUrl: albumArtUrl,
      extracted: true,
    });
  } catch (error: any) {
    console.error('❌ [ALBUM ART] Extraction error:', error);
    return NextResponse.json(
      { error: error.message || 'Album art extraction failed' },
      { status: 500 }
    );
  }
}
