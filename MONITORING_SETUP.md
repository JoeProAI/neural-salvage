# 📊 MONITORING SETUP - PostHog, Sentry, Intercom

## **Complete Observability Stack**

---

## 🎯 **WHY MONITORING MATTERS**

**Without monitoring:**
- ❌ Don't know if users are stuck
- ❌ Don't know which features are used
- ❌ Don't know when errors happen
- ❌ Can't measure growth
- ❌ Flying blind!

**With monitoring:**
- ✅ See every user action
- ✅ Track feature usage
- ✅ Get alerts on errors
- ✅ Measure conversions
- ✅ Data-driven decisions

---

## 📈 **POSTHOG SETUP (Analytics & Product Analytics)**

### **What is PostHog?**
- Product analytics platform
- Open-source alternative to Mixpanel
- Session recording
- Feature flags
- A/B testing
- Funnels & cohorts

### **Step 1: Create Account**

```
1. Go to posthog.com
2. Sign up (free tier: 1M events/month)
3. Create new project: "Neural Salvage"
4. Get your API key
```

### **Step 2: Install PostHog**

```bash
cd neural-salvage
npm install posthog-js
```

### **Step 3: Create PostHog Client**

**File:** `lib/analytics/posthog.ts`

```typescript
import posthog from 'posthog-js';

export const initPostHog = () => {
  if (typeof window !== 'undefined') {
    posthog.init(
      process.env.NEXT_PUBLIC_POSTHOG_KEY!,
      {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            posthog.opt_out_capturing(); // Don't track in dev
          }
        },
        capture_pageview: false, // We'll do this manually
        capture_pageleave: true,
        autocapture: true, // Automatically captures clicks
      }
    );
  }
};

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.capture(eventName, properties);
  }
};

export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.identify(userId, properties);
  }
};

export const trackPageView = (url?: string) => {
  if (typeof window !== 'undefined') {
    posthog.capture('$pageview', {
      $current_url: url || window.location.href,
    });
  }
};

export { posthog };
```

### **Step 4: Initialize in App**

**File:** `app/layout.tsx` (add to existing)

```typescript
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initPostHog, trackPageView } from '@/lib/analytics/posthog';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize PostHog
    initPostHog();
  }, []);

  useEffect(() => {
    // Track page views
    if (pathname) {
      trackPageView();
    }
  }, [pathname, searchParams]);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### **Step 5: Track Key Events**

**Critical Events to Track:**

```typescript
// User signup
trackEvent('user_signup', {
  method: 'email', // or 'google', 'wallet'
  referral_code: referralCode,
});

// NFT minted
trackEvent('nft_minted', {
  nft_id: nftId,
  media_type: 'image' | 'audio' | 'video',
  file_size: fileSizeBytes,
  price: 4.99,
});

// NFT listed
trackEvent('nft_listed', {
  nft_id: nftId,
  price_usd: priceUSD,
  price_ar: priceAR,
  duration: '30_days',
});

// Salvage yard created
trackEvent('salvage_yard_created', {
  subscription_price: price,
  username: username,
});

// Subscription purchased
trackEvent('subscription_purchased', {
  creator_id: creatorId,
  price: price,
  plan: 'monthly',
});

// File uploaded
trackEvent('file_uploaded', {
  file_type: 'image' | 'audio' | 'video',
  file_size: sizeInMB,
});
```

**Add these throughout your app at key actions!**

### **Step 6: Set Up Funnels**

**In PostHog Dashboard:**

1. **Minting Funnel:**
   ```
   user_signup → file_uploaded → nft_minted
   ```
   *Measures: What % of signups actually mint*

2. **Marketplace Funnel:**
   ```
   nft_minted → nft_listed → nft_sold
   ```
   *Measures: What % of NFTs get sold*

3. **Subscription Funnel:**
   ```
   user_signup → salvage_yard_created → first_subscriber
   ```
   *Measures: What % of users create successful salvage yards*

### **Step 7: Environment Variables**

```env
# .env.local
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## 🚨 **SENTRY SETUP (Error Tracking)**

### **What is Sentry?**
- Real-time error tracking
- Performance monitoring
- Release tracking
- User feedback
- Alerts when things break

### **Step 1: Create Account**

```
1. Go to sentry.io
2. Sign up (free tier: 5K errors/month)
3. Create new project: Next.js
4. Get your DSN
```

### **Step 2: Install Sentry**

```bash
npx @sentry/wizard@latest -i nextjs
```

