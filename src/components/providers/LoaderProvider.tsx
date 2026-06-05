"use client";

import { ReactNode } from "react";

/**
 * Global Loader Provider
 * Can be extended to include global router-level progression bars such as nprogress.
 */
export default function LoaderProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}
