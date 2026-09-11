/**
 * Lightweight form validation helpers (no Zod/RHF).
 * Use with local `errors: Record<string, string>` state.
 */

export type FieldErrors = Record<string, string>;

export function required(
  value: unknown,
  message = 'This field is required'
): string | undefined {
  if (value === null || value === undefined) return message;
  if (typeof value === 'string' && !value.trim()) return message;
  return undefined;
}

export function minLen(
  value: string,
  min: number,
  message?: string
): string | undefined {
  if (value.trim().length < min) {
    return message ?? `Must be at least ${min} characters`;
  }
  return undefined;
}

export function maxLen(
  value: string,
  max: number,
  message?: string
): string | undefined {
  if (value.trim().length > max) {
    return message ?? `Must be at most ${max} characters`;
  }
  return undefined;
}

export function email(
  value: string,
  message = 'Enter a valid email'
): string | undefined {
  const v = value.trim();
  if (!v) return undefined;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return message;
  return undefined;
}

export function minNum(
  value: number,
  min: number,
  message?: string
): string | undefined {
  if (Number.isNaN(value) || value < min) {
    return message ?? `Must be at least ${min}`;
  }
  return undefined;
}

export function maxNum(
  value: number,
  max: number,
  message?: string
): string | undefined {
  if (Number.isNaN(value) || value > max) {
    return message ?? `Must be at most ${max}`;
  }
  return undefined;
}

export function firstErrorMessage(errors: FieldErrors): string | undefined {
  for (const msg of Object.values(errors)) {
    if (msg?.trim()) return msg.trim();
  }
  return undefined;
}

type ToastErrorFn = (title: string, description?: string) => void;

/**
 * If errors has any message, toast the first one and return false (block submit).
 * Otherwise return true.
 */
export function blockInvalidSubmit(
  errors: FieldErrors,
  toastError: ToastErrorFn = (title, description) => {
    // Lazy import avoided — callers should pass notifyError.
    void title;
    void description;
  },
  title = 'Please fix the highlighted fields'
): boolean {
  const first = firstErrorMessage(errors);
  if (!first) return true;
  toastError(title, first);
  return false;
}

/** Convenience: toast a single step/banner validation failure. */
export function toastValidationError(
  message: string,
  toastError: ToastErrorFn,
  title = 'Please fix the highlighted fields'
): void {
  toastError(title, message);
}
