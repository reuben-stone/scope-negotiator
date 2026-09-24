export type WorkType = "product" | "feature";

export type ScopeContext = {
  workType: WorkType;
  productContext?: string;
  brief: string;
  team: string;
  timeframe: string;
  constraints?: string;
  approvedMemory?: string[];
  // Snapshot source tracking (for display, not ownership)
  sourceProductId?: string;
  sourceProductName?: string;
  sourceTeamId?: string;
  sourceTeamName?: string;
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
  description: string;
  rationale: string;
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
  analysis: ScopeAnalysis;
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
  sourceProductId: string | null;
  sourceProductName: string | null;
  sourceTeamId: string | null;
  sourceTeamName: string | null;
};

export const EMPTY_CONTEXT_DRAFT: ContextDraft = {
  mode: null,
  existingProduct: "",
  productIdea: "",
  changeRequest: "",
  team: "",
  timeframe: "",
  constraints: "",
  sourceProductId: null,
  sourceProductName: null,
  sourceTeamId: null,
  sourceTeamName: null,
};
