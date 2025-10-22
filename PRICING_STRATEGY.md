# 💰 Neural Salvage - Pricing Strategy & Cost Recovery

## 📊 Your Operating Costs

### Monthly Infrastructure Costs (Estimated)

**Based on 1,000 active users:**

| Service | Cost | What It Covers |
|---------|------|----------------|
| **Vercel Pro** | $20/mo | Hosting, serverless functions, bandwidth |
| **Daytona** | $50-200/mo | AI processing sandboxes, depends on usage |
| **OpenAI API** | $50-150/mo | GPT-4 vision, embeddings, depends on volume |
| **Firebase** | $25-100/mo | Auth, Firestore, Storage (pay-as-you-go) |
| **Qdrant Cloud** | FREE-$50/mo | Vector search, depends on data size |
| **Stripe** | 2.9% + $0.30 | Per transaction (comes from platform fee) |
| **Total** | **$145-520/mo** | Scales with usage |

---

## 💡 Revenue Strategies to Cover Costs

### **Option 1: Marketplace Commission Only** (Current Setup)

**How it works:**
- Free to use (upload, search, organize)
- **10% commission on sales**
- Zero subscription fees

**Pros:**
- ✅ Easy user acquisition (free to start)
- ✅ Only profitable users pay
- ✅ Simple to explain

**Cons:**
- ❌ Heavy users cost you money if they don't sell
- ❌ Unpredictable revenue

**Best for:** Getting started, building user base

---

### **Option 2: Freemium with AI Limits** (Recommended)

**Free Tier:**
- 100 AI analyses/month
- 10 GB storage
- Basic search
- 10% marketplace commission

**Pro Tier ($9.99/month):**
- 1,000 AI analyses/month
- 100 GB storage
- Advanced search (semantic)
- Priority processing
- 8% marketplace commission

**Enterprise ($49/month):**
- Unlimited AI analyses
- 1 TB storage
- API access
- White-label options
- 5% marketplace commission

**Why this works:**
- ✅ Covers Qdrant/AI costs from heavy users
- ✅ Most users stay free (acquisition)
- ✅ Power users subsidize infrastructure
- ✅ Predictable recurring revenue

**Cost recovery math:**
- 100 Pro users × $10 = $1,000/mo
- Covers all base costs + profit
- Marketplace sales = pure profit minus platform costs

---

### **Option 3: AI Processing Fees** (Pay-Per-Use)

**How it works:**
- Free uploads/storage
- **$0.05 per AI analysis**
- 10% marketplace commission

**Pricing tiers:**
- Buy 20 credits: $1 ($0.05 each)
- Buy 100 credits: $4 ($0.04 each)
- Buy 500 credits: $15 ($0.03 each)

**Pros:**
- ✅ Direct cost pass-through
- ✅ Heavy users pay more
- ✅ Fair pricing

**Cons:**
- ❌ Friction for users
- ❌ More complex billing

**Best for:** B2B/professional users

---

### **Option 4: Hybrid Model** (Best Long-Term)

**Combine subscription + marketplace:**

| Feature | Free | Pro ($9.99/mo) | Enterprise ($49/mo) |
|---------|------|----------------|---------------------|
| Storage | 10 GB | 100 GB | 1 TB |
| AI Analyses | 100/mo | 1,000/mo | Unlimited |
| Marketplace Fee | 10% | 8% | 5% |
| Search | Basic | Advanced | API Access |
| Support | Community | Email | Priority |
| Qdrant Included | ✅ | ✅ | ✅ |

**Revenue streams:**
1. Subscriptions (predictable)
2. Marketplace fees (variable)
3. API access (enterprise)

**Cost coverage:**
- Free users: Covered by limits (100 AI/month = ~$2 cost)
- Pro users: $10 fee covers ~$5 cost, profit on rest
- Enterprise: High margin, white-label opportunities

---

## 🔢 Qdrant Cost Breakdown

### **Qdrant Cloud Pricing:**

**Free Tier:**
- 1 GB storage
- 100,000 vectors
- Good for ~5,000 users

**Starter ($25/mo):**
- 5 GB storage
- 500,000 vectors
- ~25,000 users

**Growth ($100/mo):**
- 20 GB storage
- 2M vectors
- ~100,000 users

### **Your Costs Per User:**

Assuming:
- Average user uploads 20 assets
- Each asset = 1 vector (1536 dimensions)
- ~4KB per vector

**Math:**
- 1,000 users × 20 assets = 20,000 vectors
- 20,000 × 4KB = 80 MB
- **Cost: FREE tier** ✅

**At scale (10,000 users):**
- 200,000 vectors = ~800 MB
- **Cost: Still FREE** ✅

**Heavy usage (100,000 users):**
- 2M vectors = ~8 GB
- **Cost: ~$25-50/mo**
- **Revenue from 100 Pro users: $1,000/mo**
- **Profit margin: 95%+** ✅

---

## 📈 Recommended Pricing Strategy

### **Phase 1: Launch (First 1,000 users)**

**Free for everyone:**
- No subscription
- 10% marketplace fee only
- Build user base
- Get feedback

**Why:**
- ✅ Qdrant costs = $0 (free tier)
- ✅ Focus on product-market fit
- ✅ User acquisition

---

### **Phase 2: Growth (1,000-10,000 users)**

