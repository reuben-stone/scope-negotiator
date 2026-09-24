"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/state/auth";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>{children}</AuthProvider>
    </SessionProvider>
  );
}
