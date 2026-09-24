"use client";

import { WorkflowProvider } from "@/state/context";
import type { ReactNode } from "react";

export function ScopeNewProviders({ children }: { children: ReactNode }) {
  return <WorkflowProvider>{children}</WorkflowProvider>;
}
