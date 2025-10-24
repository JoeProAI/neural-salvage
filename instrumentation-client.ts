import posthog from 'posthog-js'
import * as Sentry from '@sentry/nextjs';

if (typeof window !== 'undefined') {
  // Initialize Sentry first (priority)
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      debug: false,
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      integrations: [
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
    });
  }

  // Initialize PostHog asynchronously (non-blocking)
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    setTimeout(() => {
      try {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
          person_profiles: 'identified_only',
          capture_pageview: true,
          capture_pageleave: true,
          loaded: (posthog) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('PostHog loaded successfully');
            }
          },
        });
      } catch (error) {
        console.error('PostHog initialization failed:', error);
      }
    }, 0);
  }
}

// Export navigation tracking for Sentry
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

export { posthog };
