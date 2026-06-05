"use client";

import { toast } from "sonner";

/**
 * Premium Success Notification (Native Tailwind & Sonner styling)
 */
export function notifySuccess(title: string, description?: string) {
  toast.success(title, {
    description,
  });
}

/**
 * Aggressive Error Notification (Distinct red styling)
 */
export function notifyError(title: string, description?: string) {
  toast.error(title, {
    description,
    className: "bg-destructive/10 text-destructive border-destructive/20",
    style: {
      color: "hsl(var(--destructive))", 
      borderColor: "hsla(var(--destructive), 20%)",
      backgroundColor: "hsla(var(--destructive), 10%)"
    }
  });
}

/**
 * Clean Info Notification 
 */
export function notifyInfo(title: string, description?: string) {
  toast.info(title, {
    description,
  });
}
