'use client';

import { useEffect } from 'react';
import Cookies from 'js-cookie';

/**
 * Auth pages layout (same flow as master-admin):
 * - If access_token exists → go dashboard
 * - If no token → trap browser Back so protected pages cannot be restored
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

    const authPath = window.location.pathname.startsWith('/signup')
      ? '/signup'
      : '/login';

    window.history.pushState(null, '', window.location.href);

    const stayOnAuth = () => {
      if (Cookies.get('access_token')) return;
      window.history.pushState(null, '', authPath);
      window.location.replace(authPath);
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted && !Cookies.get('access_token')) {
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
