"use client";

import { useState, useCallback } from "react";
import { WorkflowProvider, useWorkflow } from "@/state/context";
import { WorkflowHeader } from "@/components/layout/WorkflowHeader";
import { ContextScreen } from "@/components/context/ContextScreen";
import { UnderstandScreen } from "@/components/understand/UnderstandScreen";
import { ClarifyScreen } from "@/components/clarify/ClarifyScreen";
import { NegotiateScreen } from "@/components/negotiate/NegotiateScreen";
import { LockScreen } from "@/components/lock/LockScreen";
import { Loading } from "@/components/states/Loading";
import { ErrorState } from "@/components/states/ErrorState";

function WorkflowRouter() {
  const { state, reset, dispatch } = useWorkflow();

  if (state.error) {
    return (
      <ErrorState
        message={state.error}
        onRetry={() => dispatch({ type: "SET_ERROR", error: null })}
      />
    );
  }

  if (state.loading) {
    const messages: Record<string, string> = {
      understand: "Analysing your brief...",
      negotiate: "Renegotiating scope...",
    };
    return <Loading message={messages[state.stage] ?? "Negotiating..."} />;
  }

  switch (state.stage) {
    case "context":
      return <ContextScreen />;
    case "understand":
      if (!state.analysis) return <Loading message="Analysing your brief..." />;
      return <UnderstandScreen />;
    case "clarify":
      return <ClarifyScreen />;
    case "negotiate":
      if (!state.proposal) return <Loading message="Renegotiating scope..." />;
      return <NegotiateScreen />;
    case "lock":
      return <LockScreen />;
    default:
      return <ContextScreen />;
  }
}

export function WorkflowApp() {
  return (
    <WorkflowProvider>
      <WorkflowInner />
    </WorkflowProvider>
  );
}

function WorkflowInner() {
  const { state, reset } = useWorkflow();
  const [resetKey, setResetKey] = useState(0);

  const handleReset = useCallback(() => {
    setResetKey((k) => k + 1);
    reset();
  }, [reset]);

  return (
    <>
      <WorkflowHeader currentStage={state.stage} onReset={handleReset} />
      <main key={resetKey}>
        <WorkflowRouter />
      </main>
    </>
  );
}
