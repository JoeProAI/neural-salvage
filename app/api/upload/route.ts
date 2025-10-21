import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const visibility = (formData.get('visibility') as string) || 'private';

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'File and userId are required' },
        { status: 400 }
      );
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 100MB limit' },
        { status: 400 }
      );
    }

    // Determine media type
    const mimeType = file.type;
    let mediaType: 'image' | 'video' | 'audio' | 'document';
    
    if (mimeType.startsWith('image/')) {
      mediaType = 'image';
    } else if (mimeType.startsWith('video/')) {
      mediaType = 'video';
    } else if (mimeType.startsWith('audio/')) {
      mediaType = 'audio';
    } else {
      mediaType = 'document';
    }

    // Create asset document in Firestore first
    const assetRef = adminDb().collection('assets').doc();
    const assetId = assetRef.id;

    // Generate storage path
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `users/${userId}/assets/${assetId}/${timestamp}_${sanitizedFilename}`;

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Firebase Storage
    const bucket = adminStorage().bucket();
    const fileRef = bucket.file(storagePath);
    
    await fileRef.save(buffer, {
      metadata: {
        contentType: mimeType,
        metadata: {
          userId,
          assetId,
          originalFilename: file.name,
        },
      },
    });

    // Make file publicly readable (or use signed URLs for private)
    if (visibility === 'public') {
      await fileRef.makePublic();
    }

    // Get download URL
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // Far future date
    });

    // Get image dimensions if it's an image
    let dimensions;
    if (mediaType === 'image') {
      try {
        const sharp = require('sharp');
        const metadata = await sharp(buffer).metadata();
        dimensions = {
          width: metadata.width || 0,
          height: metadata.height || 0,
        };
      } catch (error) {
        console.error('Error getting image dimensions:', error);
      }
    }

    // Create asset document
    const assetData = {
      userId,
      filename: sanitizedFilename,
      originalFilename: file.name,
      type: mediaType,
      mimeType,
      size: file.size,
      url,
      dimensions,
      uploadedAt: new Date(),
      updatedAt: new Date(),
      collectionIds: [],
      visibility,
      forSale: false,
      sold: false,
      metadata: {},
    };

    await assetRef.set(assetData);

    // Create AI job for analysis
    const jobRef = adminDb().collection('jobs').doc();
    await jobRef.set({
      userId,
      assetId,
      type: mediaType === 'image' ? 'analyze_image' : 
            mediaType === 'video' ? 'analyze_video' : 
            mediaType === 'audio' ? 'transcribe_audio' : 'analyze_image',
      status: 'pending',
      progress: 0,
      retryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      asset: {
        id: assetId,
        ...assetData,
      },
      jobId: jobRef.id,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};