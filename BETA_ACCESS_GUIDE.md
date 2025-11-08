# ✨ Beta Access System - Complete Guide

**Purpose:** Give select users 100% free access to all paid features while maintaining control.

---

## 🎯 **What Beta Users Get**

### **UNLIMITED Everything - 100% FREE**

```
✅ UNLIMITED NFT mints (any file size)
✅ UNLIMITED AI analyses
✅ UNLIMITED cover art generation
✅ All file sizes supported (up to 500 MB)
✅ Priority support
✅ Early access to features
✅ Beta tester badge
✅ No credit card required
✅ Lifetime access (while beta program active)
```

**Value:** ~$500+/month if they were paying!

---

## 👥 **Who Should Get Beta Access?**

### Recommended Candidates

- **Seed Investors** - They funded your vision
- **Early Supporters** - Active community members
- **Content Partners** - Musicians, artists who will create buzz
- **Family/Friends** - Close personal connections
- **Advisors** - People providing strategic guidance
- **Beta Testers** - Active bug reporters

### DO NOT Give Beta Access To:

- ❌ Random users asking for free stuff
- ❌ People you don't know personally
- ❌ Users who haven't proven value
- ❌ Competitors or resellers

---

## 🔧 **How to Grant Beta Access**

### Method 1: Firebase Console (Manual - Easiest)

1. **Go to Firebase Console**
   - https://console.firebase.google.com
   - Select your project

2. **Navigate to Firestore**
   - Firestore Database → `users` collection

3. **Find the user**
   - Search by email or browse

4. **Edit the user document**
   - Click the user document
   - Click "Edit" or "+ Add field"

5. **Add beta fields:**
   ```
   betaAccess: true (boolean)
   betaGrantedAt: [Current timestamp]
   betaGrantedBy: "admin@yourcompany.com" (string)
   betaReason: "seed_investor" (string)
   betaNotes: "Lifetime access for early support" (string)
   subscriptionTier: "beta" (string)
   ```

6. **Save** - Done! ✅

### Method 2: Admin API (Programmatic)

**Setup:**
1. Add your email to `ADMIN_EMAILS` env var:
   ```bash
   ADMIN_EMAILS=your-email@domain.com,another-admin@domain.com
   ```

2. Get your Firebase auth token (from browser):
   ```javascript
   // In browser console on your site:
   firebase.auth().currentUser.getIdToken().then(console.log)
   ```

**Grant Beta:**
```bash
curl -X POST "https://your-app.vercel.app/api/admin/grant-beta" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "user@example.com",
    "reason": "seed_investor",
    "notes": "Lifetime access - early supporter"
  }'
```

**Revoke Beta:**
```bash
curl -X DELETE "https://your-app.vercel.app/api/admin/grant-beta" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "user@example.com"
  }'
```

---

## 🔐 **Security & Protection**

### Firestore Security Rules

**Already protected!** Users CANNOT grant themselves beta access.

```javascript
// In firestore.rules:
match /users/{userId} {
  allow update: if request.auth.uid == userId
    && !request.resource.data.diff(resource.data).affectedKeys().hasAny([
      'betaAccess',
      'betaGrantedAt',
      'betaGrantedBy',
      'subscriptionTier'
    ]);
}
```

Only **server-side Admin SDK** can modify beta fields!

### Admin Email Protection

```typescript
// Only these emails can grant beta
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || [];
```

**Set in Vercel env vars:**
```bash
ADMIN_EMAILS=your-email@domain.com,trusted-admin@domain.com
```

---

## 📊 **How Beta Access Works**

### Backend Checks

```typescript
import { isBetaUser } from '@/lib/utils/betaAccess';

// In API routes:
if (isBetaUser(user)) {
  // Beta user - everything is FREE!
  return mintNFTForFree(user);
}

// In minting logic:
const { canMint, isFree, reason } = canMintNFT(user, fileSize);
// Beta users: { canMint: true, isFree: true, reason: "Beta access - unlimited free mints" }
```

### Frontend Display

```typescript
// components/BetaBadge.tsx
{user?.betaAccess && (
  <div className="bg-purple-500 text-white px-3 py-1 rounded-full">
    ✨ BETA ACCESS
  </div>
)}
```

### Pricing Page Behavior

Beta users see:
```
┌──────────────────────────────────┐
│  ✨ You Have Beta Access          │
│                                  │
│  All Features FREE               │
│  • Unlimited mints               │
│  • Unlimited AI                  │
│  • Priority support              │
│                                  │
│  [Go to Dashboard]               │
└──────────────────────────────────┘
```

