import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

/**
 * AI-Powered NFT Value Estimator
 * Analyzes artwork and provides realistic market pricing
 */

interface ValueFactors {
  baseQuality: number;      // 0-100 (art quality)
  uniqueness: number;       // 0-100 (originality)
  technicalSkill: number;   // 0-100 (execution)
  marketDemand: number;     // 0-100 (trend relevance)
  platformBonus: number;    // Fixed bonus for Neural Salvage features
}

interface PriceEstimate {
  conservative: number;     // Low estimate (AR)
  realistic: number;        // Mid estimate (AR)
  optimistic: number;       // High estimate (AR)
  confidence: string;       // Low/Medium/High
  reasoning: string[];      // Why this price
}

export async function POST(request: NextRequest) {
  try {
    const { assetId, userId } = await request.json();

    if (!assetId || !userId) {
      return NextResponse.json(
        { error: 'Asset ID and User ID required' },
        { status: 400 }
      );
    }

    // Get asset data
    const assetDoc = await adminDb().collection('assets').doc(assetId).get();
    
    if (!assetDoc.exists) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    const asset = assetDoc.data();

    // Analyze value factors
    const factors = analyzeValueFactors(asset);
    
    // Calculate price estimate
    const estimate = calculatePriceEstimate(factors, asset);
    
    // Generate detailed breakdown
    const breakdown = generateBreakdown(factors, asset);

    console.log('💰 [VALUE ESTIMATOR]', {
      assetId,
      factors,
      estimate,
    });

    return NextResponse.json({
      success: true,
      estimate,
      breakdown,
      factors,
      comparison: {
        imageFile: {
          value: 0,
          sellable: false,
          ownership: false,
          permanence: false,
          royalties: false,
        },
        nft: {
          value: estimate.realistic,
          sellable: true,
          ownership: true,
          permanence: true,
          royalties: true,
        },
      },
    });

  } catch (error: any) {
    console.error('❌ [VALUE ESTIMATOR] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to estimate value' },
      { status: 500 }
    );
  }
}

/**
 * Analyze various factors that determine NFT value
 */
function analyzeValueFactors(asset: any): ValueFactors {
  const ai = asset.aiAnalysis || {};
  
  // Base quality score (from AI analysis confidence and detail)
  const baseQuality = calculateBaseQuality(ai);
  
  // Uniqueness score (how original/interesting)
  const uniqueness = calculateUniqueness(ai);
  
  // Technical skill (execution quality)
  const technicalSkill = calculateTechnicalSkill(asset, ai);
  
  // Market demand (trend relevance)
  const marketDemand = calculateMarketDemand(ai);
  
  // Platform bonus (Neural Salvage features)
  const platformBonus = 15; // Fixed 15% bonus for our tech

  return {
    baseQuality,
    uniqueness,
    technicalSkill,
    marketDemand,
    platformBonus,
  };
}

function calculateBaseQuality(ai: any): number {
  let score = 50; // Start at average

  // Check if detailed caption exists
  if (ai.caption && ai.caption.length > 100) score += 15;
  
  // Check if mood/style detected
  if (ai.mood || ai.style) score += 10;
  
  // Check if colors analyzed
  if (ai.colors && ai.colors.length > 0) score += 10;
  
  // Check if themes detected
  if (ai.themes && ai.themes.length > 0) score += 10;
  
  // Check description quality
  if (ai.description && ai.description.length > 200) score += 5;

  return Math.min(100, Math.max(0, score));
}

function calculateUniqueness(ai: any): number {
  let score = 50;

  // Cyberpunk/sci-fi is trending
  const caption = (ai.caption || '').toLowerCase();
  const description = (ai.description || '').toLowerCase();
  const combined = caption + ' ' + description;

  if (combined.includes('cyberpunk') || combined.includes('futuristic')) score += 15;
  if (combined.includes('unique') || combined.includes('surreal')) score += 10;
  if (combined.includes('abstract') || combined.includes('artistic')) score += 10;
  if (combined.includes('detailed') || combined.includes('intricate')) score += 10;
  if (combined.includes('emotional') || combined.includes('mysterious')) score += 5;

  return Math.min(100, Math.max(0, score));
}

function calculateTechnicalSkill(asset: any, ai: any): number {
  let score = 50;

  // File size indicates resolution/quality
  const sizeMB = (asset.size || 0) / (1024 * 1024);
  if (sizeMB > 5) score += 15;      // High-res
  else if (sizeMB > 2) score += 10; // Medium-res
  else if (sizeMB > 1) score += 5;  // Decent-res

  // AI-generated metadata quality
  if (ai.caption && ai.caption.length > 200) score += 10;
  if (ai.themes && ai.themes.length >= 3) score += 10;
  if (ai.colors && ai.colors.length >= 5) score += 10;
  if (ai.mood) score += 5;

  return Math.min(100, Math.max(0, score));
}

