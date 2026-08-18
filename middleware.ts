import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_PAGES = ['/login', '/signup'];

function hasAccessToken(request: NextRequest) {
  return Boolean(request.cookies.get('access_token')?.value);
}

function noStore(response: NextResponse) {
  response.headers.set(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate'
  );
  response.headers.set('Pragma', 'no-cache');
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = hasAccessToken(request);

  const isAuthPage = AUTH_PAGES.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`)
  );
  const isProtected = !isAuthPage && pathname !== '/';

  if (isProtected && !hasToken) {
    const loginUrl = new URL('/login', request.url);
    return noStore(NextResponse.redirect(loginUrl));
  }

  if (isAuthPage && hasToken) {
    return noStore(NextResponse.redirect(new URL('/dashboard', request.url)));
  }

  return noStore(NextResponse.next());
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
