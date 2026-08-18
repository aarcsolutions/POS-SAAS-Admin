/**
 * Common helper functions for the Pos-admin application.
 */

/**
 * Formats a date string into a human-readable format.
 * e.g., "2024-04-20" -> "Apr 20, 2024"
 */
export const formatDate = (date: string | Date): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Capitalizes the first letter of a string.
 */
export const capitalize = (s: string): string => {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/**
 * Truncates text with an ellipsis if it exceeds a maximum length.
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Safely parses JSON strings.
 */
export const safeJsonParse = (json: string, fallback: any = {}): any => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};

/** Normalize paginated API meta from Nest ResponseHelper.paginated payloads. */
export function extractPagination(
  response: any,
  fallbackLimit = 10
): {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const pagination =
    response?.data?.pagination ?? response?.pagination ?? {};
  const total = Number(pagination.total ?? 0);
  const page = Number(pagination.page ?? 1);
  const limit = Number(pagination.limit ?? fallbackLimit);
  const totalPages = Number(
    pagination.totalPages ?? (limit > 0 ? Math.ceil(total / limit) : 1)
  );
  return {
    total,
    page,
    limit,
    totalPages: Math.max(1, totalPages || 1),
  };
}

export function extractListItems<T>(response: any, key?: string): T[] {
  const payload = response?.data;
  if (Array.isArray(response)) return response;
  if (key && Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

/**
 * Strip undefined / null / empty-string params so Clear = plain getAll (page/limit only).
 * Keeps boolean `false` and number `0`.
 */
export function omitEmptyParams<T extends Record<string, unknown>>(
  params: T
): Partial<T> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    cleaned[key] = value;
  }
  return cleaned as Partial<T>;
}
