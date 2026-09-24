import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { teamContext } from "@/lib/db/schema";

const UpdateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

// ── PUT /api/workspace-context/[id] ──

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const workspaceId = (session as { workspaceId?: string })?.workspaceId;

  if (!session?.user?.id || !workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const [existing] = await db
    .select({ workspaceId: teamContext.workspaceId })
    .from(teamContext)
    .where(eq(teamContext.id, id))
    .limit(1);

  if (!existing || existing.workspaceId !== workspaceId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [updated] = await db
    .update(teamContext)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(teamContext.id, id))
    .returning();

  return NextResponse.json(updated);
}

// ── DELETE /api/workspace-context/[id] ──

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
    .select({ workspaceId: teamContext.workspaceId })
    .from(teamContext)
    .where(eq(teamContext.id, id))
    .limit(1);

  if (!existing || existing.workspaceId !== workspaceId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.delete(teamContext).where(eq(teamContext.id, id));

  return NextResponse.json({ deleted: true });
}
