"use client";

import { AuthProvider } from "@/state/auth";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
