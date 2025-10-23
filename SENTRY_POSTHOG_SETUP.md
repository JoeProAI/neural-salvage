# 🔧 Sentry & PostHog Setup Guide

Complete guide to configure error tracking and product analytics.

---

## 🎯 What You Installed

### **1. Sentry (Error Tracking)**
- Automatic error capture
- Performance monitoring
- Session replays
- Release tracking
- Cron monitoring

### **2. PostHog (Product Analytics)**
- User behavior tracking
- Event analytics
- Feature flags
- Session recordings
- Funnel analysis
- Retention tracking

---

## 🚀 Quick Setup (10 Minutes)

### **Step 1: Create Sentry Account**

1. **Go to:** https://sentry.io/signup/
2. **Sign up** with GitHub or email
3. **Create organization:** "neural-salvage"
4. **Create project:**
   - Platform: Next.js
   - Project name: neural-salvage
   - Alert frequency: On every issue

5. **Copy DSN:**
   ```
   Example: https://abc123@o123456.ingest.sentry.io/456789
   ```

### **Step 2: Create PostHog Account**

1. **Go to:** https://posthog.com/signup
2. **Sign up** (use "Cloud" not self-hosted)
3. **Create project:** neural-salvage
4. **Copy Project API Key:**
   - Settings → Project → Project API Key
   - Example: `phc_abc123def456ghi789...`

5. **Note the host:**
   - US Cloud: `https://us.i.posthog.com`
   - EU Cloud: `https://eu.i.posthog.com`

---

## 🔑 Step 3: Add Environment Variables to Vercel

### **Go to Vercel Dashboard:**

1. https://vercel.com/dashboard
2. Select "neural-salvage"
3. Settings → Environment Variables

### **Add These Variables:**

```env
# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id

# PostHog Product Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_your_posthog_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

**⚠️ IMPORTANT:**
- Select **ALL THREE** environments (Production, Preview, Development)
- Click "Save" after each one

---

## ✅ Step 4: Redeploy

### **Trigger Redeploy:**

**Option 1: Push to GitHub**
```bash
git add .
git commit -m "Add Sentry and PostHog monitoring"
git push origin main
```

**Option 2: Manual Redeploy**
```
Vercel Dashboard → Deployments → Redeploy
```

**Wait 2-3 minutes for deployment to complete.**

---

## 🧪 Step 5: Test It Works

### **Test Sentry (Error Tracking):**

Create a test error page:

```typescript
// app/test-error/page.tsx
'use client';

export default function TestError() {
  const throwError = () => {
    throw new Error('Test error for Sentry!');
  };

  return (
    <div className="p-8">
      <h1>Test Sentry</h1>
      <button onClick={throwError}>
        Throw Test Error
      </button>
    </div>
  );
}
```

**To test:**
1. Visit: https://neural-salvage.vercel.app/test-error
2. Click "Throw Test Error"
3. Check Sentry dashboard (sentry.io)
4. You should see the error within 30 seconds!

### **Test PostHog (Analytics):**

1. Visit your site: https://neural-salvage.vercel.app
2. Navigate between pages (dashboard, gallery, etc.)
3. Go to PostHog dashboard: https://app.posthog.com
4. Click "Events" → Should see `$pageview` events
5. Takes ~1 minute to appear

---

## 📊 What You Can Track Now

### **Sentry Tracks Automatically:**

```
✅ JavaScript errors
✅ API route errors
✅ Unhandled promise rejections
✅ Performance issues
✅ Slow database queries
✅ Failed HTTP requests
✅ User sessions
✅ Release information
```

### **PostHog Tracks Automatically:**

```
✅ Page views
✅ Session duration
✅ User paths
✅ Device info
✅ Browser info
✅ Location data
✅ Referrer sources
```

---

## 🎯 Custom Event Tracking

### **Track Custom Events with PostHog:**

```typescript
import { trackNFTMint } from '@/lib/analytics/posthog-analytics';

// After successful NFT mint
trackNFTMint({
  assetId: 'asset_123',
  nftId: 'nft_456',
  cost: 0.005,
  blockchain: 'arweave'
});
```

**Other tracking functions:**

```typescript
import {
  trackAssetUploaded,
  trackMarketplaceAction,
  trackFeature,
  identifyUser,
} from '@/lib/analytics/posthog-analytics';

// Track asset upload
trackAssetUploaded({
  assetId: 'asset_123',
  type: 'image',
  size: 5242880
});

// Track marketplace action
trackMarketplaceAction('listing_created', {
  nftId: 'nft_123',
  price: 50
});

// Track feature usage
trackFeature('ai_voice_clone', 'started');

// Identify user (after login)
identifyUser('user_123', {
  email: 'user@example.com',
  plan: 'pro'
});
```

### **Capture Errors in Sentry:**

```typescript
import * as Sentry from '@sentry/nextjs';

