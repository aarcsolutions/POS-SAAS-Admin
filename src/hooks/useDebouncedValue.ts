'use client';

import { useEffect, useState } from 'react';

/** Debounce a value (e.g. search input) before passing it to API queries.
 * Empty / cleared values apply immediately so Clear does not wait for the delay.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const isCleared =
      value === '' ||
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '');

    if (isCleared) {
      setDebounced(value);
      return;
    }

    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
