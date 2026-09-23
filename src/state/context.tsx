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
import { analyzeScope, generateProposal } from "@/mock/service";

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

  const submitContext = useCallback((ctx: ScopeContext) => {
    dispatch({ type: "SUBMIT_CONTEXT", context: ctx });

    setTimeout(() => {
      const analysis = analyzeScope(ctx);
      dispatch({ type: "SET_ANALYSIS", analysis });
    }, 1500);
  }, []);

  const submitAnswersAndNegotiate = useCallback(() => {
    dispatch({ type: "SET_LOADING", loading: true });

    setTimeout(() => {
      if (!state.scopeContext || !state.analysis) return;
      const proposal = generateProposal(state.scopeContext, state.analysis);
      dispatch({ type: "SET_PROPOSAL", proposal });
    }, 1500);
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
