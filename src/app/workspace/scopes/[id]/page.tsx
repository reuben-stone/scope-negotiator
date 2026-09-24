import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { scopes } from "@/lib/db/schema";
import { PersistedScopeSchema } from "@/lib/db/persisted-scope";
import { SavedScopeView } from "@/components/workspace/SavedScopeView";
import styles from "../../workspace.module.css";

export default async function ScopeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const workspaceId = session?.workspaceId;

  if (!session?.user?.id || !workspaceId) {
    notFound();
  }

  const { id } = await params;

  const [row] = await db
    .select()
    .from(scopes)
    .where(and(eq(scopes.id, id), eq(scopes.workspaceId, workspaceId)))
    .limit(1);

  if (!row) {
    notFound();
  }

  let data;
  try {
    data = PersistedScopeSchema.parse(JSON.parse(row.data));
  } catch {
    notFound();
  }

  return (
    <>
      <Link href="/workspace" className={styles.emptyAction}>
        ← Back to Scopes
      </Link>
      <SavedScopeView
        id={row.id}
        title={row.title}
        type={row.type as "product" | "feature"}
        data={data}
        updatedAt={row.updatedAt}
      />
    </>
  );
}
