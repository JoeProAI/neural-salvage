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

    // Check confidence levels (VERY_LIKELY, LIKELY = block)
    const blocked = [];
    const reasons = [];

    if (safeSearch.adult === 'VERY_LIKELY' || safeSearch.adult === 'LIKELY') {
      blocked.push('adult');
      reasons.push('Adult content detected');
    }

    if (safeSearch.violence === 'VERY_LIKELY' || safeSearch.violence === 'LIKELY') {
      blocked.push('violence');
      reasons.push('Violent content detected');
    }

    // CSAM is handled by Google's own detection
    // We block anything flagged at LIKELY or higher
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
 * Simple keyword-based text moderation
 * Checks titles, descriptions for prohibited content
 */
export function moderateText(text: string): ModerationResult {
  const lowerText = text.toLowerCase();

  // Prohibited keywords (add more as needed)
  const prohibitedKeywords = [
    'child porn',
    'cp',
    'csam',
    'underage',
    // Add other problematic keywords
  ];

  for (const keyword of prohibitedKeywords) {
    if (lowerText.includes(keyword)) {
      return {
        safe: false,
        reason: 'Prohibited content in text',
      };
    }
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
