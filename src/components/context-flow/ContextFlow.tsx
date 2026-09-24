import { useReducer, useCallback, useRef, useEffect } from "react";
import type {
  WorkType,
  ContextStep,
  ContextDraft,
  ScopeContext,
} from "@/types/domain";
import { CONTEXT_FLOWS, EMPTY_CONTEXT_DRAFT } from "@/types/domain";
import { useWorkflow } from "@/state/context";
import { useWorkspaceData, type SavedContext } from "@/state/workspace-data";
import { Button } from "@/components/shared/Button";
import { Textarea, TextInput } from "@/components/shared/Input";
import styles from "./ContextFlow.module.css";

// Step metadata

type StepConfig = {
  id: ContextStep;
  eyebrow: string;
  heading: string;
  helper?: string;
  optional?: boolean;
};

const STEP_CONFIG: Record<ContextStep, Omit<StepConfig, "id" | "eyebrow">> = {
  "existing-product": {
    heading: "Tell us what already exists.",
    helper:
      "Give us enough context to understand what this change is being made to.",
    optional: true,
  },
  "product-idea": {
    heading: "What are you trying to build?",
  },
  "change-request": {
    heading: "What do you want to add or change?",
  },
  delivery: {
    heading: "What do we actually have to work with?",
  },
  constraints: {
    heading: "What can\u2019t move?",
    helper: "Hard boundaries the negotiation needs to respect.",
    optional: true,
  },
};

const STEP_LABELS: Record<ContextStep, string> = {
  "existing-product": "Existing Product",
  "product-idea": "Product Idea",
  "change-request": "Change Request",
  delivery: "Delivery",
  constraints: "Constraints",
};

// Draft reducer

type DraftAction =
  | { type: "SET_MODE"; mode: WorkType }
  | { type: "SET_FIELD"; field: keyof ContextDraft; value: string }
  | { type: "RESET" };

function draftReducer(state: ContextDraft, action: DraftAction): ContextDraft {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.mode };
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return EMPTY_CONTEXT_DRAFT;
    default:
      return state;
  }
}

// Field mapping from step to draft key

function draftKeyForStep(step: ContextStep): keyof ContextDraft | null {
  switch (step) {
    case "existing-product":
      return "existingProduct";
    case "product-idea":
      return "productIdea";
    case "change-request":
      return "changeRequest";
    default:
      return null;
  }
}

function isStepValid(step: ContextStep, draft: ContextDraft): boolean {
  const config = STEP_CONFIG[step];
  if (config.optional) return true;

  switch (step) {
    case "product-idea":
      return draft.productIdea.trim().length > 0;
    case "change-request":
      return draft.changeRequest.trim().length > 0;
    case "delivery":
      return draft.team.trim().length > 0 && draft.timeframe.trim().length > 0;
    default:
      return true;
  }
}

// Build ScopeContext from draft

function buildScopeContext(draft: ContextDraft, approvedMemory?: string[]): ScopeContext {
  const mode = draft.mode!;
  return {
    workType: mode,
    brief:
      mode === "product" ? draft.productIdea.trim() : draft.changeRequest.trim(),
    team: draft.team.trim(),
    timeframe: draft.timeframe.trim(),
    ...(mode === "feature" && draft.existingProduct.trim()
      ? { productContext: draft.existingProduct.trim() }
      : {}),
    ...(draft.constraints.trim()
      ? { constraints: draft.constraints.trim() }
      : {}),
    ...(approvedMemory && approvedMemory.length > 0
      ? { approvedMemory }
      : {}),
    ...(draft.sourceProductId
      ? { sourceProductId: draft.sourceProductId, sourceProductName: draft.sourceProductName ?? undefined }
      : {}),
    ...(draft.sourceTeamId
      ? { sourceTeamId: draft.sourceTeamId, sourceTeamName: draft.sourceTeamName ?? undefined }
      : {}),
  };
}

// Main component

type Props = {
  mode: WorkType;
  onChangeType: () => void;
};

