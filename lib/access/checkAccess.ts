import { adminDb } from '@/lib/firebase/admin';

export async function checkUserAccess(
  userId: string,
  requiredTier: 'free' | 'pro' | 'enterprise' = 'free'
) {
  const userDoc = await adminDb().collection('users').doc(userId).get();
  
  if (!userDoc.exists) {
    return {
      hasAccess: false,
      isBetaUser: false,
      tier: 'free',
      reason: 'user_not_found'
    };
  }
  
  const userData = userDoc.data()!;
  
  const isBetaUser = userData.betaAccess === true;
  const userTier = userData.plan || 'free';
  const isActive = userData.subscriptionStatus === 'active';
  
  const tierLevels = { free: 0, pro: 1, enterprise: 2 };
  const hasRequiredTier = tierLevels[userTier as keyof typeof tierLevels] >= tierLevels[requiredTier];
  
  return {
    hasAccess: isBetaUser || (isActive && hasRequiredTier),
    isBetaUser,
    tier: userTier,
    reason: isBetaUser ? 'beta_access' : hasRequiredTier ? 'subscription' : 'insufficient_tier'
  };
}

export async function checkAIUsageLimit(userId: string): Promise<{
  canUseAI: boolean;
  current: number;
  limit: number;
  isBetaUser: boolean;
}> {
  const userDoc = await adminDb().collection('users').doc(userId).get();
  
  if (!userDoc.exists) {
    return { canUseAI: false, current: 0, limit: 0, isBetaUser: false };
  }
  
  const userData = userDoc.data()!;
  const isBetaUser = userData.betaAccess === true;
  
  // Beta users have unlimited AI usage
  if (isBetaUser) {
    return {
      canUseAI: true,
      current: userData.aiUsage?.current || 0,
      limit: -1, // -1 means unlimited
      isBetaUser: true
    };
  }
  
  const current = userData.aiUsage?.current || 0;
  const limit = userData.aiUsage?.limit || 100;
  
  return {
    canUseAI: current < limit,
    current,
    limit,
    isBetaUser: false
  };
}
