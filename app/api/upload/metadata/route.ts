/**
 * Lightweight metadata API for direct Firebase uploads
 * File is already uploaded to Storage - just save metadata to Firestore
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { checkRateLimit } from '@/lib/moderation/rateLimiting';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, filename, url, path, size, type, mimeType } = body;

    if (!userId || !filename || !url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // ANTI-SPAM: Rate limiting (20 uploads per hour)
    const rateLimit = checkRateLimit(userId);
    if (!rateLimit.allowed) {
      const resetDate = new Date(rateLimit.resetAt);
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many uploads. Please wait before uploading again.',
          resetAt: resetDate.toISOString(),
        },
        { status: 429 }
      );
    }

    console.log(`[METADATA] Saving asset metadata for user ${userId}`);

    // Create asset document in Firestore
    const assetRef = adminDb().collection('assets').doc();
    const assetId = assetRef.id;

    const assetData = {
      userId,
      filename,
      originalFilename: filename,
      type,
      mimeType,
      size,
      url,
      storagePath: path,
      uploadedAt: new Date(),
      updatedAt: new Date(),
      collectionIds: [],
      visibility: 'private',
      forSale: false,
      sold: false,
      metadata: {},
    };

    await assetRef.set(assetData);

    console.log(`[METADATA] Asset ${assetId} saved successfully`);

    // Trigger AI analysis in background
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    fetch(`${baseUrl}/api/ai/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assetId,
        userId,
        imageUrl: url,
        type,
      }),
    }).catch(error => {
      console.error('[METADATA] Failed to trigger AI analysis:', error);
    });

    return NextResponse.json({
      success: true,
      asset: {
        id: assetId,
        ...assetData,
        uploadedAt: assetData.uploadedAt.toISOString(),
        updatedAt: assetData.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[METADATA] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save metadata' },
      { status: 500 }
    );
  }
}