export function ContextFlow({ mode, onChangeType }: Props) {
  const { submitContext } = useWorkflow();
  const { products: savedProducts, teams: savedTeams, memories: approvedMemories } = useWorkspaceData();
  const [draft, dispatchDraft] = useReducer(draftReducer, {
    ...EMPTY_CONTEXT_DRAFT,
    mode,
  });

  const steps = CONTEXT_FLOWS[mode];
  const [stepIndex, setStepIndex] = useStepIndex(0);
  const currentStep = steps[stepIndex];
  const totalSteps = steps.length;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  const [validationError, setValidationError] = useValidation();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [stepIndex]);

  const handleBack = useCallback(() => {
    setValidationError(null);
    if (isFirst) {
      onChangeType();
    } else {
      setStepIndex(stepIndex - 1);
    }
  }, [isFirst, stepIndex, onChangeType, setStepIndex, setValidationError]);

  const handleContinue = useCallback(() => {
    if (!isStepValid(currentStep, draft)) {
      setValidationError("This field is required to continue.");
      return;
    }
    setValidationError(null);

    if (isLast) {
      submitContext(buildScopeContext(draft, approvedMemories));
    } else {
      setStepIndex(stepIndex + 1);
    }
  }, [
    currentStep,
    draft,
    isLast,
    stepIndex,
    submitContext,
    setStepIndex,
    setValidationError,
    approvedMemories,
  ]);

  const handleSkip = useCallback(() => {
    setValidationError(null);
    if (isLast) {
      submitContext(buildScopeContext(draft, approvedMemories));
    } else {
      setStepIndex(stepIndex + 1);
    }
  }, [isLast, stepIndex, draft, submitContext, setStepIndex, setValidationError, approvedMemories]);

  const updateField = useCallback(
    (field: keyof ContextDraft, value: string) => {
      dispatchDraft({ type: "SET_FIELD", field, value });
      if (validationError) setValidationError(null);
    },
    [validationError, setValidationError]
  );

  const stepConfig = STEP_CONFIG[currentStep];
  const eyebrow = `${String(stepIndex + 1).padStart(2, "0")} / ${STEP_LABELS[currentStep].toUpperCase()}`;

  return (
    <div className={styles.workspace}>
      {/* Local navigation: back + step progress */}
      <div className={styles.localNav}>
        <button
          type="button"
          className={styles.backLink}
          onClick={handleBack}
        >
          ← {isFirst ? "Change Type" : "Back"}
        </button>
        <nav className={styles.localSteps} aria-label="Context steps">
          {steps.map((s, i) => (
            <span
              key={s}
              className={`${styles.localStep} ${i === stepIndex ? styles.localStepActive : ""} ${i < stepIndex ? styles.localStepDone : ""}`}
              aria-current={i === stepIndex ? "step" : undefined}
            >
              {String(i + 1).padStart(2, "0")} {STEP_LABELS[s]}
            </span>
          ))}
        </nav>
        <span className={styles.localStepsMobile}>
          {String(stepIndex + 1).padStart(2, "0")} / {String(totalSteps).padStart(2, "0")}
        </span>
      </div>

      {/* Two-column workspace */}
      <div key={stepIndex} className={styles.workspaceGrid}>
        <div className={styles.promptColumn}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2
            className={styles.stepHeading}
            ref={headingRef}
            tabIndex={-1}
          >
            {stepConfig.heading}
          </h2>
          {stepConfig.helper && (
            <p className={styles.stepHelper}>{stepConfig.helper}</p>
          )}
        </div>

        <div className={styles.inputColumn}>
          <StepInput
            step={currentStep}
            draft={draft}
            onUpdate={updateField}
            onSelectProduct={(id, name, content) => {
              dispatchDraft({ type: "SET_FIELD", field: "sourceProductId", value: id });
              dispatchDraft({ type: "SET_FIELD", field: "sourceProductName", value: name });
              dispatchDraft({ type: "SET_FIELD", field: "existingProduct", value: content });
            }}
            onSelectTeam={(id, name, content) => {
              dispatchDraft({ type: "SET_FIELD", field: "sourceTeamId", value: id });
              dispatchDraft({ type: "SET_FIELD", field: "sourceTeamName", value: name });
              dispatchDraft({ type: "SET_FIELD", field: "team", value: content });
            }}
            savedProducts={savedProducts}
            savedTeams={savedTeams}
            validationError={validationError}
          />
        </div>
      </div>

      {/* Bottom actions */}
      <div className={styles.actions}>
        <div className={styles.actionsRight}>
          {stepConfig.optional && (
            <Button variant="ghost" onClick={handleSkip}>
              Skip →
            </Button>
          )}
          <Button variant="primary" onClick={handleContinue}>
            {isLast ? "Negotiate Scope →" : "Continue →"}
          </Button>
        </div>
      </div>

    </div>
  );
}

// Step input renderer

