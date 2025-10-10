'use client';

import { useEffect } from 'react';

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        if (process.env.NODE_ENV === 'development') {
          console.info('Service worker registered:', registration.scope);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Service worker registration failed:', error);
        }
      }
    };

    register();

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update().catch(() => undefined);
        });
      }
    };
  }, []);

  return null;
}
