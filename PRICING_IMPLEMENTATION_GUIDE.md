# 🔧 Pricing System Implementation Guide

**Status:** Partially Implemented - Core pricing working, integration incomplete

---

## ✅ **COMPLETED (Committed & Working)**

### **1. Core Pricing Logic** ✅
```
✅ lib/utils/pricing.ts - File-size-based tiers ($3.99-$29.99)
✅ lib/utils/betaAccess.ts - Beta user helper functions
✅ types/index.ts - Updated User type with beta fields
✅ app/pricing/page.tsx - Updated pricing page UI
```

### **2. NFT Minting Pricing** ✅ **JUST FIXED!**
```
✅ app/api/nft/estimate/route.ts - Uses new calculateMintPrice()
✅ components/nft/MintNFTModal.tsx - Displays correct prices
✅ Pricing tiers working:
   - 0-10 MB = $3.99
   - 10-50 MB = $5.99
   - 50-100 MB = $9.99
   - 100-250 MB = $17.99
   - 250-500 MB = $29.99
```

### **3. Beta Access System** ✅
```
✅ app/api/admin/grant-beta/route.ts - Admin API for granting beta
✅ components/beta/BetaSavingsCalculator.tsx - Shows beta user value
✅ BETA_ACCESS_GUIDE.md - Complete documentation
```

### **4. Documentation** ✅
```
✅ PRICING_BUSINESS_MODEL.md - Business model & projections
✅ BETA_ACCESS_GUIDE.md - Beta access system guide
✅ AR_BALANCE_MONITORING.md - AR monitoring setup
✅ NFT_MARKETPLACE_TRANSACTIONS.md - Marketplace guide
```

---

## ❌ **NOT YET IMPLEMENTED**

### **1. Payment Checkout Integration**
**File:** `app/api/payment/create-checkout/route.ts`

**Status:** Needs beta user checking

**What's Missing:**
```typescript
// Current: Doesn't check for beta users
// Need to add:

import { isBetaUser } from '@/lib/utils/betaAccess';

// In create-checkout route:
const userDoc = await adminDb().collection('users').doc(userId).get();
const user = userDoc.data();

// Check if beta user
if (isBetaUser(user)) {
  return NextResponse.json({
    isBetaUser: true,
    message: 'Beta user - free access',
    // Skip Stripe checkout
  });
}

// Otherwise proceed with Stripe checkout
```

**Priority:** HIGH - Beta users will be charged without this!

---

### **2. Subscription Tier Checking**
**Files:** Various API routes that check user limits

**Status:** Not checking subscription tiers for discounts

**What's Missing:**
```typescript
// In mint API and other premium features:

import { canMintNFT } from '@/lib/utils/betaAccess';
import { calculateSubscriberPrice } from '@/lib/utils/pricing';

// Check if user has free mints
const { canMint, isFree, reason } = canMintNFT(user, fileSize);

if (isFree) {
  // Proceed without payment
} else if (user.subscriptionTier !== 'free') {
  // Apply subscriber discount
  const pricing = calculateSubscriberPrice(fileSize, getSubscriptionTier(user.subscriptionTier));
  // Charge pricing.finalPrice instead of full price
}
```

**Affected Routes:**
- `app/api/payment/create-checkout/route.ts`
- `app/api/ai/analyze/route.ts` (if you have AI limits)
- `app/api/ai/cover-art/route.ts` (if you have cover art limits)

**Priority:** MEDIUM - Subscribers won't get discounts

---

### **3. User Dashboard Beta Calculator**
**Status:** Component exists but not integrated

**What's Missing:**
```typescript
// In your user dashboard page:

import { BetaSavingsCalculator } from '@/components/beta/BetaSavingsCalculator';

// Add to dashboard:
{user?.betaAccess && (
  <BetaSavingsCalculator user={user} />
)}
```

**Files to Update:**
- `app/dashboard/page.tsx` (or wherever user dashboard is)
- `app/profile/page.tsx` (if you have a profile page)

**Priority:** LOW - Nice to have, not critical

---

### **4. Subscription Purchase Flow**
**Status:** Not implemented

**What's Missing:**
- Stripe subscription product setup
- Subscription checkout page
- Webhook handling for subscription events
- Monthly usage reset logic

**Files Needed:**
```
app/api/subscription/create-checkout/route.ts
app/api/subscription/webhook/route.ts
app/api/subscription/cancel/route.ts
components/subscription/SubscriptionUpgrade.tsx
```

**Priority:** LOW - Can launch without subscriptions (pay-per-mint works)

---

### **5. Monthly Usage Tracking**
**Status:** User type has fields, but not tracked

**What's Missing:**
```typescript
// In mint API after successful mint:
await adminDb().collection('users').doc(userId).update({
  'monthlyUsage.mintsUsed': admin.firestore.FieldValue.increment(1),
  'monthlyUsage.period': getCurrentMonthKey(), // 'YYYY-MM'
});

// In AI analysis API:
await adminDb().collection('users').doc(userId).update({
  'monthlyUsage.aiAnalysisUsed': admin.firestore.FieldValue.increment(1),
});

// In cover art API:
await adminDb().collection('users').doc(userId).update({
  'monthlyUsage.coverArtUsed': admin.firestore.FieldValue.increment(1),
});
```

