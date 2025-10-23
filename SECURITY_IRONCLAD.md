# 🔒 Security Guide - Iron Clad Protection

## Multi-Layer Security for NFT Platform

**When money is involved, hackers will come. Be prepared.**

---

## 🛡️ Layer 1: Rate Limiting

### Implementation

Create rate limiting service:

```typescript
// lib/security/rateLimit.ts

import { NextRequest } from 'next/server';

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

export function rateLimit(
  request: NextRequest,
  limit: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  const now = Date.now();
  
  if (!store[ip] || now > store[ip].resetTime) {
    store[ip] = { count: 1, resetTime: now + windowMs };
    return { allowed: true, remaining: limit - 1 };
  }
  
  if (store[ip].count >= limit) {
    return { allowed: false, remaining: 0 };
  }
  
  store[ip].count++;
  return { allowed: true, remaining: limit - store[ip].count };
}
```

### Apply to NFT Mint API

```typescript
// app/api/nft/mint/route.ts - Add at top of POST function

import { rateLimit } from '@/lib/security/rateLimit';

export async function POST(request: NextRequest) {
  // Rate limit: 5 mints per minute per IP
  const { allowed } = rateLimit(request, 5, 60000);
  
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait before minting again.' },
      { status: 429 }
    );
  }
  
  // ... rest of mint logic
}
```

---

## 🛡️ Layer 2: Cost Protection

### Daily Mint Limits

```typescript
// lib/security/costLimits.ts

import { adminDb } from '@/lib/firebase/admin';

export async function checkDailyMintLimit(userId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const mints = await adminDb()
    .collection('nfts')
    .where('userId', '==', userId)
    .where('createdAt', '>=', today)
    .get();
  
  const userDoc = await adminDb().collection('users').doc(userId).get();
  const plan = userDoc.data()?.plan || 'free';
  
  const limits = {
    free: 5,
    pro: 50,
  };
  
  const limit = limits[plan as keyof typeof limits];
  const allowed = mints.size < limit;
  
  return { allowed, current: mints.size, limit };
}

export async function checkFileSizeLimit(size: number): Promise<boolean> {
  const MAX_SIZE = 100 * 1024 * 1024; // 100 MB
  return size <= MAX_SIZE;
}

export async function checkPlatformDailyCost(): Promise<{
  allowed: boolean;
  spent: number;
  limit: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const mints = await adminDb()
    .collection('nfts')
    .where('createdAt', '>=', today)
    .get();
  
  let totalCost = 0;
  mints.forEach(doc => {
    totalCost += doc.data().arweave?.uploadCost || 0;
  });
  
  const DAILY_LIMIT = 5; // 5 AR tokens (~$50) per day max
  
  return {
    allowed: totalCost < DAILY_LIMIT,
    spent: totalCost,
    limit: DAILY_LIMIT,
  };
}
```

### Apply Cost Limits

```typescript
// app/api/nft/mint/route.ts - Add after rate limit

import { checkDailyMintLimit, checkFileSizeLimit, checkPlatformDailyCost } from '@/lib/security/costLimits';

// Check user daily limit
const userLimit = await checkDailyMintLimit(userId);
if (!userLimit.allowed) {
  return NextResponse.json({
    error: `Daily mint limit reached (${userLimit.current}/${userLimit.limit}). Upgrade to Pro or try tomorrow.`,
  }, { status: 429 });
}

// Check file size
const validSize = await checkFileSizeLimit(asset.size);
if (!validSize) {
  return NextResponse.json({
    error: 'File too large. Maximum 100 MB for NFT minting.',
  }, { status: 400 });
}

// Check platform cost limit
const platformCost = await checkPlatformDailyCost();
if (!platformCost.allowed) {
  return NextResponse.json({
    error: 'Platform daily limit reached. Please contact support.',
  }, { status: 503 });
}
```

---

## 🛡️ Layer 3: Wallet Security

### Best Practices

**1. Use Separate Wallets**

