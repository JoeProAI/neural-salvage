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
      console.log(`🤖 [AI ANALYZE] Starting ${type} analysis (no timeout - let Daytona complete)...`);
      
      if (type === 'image') {
        const imageAnalysis = await daytonaService.analyzeImage(imageUrl);
        analysis = { ...analysis, ...imageAnalysis };
      } else if (type === 'video') {
        const videoAnalysis = await daytonaService.analyzeVideo(imageUrl);
        analysis = { ...analysis, ...videoAnalysis };
      } else if (type === 'audio') {
        const audioAnalysis = await daytonaService.transcribeAudio(imageUrl);
        analysis = { ...analysis, ...audioAnalysis };
      } else if (type === 'document') {
        const documentAnalysis = await daytonaService.analyzeDocument(imageUrl, mimeType || 'application/pdf');
        analysis = { ...analysis, ...documentAnalysis };
      }
      
      console.log(`✅ [AI ANALYZE] ${type} analysis completed successfully`);
    } catch (analysisError: any) {
      console.error('❌ [AI ANALYZE] Analysis failed:', {
        message: analysisError.message,
        stack: analysisError.stack,
        name: analysisError.name,
        cause: analysisError.cause,
      });
      
      // Provide basic fallback analysis
      analysis = {
        tags: [type || 'media'],
        caption: `${type || 'Media'} uploaded to Neural Salvage`,
        analyzedAt: new Date(),
        error: analysisError.message || 'AI analysis temporarily unavailable',
      };
      
      // Don't throw - return partial analysis instead
      console.warn('⚠️ [AI ANALYZE] Returning fallback analysis due to error');
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

      console.log('🧠 [AI ANALYZE] Generating embedding...');
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
        console.log('✅ [AI ANALYZE] Vector stored in Qdrant');
      } catch (qdrantError: any) {
        console.warn('⚠️ [AI ANALYZE] Qdrant skipped:', qdrantError.message);
      }
    } catch (embeddingError: any) {
      console.warn('⚠️ [AI ANALYZE] Embedding skipped:', embeddingError.message);
      // Continue without embeddings - they're only for similarity search
    }

    // Update asset in Firestore
    console.log('💾 [AI ANALYZE] Saving to Firestore:', {
      assetId,
      hasCaption: !!analysis.caption,
      hasTranscript: !!analysis.transcript,
      hasTags: !!analysis.tags,
      tagsCount: analysis.tags?.length || 0,
      tags: analysis.tags,
      captionLength: analysis.caption?.length || 0,
      transcriptLength: analysis.transcript?.length || 0,
    });
    
    await assetRef.update({
      aiAnalysis: analysis,
      updatedAt: new Date(),
    });
    
    console.log('✅ [AI ANALYZE] Successfully saved to Firestore');

    // Update AI usage for user (only increment if NOT already paid for)
    if (!alreadyPaidForAI && !usageCheck.isBetaUser) {
      const userRef = adminDb().collection('users').doc(userId);
      await userRef.update({
        'aiUsage.current': admin.firestore.FieldValue.increment(1),
        updatedAt: new Date(),
      });
    }

    // Trigger album art extraction or cover generation for audio/documents (background task)
    if ((type === 'audio' || type === 'document') && !asset?.thumbnailUrl) {
      // Use same domain as current request to avoid auth issues
      const host = request.headers.get('host');
      const protocol = request.headers.get('x-forwarded-proto') || 'https';
      const baseUrl = host ? `${protocol}://${host}` : 'http://localhost:3000';
      
      // For audio: Try extracting embedded album art first
      if (type === 'audio') {
        console.log('🎵 [AI ANALYZE] Attempting to extract embedded album art...');
        
        fetch(`${baseUrl}/api/audio/extract-album-art`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assetId,
            userId,
          }),
        }).then(async (response) => {
          const result = await response.json();
          
          // If no album art found, generate AI cover art
          if (!result.extracted) {
            console.log('🎨 [AI ANALYZE] No album art found, generating AI cover...');
            
            return fetch(`${baseUrl}/api/ai/generate-cover`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                assetId,
                userId,
              }),
            });
          } else {
            console.log('✅ [AI ANALYZE] Album art extracted successfully');
          }
        }).catch(error => {
          console.error('[AI ANALYZE] Album art extraction failed, will try AI generation:', error);
          
          // Fallback to AI generation
          fetch(`${baseUrl}/api/ai/generate-cover`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              assetId,
              userId,
            }),
          }).catch(e => console.error('[AI ANALYZE] Cover generation also failed:', e));
        });
      } else {
        // For documents: Generate AI cover art directly
        console.log('🎨 [AI ANALYZE] Generating AI cover art for document...');
        
        fetch(`${baseUrl}/api/ai/generate-cover`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assetId,
            userId,
          }),
        }).catch(error => {
          console.error('[AI ANALYZE] Failed to trigger cover art generation:', error);
        });
      }
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