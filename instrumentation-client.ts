import posthog from 'posthog-js'
import * as Sentry from '@sentry/nextjs';

if (typeof window !== 'undefined') {
  // Initialize PostHog
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
      defaults: '2025-05-24',
    });
  }

  // Initialize Sentry client-side
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

// Export navigation tracking for Sentry
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

export { posthog };
