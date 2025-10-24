'use client';

import * as Sentry from '@sentry/nextjs';

export default function SentryExamplePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-8">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-white mb-6">
          Sentry Error Testing
        </h1>
        
        <p className="text-gray-300 mb-6">
          Click the button below to trigger a test error and verify Sentry is working.
        </p>

        <button
          onClick={() => {
            throw new Error('Sentry Test Error - Monitoring is working! 🎉');
          }}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Throw Test Error
        </button>

        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-300">
            <strong>What happens when you click:</strong>
          </p>
          <ul className="mt-2 text-sm text-gray-400 space-y-1 list-disc list-inside">
            <li>An error is thrown</li>
            <li>Sentry captures it automatically</li>
            <li>You'll see it in your Sentry dashboard</li>
            <li>Check sentry.io/issues in 30 seconds</li>
          </ul>
        </div>

        <div className="mt-6">
          <a
            href="https://sentry.io/organizations/joeproai/issues/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Open Sentry Dashboard →
          </a>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <a
            href="/dashboard"
            className="block text-center text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
