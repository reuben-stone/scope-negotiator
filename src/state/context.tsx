import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react";
import type { WorkflowState, WorkflowAction } from "@/types/workflow";
import type { ScopeContext, ScopeClassification } from "@/types/domain";
import { initialWorkflowState } from "@/types/workflow";
import { workflowReducer } from "./reducer";

type WorkflowContextValue = {
  state: WorkflowState;
  dispatch: React.Dispatch<WorkflowAction>;
  submitContext: (ctx: ScopeContext) => void;
  submitAnswersAndNegotiate: () => void;
  moveScopeItem: (itemId: string, to: ScopeClassification) => void;
  lockScope: () => void;
  reset: () => void;
};

const WorkflowContext = createContext<WorkflowContextValue | null>(null);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workflowReducer, initialWorkflowState);

  const submitContext = useCallback(async (ctx: ScopeContext) => {
    dispatch({ type: "SUBMIT_CONTEXT", context: ctx });

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ctx),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Analysis failed (${res.status})`);
      }

      const analysis = await res.json();
      dispatch({ type: "SET_ANALYSIS", analysis });
    } catch (err) {
      // Revert to context stage so retry doesn't dead-end at understand
      dispatch({
        type: "SET_ERROR",
        error:
          err instanceof Error
            ? err.message
            : "Analysis failed. Please try again.",
      });
    }
  }, []);

  const submitAnswersAndNegotiate = useCallback(async () => {
    dispatch({ type: "SET_LOADING", loading: true });

    try {
      const res = await fetch("/api/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: state.scopeContext,
          analysis: state.analysis,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error || `Proposal generation failed (${res.status})`
        );
      }

      const proposal = await res.json();
      dispatch({ type: "SET_PROPOSAL", proposal });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        error:
          err instanceof Error
            ? err.message
            : "Proposal generation failed. Please try again.",
      });
    }
  }, [state.scopeContext, state.analysis]);

  const moveScopeItem = useCallback(
    (itemId: string, to: ScopeClassification) => {
      dispatch({ type: "MOVE_SCOPE_ITEM", itemId, to });
    },
    []
  );

  const lockScope = useCallback(() => {
    dispatch({ type: "LOCK_SCOPE" });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return (
    <WorkflowContext.Provider
      value={{
        state,
        dispatch,
        submitContext,
        submitAnswersAndNegotiate,
        moveScopeItem,
        lockScope,
        reset,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error("useWorkflow must be used within WorkflowProvider");
  return ctx;
}
