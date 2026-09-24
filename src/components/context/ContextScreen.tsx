import { useEffect, useState } from "react";
import type { WorkType } from "@/types/domain";
import { useRouter } from "next/navigation";
import { useWorkflow } from "@/state/context";
import { ContextFlow } from "@/components/context-flow/ContextFlow";

export function ContextScreen() {
  const router = useRouter();
  const { state } = useWorkflow();
  const [clientMode, setClientMode] = useState<WorkType | null>(null);
  const [checked, setChecked] = useState(false);

  // Read sessionStorage after mount to avoid hydration mismatch
  useEffect(() => {
    const stored = sessionStorage.getItem("scope-negotiator:mode");
    if (stored === "product" || stored === "feature") {
      setClientMode(stored);
    }
    setChecked(true);
  }, []);

  const mode = state.scopeContext?.workType ?? clientMode;

  useEffect(() => {
    if (checked && !mode) {
      router.replace("/");
    }
  }, [checked, mode, router]);

  if (!checked || !mode) return null;

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