This wizard will:
- Install required packages
- Create sentry.client.config.ts
- Create sentry.server.config.ts
- Create sentry.edge.config.ts
- Add to next.config.js

### **Step 3: Configure Sentry**

**File:** `sentry.client.config.ts`

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: 1.0, // 100% in dev, reduce to 0.1 in prod
  
  // Session replay
  replaysOnErrorSampleRate: 1.0, // Record 100% of sessions with errors
  replaysSessionSampleRate: 0.1, // Record 10% of normal sessions
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  
  // Filter out sensitive data
  beforeSend(event, hint) {
    // Don't send passwords, tokens, etc.
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }
    return event;
  },
  
  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'ResizeObserver loop limit exceeded',
  ],
});
```

### **Step 4: Track Custom Events**

```typescript
import * as Sentry from '@sentry/nextjs';

// Track user context
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.username,
});

// Track custom error
try {
  await mintNFT();
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      feature: 'nft_minting',
    },
    extra: {
      nft_id: nftId,
      file_size: fileSize,
    },
  });
  throw error;
}

// Track message
Sentry.captureMessage('User attempted to mint without wallet', {
  level: 'warning',
});

// Performance tracking
const transaction = Sentry.startTransaction({
  op: 'nft_mint',
  name: 'Mint NFT',
});

