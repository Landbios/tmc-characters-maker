'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker for PWA offline support.
 * Mounted once in the root layout. Does nothing in development mode
 * unless explicitly enabled via NEXT_PUBLIC_SW_DEV=true.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[SW] Registered, scope:', registration.scope);
        })
        .catch((err) => {
          console.error('[SW] Registration failed:', err);
        });
    }
  }, []);

  return null;
}
