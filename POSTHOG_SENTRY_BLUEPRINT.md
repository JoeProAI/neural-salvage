# PostHog + Sentry Installation Blueprint

**Complete guide for adding PostHog analytics and Sentry error tracking to any Next.js app**

---

## 📦 Step 1: Install Dependencies

```bash
npm install posthog-js @sentry/nextjs
```

---

## 🔑 Step 2: Environment Variables

Create/update `.env.local`:

```bash
# PostHog
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_project_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_ORG=your_org_name
SENTRY_PROJECT=your_project_name
```

**Where to get these:**
- **PostHog Key**: PostHog Dashboard → Project Settings → Project API Key
- **PostHog Host**: Use `https://app.posthog.com` (or your self-hosted URL)
- **Sentry DSN**: Sentry Dashboard → Settings → Projects → [Your Project] → Client Keys (DSN)
- **Sentry Auth Token**: Sentry → Settings → Account → Auth Tokens → Create New Token

---

## 📁 Step 3: Create Configuration Files

### **File 1: `instrumentation-client.ts`** (Root of project)

```typescript
'use client';

import * as Sentry from '@sentry/nextjs';
import posthog from 'posthog-js';

// Initialize Sentry
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: process.env.NODE_ENV,
  });
}

// Initialize PostHog (non-blocking)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          posthog.debug();
        }
      },
      capture_pageview: false, // We'll handle this manually
      capture_pageleave: true,
    });
  }, 0);
}

export { posthog };

// Export Sentry router transition handler
export function onRouterTransitionStart() {
  // Called on route transitions for Sentry
}
```

---

### **File 2: `instrumentation.ts`** (Root of project)

```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./instrumentation-server');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./instrumentation-edge');
  }
}
```

---

### **File 3: `instrumentation-server.ts`** (Root of project)

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

---

### **File 4: `instrumentation-edge.ts`** (Root of project)

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

---

### **File 5: `lib/analytics/posthog-analytics.ts`**

```typescript
import { posthog } from '@/instrumentation-client';

export const analytics = {
  // Page views
  pageview: (url: string) => {
    if (typeof window !== 'undefined') {
      posthog?.capture('$pageview', { url });
    }
  },

  // Custom events
  track: (event: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      posthog?.capture(event, properties);
    }
  },

  // Identify user
  identify: (userId: string, traits?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      posthog?.identify(userId, traits);
    }
  },

  // Reset on logout
  reset: () => {
    if (typeof window !== 'undefined') {
      posthog?.reset();
    }
  },
};
```

---

### **File 6: `components/providers/PostHogProvider.tsx`**

```typescript
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { analytics } from '@/lib/analytics/posthog-analytics';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      const url = window.origin + pathname;
      const search = searchParams?.toString();
      const fullUrl = search ? `${url}?${search}` : url;
      
      analytics.pageview(fullUrl);
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
```

---

## 🎯 Step 4: Update Root Layout

**File: `app/layout.tsx`**

```typescript
import { PostHogProvider } from '@/components/providers/PostHogProvider';
import '@/instrumentation-client'; // Import to initialize

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
```

---

## ⚙️ Step 5: Update Next.js Config

**File: `next.config.ts`** (or `next.config.js`)

```typescript
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = {
  // Your existing config
  experimental: {
    instrumentationHook: true, // Enable instrumentation
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  reactComponentAnnotation: {
    enabled: true,
  },
  tunnelRoute: '/monitoring',
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
```

---

## 🧪 Step 6: Test Installation

### **Create Test Page: `app/test-analytics/page.tsx`**

```typescript
'use client';

import { analytics } from '@/lib/analytics/posthog-analytics';
import * as Sentry from '@sentry/nextjs';

export default function TestAnalyticsPage() {
  const testPostHog = () => {
    analytics.track('test_event', {
      test_property: 'test_value',
      timestamp: new Date().toISOString(),
    });
    alert('PostHog event sent! Check your PostHog dashboard.');
  };

  const testSentry = () => {
    try {
      throw new Error('Test error for Sentry');
    } catch (error) {
      Sentry.captureException(error);
      alert('Sentry error sent! Check your Sentry dashboard.');
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-black">
          Analytics Test Page
        </h1>

        <div className="space-y-4">
          <button
            onClick={testPostHog}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Test PostHog Event
          </button>

          <button
            onClick={testSentry}
            className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700"
          >
            Test Sentry Error
          </button>
        </div>

        <div className="bg-gray-100 p-4 rounded-md">
          <h2 className="font-semibold mb-2">What to check:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>PostHog: Dashboard → Live Events → Look for "test_event"</li>
            <li>Sentry: Issues → Look for "Test error for Sentry"</li>
            <li>Both should appear within 30 seconds</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
```

