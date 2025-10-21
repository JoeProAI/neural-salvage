import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { aiService } from '@/lib/ai/providers';
import { qdrantService } from '@/lib/vector/qdrant';

export async function POST(request: NextRequest) {
  try {
    const { query, filters, userId, limit = 20 } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Generate embedding for the search query
    const queryEmbedding = await aiService.generateEmbedding(query);

    // Build Qdrant filters
    const qdrantFilters: any = {};

    if (filters?.type && filters.type.length > 0) {
      qdrantFilters.type = filters.type;
    }

    if (filters?.tags && filters.tags.length > 0) {
      qdrantFilters.tags = filters.tags;
    }

    if (filters?.forSale !== undefined) {
      qdrantFilters.forSale = filters.forSale;
    }

    // Perform vector search
    const vectorResults = await qdrantService.search(
      queryEmbedding,
      qdrantFilters,
      limit
    );

    // Get asset details from Firestore
    const assetIds = vectorResults.map((r) => r.assetId);
    const assets = await Promise.all(
      assetIds.map(async (id) => {
        const doc = await adminDb().collection('assets').doc(id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
      })
    );

    // Filter out null results and apply additional filters
    let filteredAssets = assets.filter((asset) => {
      if (!asset) return false;

      // Check visibility - only show public assets or user's own assets
      if (asset.visibility === 'private' && asset.userId !== userId) {
        return false;
      }

      // Apply color filter if specified
      if (filters?.colors && filters.colors.length > 0) {
        const assetColors = asset.aiAnalysis?.colors || [];
        const hasMatchingColor = filters.colors.some((color: string) =>
          assetColors.includes(color)
        );
        if (!hasMatchingColor) return false;
      }

      // Apply date range filter
      if (filters?.dateRange) {
        const assetDate = asset.uploadedAt?.toDate?.() || new Date(asset.uploadedAt);
        const start = new Date(filters.dateRange.start);
        const end = new Date(filters.dateRange.end);
        if (assetDate < start || assetDate > end) return false;
      }

      // Apply price range filter
      if (filters?.priceRange && asset.forSale) {
        const price = asset.price || 0;
        if (price < filters.priceRange.min || price > filters.priceRange.max) {
          return false;
        }
      }

      return true;
    });

    // Combine with vector scores
    const results = filteredAssets.map((asset, index) => {
      const vectorResult = vectorResults.find((r) => r.assetId === asset?.id);
      return {
        asset,
        score: vectorResult?.score || 0,
        highlights: [
          asset?.aiAnalysis?.caption,
          ...(asset?.aiAnalysis?.tags || []).slice(0, 3),
        ].filter(Boolean),
      };
    });

    // Sort by score (relevance)
    results.sort((a, b) => b.score - a.score);

    // Keyword fallback if vector search returns few results
    if (results.length < 5) {
      const keywordResults = await performKeywordSearch(query, filters, userId, limit);
      
      // Merge results, avoiding duplicates
      const existingIds = new Set(results.map((r) => r.asset?.id));
      const newResults = keywordResults.filter(
        (r) => !existingIds.has(r.asset?.id)
      );
      
      results.push(...newResults);
    }

    return NextResponse.json({
      success: true,
      results: results.slice(0, limit),
      total: results.length,
    });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    );
  }
}

async function performKeywordSearch(
  query: string,
  filters: any,
  userId: string,
  limit: number
) {
  const queryLower = query.toLowerCase();
  const keywords = queryLower.split(' ').filter((k) => k.length > 2);

  let assetsQuery = adminDb().collection('assets');

  // Apply filters
  if (filters?.type && filters.type.length > 0) {
    assetsQuery = assetsQuery.where('type', 'in', filters.type);
  }

  if (filters?.forSale !== undefined) {
    assetsQuery = assetsQuery.where('forSale', '==', filters.forSale);
  }

  const snapshot = await assetsQuery.limit(100).get();

  const results = snapshot.docs
    .map((doc) => {
      const asset = { id: doc.id, ...doc.data() };

      // Check visibility
      if (asset.visibility === 'private' && asset.userId !== userId) {
        return null;
      }

      // Calculate keyword match score
      const searchableText = [
        asset.filename,
        asset.aiAnalysis?.caption,
        ...(asset.aiAnalysis?.tags || []),
        asset.aiAnalysis?.ocr,
        asset.aiAnalysis?.transcript,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchCount = keywords.filter((keyword) =>
        searchableText.includes(keyword)
      ).length;

      if (matchCount === 0) return null;

      return {
        asset,
        score: matchCount / keywords.length,
        highlights: asset.aiAnalysis?.tags?.slice(0, 3) || [],
      };
    })
    .filter(Boolean);

  results.sort((a, b) => (b?.score || 0) - (a?.score || 0));

  return results.slice(0, limit);
}