function StepInput({
  step,
  draft,
  onUpdate,
  onSelectProduct,
  onSelectTeam,
  savedProducts,
  savedTeams,
  validationError,
}: {
  step: ContextStep;
  draft: ContextDraft;
  onUpdate: (field: keyof ContextDraft, value: string) => void;
  onSelectProduct: (id: string, name: string, content: string) => void;
  onSelectTeam: (id: string, name: string, content: string) => void;
  savedProducts: SavedContext[];
  savedTeams: SavedContext[];
  validationError: string | null;
}) {
  // Existing product step — with saved product selector
  if (step === "existing-product") {
    return (
      <div className={styles.inputGroup}>
        {savedProducts.length > 0 && (
          <div className={styles.selectorGroup}>
            <label htmlFor="product-select" className={styles.selectorLabel}>
              Saved Product
            </label>
            <select
              id="product-select"
              className={styles.selector}
              value={draft.sourceProductId ?? ""}
              onChange={(e) => {
                const selected = savedProducts.find((p) => p.id === e.target.value);
                if (selected) {
                  onSelectProduct(selected.id, selected.title ?? "", selected.content);
                } else {
                  onSelectProduct("", "", "");
                }
              }}
            >
              <option value="">Enter manually</option>
              {savedProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        )}
        <label htmlFor="input-existing-product" className={styles.selectorLabel}>
          Product Context
        </label>
        <Textarea
          id="input-existing-product"
          large
          value={draft.existingProduct}
          onChange={(e) => onUpdate("existingProduct", e.target.value)}
          placeholder="Product, users, current behaviour, relevant technical context..."
          aria-invalid={validationError ? true : undefined}
          aria-describedby={validationError ? "error-existing-product" : undefined}
        />
        {validationError && (
          <p id="error-existing-product" className={styles.error} role="alert">
            {validationError}
          </p>
        )}
      </div>
    );
  }

  // Other single-field steps (product-idea, change-request)
  const singleFieldKey = draftKeyForStep(step);

  if (singleFieldKey) {
    const value = draft[singleFieldKey] as string;
    const placeholders: Record<string, string> = {
      productIdea: "The idea, the problem, intended users, desired outcome...",
      changeRequest: "Describe the feature or change...",
    };

    return (
      <div className={styles.inputGroup}>
        <label htmlFor={`input-${step}`} className={styles.srOnly}>
          {STEP_LABELS[step]}
        </label>
        <Textarea
          id={`input-${step}`}
          large
          value={value}
          onChange={(e) => onUpdate(singleFieldKey, e.target.value)}
          placeholder={placeholders[singleFieldKey] ?? ""}
          aria-invalid={validationError ? true : undefined}
          aria-describedby={validationError ? `error-${step}` : undefined}
        />
        {validationError && (
          <p id={`error-${step}`} className={styles.error} role="alert">
            {validationError}
          </p>
        )}
      </div>
    );
  }

  if (step === "delivery") {
    return (
      <div className={styles.deliveryFields}>
        <div className={styles.inputGroup}>
          <label htmlFor="input-team" className={styles.fieldLabel}>
            Team / Capacity
          </label>
          <p className={styles.fieldHint}>Who can actually work on this?</p>
          {savedTeams.length > 0 && (
            <div className={styles.selectorGroup}>
              <label htmlFor="team-select" className={styles.selectorLabel}>
                Using
              </label>
              <select
                id="team-select"
                className={styles.selector}
                value={draft.sourceTeamId ?? ""}
                onChange={(e) => {
                  const selected = savedTeams.find((t) => t.id === e.target.value);
                  if (selected) {
                    onSelectTeam(selected.id, selected.title ?? "", selected.content);
                  } else {
                    onSelectTeam("", "", "");
                  }
                }}
              >
                <option value="">Enter manually</option>
                {savedTeams.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          )}
          <Textarea
            id="input-team"
            value={draft.team}
            onChange={(e) => onUpdate("team", e.target.value)}
            placeholder="2 full-stack engineers, full-time; designer available 2 days/week"
            aria-invalid={validationError && !draft.team.trim() ? true : undefined}
            aria-describedby={
              validationError && !draft.team.trim() ? "error-delivery" : undefined
            }
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="input-timeframe" className={styles.fieldLabel}>
            Timeframe
          </label>
          <TextInput
            id="input-timeframe"
            variant="secondary"
            value={draft.timeframe}
            onChange={(e) => onUpdate("timeframe", e.target.value)}
            placeholder="6 weeks"
            aria-invalid={
              validationError && !draft.timeframe.trim() ? true : undefined
            }
            aria-describedby={
              validationError && !draft.timeframe.trim()
                ? "error-delivery"
                : undefined
            }
          />
        </div>
        {validationError && (
          <p id="error-delivery" className={styles.error} role="alert">
            {validationError}
          </p>
        )}
      </div>
    );
  }

  if (step === "constraints") {
    return (
      <div className={styles.inputGroup}>
        <label htmlFor="input-constraints" className={styles.srOnly}>
          Constraints
        </label>
        <Textarea
          id="input-constraints"
          large
          value={draft.constraints}
          onChange={(e) => onUpdate("constraints", e.target.value)}
          placeholder="Must use existing auth. No new infrastructure. Must ship in 6 weeks. Customer-facing AI requires human review."
        />
      </div>
    );
  }

  return null;
}

// Hooks

function useStepIndex(initial: number): [number, (n: number) => void] {
  const [index, setIndex] = useReducer(
    (_: number, next: number) => next,
    initial
  );
  return [index, setIndex];
}

function useValidation(): [string | null, (e: string | null) => void] {
  const [error, setError] = useReducer(
    (_: string | null, next: string | null) => next,
    null
  );
  return [error, setError];
}
