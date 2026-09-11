'use client';

import { useEffect } from 'react';
import Cookies from 'js-cookie';

/**
 * Auth pages layout:
 * - If access_token exists → go dashboard
 * - If no token → trap browser Back without full-page reload (avoids tenantInfo spam)
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (Cookies.get('access_token')) {
      window.location.replace('/dashboard');
      return;
    }

    const path = window.location.pathname;
    const authPath = path.startsWith('/signup')
      ? '/signup'
      : path.startsWith('/forgot-password')
        ? '/forgot-password'
        : '/login';

    window.history.pushState(null, '', window.location.href);

    const stayOnAuth = () => {
      if (Cookies.get('access_token')) return;
      // Push history only — do not location.replace(self) (that remounts login forever)
      window.history.pushState(null, '', authPath);
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      if (Cookies.get('access_token')) {
        window.location.replace('/dashboard');
        return;
      }
      // bfcache restore onto a non-auth path → hard navigate once
      if (window.location.pathname !== authPath) {
        window.location.replace(authPath);
      }
    };

    window.addEventListener('popstate', stayOnAuth);
    window.addEventListener('pageshow', onPageShow);

    return () => {
      window.removeEventListener('popstate', stayOnAuth);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, []);

  return <>{children}</>;
}
