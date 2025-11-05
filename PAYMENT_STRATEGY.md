# 💰 Payment Strategy for Neural Salvage

## Current Status

### ✅ Already Built (Marketplace)
- Stripe Connect for buying/selling assets
- 10% platform fee
- Webhook handling
- Refund processing
- Production-ready

### ❌ Missing (Platform Revenue)
- NFT minting payments
- AI analysis payments  
- Subscription billing

---

## 🎯 Recommended Payment Model

### **Free Tier**
- ✅ Unlimited uploads
- ✅ Unlimited storage
- ✅ Basic gallery & collections
- ❌ 0 NFT mints
- ❌ 5 AI analyses/month

### **Pay-Per-Use**
- 💰 $0.10 per AI analysis
  - Your cost: $0.01-0.02
  - Profit: $0.08 (400% margin)
  
- 💰 $1.00 per NFT mint
  - Your cost: $0.10-0.20
  - Profit: $0.80 (400% margin)

### **Pro Plan: $9.99/month**
- ✅ Everything in Free
- ✅ Unlimited AI analyses
- ✅ 10 NFT mints/month (additional $0.50 each)
- ✅ Priority support
- ✅ Advanced search
- ✅ API access

---

## 💳 Implementation Plan

### **Phase 1: Simple One-Time Payments** (30 min)

Create `/api/payment/create-checkout` endpoint:

```typescript
// For NFT minting
POST /api/payment/create-checkout
{
  type: 'nft_mint',
  assetId: 'asset_123',
  price: 1.00
}

// For AI analysis
POST /api/payment/create-checkout
{
  type: 'ai_analysis',
  assetId: 'asset_123',
  price: 0.10
}
```

**Returns:** Stripe Checkout URL

**Flow:**
1. User clicks "Mint NFT" or "Generate AI"
2. Modal shows price + "Continue to Payment"
3. Redirects to Stripe Checkout
4. Payment success → triggers action (mint or analyze)
5. Redirects back to asset page

---

### **Phase 2: Subscription Billing** (2 hours)

Create `/api/payment/create-subscription` endpoint:

```typescript
POST /api/payment/create-subscription
{
  plan: 'pro',
  userId: 'user_123'
}
```

**Features:**
- Stripe Customer Portal (users manage their own billing)
- Automatic recurring billing
- Cancel anytime
- Usage tracking (mint count, AI count)

---

## 📊 Revenue Projections

### **Conservative (First 3 Months)**

**100 users:**
- 50 free users: $0
- 40 pay-per-use: ~$2/user/month = $80/month
- 10 pro subscribers: $9.99 × 10 = $99.90/month

**Total Revenue:** ~$180/month
**Total Costs:** ~$40/month (Firebase + API + Arweave)
**Profit:** ~$140/month

---

### **Moderate (6-12 Months)**

**1,000 users:**
- 600 free: $0
- 300 pay-per-use: ~$3/user = $900/month
- 100 pro: $999/month

**Total Revenue:** ~$1,900/month
**Total Costs:** ~$400/month
**Profit:** ~$1,500/month

---

### **Optimistic (12+ Months)**

**5,000 users:**
- 3,000 free: $0
- 1,500 pay-per-use: ~$4/user = $6,000/month
- 500 pro: $4,995/month

**Total Revenue:** ~$11,000/month
**Total Costs:** ~$2,000/month
**Profit:** ~$9,000/month

**This is "quit your job" money.** 💰

---

## 🔧 What I'll Build

### **Immediate (30 min):**

1. **NFT Mint Payment Modal**
   ```
   components/nft/MintPaymentModal.tsx
   app/api/payment/create-checkout/route.ts
   app/api/payment/success/route.ts
   ```

2. **AI Analysis Payment Modal**
   ```
   components/ai/AIPaymentModal.tsx
   (uses same API endpoints)
   ```

3. **Update MintNFTModal**
   - Add "Continue to Payment" step
   - Only mint after payment confirmed

4. **Update AI Generation Button**
   - Show price before generation
   - Only analyze after payment

---

### **Later (2 hours):**

1. **Subscription System**
   ```
   app/api/payment/create-subscription/route.ts
   app/api/webhooks/stripe/subscription.ts
   components/pricing/PricingPlans.tsx
   app/pricing/page.tsx
   ```

2. **Usage Tracking**
   - Count mints per month
   - Count AI analyses per month
   - Show usage in dashboard

3. **Customer Portal**
   - Manage subscription
   - View usage
   - Download invoices

---

## 🎯 Environment Variables Needed

**Already set (you confirmed):**
```
✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
✅ STRIPE_SECRET_KEY
✅ STRIPE_CONNECT_WEBHOOK_SECRET
```

**Need to add (for webhooks):**
```
STRIPE_WEBHOOK_SECRET (different from Connect webhook)
```

**How to get:**
1. Go to Stripe Dashboard
2. Developers → Webhooks
3. Add endpoint: `https://your-app.vercel.app/api/webhooks/stripe/standard`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy webhook secret

---

## 💡 Recommended Pricing

### **NFT Minting:**
- $1.00 per mint (400% margin)
- Show: "Permanent blockchain storage: $1"
- Users think it's cheap for "forever storage"

### **AI Analysis:**
- $0.10 per analysis (400% margin)
- Or include free in Pro plan
- Show: "AI caption + smart tags: $0.10"

### **Pro Plan:**
- $9.99/month
- Unlimited AI (save $5-10/month for heavy users)
- 10 free NFT mints (save $10/month)
- "Best value" badge
- Most users will upgrade after trying pay-per-use

---

## 🚀 Launch Strategy

**Week 1: Free Beta**
- No payments
- Get 20-50 beta testers
- Gather feedback
- Fix bugs

**Week 2: Pay-Per-Use**
- Add NFT mint payment
- Add AI payment
- Free tier still available
- Announce on Twitter/Reddit

**Week 3: Pro Plan**
- Launch subscription
- Offer 20% off first month
- "Early adopter" discount
- Email beta users

**Month 2+: Growth**
- Content marketing
- SEO optimization
- Partnerships with photographers
- Affiliate program

---

## 📈 Success Metrics

**Week 1:**
- ✅ 20 beta signups
- ✅ 5 active daily users
- ✅ 50+ assets uploaded

**Month 1:**
- ✅ 100 total users
- ✅ 10 paying customers
- ✅ $100 revenue
- ✅ Break even on costs

**Month 3:**
- ✅ 500 users
- ✅ 50 paying customers
- ✅ $500 revenue
- ✅ $300+ profit

**Month 6:**
- ✅ 2,000 users
- ✅ 200 paying customers
- ✅ $2,000 revenue
- ✅ $1,500+ profit

**Month 12:**
- ✅ 5,000 users
- ✅ 500 paying customers
- ✅ $5,000+ revenue
- ✅ $4,000+ profit

**This is realistic if you execute.** 🎯

---

## ❓ What Do You Want to Do?

**Option A: Add NFT + AI Payments Now** (30 min)
- I build the payment modals
- Wire up Stripe Checkout
- Test with real money
- Deploy today

**Option B: Launch Free Beta First** (0 min)
- Keep everything free
- Get 20-50 users
- Gather feedback
- Add payments next week

**Option C: Full Subscription System** (2-3 hours)
- Build Pro plan
- Add usage tracking
- Customer portal
- Pricing page
- Launch with 3 tiers

---

**Which option do you want?** 🚀
