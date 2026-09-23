import { z } from "zod";

// ── Model response schemas ──
// These define what the model is expected to return.
// Application-owned fields (id, currentClassification, userOverride) are added
// by the service layer after validation.

export const AnalysisResponseSchema = z.object({
  insights: z
    .array(
      z.object({
        category: z.enum(["known", "assumed", "unknown", "risk"]),
        statement: z.string().min(1),
      })
    )
    .max(10),
  questions: z
    .array(
      z.object({
        question: z.string().min(1),
        whyItMatters: z.string().min(1),
      })
    )
    .max(3),
});

export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>;

export const ProposalResponseSchema = z.object({
  goal: z.string().min(1),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        reasoning: z.string().min(1),
        effort: z.enum(["low", "medium", "high"]),
        risk: z.enum(["low", "medium", "high"]),
        classification: z.enum(["ship", "negotiate", "cut"]),
      })
    )
    .max(12),
  successCriteria: z.array(z.string().min(1)).max(8),
});

export type ProposalResponse = z.infer<typeof ProposalResponseSchema>;

// ── API request body schemas ──
// Validate incoming client payloads before reaching the provider.

export const AnalyzeRequestSchema = z.object({
  workType: z.enum(["product", "feature"]),
  brief: z.string().min(1),
  team: z.string().min(1),
  timeframe: z.string().min(1),
  productContext: z.string().optional(),
  constraints: z.string().optional(),
});

const ClarifyingQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  whyItMatters: z.string(),
  answer: z.string().optional(),
});

const InsightSchema = z.object({
  id: z.string(),
  category: z.enum(["known", "assumed", "unknown", "risk"]),
  statement: z.string(),
});

export const ProposeRequestSchema = z.object({
  context: z.object({
    workType: z.enum(["product", "feature"]),
    brief: z.string().min(1),
    team: z.string().min(1),
    timeframe: z.string().min(1),
    productContext: z.string().optional(),
    constraints: z.string().optional(),
  }),
  analysis: z.object({
    insights: z.array(InsightSchema),
    questions: z.array(ClarifyingQuestionSchema),
  }),
});
