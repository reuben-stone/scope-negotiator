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

  let content: React.ReactNode;
  switch (state.stage) {
    case "context":
      content = <ContextScreen />;
      break;
    case "understand":
      if (!state.analysis) return <Loading message="Analysing your brief..." />;
      content = <UnderstandScreen />;
      break;
    case "clarify":
      content = <ClarifyScreen />;
      break;
    case "negotiate":
      if (!state.proposal) return <Loading message="Renegotiating scope..." />;
      content = <NegotiateScreen />;
      break;
    case "lock":
      content = <LockScreen />;
      break;
    default:
      content = <ContextScreen />;
  }

  return (
    <div key={state.stage} className="stageTransition">
      {content}
    </div>
  );
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
