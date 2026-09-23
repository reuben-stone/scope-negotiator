export type WorkType = "product" | "feature";

export type ScopeContext = {
  workType: WorkType;
  productContext?: string;
  brief: string;
  team: string;
  timeframe: string;
  constraints?: string;
};

export type InsightCategory = "known" | "assumed" | "unknown" | "risk";

export type Insight = {
  id: string;
  category: InsightCategory;
  statement: string;
};

export type ClarifyingQuestion = {
  id: string;
  question: string;
  whyItMatters: string;
  answer?: string;
};

export type ScopeClassification = "ship" | "negotiate" | "cut";

export type ScopeItem = {
  id: string;
  title: string;
  description?: string;
  reasoning: string;
  effort: "low" | "medium" | "high";
  risk: "low" | "medium" | "high";
  recommendedClassification: ScopeClassification;
  currentClassification: ScopeClassification;
  userOverride: boolean;
};

export type ScopeAnalysis = {
  insights: Insight[];
  questions: ClarifyingQuestion[];
};

export type ScopeProposal = {
  goal: string;
  items: ScopeItem[];
  successCriteria: string[];
};

export type LockedScope = {
  context: ScopeContext;
  proposal: ScopeProposal;
  lockedAt: string;
};

// Context flow substep types

export type ContextStep =
  | "product-idea"
  | "existing-product"
  | "change-request"
  | "delivery"
  | "constraints";

export const CONTEXT_FLOWS: Record<WorkType, ContextStep[]> = {
  product: ["product-idea", "delivery", "constraints"],
  feature: ["existing-product", "change-request", "delivery", "constraints"],
};

export type ContextDraft = {
  mode: WorkType | null;
  existingProduct: string;
  productIdea: string;
  changeRequest: string;
  team: string;
  timeframe: string;
  constraints: string;
};

export const EMPTY_CONTEXT_DRAFT: ContextDraft = {
  mode: null,
  existingProduct: "",
  productIdea: "",
  changeRequest: "",
  team: "",
  timeframe: "",
  constraints: "",
};