try {
  await mintNFT();
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

### **Step 5: Set Up Alerts**

**In Sentry Dashboard:**

1. **Critical Errors Alert:**
   ```
   When: Any error occurs
   Notify: Email + Slack
   Frequency: Immediately
   ```

2. **Performance Alert:**
   ```
   When: API response time > 5 seconds
   Notify: Email
   Frequency: Once per hour
   ```

3. **Error Rate Alert:**
   ```
   When: Error rate > 5% of requests
   Notify: Email + Slack + SMS
   Frequency: Immediately
   ```

### **Step 6: Environment Variables**

```env
# .env.local
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_AUTH_TOKEN=xxxxx (for source maps)
```

---

## 💬 **INTERCOM SETUP (Customer Support & Messaging)**

### **What is Intercom?**
- Live chat widget
- Customer messaging
- Product tours
- Help center
- Email campaigns

### **Step 1: Create Account**

```
1. Go to intercom.com
2. Sign up (free trial, then $74/month)
3. Create workspace: "Neural Salvage"
4. Get your app ID
```

### **Step 2: Install Intercom**

```bash
npm install react-use-intercom
```

### **Step 3: Create Intercom Provider**

**File:** `lib/intercom/IntercomProvider.tsx`

```typescript
'use client';

import { IntercomProvider as IntercomProviderBase } from 'react-use-intercom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const INTERCOM_APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID!;

export function IntercomProvider({ children }: { children: React.ReactNode }) {
  return (
    <IntercomProviderBase appId={INTERCOM_APP_ID} autoBoot>
      <IntercomUser />
      {children}
    </IntercomProviderBase>
  );
}

function IntercomUser() {
  const { user } = useAuth();
  const { boot, shutdown, update } = useIntercom();

  useEffect(() => {
    if (user) {
      // Identify user to Intercom
      boot({
        userId: user.id,
        email: user.email,
        name: user.displayName || user.email,
        createdAt: new Date(user.createdAt).getTime() / 1000,
        customAttributes: {
          nft_count: user.nftCount || 0,
          salvage_yard: user.hasSalvageYard || false,
          subscription_tier: user.subscriptionTier || 'free',
        },
      });
    } else {
      shutdown();
    }
  }, [user, boot, shutdown]);

  return null;
}
```

### **Step 4: Add to App Layout**

**File:** `app/layout.tsx`

```typescript
import { IntercomProvider } from '@/lib/intercom/IntercomProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <IntercomProvider>
          {children}
        </IntercomProvider>
      </body>
    </html>
  );
}
```

### **Step 5: Use Intercom in Components**

```typescript
'use client';

import { useIntercom } from 'react-use-intercom';

export function HelpButton() {
  const { show } = useIntercom();

  return (
    <button onClick={show}>
      Need Help?
    </button>
  );
}

// Show Intercom on specific pages
export function NFTDetailPage() {
  const { showNewMessages } = useIntercom();

  const handleListingHelp = () => {
    showNewMessages('I need help listing my NFT for sale');
  };

  return (
    <button onClick={handleListingHelp}>
      Help with Listing
    </button>
  );
}
```

### **Step 6: Track Events in Intercom**

```typescript
import { useIntercom } from 'react-use-intercom';

const { trackEvent } = useIntercom();

// Track key actions
trackEvent('nft_minted', {
  nft_id: nftId,
  price: 4.99,
});

trackEvent('salvage_yard_created', {
  subscription_price: price,
});

trackEvent('support_contacted', {
  issue_type: 'minting_help',
});
```

### **Step 7: Set Up Messages & Tours**

**In Intercom Dashboard:**

1. **Welcome Message:**
   ```
   Trigger: New user signs up
   Message: "Welcome to Neural Salvage! 🎉 Want a quick tour?"
   CTA: "Show me around"
   ```

2. **Onboarding Tour:**
   ```
   Step 1: Upload your first file
   Step 2: Mint as NFT
   Step 3: View in gallery
   ```

3. **Abandoned Cart:**
   ```
   Trigger: User uploads file but doesn't mint within 24 hours
   Message: "You're so close! Finish minting your NFT"
   ```

4. **Success Message:**
   ```
   Trigger: User mints first NFT
   Message: "Congrats on your first NFT! 🎉 Want to list it for sale?"
   ```

### **Step 8: Environment Variables**

```env
# .env.local
NEXT_PUBLIC_INTERCOM_APP_ID=xxxxx
```

---

## 📊 **DASHBOARD SETUP**

### **Create Monitoring Dashboard**

**Recommended Tools:**
1. **Vercel Analytics** (built-in)
2. **PostHog Dashboard** (product metrics)
3. **Sentry Dashboard** (errors)
4. **Intercom Dashboard** (support)

### **Key Metrics to Display:**

**Growth Metrics:**
- Daily signups
- Weekly active users
- Monthly active users
- Retention curves

**Revenue Metrics:**
- Daily revenue
- MRR (Monthly Recurring Revenue)
- ARPU (Average Revenue Per User)
- LTV (Lifetime Value)

**Product Metrics:**
- NFTs minted per day
- Marketplace sales
- Salvage yards created
- Subscriptions sold

**Health Metrics:**
- Error rate
- API response times
- Page load speed
- Uptime %

---

## ✅ **TESTING MONITORING**

### **Test PostHog:**
```
1. Open your site in incognito
2. Sign up
3. Perform actions (upload, mint, etc.)
4. Go to PostHog dashboard
5. Check "Events" tab
6. Verify events appear
```

### **Test Sentry:**
```
1. Add test error to code:
   throw new Error('Test error - please ignore');
2. Trigger the error
3. Go to Sentry dashboard
4. Verify error appears
5. Check stack trace is correct
6. Remove test error
```

### **Test Intercom:**
```
1. Open your site
2. Check chat widget appears (bottom right)
3. Click widget
4. Send test message
5. Check Intercom inbox
6. Reply from Intercom
7. Verify reply appears on site
```

---

## 🚨 **ALERT CONFIGURATION**

### **Critical Alerts (Immediate Action):**
```
✉️  Email + 📱 SMS + 💬 Slack

1. Site is down (uptime < 99%)
2. Error rate > 10%
3. Payment processing fails
4. Database connection lost
5. Arweave minting fails
```

### **High Priority (Check Within 1 Hour):**
```
✉️  Email + 💬 Slack

1. Error rate > 5%
2. API response time > 10s
3. User signup flow broken
4. 10+ support messages
```

### **Medium Priority (Daily Review):**
```
✉️  Email

1. Unusual traffic patterns
2. Feature usage drops
3. Churn rate increases
4. Performance degradation
```

---

## 📈 **ONGOING MONITORING**

### **Daily:**
- Check error count in Sentry
- Review support messages in Intercom
- Check signup/minting numbers in PostHog

### **Weekly:**
- Review funnel conversion rates
- Analyze feature usage
- Check retention cohorts
- Review top errors

### **Monthly:**
- Deep dive analytics
- A/B test results
- User feedback themes
- Performance trends

---

## 🎯 **SUCCESS METRICS**

**You'll know monitoring is working when:**
- ✅ You catch errors before users report them
- ✅ You know exactly which features are used most
- ✅ You can answer "How many users did X?" instantly
- ✅ You get alerts within minutes of issues
- ✅ Support team has context on every user

---

**Estimated Setup Time:** 4-6 hours  
**Monthly Cost:** $0-$200 (depending on usage)  
**Value:** PRICELESS for running a successful platform! 💎