**Priority:** MEDIUM - Needed for subscription limits

---

### **6. AR Balance Monitoring**
**Status:** Code exists, not deployed

**What's Missing:**
```bash
# 1. Set environment variables in Vercel:
CRON_SECRET=create-a-random-secret-here
ADMIN_EMAILS=your-email@domain.com

# 2. Setup Vercel Cron Job:
Vercel Dashboard → Cron Jobs → Add:
  URL: /api/cron/monitor-ar-balance?secret=YOUR_SECRET
  Schedule: 0 12 * * * (daily at noon)
```

**Priority:** HIGH - You need this to avoid running out of AR!

---

## 🚀 **QUICK START GUIDE**

### **Step 1: Test Current Pricing** (5 minutes)

```bash
# 1. Run your dev server
npm run dev

# 2. Upload a 10 MB file
# 3. Click "Mint NFT"
# 4. Check price shown - should be $3.99 ✅

# 5. Upload a 100 MB file
# 6. Click "Mint NFT"  
# 7. Check price shown - should be $9.99 ✅
```

**Expected Result:** Pricing now shows correct tiered amounts!

---

### **Step 2: Add Beta User Checking to Checkout** (15 minutes)

**File:** `app/api/payment/create-checkout/route.ts`

**Find this section and add beta checking:**

```typescript
export async function POST(request: NextRequest) {
  try {
    const { type, assetId, userId, price } = await request.json();

    // GET USER DATA
    const userDoc = await adminDb().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const user = userDoc.data();

    // CHECK FOR BETA ACCESS ← ADD THIS!
    if (user?.betaAccess === true || user?.isBetaUser === true) {
      console.log('✅ [CHECKOUT] Beta user detected - free access granted');
      return NextResponse.json({
        isBetaUser: true,
        isPro: false,
        freeMintUsed: true, // Trigger free mint flow
        message: 'Beta access - unlimited free mints'
      });
    }

    // CHECK SUBSCRIPTION TIER ← ADD THIS!
    const subscriptionTier = user?.subscriptionTier || 'free';
    const monthlyUsage = user?.monthlyUsage || { mintsUsed: 0 };

    // If they have a subscription with free mints left
    if (subscriptionTier !== 'free') {
      const tier = getSubscriptionTier(subscriptionTier);
      if (monthlyUsage.mintsUsed < tier.freeMints) {
        console.log(`✅ [CHECKOUT] ${tier.name} user - free mint available`);
        return NextResponse.json({
          isBetaUser: false,
          isPro: true,
          freeMintUsed: true,
          message: `${tier.name} tier - free mint ${monthlyUsage.mintsUsed + 1}/${tier.freeMints}`
        });
      }
    }

    // Otherwise create Stripe checkout (existing code)
    // ... rest of your checkout logic
  }
}
```

**Import needed:**
```typescript
import { getSubscriptionTier } from '@/lib/utils/pricing';
```

---

### **Step 3: Setup AR Monitoring** (10 minutes)

**1. Add Environment Variables in Vercel:**
```
CRON_SECRET=make-this-a-random-secret-min-32-chars
ADMIN_EMAILS=your-email@domain.com
```

**2. Setup Vercel Cron Job:**
```
1. Go to Vercel Dashboard → Your Project
2. Settings → Cron Jobs
3. Add Cron Job:
   Path: /api/cron/monitor-ar-balance?secret=YOUR_CRON_SECRET
   Schedule: 0 12 * * * (daily at noon UTC)
```

**3. Test Manually:**
```bash
# Get your Firebase auth token (browser console):
firebase.auth().currentUser.getIdToken().then(console.log)

# Test the endpoint:
curl -X GET "https://your-app.vercel.app/api/admin/ar-balance" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### **Step 4: Grant Your First Beta User** (2 minutes)

**Via Firebase Console:**
```
1. Go to Firebase Console → Firestore
2. Find users collection → Find your user
3. Click Edit Document
4. Add these fields:
   betaAccess: true (boolean)
   betaGrantedAt: [Current timestamp]
   betaGrantedBy: "your-email@domain.com" (string)
   betaReason: "testing" (string)
   subscriptionTier: "beta" (string)
