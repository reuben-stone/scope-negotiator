import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { scopes } from "@/lib/db/schema";
import { PersistedScopeSchema } from "@/lib/db/persisted-scope";

// ── GET /api/scopes/[id] ──

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const workspaceId = (session as { workspaceId?: string })?.workspaceId;

  if (!session?.user?.id || !workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [row] = await db
    .select()
    .from(scopes)
    .where(and(eq(scopes.id, id), eq(scopes.workspaceId, workspaceId)))
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Parse and validate the stored data
  let data: unknown;
  try {
    data = JSON.parse(row.data);
  } catch {
    return NextResponse.json(
      { error: "Corrupt scope data" },
      { status: 500 }
    );
  }

  const parsed = PersistedScopeSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid scope data" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    id: row.id,
    type: row.type,
    title: row.title,
    goal: row.goal,
    data: parsed.data,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

// ── DELETE /api/scopes/[id] ──

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const workspaceId = (session as { workspaceId?: string })?.workspaceId;

  if (!session?.user?.id || !workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [existing] = await db
    .select({ id: scopes.id })
    .from(scopes)
    .where(and(eq(scopes.id, id), eq(scopes.workspaceId, workspaceId)))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.delete(scopes).where(eq(scopes.id, id));

  return NextResponse.json({ deleted: true });
}