---

## 📊 Step 7: Common Use Cases

### **Track User Sign Up**

```typescript
import { analytics } from '@/lib/analytics/posthog-analytics';
import * as Sentry from '@sentry/nextjs';

async function handleSignUp(email: string, userId: string) {
  // Track event
  analytics.track('user_signed_up', {
    email,
    signup_method: 'email',
  });

  // Identify user
  analytics.identify(userId, {
    email,
    plan: 'free',
  });

  // Set Sentry user context
  Sentry.setUser({
    id: userId,
    email,
  });
}
```

---

### **Track User Sign Out**

```typescript
import { analytics } from '@/lib/analytics/posthog-analytics';
import * as Sentry from '@sentry/nextjs';

function handleSignOut() {
  analytics.track('user_signed_out');
  analytics.reset(); // Clear PostHog identity
  Sentry.setUser(null); // Clear Sentry user
}
```

---

### **Track Custom Events**

```typescript
// Button click
analytics.track('button_clicked', {
  button_name: 'upgrade_plan',
  location: 'pricing_page',
});

// Feature usage
analytics.track('feature_used', {
  feature: 'image_upload',
  file_type: 'png',
  file_size: 1024000,
});

// Purchase
analytics.track('purchase_completed', {
  plan: 'pro',
  amount: 29.99,
  currency: 'USD',
});
```

---

### **Capture Errors**

```typescript
import * as Sentry from '@sentry/nextjs';

try {
  await riskyOperation();
} catch (error) {
  // Send to Sentry with context
  Sentry.captureException(error, {
    tags: {
      section: 'payment',
      action: 'process_payment',
    },
    extra: {
      userId: user.id,
      amount: paymentAmount,
    },
  });
  
  // Show user-friendly error
  toast.error('Payment failed. Please try again.');
}
```

---

## 🔒 Step 8: Security & Privacy

### **Add to `.gitignore`**

```
# Environment variables
.env.local
.env*.local

# Sentry
.sentryclirc
```

---

### **GDPR Compliance**

Add cookie consent (optional but recommended):

```typescript
'use client';

import { useState, useEffect } from 'react';
import posthog from 'posthog-js';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
    posthog.opt_in_capturing();
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowBanner(false);
    posthog.opt_out_capturing();
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black text-white p-4 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <p className="text-sm">
          We use cookies to improve your experience and analyze site usage.
        </p>
        <div className="flex gap-4">
          <button
            onClick={acceptCookies}
            className="bg-white text-black px-4 py-2 rounded-md text-sm"
          >
            Accept
          </button>
          <button
            onClick={declineCookies}
            className="border border-white px-4 py-2 rounded-md text-sm"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ Verification Checklist

- [ ] Dependencies installed (`posthog-js`, `@sentry/nextjs`)
- [ ] Environment variables added to `.env.local`
- [ ] `instrumentation-client.ts` created
- [ ] `instrumentation.ts` created
- [ ] `instrumentation-server.ts` created
- [ ] `instrumentation-edge.ts` created
- [ ] `lib/analytics/posthog-analytics.ts` created
- [ ] `PostHogProvider` component created
- [ ] Root layout updated with provider
- [ ] `next.config.ts` updated with Sentry config
- [ ] Test page created and verified
- [ ] PostHog dashboard shows events
- [ ] Sentry dashboard shows errors
- [ ] Environment variables added to Vercel (if deploying)

---

## 🚀 Deployment Notes

### **Vercel Environment Variables**

Add these in Vercel Dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_POSTHOG_KEY=<your_key>
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_SENTRY_DSN=<your_dsn>
SENTRY_AUTH_TOKEN=<your_token>
SENTRY_ORG=<your_org>
SENTRY_PROJECT=<your_project>
```

---

## 📚 Resources

- **PostHog Docs**: https://posthog.com/docs
- **Sentry Docs**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **PostHog Dashboard**: https://app.posthog.com
- **Sentry Dashboard**: https://sentry.io

---

## 🎯 Quick Start Summary

```bash
# 1. Install
npm install posthog-js @sentry/nextjs

# 2. Copy files from this blueprint

# 3. Add environment variables

# 4. Test
npm run dev
# Visit /test-analytics

# 5. Deploy
git push
```

---

**That's it! You're now tracking analytics and errors like a pro.** 🎉
