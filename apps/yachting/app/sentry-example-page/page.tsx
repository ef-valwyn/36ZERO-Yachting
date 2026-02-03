"use client";

import { Button } from "@36zero/ui";

export default function SentryExamplePage() {
  const triggerError = () => {
    // Intentionally call undefined function to test Sentry client-side capture
    // @ts-expect-error - Sentry test
    myUndefinedFunction();
  };

  return (
    <main className="min-h-screen bg-brand-navy flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-white mb-2">
          Sentry Test Page
        </h1>
        <p className="text-white/60 mb-6">
          Click the button below to trigger a test error. It should appear in
          your Sentry dashboard within a few seconds.
        </p>
        <Button variant="primary" onClick={triggerError}>
          Trigger test error
        </Button>
      </div>
    </main>
  );
}
