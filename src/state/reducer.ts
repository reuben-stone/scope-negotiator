import type { WorkflowState, WorkflowAction } from "@/types/workflow";

export function workflowReducer(
  state: WorkflowState,
  action: WorkflowAction
): WorkflowState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.loading, error: null };

    case "SET_ERROR":
      return { ...state, error: action.error, loading: false };

    case "SUBMIT_CONTEXT":
      return {
        ...state,
        scopeContext: action.context,
        stage: "understand",
        loading: true,
        error: null,
      };

    case "SET_ANALYSIS":
      return {
        ...state,
        analysis: action.analysis,
        loading: false,
        stage: "understand",
      };

    case "PROCEED_TO_CLARIFY":
      return { ...state, stage: "clarify" };

    case "ANSWER_QUESTION": {
      if (!state.analysis) return state;
      return {
        ...state,
        analysis: {
          ...state.analysis,
          questions: state.analysis.questions.map((q) =>
            q.id === action.questionId ? { ...q, answer: action.answer } : q
          ),
        },
      };
    }

    case "SET_PROPOSAL":
      return {
        ...state,
        proposal: action.proposal,
        loading: false,
        stage: "negotiate",
      };

    case "MOVE_SCOPE_ITEM": {
      if (!state.proposal) return state;
      return {
        ...state,
        proposal: {
          ...state.proposal,
          items: state.proposal.items.map((item) =>
            item.id === action.itemId
              ? {
                  ...item,
                  currentClassification: action.to,
                  userOverride:
                    action.to !== item.recommendedClassification,
                }
              : item
          ),
        },
      };
    }

    case "LOCK_SCOPE": {
      if (!state.proposal || !state.scopeContext) return state;
      return {
        ...state,
        stage: "lock",
        lockedScope: {
          context: state.scopeContext,
          proposal: state.proposal,
          lockedAt: new Date().toISOString(),
        },
      };
    }

    case "RESET":
      return {
        stage: "context",
        scopeContext: null,
        analysis: null,
        proposal: null,
        lockedScope: null,
        loading: false,
        error: null,
      };

    default:
      return state;
  }
}
