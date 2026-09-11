"use client";

import type { CSSProperties } from "react";
import { toast } from "sonner";

const brandToastStyle: CSSProperties = {
  background: "var(--brand-toast)",
  backgroundColor: "var(--brand-toast)",
  color: "#ffffff",
  border: "1px solid var(--brand-primary-dark)",
  borderRadius: 16,
  boxShadow:
    "0 14px 40px color-mix(in srgb, var(--brand-toast) 28%, transparent)",
};

const base = {
  duration: 4200,
  style: brandToastStyle,
} as const;

export function notifySuccess(title: string, description?: string) {
  toast.success(title, { ...base, description });
}

export function notifyError(title: string, description?: string) {
  toast.error(title, { ...base, description });
}

export function notifyInfo(title: string, description?: string) {
  toast.info(title, { ...base, description });
}
