import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { scopes } from "@/lib/db/schema";
import { PersistedScopeSchema } from "@/lib/db/persisted-scope";
import { deriveTitle } from "@/utils/title";

// ── Save request schema ──

const SaveScopeRequestSchema = z.object({
  id: z.string().optional(), // present on re-lock (update)
  type: z.enum(["product", "feature"]),
  data: PersistedScopeSchema,
});

// ── POST /api/scopes ──

export async function POST(request: Request) {
  const session = await auth();
  const workspaceId = (session as { workspaceId?: string })?.workspaceId;

  if (!session?.user?.id || !workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = SaveScopeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const { id, type, data } = parsed.data;
  const title = deriveTitle(data.context.brief);
  const goal = data.proposal.goal;
  const serialized = JSON.stringify(data);

  // Re-lock: update existing scope
  if (id) {
    const [existing] = await db
      .select({ workspaceId: scopes.workspaceId })
      .from(scopes)
      .where(eq(scopes.id, id))
      .limit(1);

    if (!existing || existing.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [updated] = await db
      .update(scopes)
      .set({
        type,
        title,
        goal,
        data: serialized,
        updatedAt: new Date(),
      })
      .where(eq(scopes.id, id))
      .returning({ id: scopes.id });

    return NextResponse.json({ id: updated.id });
  }

  // New scope
  const [created] = await db
    .insert(scopes)
    .values({
      workspaceId,
      type,
      title,
      goal,
      data: serialized,
    })
    .returning({ id: scopes.id });

  return NextResponse.json({ id: created.id }, { status: 201 });
}

// ── GET /api/scopes ──

export async function GET() {
  const session = await auth();
  const workspaceId = (session as { workspaceId?: string })?.workspaceId;

  if (!session?.user?.id || !workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({
      id: scopes.id,
      type: scopes.type,
      title: scopes.title,
      goal: scopes.goal,
      data: scopes.data,
      createdAt: scopes.createdAt,
      updatedAt: scopes.updatedAt,
    })
    .from(scopes)
    .where(eq(scopes.workspaceId, workspaceId))
    .orderBy(desc(scopes.updatedAt));

  // Parse data to extract counts for list view
  const items = rows.map((row) => {
    let shipCount = 0;
    let negotiateCount = 0;
    let cutCount = 0;

    try {
      const data = JSON.parse(row.data);
      const scopeItems = data?.proposal?.items ?? [];
      for (const item of scopeItems) {
        if (item.currentClassification === "ship") shipCount++;
        else if (item.currentClassification === "negotiate") negotiateCount++;
        else if (item.currentClassification === "cut") cutCount++;
      }
    } catch {
      // data parse failed — counts stay 0
    }

    return {
      id: row.id,
      type: row.type,
      title: row.title,
      goal: row.goal,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      shipCount,
      negotiateCount,
      cutCount,
    };
  });

  return NextResponse.json(items);
}