---

## 🎨 **User Experience**

### What Beta Users See

1. **Dashboard Badge:**
   ```
   ✨ BETA TESTER
   You have unlimited access to all features!
   ```

2. **Mint Modal:**
   ```
   File: song.mp3 (5 MB)
   Price: FREE with your beta access!
   [Mint NFT] (no payment required)
   ```

3. **AI Features:**
   ```
   AI Analysis: Unlimited ✅
   Cover Art: Unlimited ✅
   No monthly limits!
   ```

4. **Beta Savings Calculator:**
   ```
   🎉 Your Beta Savings This Month: $247.56
   
   This Month's Activity:
   - 15 NFTs minted
   - 42 AI analyses
   - 18 cover arts
   
   What This Would Cost:
   - NFT Minting: $59.85 (15 × $3.99)
   - AI Analysis: $63.68 (32 × $1.99)
   - Cover Art: $64.87 (13 × $4.99)
   - Subscription Equivalent: Pro Tier ($34.99/mo)
   
   💬 Feedback Questions:
   - Would you pay $247.56 for this usage?
   - Is the Pro subscription ($34.99/mo) fair?
   - What's reasonable for 15 NFT mints?
   ```
   
   **Component:** `<BetaSavingsCalculator user={user} />`
   
   **Purpose:** 
   - Show beta users real value they're getting
   - Collect pricing feedback
   - Help you refine pricing model

