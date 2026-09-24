import { useEffect } from "react";
import type { WorkType } from "@/types/domain";
import { useRouter } from "next/navigation";
import { useWorkflow } from "@/state/context";
import { ContextFlow } from "@/components/context-flow/ContextFlow";

function readMode(): WorkType | null {
  if (typeof window === "undefined") return null;
  const stored = sessionStorage.getItem("scope-negotiator:mode");
  if (stored === "product" || stored === "feature") return stored;
  return null;
}

export function ContextScreen() {
  const router = useRouter();
  const { state } = useWorkflow();

  // Derive mode: existing workflow context > sessionStorage > redirect
  const mode = state.scopeContext?.workType ?? readMode();

  useEffect(() => {
    if (!mode) {
      router.replace("/");
    }
  }, [mode, router]);

  if (!mode) return null;

  return (
    <ContextFlow
      mode={mode}
      onChangeType={() => {
        sessionStorage.removeItem("scope-negotiator:mode");
        router.push("/");
      }}
    />
  );
}