try {
  // Your code
  await mintNFT();
} catch (error) {
  // Automatically sent to Sentry
  Sentry.captureException(error, {
    tags: {
      section: 'nft-minting',
    },
    extra: {
      assetId: assetId,
    },
  });
}
```

---

## 📈 Sentry Dashboard Features

### **Issues Tab:**
- See all errors
- Filter by unresolved/resolved
- Group similar errors
- Assign to team members

### **Performance Tab:**
- API route performance
- Database query times
- Frontend load times
- Web vitals

### **Releases Tab:**
- Track deployments
- See errors per release
- Compare performance

### **Alerts:**
- Email notifications
- Slack integration
- Discord webhooks

---

## 📊 PostHog Dashboard Features

### **Events Tab:**
- See all tracked events
- Filter by event type
- View user properties
- Export data

### **Insights Tab:**
- Create charts
- Trends over time
- Funnels (signup → mint)
- Retention cohorts

### **Session Replay:**
- Watch user sessions
- See where users struggle
- Debug UI issues
- Privacy-safe (masks sensitive data)

### **Feature Flags:**
- A/B testing
- Gradual rollouts
- User targeting

---

## 🎯 Key Metrics to Track

### **Daily Monitoring:**

**In Sentry:**
```
□ New errors: ____
□ Error rate: ____%
□ Affected users: ____
□ P95 response time: ____ms
```

**In PostHog:**
```
□ Daily active users: ____
□ Page views: ____
□ Avg session duration: ____
□ Top pages: ____
□ Conversion rate: ____%
```

### **Weekly Analysis:**

**Funnels in PostHog:**
```
Signup → Upload → Mint:
1. Signups: 100 users
2. Uploaded: 60 users (60% conversion)
3. Minted: 30 users (50% conversion)

Overall: 30% signup → mint
```

**Performance in Sentry:**
```
API Routes:
- /api/nft/mint: 850ms avg (good)
- /api/upload: 1.2s avg (could improve)
- /api/marketplace: 450ms avg (excellent)
```

---

## 🔔 Setting Up Alerts

### **Sentry Alerts:**

1. **Go to:** Sentry → Alerts → Create Alert
2. **When:** Any issue is seen for the first time
3. **Then:** Send email + Slack notification
4. **Example alerts:**
   - High error rate (> 10 errors/min)
   - New error type
   - Performance degradation
   - Failed cron job

### **PostHog Alerts:**

1. **Go to:** PostHog → Insights → Create Alert
2. **Examples:**
   - Daily users drop > 20%
   - Conversion rate < 10%
   - No mints in 24 hours

---

## 💰 Pricing

### **Sentry:**
```
Free Tier:
- 5,000 errors/month
- 10,000 performance transactions
- 50 replays/month
- 1 project

Developer ($26/month):
- 50,000 errors/month
- 100,000 transactions
- 500 replays/month
- Unlimited projects

Perfect to start with FREE tier!
```

### **PostHog:**
```
Free Tier:
- 1M events/month
- 5,000 session replays
- All features included
- No credit card required

Scale ($0.00031/event after free tier):
- Pay as you grow
- Volume discounts

Start with FREE - covers you for months!
```

---

## 🚀 Best Practices

### **1. Use Environments:**
```typescript
// Only enable replays in production
Sentry.init({
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
});
```

### **2. Add Context:**
```typescript
Sentry.setUser({
  id: userId,
  email: userEmail,
});

Sentry.setContext('nft', {
  assetId: assetId,
  cost: cost,
});
```

### **3. Filter Sensitive Data:**
```typescript
// PostHog automatically masks:
// - Passwords
// - Credit cards
// - Email addresses (in replays)
```

### **4. Use Tags:**
```typescript
// Makes filtering easier
Sentry.setTag('feature', 'nft-minting');
Sentry.setTag('blockchain', 'arweave');
```

---

## 🔧 Troubleshooting

### **Sentry Not Capturing Errors:**

1. Check DSN is set in environment variables
2. Verify deployment completed
3. Check browser console for Sentry initialization
4. Try test error page

### **PostHog Not Tracking:**

1. Check API key is set
2. Verify host URL is correct
3. Disable ad blockers
4. Check browser console for PostHog logs

### **No Data Showing:**

1. Wait 2-5 minutes for data to appear
2. Check you're in the right project
3. Verify environment variables are saved
4. Redeploy if needed

---

## 📚 Resources

### **Sentry:**
- Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Dashboard: https://sentry.io
- Best Practices: https://docs.sentry.io/platforms/javascript/best-practices/

### **PostHog:**
- Docs: https://posthog.com/docs
- Dashboard: https://app.posthog.com
- Tutorials: https://posthog.com/tutorials

---

## ✅ Setup Checklist

**Before Launch:**
- [ ] Sentry account created
- [ ] PostHog account created
- [ ] Environment variables added to Vercel
- [ ] Code deployed
- [ ] Test error captured in Sentry
- [ ] Page views showing in PostHog
- [ ] Alerts configured
- [ ] Team invited (if applicable)

**After Launch:**
- [ ] Monitor errors daily
- [ ] Check analytics weekly
- [ ] Set up custom events
- [ ] Configure funnels
- [ ] Enable session replay (low sample rate)
- [ ] Integrate with Slack/Discord

---

**You're all set! Both Sentry and PostHog are ready to track everything.** 🎉

**Next:** Add environment variables to Vercel and redeploy! 🚀
