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
