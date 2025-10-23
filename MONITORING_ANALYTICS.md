# 📊 Monitoring & Analytics Setup

## Complete monitoring strategy for Neural Salvage post-launch

---

## 🎯 What to Monitor

### **1. Business Metrics (Revenue)**
```
Track:
- Daily NFT mints
- Revenue per day/week/month
- Average mint cost
- Profit margins
- User acquisition cost
- Customer lifetime value
- Churn rate
```

### **2. Technical Metrics (Performance)**
```
Track:
- API response times
- Error rates
- Uptime/downtime
- Page load speeds
- Database query performance
- Firebase usage
- Arweave transaction success rate
```

### **3. User Metrics (Engagement)**
```
Track:
- Daily/Monthly active users
- Sign-ups vs. churned users
- Upload frequency
- Mint conversion rate (uploads → mints)
- Feature usage
- User flow (where they drop off)
```

---

## 🛠️ Tools to Implement

### **1. Vercel Analytics (Built-in)**

**Setup:**
```
1. Go to: Vercel Dashboard → neural-salvage → Analytics
2. Enable Web Analytics
3. Enable Speed Insights
4. Upgrade to Pro ($20/month) for:
   - Real user monitoring
   - Core Web Vitals
   - Visitor insights
```

**What you get:**
```
✅ Page views
✅ Unique visitors
✅ Top pages
✅ Load times
✅ Real-time data
```

---

### **2. Sentry (Error Tracking)**

**Why:**
```
Catch errors before users report them
See full stack traces
Track error frequency
Monitor performance issues
```

**Setup:**

```bash
# Install
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard@latest -i nextjs
```

**Add to vercel.json:**
```json
{
  "build": {
    "env": {
      "NEXT_PUBLIC_SENTRY_DSN": "@sentry-dsn"
    }
  }
}
```

**Environment variable:**
```
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

**Cost:** Free tier (5,000 errors/month) - Enough to start

---

### **3. PostHog (Product Analytics)**

**Why:**
```
Track user behavior
Feature flag testing
Session recordings
Funnels (sign-up → upload → mint)
Retention analysis
```

**Setup:**

```bash
npm install posthog-js
```

**Add to app/layout.tsx:**
```typescript
// app/layout.tsx
import { PostHogProvider } from '@/lib/analytics/posthog-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
```

**Create provider:**
```typescript
// lib/analytics/posthog-provider.tsx
'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: 'https://app.posthog.com',
        capture_pageview: false // We'll do this manually
      });
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
```

**Track events:**
```typescript
// When user mints NFT
posthog.capture('nft_minted', {
  asset_id: assetId,
  cost: cost,
  blockchain: 'arweave',
});

// When user uploads
posthog.capture('asset_uploaded', {
  type: fileType,
  size: fileSize,
});
```

**Environment variable:**
```
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
```

**Cost:** Free tier (1M events/month) - Perfect to start

---

### **4. Firebase Analytics (User Behavior)**

**Already have Firebase! Just enable:**

```typescript
// lib/firebase/analytics.ts
import { getAnalytics, logEvent } from 'firebase/analytics';
import { app } from './client';

export const analytics = getAnalytics(app);

// Track custom events
export function trackEvent(eventName: string, params?: any) {
  logEvent(analytics, eventName, params);
}
```

**Use throughout app:**
```typescript
import { trackEvent } from '@/lib/firebase/analytics';

// Track mint
trackEvent('mint_nft', {
  asset_id: assetId,
  cost: totalCost,
});

// Track upload
trackEvent('upload_asset', {
  type: asset.type,
  size: asset.size,
});
```

**Cost:** FREE

---

### **5. Custom Revenue Dashboard**

**Create admin dashboard to track revenue:**

```typescript
// app/admin/revenue/page.tsx
import { adminDb } from '@/lib/firebase/admin';

export default async function RevenueDashboard() {
  // Get all mints this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const mints = await adminDb()
    .collection('nfts')
    .where('createdAt', '>=', startOfMonth)
    .get();

  let totalRevenue = 0;
  let totalCost = 0;

  mints.forEach(doc => {
    const nft = doc.data();
    totalRevenue += nft.userPaid || 0; // Track what user paid
    totalCost += nft.arweave?.uploadCost || 0;
  });

  const profit = totalRevenue - totalCost;
  const margin = (profit / totalRevenue) * 100;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Revenue Dashboard</h1>
      
      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          change="+12%"
        />
        <MetricCard
          title="Total Costs"
          value={`$${totalCost.toFixed(2)}`}
          change="-5%"
        />
        <MetricCard
          title="Profit"
          value={`$${profit.toFixed(2)}`}
          change="+15%"
        />
      </div>

      <div className="mt-8">
        <h2>This Month</h2>
        <p>Mints: {mints.size}</p>
        <p>Margin: {margin.toFixed(1)}%</p>
      </div>
    </div>
  );
}
```

---

### **6. Stripe Dashboard (Payment Tracking)**

**If you implement paid minting:**

Stripe already provides:
- Real-time revenue
- Customer lifetime value
- Failed payments
- Churn analytics
- Revenue recognition

**Access:** https://dashboard.stripe.com

---

### **7. Arweave Transaction Monitoring**

**Track your platform wallet:**

```typescript
// lib/monitoring/arweave-monitor.ts

