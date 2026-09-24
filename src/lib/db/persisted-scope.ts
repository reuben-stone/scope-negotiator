import { z } from "zod";

/**
 * Schema for the JSON blob stored in scopes.data.
 * Captures the full domain state needed to reconstruct
 * both the locked scope and the reasoning that produced it.
 */

const ScopeContextSchema = z.object({
  workType: z.enum(["product", "feature"]),
  brief: z.string(),
  team: z.string(),
  timeframe: z.string(),
  productContext: z.string().optional(),
  constraints: z.string().optional(),
  approvedMemory: z.array(z.string()).optional(),
  sourceProductId: z.string().optional(),
  sourceProductName: z.string().optional(),
  sourceTeamId: z.string().optional(),
  sourceTeamName: z.string().optional(),
});

const InsightSchema = z.object({
  id: z.string(),
  category: z.enum(["known", "assumed", "unknown", "risk"]),
  statement: z.string(),
});

const QuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  whyItMatters: z.string(),
  answer: z.string().optional(),
});

const ScopeItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().default(""),
  // Current field name; older records may have "reasoning" instead
  rationale: z.string().optional(),
  reasoning: z.string().optional(),
  effort: z.enum(["low", "medium", "high"]),
  risk: z.enum(["low", "medium", "high"]),
  recommendedClassification: z.enum(["ship", "negotiate", "cut"]),
  currentClassification: z.enum(["ship", "negotiate", "cut"]),
  userOverride: z.boolean(),
}).transform((item) => ({
  ...item,
  rationale: item.rationale ?? item.reasoning ?? "",
}));

const AnalysisSchema = z.object({
  insights: z.array(InsightSchema),
  questions: z.array(QuestionSchema),
});

const ProposalSchema = z.object({
  goal: z.string(),
  items: z.array(ScopeItemSchema),
  successCriteria: z.array(z.string()),
});

export const PersistedScopeSchema = z.object({
  context: ScopeContextSchema,
  analysis: AnalysisSchema,
  proposal: ProposalSchema,
  lockedAt: z.string(),
});

export type PersistedScope = z.infer<typeof PersistedScopeSchema>;
