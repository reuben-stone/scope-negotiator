import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type { WorkflowState, WorkflowAction } from "@/types/workflow";
import type { ScopeContext, ScopeClassification } from "@/types/domain";
import { initialWorkflowState } from "@/types/workflow";
import { workflowReducer } from "./reducer";
import { useAuth } from "./auth";

const STORAGE_KEY = "scope-negotiator:workflow";
const SAVED_ID_KEY = "scope-negotiator:savedScopeId";

function saveState(state: WorkflowState, savedScopeId: string | null) {
  try {
    // Don't persist loading or error states
    const toSave: WorkflowState = {
      ...state,
      loading: false,
      error: null,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    if (savedScopeId) {
      sessionStorage.setItem(SAVED_ID_KEY, savedScopeId);
    } else {
      sessionStorage.removeItem(SAVED_ID_KEY);
    }
  } catch {
    // Storage unavailable
  }
}

function loadState(): WorkflowState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorkflowState;
    // Only restore if we have meaningful state beyond context stage
    if (parsed.stage === "context" && !parsed.scopeContext) return null;
    return { ...parsed, loading: false, error: null };
  } catch {
    return null;
  }
}

function loadSavedScopeId(): string | null {
  try {
    return sessionStorage.getItem(SAVED_ID_KEY);
  } catch {
    return null;
  }
}

function clearState() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SAVED_ID_KEY);
  } catch {
    // Storage unavailable
  }
}

type WorkflowContextValue = {
  state: WorkflowState;
  dispatch: React.Dispatch<WorkflowAction>;
  submitContext: (ctx: ScopeContext) => void;
  submitAnswersAndNegotiate: () => void;
  moveScopeItem: (itemId: string, to: ScopeClassification) => void;
  lockScope: () => void;
  reset: () => void;
  savedScopeId: string | null;
};

const WorkflowContext = createContext<WorkflowContextValue | null>(null);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workflowReducer, initialWorkflowState);
  const { isAuthenticated } = useAuth();
  const savedScopeIdRef = useRef<string | null>(null);
  const hydrated = useRef(false);

  // Hydrate from sessionStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const restored = loadState();
    if (restored && restored.scopeContext) {
      // Replay the state by dispatching a restore action
      dispatch({ type: "RESTORE", state: restored });
    }
    savedScopeIdRef.current = loadSavedScopeId();
  }, []);

  // Persist state on every change (skip while loading to avoid saving incomplete states)
  useEffect(() => {
    if (state.loading) return;
    saveState(state, savedScopeIdRef.current);
  }, [state]);

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

    // Auto-save for authenticated users (fire-and-forget)
    if (isAuthenticated && state.scopeContext && state.analysis && state.proposal) {
      const data = {
        context: state.scopeContext,
        analysis: state.analysis,
        proposal: state.proposal,
        lockedAt: new Date().toISOString(),
      };

      const body: { type: string; data: typeof data; id?: string } = {
        type: state.scopeContext.workType,
        data,
      };

      // Re-lock: update existing scope
      if (savedScopeIdRef.current) {
        body.id = savedScopeIdRef.current;
      }

      fetch("/api/scopes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Save failed");
        })
        .then((result: { id: string }) => {
          savedScopeIdRef.current = result.id;
          saveState(state, result.id);
        })
        .catch(() => {
          // Silent fail — save is best-effort, workflow continues
        });
    }
  }, [isAuthenticated, state.scopeContext, state.analysis, state.proposal]);

  const reset = useCallback(() => {
    savedScopeIdRef.current = null;
    clearState();
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
        savedScopeId: savedScopeIdRef.current,
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
