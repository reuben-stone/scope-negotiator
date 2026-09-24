import type { Metadata } from "next";
import { WorkflowProvider } from "@/state/context";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "New Scope | Scope Negotiator",
  description:
    "Scope a new product or feature. Describe your idea and let AI propose a credible, negotiable scope.",
};

export default function ScopeNewLayout({ children }: { children: ReactNode }) {
  return <WorkflowProvider>{children}</WorkflowProvider>;
}
