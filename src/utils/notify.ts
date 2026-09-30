"use client";

import { toast } from "sonner";

/** Success auto-dismisses; error / warning / info stay until user closes (per toast UI spec). */
const SUCCESS_MS = 10_000;
const STICKY = Infinity;

export function notifySuccess(title: string, description?: string) {
  toast.success(title, { description, duration: SUCCESS_MS });
}

export function notifyError(title: string, description?: string) {
  toast.error(title, { description, duration: STICKY });
}

export function notifyWarning(title: string, description?: string) {
  toast.warning(title, { description, duration: STICKY });
}

export function notifyInfo(title: string, description?: string) {
  toast.info(title, { description, duration: STICKY });
}
