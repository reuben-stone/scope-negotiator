import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { teamContext } from "@/lib/db/schema";

const VALID_TYPES = ["product_context", "team", "memory"] as const;

const CreateSchema = z.object({
  type: z.enum(VALID_TYPES),
  title: z.string().min(1),
  content: z.string().min(1),
  sourceScopeId: z.string().optional(),
});

// ── GET /api/workspace-context?type=product_context ──

export async function GET(request: NextRequest) {
  const session = await auth();
  const workspaceId = session?.workspaceId;

  if (!session?.user?.id || !workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const type = request.nextUrl.searchParams.get("type");
  if (type && !VALID_TYPES.includes(type as typeof VALID_TYPES[number])) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const conditions = [eq(teamContext.workspaceId, workspaceId)];
  if (type) {
    conditions.push(eq(teamContext.type, type));
  }

  const rows = await db
    .select()
    .from(teamContext)
    .where(and(...conditions))
    .orderBy(desc(teamContext.updatedAt));

  return NextResponse.json(rows);
}

// ── POST /api/workspace-context ──

export async function POST(request: Request) {
  const session = await auth();
  const workspaceId = session?.workspaceId;

  if (!session?.user?.id || !workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const [created] = await db
    .insert(teamContext)
    .values({
      workspaceId,
      type: parsed.data.type,
      title: parsed.data.title,
      content: parsed.data.content,
      sourceScopeId: parsed.data.sourceScopeId,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
