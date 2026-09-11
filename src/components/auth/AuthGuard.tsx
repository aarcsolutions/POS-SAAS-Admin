'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/store/authStore';

function getAccessToken() {
  return Cookies.get('access_token') || '';
}

/**
 * Token-only gate (same as master-admin).
 * - No token → hard redirect /login (no spinner hang)
 * - unload listener opts this page out of bfcache so Back does a fresh request
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const blockBfCache = () => undefined;
    window.addEventListener('unload', blockBfCache);
    window.addEventListener('pagehide', blockBfCache);

    const kickToLogin = () => {
      Cookies.remove('access_token', { path: '/' });
      Cookies.remove('refresh_token', { path: '/' });
      useAuthStore.getState().logout();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.replace('/login');
      }
    };

    if (!getAccessToken()) {
      kickToLogin();
      return () => {
        window.removeEventListener('unload', blockBfCache);
        window.removeEventListener('pagehide', blockBfCache);
      };
    }

    setAllowed(true);

    const onPageShow = (event: PageTransitionEvent) => {
      if (!getAccessToken()) {
        kickToLogin();
        return;
      }
      if (event.persisted && !getAccessToken()) {
        kickToLogin();
      }
    };

    const onPopState = () => {
      if (!getAccessToken()) {
        kickToLogin();
      }
    };

    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('unload', blockBfCache);
      window.removeEventListener('pagehide', blockBfCache);
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
