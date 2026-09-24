"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname, useRouter, notFound } from "next/navigation";
import type { WorkflowStage } from "@/types/workflow";
import { STAGES } from "@/types/workflow";
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

const VALID_STAGES = new Set<string>(STAGES);

function getLatestValidStage(state: {
  scopeContext: unknown;
  analysis: unknown;
  proposal: unknown;
  lockedScope: unknown;
}): WorkflowStage {
  if (state.lockedScope) return "lock";
  if (state.proposal) return "negotiate";
  if (state.analysis) return "clarify";
  if (state.scopeContext) return "understand";
  return "context";
}

function idx(s: WorkflowStage): number {
  return STAGES.indexOf(s);
}

function stageFromPathname(pathname: string): WorkflowStage | null {
  const segment = pathname.split("/").pop();
  if (segment && VALID_STAGES.has(segment)) return segment as WorkflowStage;
  // /scope/new with no stage segment → context
  if (pathname === "/scope/new" || pathname === "/scope/new/") return "context";
  return null;
}

export default function StagePage() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, reset, dispatch } = useWorkflow();
  const [resetKey, setResetKey] = useState(0);
  const prevReducerStage = useRef(state.stage);

  const requestedStage = stageFromPathname(pathname);

  if (requestedStage === null) {
    notFound();
  }

  const latestValid = getLatestValidStage(state);

  // Navigate by updating URL without full route change
  const navigateToStage = useCallback(
    (stage: WorkflowStage) => {
      window.history.pushState(null, "", `/scope/new/${stage}`);
      // Force re-render by dispatching a no-op or relying on state change
    },
    []
  );

  // Forward navigation: when reducer stage advances beyond current route
  useEffect(() => {
    const prev = prevReducerStage.current;
    prevReducerStage.current = state.stage;

    if (
      state.stage !== prev &&
      !state.loading &&
      !state.error &&
      idx(state.stage) > idx(requestedStage)
    ) {
      router.push(`/scope/new/${state.stage}`, { scroll: false });
    }
  }, [state.stage, state.loading, state.error, requestedStage, router]);

  // Route guard: redirect to latest valid stage if requested is ahead
  useEffect(() => {
    if (idx(requestedStage) > idx(latestValid)) {
      const target = latestValid === "context" ? "/" : `/scope/new/${latestValid}`;
      router.replace(target);
    }
  }, [requestedStage, latestValid, router]);

  // Browser back/forward sync: align reducer with route when going backward
  useEffect(() => {
    if (
      idx(requestedStage) <= idx(latestValid) &&
      idx(requestedStage) < idx(state.stage)
    ) {
      if (requestedStage === "context" && state.stage !== "context") {
        dispatch({ type: "BACK_TO_CONTEXT" });
      } else if (requestedStage === "understand" && idx(state.stage) > idx("understand")) {
        dispatch({ type: "BACK_TO_UNDERSTAND" });
      } else if (requestedStage === "clarify" && idx(state.stage) > idx("clarify")) {
        dispatch({ type: "BACK_TO_CLARIFY" });
      } else if (requestedStage === "negotiate" && state.stage === "lock") {
        dispatch({ type: "BACK_TO_NEGOTIATE" });
      }
    }
  }, [requestedStage, latestValid, state.stage, dispatch]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [requestedStage]);

  const handleReset = useCallback(() => {
    setResetKey((k) => k + 1);
    reset();
    router.push("/");
  }, [reset, router]);

  // If route guard will redirect, show nothing
  if (idx(requestedStage) > idx(latestValid)) {
    return null;
  }

  // Use the effective stage for content: whichever is lower between
  // the requested route and the actual reducer stage. This prevents
  // flashing content for a stage whose data isn't ready yet.
  const effectiveStage: WorkflowStage =
    idx(requestedStage) <= idx(state.stage) ? requestedStage : state.stage;

  // Determine content based on effective stage + actual data
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
    switch (effectiveStage) {
      case "context":
        content = <ContextScreen />;
        break;
      case "understand":
        if (!state.analysis) {
          isLoading = true;
          content = <Loading message="Analysing your brief..." />;
          break;
        }
        content = <UnderstandScreen />;
        break;
      case "clarify":
        content = <ClarifyScreen />;
        break;
      case "negotiate":
        if (!state.proposal) {
          isLoading = true;
          content = <Loading message="Renegotiating scope..." />;
          break;
        }
        content = <NegotiateScreen />;
        break;
      case "lock":
        content = <LockScreen />;
        break;
      default:
        content = <ContextScreen />;
    }
  }

  // Use effective stage for header/footer so they don't jump ahead of content
  const displayStage = isLoading || isError ? effectiveStage : effectiveStage;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <WorkflowHeader currentStage={displayStage} onReset={handleReset} />
      <main key={resetKey} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {content}
      </main>
      <WorkflowFooter stage={displayStage} loading={isLoading} error={isError} />
    </div>
  );
}