export async function checkPlatformWalletBalance() {
  const bundlr = await initBundlr(process.env.ARWEAVE_PRIVATE_KEY);
  const balance = await bundlr.getLoadedBalance();
  const balanceAR = parseFloat(bundlr.utils.fromAtomic(balance));
  
  return {
    balance: balanceAR,
    lowBalance: balanceAR < 0.1, // Alert if < 0.1 AR
  };
}

// Check daily via cron
export async function dailyWalletCheck() {
  const wallet = await checkPlatformWalletBalance();
  
  if (wallet.lowBalance) {
    // Send alert (email, Slack, etc.)
    await sendAlert(`⚠️ Low AR balance: ${wallet.balance} AR`);
  }
}
```

**Add to cron job:**
```typescript
// app/api/cron/daily-checks/route.ts
export async function GET(request: NextRequest) {
  await dailyWalletCheck();
  // ... other checks
}
```

---

## 📊 Dashboard Layout (What to Track Daily)

### **Morning Dashboard Check (5 minutes)**

```
Revenue Metrics:
□ Yesterday's revenue: $___
□ NFTs minted yesterday: ___
□ New users: ___
□ Active users: ___

Technical Health:
□ Uptime: ___%
□ Error rate: ___%
□ Avg response time: ___ms
□ Failed mints: ___

Wallet Status:
□ AR balance: ___ AR
□ Estimated days remaining: ___
□ Need refill? Yes/No
```

---

## 🚨 Alerts to Set Up

### **Critical Alerts (Immediate Action)**
```
✅ Uptime < 99% (Vercel monitors this)
✅ Error rate > 5%
✅ AR wallet balance < 0.1 AR
✅ Failed payment > 10% of transactions
✅ API response time > 3 seconds
```

### **Warning Alerts (Check Within 24h)**
```
⚠️ Daily active users drops > 20%
⚠️ Mint conversion rate < 10%
⚠️ Storage usage > 80%
⚠️ Firebase costs spike > 50%
```

---

## 📈 Key Performance Indicators (KPIs)

### **Week 1 Goals:**
```
□ 50+ total mints
□ 10+ daily active users
□ < 1% error rate
□ 99%+ uptime
□ $25+ revenue
```

### **Month 1 Goals:**
```
□ 500+ total mints
□ 50+ daily active users
□ Break even ($100 revenue)
□ 5+ paying subscribers (if subscription model)
```

### **Month 3 Goals:**
```
□ 2,000+ total mints
□ 200+ daily active users
□ $500+ monthly profit
□ 50+ paying subscribers
```

### **Month 6 Goals:**
```
□ 10,000+ total mints
□ 500+ daily active users
□ $2,000+ monthly profit
□ 200+ paying subscribers
```

---

## 🛠️ Quick Setup Checklist

### **Immediate (This Week):**
- [ ] Enable Vercel Analytics
- [ ] Set up Sentry error tracking
- [ ] Add Firebase Analytics events
- [ ] Create admin revenue dashboard
- [ ] Set up wallet balance monitoring

### **Within Month 1:**
- [ ] Implement PostHog for user analytics
- [ ] Create daily metrics dashboard
- [ ] Set up email alerts
- [ ] Add Stripe if using payments
- [ ] Create weekly reports

### **Ongoing:**
- [ ] Check dashboard daily (5 min)
- [ ] Review weekly metrics
- [ ] Adjust pricing based on data
- [ ] Optimize based on user behavior
- [ ] Scale infrastructure as needed

---

## 💰 Monitoring Costs

```
Vercel Pro: $20/month (analytics + speed insights)
Sentry: Free tier → $26/month (when you scale)
PostHog: Free tier → $20/month (when you scale)
Firebase Analytics: FREE
Custom dashboards: FREE (your code)

Total: $20/month to start
Scale to: $66/month at 10,000 users
```

---

## 📞 Support Links

- **Vercel Analytics:** https://vercel.com/docs/analytics
- **Sentry Docs:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **PostHog Docs:** https://posthog.com/docs
- **Firebase Analytics:** https://firebase.google.com/docs/analytics

**You're set up to track everything that matters!** 📊
