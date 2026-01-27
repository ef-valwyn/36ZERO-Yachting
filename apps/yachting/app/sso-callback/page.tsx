'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function SSOCallbackPage() {
  return (
    <main className="min-h-screen bg-brand-navy flex items-center justify-center">
      <AuthenticateWithRedirectCallback />
    </main>
  );
}
