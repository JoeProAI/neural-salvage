/**
 * Simple rate limiting to prevent spam
 * Tracks uploads per user per hour
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory store (use Redis in production)
const uploadLimits = new Map<string, RateLimitRecord>();

/**
 * Check if user is rate limited
 * @param userId User ID to check
 * @param maxUploadsPerHour Maximum uploads allowed per hour (default: 20)
 */
export function checkRateLimit(userId: string, maxUploadsPerHour: number = 20): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  const record = uploadLimits.get(userId);

  // No record or expired - allow
  if (!record || now > record.resetAt) {
    const resetAt = now + oneHour;
    uploadLimits.set(userId, { count: 1, resetAt });

    return {
      allowed: true,
      remaining: maxUploadsPerHour - 1,
      resetAt,
    };
  }

  // Check if limit exceeded
  if (record.count >= maxUploadsPerHour) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  // Increment count
  record.count++;
  uploadLimits.set(userId, record);

  return {
    allowed: true,
    remaining: maxUploadsPerHour - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Reset rate limit for a user (admin use)
 */
export function resetRateLimit(userId: string): void {
  uploadLimits.delete(userId);
}

/**
 * Check if user is likely a spammer based on behavior
 */
export function detectSpammerBehavior(userId: string): {
  isSpammer: boolean;
  reason?: string;
} {
  const record = uploadLimits.get(userId);

  if (!record) {
    return { isSpammer: false };
  }

  // Uploading at maximum rate = likely bot
  if (record.count >= 15) {
    return {
      isSpammer: true,
      reason: 'Excessive uploads (15+ per hour)',
    };
  }

  return { isSpammer: false };
}