```
Production: Real AR tokens, secure storage
Testnet: Free tokens, testing only
Development: Separate from production

NEVER use the same wallet across environments
```

**2. Secure Storage (3 Locations)**

```
Location 1: Vercel env vars (encrypted by Vercel)
Location 2: Password manager (1Password, Bitwarden)
Location 3: Encrypted backup drive

Seed Phrase:
- Password manager
- Physical paper in safe
- Steel backup plate (fireproof)
```

**3. Regular Rotation**

```bash
# Every 90 days:
# 1. Create new wallet
# 2. Transfer AR balance
# 3. Update ARWEAVE_PRIVATE_KEY in Vercel
# 4. Redeploy
# 5. Archive old wallet securely
```

### Wallet Monitoring

```typescript
// lib/security/walletMonitor.ts

import { initBundlr } from '@/lib/nft/arweave';

export async function checkWalletBalance(): Promise<{
  balance: number;
  lowBalance: boolean;
}> {
  try {
    const bundlr = await initBundlr(process.env.ARWEAVE_PRIVATE_KEY);
    const balance = await bundlr.getLoadedBalance();
    const balanceAR = parseFloat(bundlr.utils.fromAtomic(balance));
    
    const LOW_BALANCE_THRESHOLD = 0.1; // Alert if < 0.1 AR
    
    return {
      balance: balanceAR,
      lowBalance: balanceAR < LOW_BALANCE_THRESHOLD,
    };
  } catch (error) {
    console.error('Wallet check failed:', error);
    return { balance: 0, lowBalance: true };
  }
}
```

---

## 🛡️ Layer 4: Monitoring & Alerts

### Alert System

```typescript
// lib/security/alerts.ts

export async function sendAlert(
  message: string,
  severity: 'low' | 'medium' | 'high'
) {
  console.error(`[ALERT ${severity.toUpperCase()}] ${message}`);
  
  // Send to your preferred channel
  if (process.env.ALERT_WEBHOOK_URL && severity === 'high') {
    await fetch(process.env.ALERT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 ${message}`,
        severity,
        timestamp: new Date().toISOString(),
      }),
    });
  }
}
```

### Security Monitoring Cron

```typescript
// app/api/cron/security-check/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { checkWalletBalance } from '@/lib/security/walletMonitor';
import { sendAlert } from '@/lib/security/alerts';

export async function GET(request: NextRequest) {
  // Verify Vercel Cron authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Check 1: Wallet balance
    const wallet = await checkWalletBalance();
    if (wallet.lowBalance) {
      await sendAlert(`Arweave wallet low: ${wallet.balance} AR`, 'high');
    }
    
    // Check 2: Unusual activity (>1000 mints in 24h)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentMints = await adminDb()
      .collection('nfts')
      .where('createdAt', '>=', yesterday)
      .get();
    
    if (recentMints.size > 1000) {
      await sendAlert(`Unusual activity: ${recentMints.size} mints in 24h`, 'medium');
    }
    
    // Check 3: High failure rate
    const failedMints = await adminDb()
      .collection('nfts')
      .where('status', '==', 'failed')
      .where('createdAt', '>=', yesterday)
      .get();
    
    if (failedMints.size > 50) {
      await sendAlert(`High failure rate: ${failedMints.size} failed mints`, 'medium');
    }
    
    return NextResponse.json({
      ok: true,
      checks: {
        walletBalance: wallet.balance,
        recentMints: recentMints.size,
        failedMints: failedMints.size,
      },
    });
  } catch (error: any) {
    await sendAlert(`Security check failed: ${error.message}`, 'high');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Add Cron to vercel.json

```json
{
  "crons": [
    {
      "path": "/api/cron/security-check",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Add CRON_SECRET to Vercel env vars:**
```
CRON_SECRET=your_random_secret_here_generate_strong_password
```

---

## 🛡️ Layer 5: Access Control

### Vercel Security Settings

```
1. Dashboard → Settings → Authentication
   → Enable "Require authentication for Production"
   
2. Dashboard → Settings → Team
   → Review all team members
   → Remove unnecessary access
   → Use "Viewer" role by default
   
3. Dashboard → Settings → Environment Variables
   → Only Owners can edit
   → Audit changes regularly
```

### Firebase Security Rules

**Already implemented in `firestore.rules` - verify they're deployed:**

```javascript
// Only users can write their own data
match /users/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && request.auth.uid == userId;
}