5. **Marketplace:**
   - Can sell NFTs normally
   - Receives 93% of sale price (you get 2% + 3% creator royalty)
   - No special treatment on sales (they're the seller)

---

## 📋 **Beta User Tracking**

### Firestore Fields

```typescript
{
  email: "user@example.com",
  betaAccess: true,                    // MAIN FLAG
  betaGrantedAt: "2025-11-08T12:00:00Z",
  betaGrantedBy: "admin@yourcompany.com",
  betaReason: "seed_investor",         // Why they have beta
  betaNotes: "Lifetime access",        // Optional notes
  subscriptionTier: "beta",            // Tier for logic
  
  // Usage tracking (still tracked, just not limited)
  monthlyUsage: {
    mintsUsed: 15,        // Tracked but no limit
    aiAnalysisUsed: 50,   // Tracked but no limit
    coverArtUsed: 20,     // Tracked but no limit
  }
}
```

### View All Beta Users

**In Firebase Console:**
1. Firestore → `users` collection
2. Filter: `betaAccess == true`
3. See all beta users and their details

**Via API** (coming soon):
```bash
GET /api/admin/beta-users
```

---

## 💡 **Beta Reasons**

Use these standard codes for `betaReason`:

| Code | Meaning | Notes |
|------|---------|-------|
| `seed_investor` | Financial backer | Lifetime access |
| `early_supporter` | Community contributor | Lifetime access |
| `content_partner` | Artist/creator partnership | Review quarterly |
| `advisor` | Strategic advisor | Lifetime access |
| `family_friend` | Personal connection | Lifetime access |
| `beta_tester` | Active bug reporter | Duration: 6 months |
| `influencer` | Marketing partnership | Review after campaign |
| `team_member` | Employee/contractor | Active employment only |

---

## ⏰ **Duration & Revocation**

### Lifetime vs. Temporary

**Lifetime Access** (Never revoke unless abuse):
- Seed investors
- Family/friends
- Advisors
- Early supporters who were critical

**Temporary/Conditional** (Review periodically):
- Beta testers (6 months)
- Influencers (campaign duration)
- Content partners (quarterly review)
- Team members (employment duration)

### How to Revoke

**Firebase Console:**
1. Find user in Firestore
2. Edit document
3. Set `betaAccess: false`
4. Add `betaRevokedAt: [timestamp]`
5. Add `betaRevokedBy: "admin@yourcompany.com"`
6. Add `betaRevocationReason: "reason here"`
7. Change `subscriptionTier: "free"`

**Via API:**
```bash
curl -X DELETE "https://your-app.vercel.app/api/admin/grant-beta" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"userEmail": "user@example.com"}'
```

---

## 📈 **Beta Program Economics**

### Cost Analysis

**Per Beta User Monthly Cost:**
```
Assume active beta user mints 20 NFTs/month:
- AR cost: 20 × $0.05 = $1.00/month
- AI costs: ~$2.00/month (OpenAI)
Total cost: ~$3/month per active beta user
```

**Revenue Foregone:**
```
If they paid Creator tier: $12.99/month
Your cost: $3/month
Net "cost": $9.99/month per beta user
```

### Recommended Limits

- **Max Beta Users:** 20-50 users
- **Max Monthly Cost:** $60-150 (AR + AI)
- **% of Total Users:** Keep <5% of user base

### ROI Considerations

**Beta users provide:**
- ✅ Product feedback (worth $$$)
- ✅ Word-of-mouth marketing (invaluable)
- ✅ Content creation (fills marketplace)
- ✅ Bug reports (saves dev time)
- ✅ Social proof (legitimacy)

**Worth the cost? YES!** (if chosen wisely)

---

## 🎯 **Best Practices**

### DO:
✅ Be selective - quality over quantity
✅ Document WHY each person has beta
✅ Set clear expectations upfront
✅ Review beta list quarterly
✅ Thank beta users publicly
✅ Ask for feedback regularly

### DON'T:
❌ Give beta to random requesters
❌ Promise "lifetime" to everyone
❌ Forget to track who has access
❌ Let beta users abuse the system
❌ Hide the beta program (own it!)

---

## 🔔 **Monitoring Beta Usage**

### Check Beta User Activity

```typescript
// Get all beta users with high usage
const betaUsers = await adminDb()
  .collection('users')
  .where('betaAccess', '==', true)
  .get();

betaUsers.forEach(doc => {
  const data = doc.data();
  console.log(`${data.email}: ${data.monthlyUsage.mintsUsed} mints this month`);
});
```

### Warning Signs (Possible Abuse)

- 🚩 100+ mints per month (unless content partner)
- 🚩 Selling NFTs but not engaging with platform
- 🚩 Creating low-quality spam content
- 🚩 Sharing account with others

**Action:** Contact user → Warning → Revoke if continues

---

## 📧 **Communication Templates**

### Granting Beta Access

```
Subject: Welcome to Neural Salvage Beta Program! ✨

Hi [Name],

Great news! You've been granted beta access to Neural Salvage as a [reason - e.g., "seed investor"].

What this means:
• UNLIMITED NFT mints (any file size)
• UNLIMITED AI features
• Priority support
• Early access to new features
• 100% FREE - no credit card needed

Your account has been upgraded. Just log in and start creating!

Questions? Reply to this email.

Welcome aboard!
[Your Name]
```

### Revoking Beta Access

```
Subject: Neural Salvage Beta Program Update

Hi [Name],

Thank you for participating in our beta program! As we transition out of beta, we're moving users to our standard plans.

Your beta access will end on [date]. After that, you can:
1. Continue with our Free tier
2. Upgrade to Creator ($12.99/mo) - 5 free mints/month
3. Upgrade to Pro ($34.99/mo) - 20 free mints + unlimited AI

As a thank you for your beta participation, we're offering you 50% off any paid plan for your first 3 months! Use code: BETA50

Questions? Let me know.

Thanks for your support!
[Your Name]
```

---

## ✅ **Action Checklist**

### Initial Setup
- [ ] Add your email to `ADMIN_EMAILS` env var
- [ ] Test granting beta via Firebase Console
- [ ] Test granting beta via API
- [ ] Test revoking beta
- [ ] Verify security rules prevent self-granting

### For Each Beta User
- [ ] Verify they deserve beta access
- [ ] Document reason in `betaReason`
- [ ] Add notes explaining why
- [ ] Send welcome email
- [ ] Add to beta users tracking sheet

### Monthly Review
- [ ] Check beta user activity
- [ ] Identify inactive beta users
- [ ] Review temporary beta expirations
- [ ] Calculate total beta program cost
- [ ] Adjust limits if needed

---

## 🎉 **Summary**

```
Beta Access System:
✅ Fully implemented
✅ Secure (users can't self-grant)
✅ Admin-controlled (manual or API)
✅ Tracked (reason, date, granted by)
✅ Revocable (manual or API)

Beta Users Get:
✅ Everything unlimited & FREE
✅ $500+/month value
✅ Priority access
✅ Beta badge

Your Control:
✅ Grant to anyone, anytime
✅ Revoke if needed
✅ Track all activity
✅ Set your own criteria

Cost: ~$3/user/month (AR + AI)
Benefit: Priceless feedback & marketing
```

**You're ready to build your beta community!** 🚀

---

**Last Updated:** November 8, 2025  
**Status:** ✅ System Active & Ready