5. Save
```

**Test it:**
```
1. Log in as that user
2. Try to mint an NFT
3. Should show "FREE with beta access" ✅
```

---

### **Step 5: Add Usage Tracking** (20 minutes)

**File:** `app/api/nft/mint/route.ts`

**After successful mint, add:**

```typescript
// At the top:
function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// After successful mint:
await adminDb().collection('users').doc(userId).update({
  'monthlyUsage.mintsUsed': admin.firestore.FieldValue.increment(1),
  'monthlyUsage.period': getCurrentMonthKey(),
  'monthlyUsage.resetDate': new Date(now.getFullYear(), now.getMonth() + 1, 1),
  updatedAt: admin.firestore.Timestamp.now()
});
```

---

## 📋 **COMPLETE IMPLEMENTATION CHECKLIST**

### **Critical (Do Now)**
- [x] ✅ Update NFT estimate API with new pricing
- [x] ✅ Update MintNFTModal to show correct prices
- [ ] ❌ Add beta user checking to payment checkout
- [ ] ❌ Setup AR balance monitoring cron job
- [ ] ❌ Test pricing with different file sizes

### **Important (Do Soon)**
- [ ] ❌ Add usage tracking to mint API
- [ ] ❌ Add subscription tier discount logic
- [ ] ❌ Grant beta access to first users
- [ ] ❌ Add beta savings calculator to dashboard

### **Nice to Have (Later)**
- [ ] ❌ Build subscription purchase flow
- [ ] ❌ Add subscription management page
- [ ] ❌ Implement monthly usage reset cron
- [ ] ❌ Build admin dashboard for beta users

---

## 🧪 **TESTING CHECKLIST**

### **Test Pricing Tiers:**
```
[ ] Upload 5 MB file → Should show $3.99
[ ] Upload 20 MB file → Should show $5.99
[ ] Upload 75 MB file → Should show $9.99
[ ] Upload 150 MB file → Should show $17.99
[ ] Upload 300 MB file → Should show $29.99
```

### **Test Beta Access:**
```
[ ] Grant beta to test user via Firebase
[ ] Login as beta user
[ ] Try to mint NFT → Should be FREE
[ ] Check that payment is skipped
[ ] Verify NFT mints successfully
```

### **Test AR Monitoring:**
```
[ ] Set CRON_SECRET env var
[ ] Set ADMIN_EMAILS env var
[ ] Call /api/admin/ar-balance manually
[ ] Verify balance shows correctly
[ ] Setup Vercel cron job
```

---

## 🐛 **TROUBLESHOOTING**

### **"Pricing still shows old amounts"**
```
1. Hard refresh browser (Ctrl+Shift+R)
2. Check estimate API response in Network tab
3. Verify calculateMintPrice is imported
4. Check for TypeScript errors in terminal
```

### **"Beta user still being charged"**
```
1. Check Firebase - verify betaAccess: true
2. Check payment checkout API logs
3. Add console.log to see if beta check runs
4. Make sure isBetaUser function is imported
```

### **"AR balance not updating"**
```
1. Verify ARWEAVE_PRIVATE_KEY is set
2. Check Bundlr node is working (https://bundlr.network/status)
3. Test balance API manually with curl
4. Check Vercel function logs
```

---

## 📊 **CURRENT STATUS SUMMARY**

```
WORKING:
✅ File-size-based pricing ($3.99-$29.99)
✅ NFT estimate API returns correct prices
✅ MintNFTModal displays correct prices
✅ Beta access helper functions
✅ AR balance monitoring code

NOT WORKING YET:
❌ Beta users will still be charged (needs checkout update)
❌ Subscribers won't get discounts (needs tier checking)
❌ Usage not tracked (needs increment logic)
❌ AR monitoring not running (needs cron setup)
❌ Beta calculator not visible (needs dashboard integration)

DEPLOYMENT STATUS:
✅ Pricing logic - Committed & pushed
✅ Estimate API fix - Committed & pushed
✅ Modal updates - Committed & pushed
❌ Payment integration - Not implemented
❌ AR monitoring cron - Not deployed
❌ Usage tracking - Not implemented
```

---

## 🎯 **RECOMMENDED ORDER**

**Today (30 minutes):**
1. ✅ Add beta checking to payment checkout ← Most critical!
2. ✅ Test with a beta user
3. ✅ Setup AR monitoring cron job

**This Week:**
4. ❌ Add usage tracking to mint API
5. ❌ Grant beta to first 5-10 users
6. ❌ Test pricing tiers thoroughly

**Next Week:**
7. ❌ Build subscription purchase flow
8. ❌ Add beta calculator to dashboard
9. ❌ Launch to more users!

---

## 💡 **QUICK REFERENCE**

### **Important Functions:**
```typescript
// Check if user is beta
import { isBetaUser } from '@/lib/utils/betaAccess';
if (isBetaUser(user)) { /* free access */ }

// Calculate pricing
import { calculateMintPrice } from '@/lib/utils/pricing';
const pricing = calculateMintPrice(fileSize);
// pricing.totalPrice = final price

// Get subscription tier
import { getSubscriptionTier } from '@/lib/utils/pricing';
const tier = getSubscriptionTier(user.subscriptionTier);

// Check if mint is free
import { canMintNFT } from '@/lib/utils/betaAccess';
const { canMint, isFree, reason } = canMintNFT(user, fileSize);
```

---

## 🆘 **NEED HELP?**

Check these files:
- `PRICING_BUSINESS_MODEL.md` - Business model & revenue
- `BETA_ACCESS_GUIDE.md` - Beta system complete guide
- `AR_BALANCE_MONITORING.md` - AR monitoring setup
- `NFT_MARKETPLACE_TRANSACTIONS.md` - Marketplace planning

---

**Last Updated:** November 8, 2025  
**Status:** Core pricing working, integration in progress
