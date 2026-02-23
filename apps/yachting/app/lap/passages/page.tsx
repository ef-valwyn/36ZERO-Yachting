'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LapPassagesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/lap#passages');
  }, [router]);

  return null;
}
