import { NextResponse } from "next/server";
import { MemoryProposalResponseSchema } from "@/lib/ai/schemas";
import { callModel } from "@/lib/ai/provider";
import { memorySystemPrompt, memoryUserPrompt } from "@/lib/ai/prompts";
import { PersistedScopeSchema } from "@/lib/db/persisted-scope";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = PersistedScopeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid locked scope data" }, { status: 400 });
  }

  const locked = {
    context: parsed.data.context,
    analysis: parsed.data.analysis,
    proposal: {
      ...parsed.data.proposal,
      items: parsed.data.proposal.items.map((item) => ({
        ...item,
        rationale: item.rationale ?? "",
      })),
    },
    lockedAt: parsed.data.lockedAt,
  };

  try {
    const result = await callModel({
      system: memorySystemPrompt(),
      user: memoryUserPrompt(locked),
      toolName: "memory_proposal",
      schema: MemoryProposalResponseSchema,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[propose-memory] Error:", message);
    return NextResponse.json(
      { error: "Memory proposal failed" },
      { status: 502 }
    );
  }
}
