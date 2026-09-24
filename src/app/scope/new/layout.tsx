"use client";

import { WorkflowProvider } from "@/state/context";
import type { ReactNode } from "react";

export default function ScopeNewLayout({ children }: { children: ReactNode }) {
  return <WorkflowProvider>{children}</WorkflowProvider>;
}
