import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { daytonaService } from '@/lib/daytona/service';
import { qdrantService } from '@/lib/vector/qdrant';
import { checkAIUsageLimit } from '@/lib/access/checkAccess';
import admin from 'firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { assetId, userId, imageUrl, type, mimeType } = await request.json();

    if (!assetId || !userId || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check AI usage limit (beta users bypass this)
    const usageCheck = await checkAIUsageLimit(userId);
    
    if (!usageCheck.canUseAI) {
      return NextResponse.json(
        { 
          error: 'AI analysis limit reached',
          current: usageCheck.current,
          limit: usageCheck.limit,
          message: 'Upgrade to Pro for unlimited AI analyses or contact us about beta access'
        },
        { status: 402 } // 402 = Payment Required
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

    try {
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
      } else if (type === 'document') {
        // Analyze document (PDF, TXT, etc.) in Daytona sandbox
        const documentAnalysis = await daytonaService.analyzeDocument(imageUrl, mimeType || 'application/pdf');
        analysis = { ...analysis, ...documentAnalysis };
      }
    } catch (analysisError: any) {
      console.error('AI analysis failed:', analysisError);
      
      // Provide basic fallback analysis
      analysis = {
        tags: [type || 'media'],
        caption: `${type || 'Media'} uploaded to Neural Salvage`,
        analyzedAt: new Date(),
        error: 'AI analysis temporarily unavailable',
      };
      
      // Don't throw - return partial analysis instead
      console.warn('Returning fallback analysis due to:', analysisError.message);
    }

    // Generate embedding for semantic search (optional - skip if it fails)
    try {
      const embeddingText = [
        asset?.filename,
        analysis.caption,
        analysis.summary,
        analysis.transcript,
        analysis.extractedText,
        ...(analysis.tags || []),
        ...(analysis.keyTopics || []),
      ]
        .filter(Boolean)
        .join(' ');

      const embedding = await daytonaService.generateEmbedding(embeddingText);
      analysis.embedding = embedding;

      // Store in Qdrant for vector search (optional - skip if not configured)
      try {
        await qdrantService.upsertVector(assetId, embedding, {
          userId,
          type: asset?.type || type,
          tags: analysis.tags,
          caption: analysis.caption,
          forSale: asset?.forSale || false,
        });
      } catch (qdrantError) {
        console.warn('Qdrant vector storage skipped (not configured):', qdrantError);
        // Continue without Qdrant - it's only for similarity search
      }
    } catch (embeddingError) {
      console.warn('Embedding generation skipped:', embeddingError);
      // Continue without embeddings - they're only for similarity search
    }

    // Update asset in Firestore
    await assetRef.update({
      aiAnalysis: analysis,
      updatedAt: new Date(),
    });

    // Update AI usage for user (track for all, but beta users have no limits)
    const userRef = adminDb().collection('users').doc(userId);
    await userRef.update({
      'aiUsage.current': admin.firestore.FieldValue.increment(1),
      updatedAt: new Date(),
    });

    // Trigger cover art generation for audio/documents (background task)
    if ((type === 'audio' || type === 'document') && !asset?.thumbnailUrl) {
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      
      fetch(`${baseUrl}/api/ai/generate-cover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId,
          userId,
        }),
      }).catch(error => {
        console.error('[AI ANALYZE] Failed to trigger cover art generation:', error);
      });
      
      console.log('🎨 [AI ANALYZE] Cover art generation triggered in background');
    }

    return NextResponse.json({
      success: true,
      analysis,
      usageInfo: {
        current: usageCheck.current + 1,
        limit: usageCheck.limit,
        isBetaUser: usageCheck.isBetaUser
      }
    });
  } catch (error: any) {
    console.error('AI analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}