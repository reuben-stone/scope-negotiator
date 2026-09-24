import { NextResponse } from "next/server";
import { MemoryProposalResponseSchema } from "@/lib/ai/schemas";
import { callModel } from "@/lib/ai/provider";
import { memorySystemPrompt, memoryUserPrompt } from "@/lib/ai/prompts";
import { PersistedScopeSchema } from "@/lib/db/persisted-scope";
import { auth } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const { limited } = rateLimit(getClientIp(request));
  if (limited) {
    return NextResponse.json(
      { error: "You're making requests too quickly. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  const session = await auth();
  const workspaceId = session?.workspaceId;

  if (!session?.user?.id || !workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
      title: parsed.data.proposal.title ?? "",
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
