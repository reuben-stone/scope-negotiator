"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/state/auth";
import { WorkspaceDataProvider } from "@/state/workspace-data";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <WorkspaceDataProvider>{children}</WorkspaceDataProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
