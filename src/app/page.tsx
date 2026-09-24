"use client";

import { useCallback } from "react";
import { WorkflowProvider, useWorkflow } from "@/state/context";
import { WorkflowHeader } from "@/components/layout/WorkflowHeader";
import { WorkflowFooter } from "@/components/layout/WorkflowFooter";
import { LandingPage } from "@/components/context/LandingPage";

function LandingInner() {
  const { reset } = useWorkflow();

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <WorkflowHeader currentStage="context" onReset={handleReset} />
      <main id="main-content" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <LandingPage />
      </main>
      <WorkflowFooter stage="context" />
    </div>
  );
}

export default function Home() {
  return (
    <WorkflowProvider>
      <LandingInner />
    </WorkflowProvider>
  );
}