function calculateMarketDemand(ai: any): number {
  let score = 50;

  const caption = (ai.caption || '').toLowerCase();
  const description = (ai.description || '').toLowerCase();
  const combined = caption + ' ' + description;

  // Hot trends on Arweave/NFT market
  const trends = [
    'cyberpunk', 'futuristic', 'sci-fi', 'neon', 'digital',
    'abstract', 'surreal', 'dystopian', 'tech', 'ai',
    'portrait', 'landscape', 'architecture', 'cosmic',
  ];

  let matchCount = 0;
  trends.forEach(trend => {
    if (combined.includes(trend)) matchCount++;
  });

  score += matchCount * 5;

  return Math.min(100, Math.max(0, score));
}

/**
 * Calculate price estimate based on factors
 */
function calculatePriceEstimate(factors: ValueFactors, asset: any): PriceEstimate {
  // Base price calculation
  const averageScore = (
    factors.baseQuality +
    factors.uniqueness +
    factors.technicalSkill +
    factors.marketDemand
  ) / 4;

  // Platform bonus
  const scoreWithBonus = averageScore * (1 + factors.platformBonus / 100);

  // Convert score to AR price
  // Scale: 0-100 score → 2-50 AR price range
  const basePrice = 2 + (scoreWithBonus / 100) * 48;

  // Calculate range
  const conservative = Math.max(2, basePrice * 0.7);
  const realistic = basePrice;
  const optimistic = Math.min(100, basePrice * 1.5);

  // Determine confidence level
  let confidence = 'Medium';
  if (averageScore >= 75) confidence = 'High';
  if (averageScore <= 40) confidence = 'Low';

  // Generate reasoning
  const reasoning: string[] = [];

  if (factors.baseQuality >= 70) {
    reasoning.push('✅ High quality artwork with detailed AI analysis');
  } else if (factors.baseQuality <= 40) {
    reasoning.push('⚠️ Basic quality - consider improving resolution or detail');
  }

  if (factors.uniqueness >= 70) {
    reasoning.push('✅ Unique style with trending themes (cyberpunk/sci-fi)');
  }

  if (factors.technicalSkill >= 70) {
    reasoning.push('✅ Professional-level execution and presentation');
  }

  if (factors.marketDemand >= 70) {
    reasoning.push('✅ Strong market demand for this style');
  } else if (factors.marketDemand <= 40) {
    reasoning.push('⚠️ Niche appeal - may take longer to sell');
  }

  reasoning.push(`✅ +${factors.platformBonus}% Neural Salvage platform bonus (AI metadata, ownership proof, permanent storage)`);

  if (confidence === 'Low') {
    reasoning.push('💡 Tip: Improve quality or pick trendier themes for higher value');
  }

  return {
    conservative: Math.round(conservative * 10) / 10,
    realistic: Math.round(realistic * 10) / 10,
    optimistic: Math.round(optimistic * 10) / 10,
    confidence,
    reasoning,
  };
}

/**
 * Generate detailed breakdown for users
 */
function generateBreakdown(factors: ValueFactors, asset: any) {
  const arPrice = 7.5; // Approximate AR/USD rate

  return {
    factors: {
      quality: {
        score: factors.baseQuality,
        label: getScoreLabel(factors.baseQuality),
        impact: 'Foundation of value - how good the art is',
      },
      uniqueness: {
        score: factors.uniqueness,
        label: getScoreLabel(factors.uniqueness),
        impact: 'Originality and style differentiation',
      },
      technicalSkill: {
        score: factors.technicalSkill,
        label: getScoreLabel(factors.technicalSkill),
        impact: 'Execution quality and presentation',
      },
      marketDemand: {
        score: factors.marketDemand,
        label: getScoreLabel(factors.marketDemand),
        impact: 'Current trends and buyer interest',
      },
      platformBonus: {
        score: factors.platformBonus,
        label: 'Excellent',
        impact: 'Neural Salvage tech advantages',
      },
    },
    advantages: [
      '✅ AI-powered metadata (10x better discovery)',
      '✅ Cryptographic ownership proof (verifiable)',
      '✅ 200+ year permanent storage (Arweave)',
      '✅ 3% lifetime royalties (passive income)',
      '✅ Professional platform (polished UX)',
    ],
    comparison: {
      imageFile: {
        value: '$0',
        description: 'Just a file on your computer',
        sellable: false,
        royalties: false,
      },
      nft: {
        value: `$${Math.round(factors.baseQuality * arPrice)}-${Math.round(factors.baseQuality * arPrice * 1.5)}`,
        description: 'Market-tradeable digital asset',
        sellable: true,
        royalties: true,
      },
    },
  };
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Average';
  if (score >= 35) return 'Below Average';
  return 'Needs Improvement';
}
