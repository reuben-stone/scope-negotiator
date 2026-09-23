import { NextResponse } from "next/server";
import { ProposeRequestSchema, ProposalResponseSchema } from "@/lib/ai/schemas";
import { callModel } from "@/lib/ai/provider";
import { proposeSystemPrompt, proposeUserPrompt } from "@/lib/ai/prompts";
import type { ScopeProposal } from "@/types/domain";

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

  const parsed = ProposeRequestSchema.safeParse(body);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    return NextResponse.json(
      { error: `Invalid input: ${issues}` },
      { status: 400 }
    );
  }

  const { context, analysis } = parsed.data;

  try {
    const result = await callModel({
      system: proposeSystemPrompt(),
      user: proposeUserPrompt(context, analysis),
      toolName: "scope_proposal",
      schema: ProposalResponseSchema,
    });

    // Add application-owned fields
    const proposal: ScopeProposal = {
      goal: result.goal,
      items: result.items.map((item, i) => ({
        ...item,
        id: `item-${i + 1}`,
        description: item.description ?? undefined,
        recommendedClassification: item.classification,
        currentClassification: item.classification,
        userOverride: false,
      })),
      successCriteria: result.successCriteria,
    };

    return NextResponse.json(proposal);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown provider error";
    console.error("[propose] Provider error:", message);

    const isTimeout =
      message.includes("timeout") || message.includes("ETIMEDOUT");

    return NextResponse.json(
      { error: "Proposal generation failed. Please try again." },
      { status: isTimeout ? 504 : 502 }
    );
  }
}
