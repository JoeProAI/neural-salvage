/**
 * Content Moderation using AI
 * Detects inappropriate content before upload/minting
 */

interface ModerationResult {
  safe: boolean;
  reason?: string;
  categories?: string[];
  confidence?: number;
}

/**
 * Moderate image content using Google Cloud Vision API
 * Detects: adult content, violence, medical, racy content, spoof
 */
export async function moderateImage(imageBuffer: Buffer): Promise<ModerationResult> {
  try {
    // Check if Vision API is configured
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID || !process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      console.warn('⚠️ [MODERATION] Google Cloud Vision not configured - skipping AI moderation');
      return { safe: true }; // Allow if not configured (for development)
    }

    const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CLOUD_API_KEY}`;

    const base64Image = imageBuffer.toString('base64');

    const response = await fetch(visionApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: 'SAFE_SEARCH_DETECTION',
                maxResults: 1,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('[MODERATION] Vision API error:', await response.text());
      return { safe: true }; // Allow on API error (don't block users due to our error)
    }

    const data = await response.json();
    const safeSearch = data.responses?.[0]?.safeSearchAnnotation;

    if (!safeSearch) {
      console.warn('[MODERATION] No safe search data returned');
      return { safe: true };
    }

    console.log('[MODERATION] Safe search results:', safeSearch);

    // Only block EXTREMELY severe content (VERY_LIKELY only)
    // We're not the morality police - just prevent illegal stuff
    const blocked = [];
    const reasons = [];

    // Only block if VERY_LIKELY (not just LIKELY)
    // This catches illegal content but allows art/creative stuff
    if (safeSearch.adult === 'VERY_LIKELY') {
      // Only if it's extreme - artistic nudity is fine
      blocked.push('extreme_adult');
      reasons.push('Extreme adult content detected');
    }

    if (safeSearch.violence === 'VERY_LIKELY') {
      // Only extreme violence - horror/art is fine
      blocked.push('extreme_violence');
      reasons.push('Extreme violent content detected');
    }

    // Google's CSAM detection is automatic - we trust it
    // If VERY_LIKELY on anything, probably illegal
    if (blocked.length > 0) {
      return {
        safe: false,
        reason: reasons.join(', '),
        categories: blocked,
      };
    }

    return {
      safe: true,
      categories: [],
    };
  } catch (error) {
    console.error('[MODERATION] Error during moderation:', error);
    // On error, allow upload (don't block users due to our errors)
    return { safe: true };
  }
}

/**
 * Detect spam and illegal keywords
 * More focused on abuse than content morality
 */
export function moderateText(text: string): ModerationResult {
  const lowerText = text.toLowerCase();

  // Illegal content keywords
  const illegalKeywords = [
    'child porn',
    'cp',
    'csam',
    'underage',
    'preteen',
  ];

  // Spam indicators
  const spamPatterns = [
    /free\s*money/i,
    /click\s*here/i,
    /buy\s*now/i,
    /limited\s*time/i,
    /earn\s*\$\d+/i,
    /http[s]?:\/\/.*bit\.ly/i, // Shortened links
    /http[s]?:\/\/.*goo\.gl/i,
    /crypto.*free/i,
    /nft.*giveaway/i,
  ];

  // Check illegal content
  for (const keyword of illegalKeywords) {
    if (lowerText.includes(keyword)) {
      return {
        safe: false,
        reason: 'Illegal content keyword detected',
      };
    }
  }

  // Check spam patterns
  let spamScore = 0;
  for (const pattern of spamPatterns) {
    if (pattern.test(text)) {
      spamScore++;
    }
  }

  // Multiple spam indicators = likely spam
  if (spamScore >= 2) {
    return {
      safe: false,
      reason: 'Spam detected',
      categories: ['spam'],
    };
  }

  // Check for excessive URLs (3+ links = spam)
  const urlCount = (text.match(/http[s]?:\/\//g) || []).length;
  if (urlCount >= 3) {
    return {
      safe: false,
      reason: 'Excessive links (spam)',
      categories: ['spam'],
    };
  }

  return { safe: true };
}

/**
 * Moderate file before upload/mint
 */
export async function moderateFile(
  fileBuffer: Buffer,
  mimeType: string,
  metadata?: { title?: string; description?: string }
): Promise<ModerationResult> {
  // Check text metadata first (faster)
  if (metadata) {
    const titleCheck = moderateText(metadata.title || '');
    if (!titleCheck.safe) {
      return titleCheck;
    }

    const descCheck = moderateText(metadata.description || '');
    if (!descCheck.safe) {
      return descCheck;
    }
  }

  // Check image content
  if (mimeType.startsWith('image/')) {
    return await moderateImage(fileBuffer);
  }

  // For now, allow video/audio (can add later)
  return { safe: true };
}

/**
 * Log moderation violations for admin review
 */
export async function logModerationViolation(
  userId: string,
  filename: string,
  reason: string,
  categories: string[]
) {
  console.error('[MODERATION VIOLATION]', {
    userId,
    filename,
    reason,
    categories,
    timestamp: new Date().toISOString(),
  });

  // TODO: Save to database for admin review
  // TODO: Consider auto-banning repeat offenders
  // TODO: Send alert to admin dashboard
}