// Only owners can write their assets
match /assets/{assetId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && 
    request.auth.uid == request.resource.data.userId;
}

// NFTs are read-only via API
match /nfts/{nftId} {
  allow read: if request.auth != null;
  allow write: if false; // Only server can write
}
```

---

## 🚨 Incident Response Plan

### If You Suspect a Breach

**Immediate (0-15 min):**

1. **Pause Deployments**
   ```
   Vercel → Settings → Pause Deployments
   ```

2. **Check Damage**
   ```
   → Arweave wallet balance
   → Recent NFT mints (look for spam)
   → Firebase data changes
   → Vercel logs for suspicious IPs
   ```

3. **Rotate Keys** (if confirmed breach)
   ```
   → New Firebase Admin key
   → New Daytona key
   → New OpenAI key
   → New Arweave wallet (transfer balance first!)
   → Update all in Vercel
   ```

**Investigation (15-60 min):**

1. **Export Logs**
   ```
   Vercel → Logs → Export last 24 hours
   Firebase → Analytics → Export events
   ```

2. **Identify Entry Point**
   ```
   → Check for exposed env vars
   → Review recent code changes
   → Check team member access
   → Review third-party integrations
   ```

3. **Document**
   ```
   → Screenshot everything
   → Save transaction hashes
   → Note timestamps
   → Record affected users
   ```

**Recovery (1-24 hours):**

1. **Restore Service**
   ```
   → Deploy with new keys
   → Test all functionality
   → Monitor for issues
   ```

2. **Notify (if needed)**
   ```
   → Email affected users
   → Post status update
   → Social media announcement
   ```

3. **Post-Mortem**
   ```
   → Document what happened
   → How they got in
   → What was accessed
   → Prevention steps
   ```

---

## ✅ Security Checklist

### Before Launch

- [ ] All env vars in Vercel (never in code)
- [ ] Rate limiting enabled on mint API
- [ ] Daily mint limits per user
- [ ] File size validation
- [ ] Platform cost limits
- [ ] Wallet backed up (3 locations)
- [ ] Firebase security rules deployed
- [ ] Vercel authentication enabled
- [ ] 2FA on all accounts (Vercel, Firebase, GitHub)
- [ ] Security cron job configured
- [ ] Alert webhook configured
- [ ] Tested with testnet wallet

### Weekly

- [ ] Check Arweave wallet balance
- [ ] Review unusual mint activity
- [ ] Check error logs
- [ ] Verify backups working

### Monthly

- [ ] Review Vercel access logs
- [ ] Update dependencies
- [ ] Check for security advisories
- [ ] Test backup restore
- [ ] Review cost trends

### Quarterly

- [ ] Rotate API keys
- [ ] Rotate Arweave wallet
- [ ] Security audit
- [ ] Review team access
- [ ] Update incident response plan

---

## 📞 Emergency Contacts

**Add these NOW:**

```
Vercel Support: https://vercel.com/support
Firebase Support: https://firebase.google.com/support
GitHub Security: security@github.com

Your Contacts:
- Primary Admin: [YOUR EMAIL]
- Secondary Admin: [BACKUP EMAIL]
- Alert Webhook: [SLACK/DISCORD URL]
```

---

## 🎯 Summary

**Your platform is now protected with:**

✅ Rate limiting (prevents spam)
✅ Cost limits (prevents wallet drain)
✅ Wallet security (multiple backups)
✅ Monitoring (alerts for issues)
✅ Access control (team permissions)
✅ Incident response plan (ready for breaches)

**Next:** Review `BACKUP_RECOVERY.md` for data protection

**You're iron clad. Deploy with confidence.** 🛡️
