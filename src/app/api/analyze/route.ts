import { NextResponse } from "next/server";
import { AnalyzeRequestSchema, AnalysisResponseSchema } from "@/lib/ai/schemas";
import { callModel } from "@/lib/ai/provider";
import { analyzeSystemPrompt, analyzeUserPrompt } from "@/lib/ai/prompts";
import type { ScopeAnalysis } from "@/types/domain";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const parsed = AnalyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    return NextResponse.json(
      { error: `Invalid input: ${issues}` },
      { status: 400 }
    );
  }

  const context = parsed.data;

  try {
    const result = await callModel({
      system: analyzeSystemPrompt(),
      user: analyzeUserPrompt(context),
      toolName: "scope_analysis",
      schema: AnalysisResponseSchema,
    });

    // Add application-owned IDs (category-scoped counters)
    const categoryCounts: Record<string, number> = {};
    const analysis: ScopeAnalysis = {
      insights: result.insights.map((insight) => {
        const prefix = insight.category[0];
        categoryCounts[prefix] = (categoryCounts[prefix] ?? 0) + 1;
        return { ...insight, id: `${prefix}${categoryCounts[prefix]}` };
      }),
      questions: result.questions.map((q, i) => ({
        ...q,
        id: `q${i + 1}`,
      })),
    };

    return NextResponse.json(analysis);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown provider error";
    console.error("[analyze] Provider error:", message);

    if (message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json(
        { error: "AI provider is not configured. Set ANTHROPIC_API_KEY in .env.local." },
        { status: 503 }
      );
    }

    const isTimeout =
      message.includes("timeout") || message.includes("ETIMEDOUT");

    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: isTimeout ? 504 : 502 }
    );
  }
}
