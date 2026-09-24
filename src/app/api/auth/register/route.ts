import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const RegisterSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100).optional(),
});

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

  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    return NextResponse.json(
      { error: issues },
      { status: 400 }
    );
  }

  const { email, password, name } = parsed.data;
  const normalised = email.toLowerCase().trim();

  // Check for existing account
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalised))
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await hash(password, 10);

  await db.insert(users).values({
    email: normalised,
    passwordHash,
    name: name ?? null,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
