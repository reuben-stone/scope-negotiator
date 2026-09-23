import type {
  ScopeContext,
  ScopeAnalysis,
  ScopeProposal,
  LockedScope,
  ScopeClassification,
} from "./domain";

export type WorkflowStage =
  | "context"
  | "understand"
  | "clarify"
  | "negotiate"
  | "lock";

export const STAGES: WorkflowStage[] = [
  "context",
  "understand",
  "clarify",
  "negotiate",
  "lock",
];

export type WorkflowState = {
  stage: WorkflowStage;
  scopeContext: ScopeContext | null;
  analysis: ScopeAnalysis | null;
  proposal: ScopeProposal | null;
  lockedScope: LockedScope | null;
  loading: boolean;
  error: string | null;
};

export type WorkflowAction =
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SUBMIT_CONTEXT"; context: ScopeContext }
  | { type: "SET_ANALYSIS"; analysis: ScopeAnalysis }
  | { type: "ANSWER_QUESTION"; questionId: string; answer: string }
  | { type: "PROCEED_TO_CLARIFY" }
  | { type: "SET_PROPOSAL"; proposal: ScopeProposal }
  | {
      type: "MOVE_SCOPE_ITEM";
      itemId: string;
      to: ScopeClassification;
    }
  | { type: "LOCK_SCOPE" }
  | { type: "RESET" };

export const initialWorkflowState: WorkflowState = {
  stage: "context",
  scopeContext: null,
  analysis: null,
  proposal: null,
  lockedScope: null,
  loading: false,
  error: null,
};