**Introduce Pro tier:**
- Keep free tier (100 AI/month limit)
- Launch Pro ($9.99/mo) for power users
- Reduce Pro marketplace fee to 8%

**Expected revenue:**
- 1% convert to Pro = 100 users
- 100 × $10 = $1,000/mo
- Marketplace sales = $500-2,000/mo
- **Total: $1,500-3,000/mo**

**Costs:**
- Qdrant: $0 (still free tier)
- Other infrastructure: ~$200-400/mo
- **Profit: $1,100-2,600/mo** ✅

---

### **Phase 3: Scale (10,000+ users)**

**Full freemium model:**
- Free: 50 AI/month (reduced)
- Pro: $9.99/mo (1,000 AI/month)
- Teams: $29/mo per user (unlimited)
- Enterprise: Custom pricing

**Revenue at 50,000 users:**
- 2% convert to Pro = 1,000 users × $10 = $10,000/mo
- Marketplace = $5,000-15,000/mo
- **Total: $15,000-25,000/mo**

**Costs:**
- Infrastructure: $500-1,500/mo
- **Profit: $13,500-23,500/mo** ✅

---

## 🎯 Implementation: Add Usage Limits

Let me create a simple usage tracking system:

### **1. Track AI Usage**

Already implemented! In your user document:
```typescript
aiUsage: {
  current: 0,      // This month
  limit: 100,      // Free tier limit
  resetDate: Date  // Monthly reset
}
```

### **2. Enforce Limits**

In `/api/ai/analyze`:
```typescript
// Check if user is over limit
if (user.aiUsage.current >= user.aiUsage.limit && user.plan === 'free') {
  return NextResponse.json({
    error: 'AI analysis limit reached. Upgrade to Pro for more.',
    upgradeUrl: '/pricing'
  }, { status: 402 }); // 402 = Payment Required
}
```

### **3. Reset Monthly**

Create a cron job (Vercel Cron):
```typescript
// /api/cron/reset-usage
// Runs monthly
export async function GET() {
  const users = await adminDb().collection('users').get();
  
  for (const user of users.docs) {
    await user.ref.update({
      'aiUsage.current': 0,
      'aiUsage.resetDate': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  }
}
```

---

## 💳 Stripe Subscription Setup

### **Environment Variables Needed:**

Add to Vercel:
```env
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_QsjU9E5QElt7WYTqwifCZD1iGtmgzbjY
PLATFORM_FEE_PERCENTAGE=10

# Optional: For subscriptions
STRIPE_PRO_PRICE_ID=price_xxx  # Create in Stripe Dashboard
```

### **Subscription Flow:**

1. User clicks "Upgrade to Pro"
2. Redirects to Stripe Checkout
3. Creates subscription
4. Webhook updates user plan
5. New AI limits apply immediately

---

## 📊 Recommended Pricing (Launch)

### **Best Starting Strategy:**

**Free Forever:**
- ✅ Unlimited uploads
- ✅ 100 AI analyses/month
- ✅ 10 GB storage
- ✅ Basic search
- ✅ 10% marketplace fee

**Pro ($9.99/month):**
- ✅ Everything in Free
- ✅ 1,000 AI analyses/month
- ✅ 100 GB storage
- ✅ Advanced semantic search
- ✅ Priority processing
- ✅ **8% marketplace fee** (save 2%)

**Why this works:**
1. **Free tier is generous** → Easy user acquisition
2. **Qdrant costs covered** → Free tier stays within limits
3. **Pro tier attractive** → Power users see value
4. **Marketplace incentive** → Lower fee for subscribers
5. **Predictable costs** → Usage limits prevent abuse

---

## 🚀 Next Steps

### **Immediate (Before Public Launch):**
1. ✅ Add webhook secret to Vercel
2. ✅ Set PLATFORM_FEE_PERCENTAGE=10
3. ⏳ Test marketplace flow with test cards
4. ⏳ Create Stripe subscription products (when ready)

### **Phase 1 (0-1K users):**
- Keep everything free
- Monitor costs
- Gather feedback
- No usage limits yet

### **Phase 2 (1K-10K users):**
- Introduce Pro tier
- Add AI usage limits
- Enable subscriptions
- Monitor conversion rates

### **Phase 3 (10K+ users):**
- Full freemium model
- Enterprise tier
- API access
- White-label options

---

## 💰 Cost Summary

**Current Setup (Free Qdrant):**
- Up to 5,000 users = $0 Qdrant cost
- Other costs = $145-300/mo
- Need ~30 Pro subscribers to break even
- Marketplace revenue = bonus

**At Scale (100K users):**
- Qdrant = ~$50/mo
- Other costs = $500/mo
- Revenue from 2% Pro conversion = $20,000/mo
- **Profit margin: 97%** ✅

**Qdrant is NOT a concern** - it's one of your cheapest services!

---

## ✅ Recommendation

**Start with:**
1. Free tier (100 AI/month)
2. 10% marketplace fee
3. No subscriptions yet
4. Monitor usage

**When you hit 1,000 users:**
1. Add Pro tier ($9.99/mo)
2. Reduce Pro marketplace fee to 8%
3. Keep free tier generous

**Qdrant will cost you $0 until ~50,000 users.**

By then, you'll have plenty of revenue to cover it! 🚀
