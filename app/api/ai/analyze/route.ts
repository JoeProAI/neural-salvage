import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { daytonaService } from '@/lib/daytona/service';
import { qdrantService } from '@/lib/vector/qdrant';
import admin from 'firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { assetId, userId, imageUrl, type } = await request.json();

    if (!assetId || !userId || !imageUrl) {
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

    // Check if user owns the asset
    if (asset?.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Perform AI analysis with Daytona based on type
    let analysis: any = {
      tags: [],
      analyzedAt: new Date(),
    };

    if (type === 'image') {
      // Analyze image in Daytona sandbox - all operations in one call
      const imageAnalysis = await daytonaService.analyzeImage(imageUrl);
      analysis = { ...analysis, ...imageAnalysis };
    } else if (type === 'video') {
      // Analyze video in Daytona sandbox
      const videoAnalysis = await daytonaService.analyzeVideo(imageUrl);
      analysis = { ...analysis, ...videoAnalysis };
    } else if (type === 'audio') {
      // Transcribe audio in Daytona sandbox
      const audioAnalysis = await daytonaService.transcribeAudio(imageUrl);
      analysis = { ...analysis, ...audioAnalysis };
    }

    // Generate embedding for semantic search
    const embeddingText = [
      asset?.filename,
      analysis.caption,
      analysis.transcript,
      ...(analysis.tags || []),
    ]
      .filter(Boolean)
      .join(' ');

    const embedding = await daytonaService.generateEmbedding(embeddingText);
    analysis.embedding = embedding;

    // Store in Qdrant for vector search
    await qdrantService.upsertVector(assetId, embedding, {
      userId,
      type: asset?.type || type,
      tags: analysis.tags,
      caption: analysis.caption,
      forSale: asset?.forSale || false,
    });

    // Update asset in Firestore
    await assetRef.update({
      aiAnalysis: analysis,
      updatedAt: new Date(),
    });

    // Update AI usage for user
    const userRef = adminDb().collection('users').doc(userId);
    await userRef.update({
      'aiUsage.current': admin.firestore.FieldValue.increment(1),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('AI analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}