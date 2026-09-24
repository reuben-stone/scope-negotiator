"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkflow } from "@/state/context";
import { WorkflowHeader } from "@/components/layout/WorkflowHeader";
import { WorkflowFooter } from "@/components/layout/WorkflowFooter";
import { ContextScreen } from "@/components/context/ContextScreen";
import { UnderstandScreen } from "@/components/understand/UnderstandScreen";
import { ClarifyScreen } from "@/components/clarify/ClarifyScreen";
import { NegotiateScreen } from "@/components/negotiate/NegotiateScreen";
import { LockScreen } from "@/components/lock/LockScreen";
import { Loading } from "@/components/states/Loading";
import { ErrorState } from "@/components/states/ErrorState";

export default function ScopePage() {
  const router = useRouter();
  const { state, reset, dispatch } = useWorkflow();
  const [resetKey, setResetKey] = useState(0);

  // Scroll to top on every stage change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [state.stage]);

  const handleReset = useCallback(() => {
    setResetKey((k) => k + 1);
    reset();
    router.push("/");
  }, [reset, router]);

  let content: React.ReactNode;
  let isLoading = false;
  let isError = false;

  if (state.error) {
    isError = true;
    content = (
      <ErrorState
        message={state.error}
        onRetry={() => dispatch({ type: "SET_ERROR", error: null })}
      />
    );
  } else if (state.loading) {
    isLoading = true;
    const messages: Record<string, string> = {
      understand: "Analysing your brief...",
      negotiate: "Renegotiating scope...",
    };
    content = <Loading message={messages[state.stage] ?? "Negotiating..."} />;
  } else {
    switch (state.stage) {
      case "context":
        content = <ContextScreen />;
        break;
      case "understand":
        content = <UnderstandScreen />;
        break;
      case "clarify":
        content = <ClarifyScreen />;
        break;
      case "negotiate":
        content = <NegotiateScreen />;
        break;
      case "lock":
        content = <LockScreen />;
        break;
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <WorkflowHeader currentStage={state.stage} onReset={handleReset} />
      <main id="main-content" key={resetKey} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {content}
      </main>
      <WorkflowFooter stage={state.stage} loading={isLoading} error={isError} />
    </div>
  );
}
