/** Dev/prod app port from env (see PORT in .env.local) */
export function getAppPort(): string {
  return process.env.NEXT_PUBLIC_APP_PORT || process.env.PORT || '3020';
}

/** Host part of tenant domain (without port) */
export function getTenantHost(): string {
  return process.env.NEXT_PUBLIC_TENANT_HOST || 'localhost';
}

/**
 * Tenant domain sent on auth requests (e.g. localhost:3020).
 * In the browser uses window.location.host; SSR uses env-derived host:port.
 */
export function getTenantDomain(): string {
  if (typeof window !== 'undefined' && window.location?.host) {
    return window.location.host.toLowerCase();
  }

  return (
    process.env.NEXT_PUBLIC_TENANT_DOMAIN ||
    `${getTenantHost()}:${getAppPort()}`
  );
}
