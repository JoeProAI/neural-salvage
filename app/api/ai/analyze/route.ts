import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { daytonaService } from '@/lib/daytona/service';
import { qdrantService } from '@/lib/vector/qdrant';
import { checkAIUsageLimit } from '@/lib/access/checkAccess';
import admin from 'firebase-admin';

// Timeout wrapper for Daytona calls (30 second max to avoid Vercel timeout)
function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 30000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('AI analysis timeout - taking too long')), timeoutMs)
    )
  ]);
}

export async function POST(request: NextRequest) {
  try {
    const { assetId, userId, imageUrl, type, mimeType } = await request.json();

    if (!assetId || !userId || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get asset from Firestore FIRST to check payment status
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

    // Check if AI analysis was already paid for (bypass quota check)
    const alreadyPaidForAI = asset?.paidFeatures?.aiAnalysis === true || asset?.aiAnalysisPaid === true;
    
    let usageCheck;
    if (alreadyPaidForAI) {
      console.log('[PAYMENT] AI analysis already paid for, allowing free re-analysis');
      // Set dummy usage info for paid users
      usageCheck = { current: 0, limit: -1, canUseAI: true, isBetaUser: false };
    } else {
      // Check AI usage limit (beta users bypass this)
      usageCheck = await checkAIUsageLimit(userId);
      
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
    }

    // Perform AI analysis with Daytona based on type
    let analysis: any = {
      tags: [],
      analyzedAt: new Date(),
    };

    try {
      console.log(`🤖 [AI ANALYZE] Starting ${type} analysis with 30s timeout...`);
      
      if (type === 'image') {
        // Analyze image with 30s timeout
        const imageAnalysis = await withTimeout(
          daytonaService.analyzeImage(imageUrl),
          30000
        );
        analysis = { ...analysis, ...imageAnalysis };
      } else if (type === 'video') {
        // Analyze video with 30s timeout
        const videoAnalysis = await withTimeout(
          daytonaService.analyzeVideo(imageUrl),
          30000
        );
        analysis = { ...analysis, ...videoAnalysis };
      } else if (type === 'audio') {
        // Transcribe audio with 30s timeout
        const audioAnalysis = await withTimeout(
          daytonaService.transcribeAudio(imageUrl),
          30000
        );
        analysis = { ...analysis, ...audioAnalysis };
      } else if (type === 'document') {
        // Analyze document with 30s timeout
        const documentAnalysis = await withTimeout(
          daytonaService.analyzeDocument(imageUrl, mimeType || 'application/pdf'),
          30000
        );
        analysis = { ...analysis, ...documentAnalysis };
      }
      
      console.log(`✅ [AI ANALYZE] ${type} analysis completed successfully`);
    } catch (analysisError: any) {
      console.error('❌ [AI ANALYZE] Analysis failed:', analysisError.message);
      
      // Provide basic fallback analysis
      analysis = {
        tags: [type || 'media'],
        caption: `${type || 'Media'} uploaded to Neural Salvage`,
        analyzedAt: new Date(),
        error: analysisError.message.includes('timeout') 
          ? 'AI service timeout - using basic tags'
          : 'AI analysis temporarily unavailable',
      };
      
      // Don't throw - return partial analysis instead
      console.warn('⚠️ [AI ANALYZE] Returning fallback analysis');
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

      console.log('🧠 [AI ANALYZE] Generating embedding with 15s timeout...');
      const embedding = await withTimeout(
        daytonaService.generateEmbedding(embeddingText),
        15000  // 15s timeout for embeddings
      );
      analysis.embedding = embedding;

      // Store in Qdrant for vector search (optional - skip if not configured)
      try {
        await withTimeout(
          qdrantService.upsertVector(assetId, embedding, {
            userId,
            type: asset?.type || type,
            tags: analysis.tags,
            caption: analysis.caption,
            forSale: asset?.forSale || false,
          }),
          10000  // 10s timeout for Qdrant
        );
        console.log('✅ [AI ANALYZE] Vector stored in Qdrant');
      } catch (qdrantError: any) {
        console.warn('⚠️ [AI ANALYZE] Qdrant skipped:', qdrantError.message);
      }
    } catch (embeddingError: any) {
      console.warn('⚠️ [AI ANALYZE] Embedding skipped:', embeddingError.message);
      // Continue without embeddings - they're only for similarity search
    }

    // Update asset in Firestore
    await assetRef.update({
      aiAnalysis: analysis,
      updatedAt: new Date(),
    });

    // Update AI usage for user (only increment if NOT already paid for)
    if (!alreadyPaidForAI && !usageCheck.isBetaUser) {
      const userRef = adminDb().collection('users').doc(userId);
      await userRef.update({
        'aiUsage.current': admin.firestore.FieldValue.increment(1),
        updatedAt: new Date(),
      });
    }

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
        current: alreadyPaidForAI ? usageCheck.current : usageCheck.current + 1,
        limit: usageCheck.limit,
        isBetaUser: usageCheck.isBetaUser,
        alreadyPaid: alreadyPaidForAI
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