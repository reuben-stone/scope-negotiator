import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { scopes } from "@/lib/db/schema";
import styles from "./workspace.module.css";

type ScopeListItem = {
  id: string;
  type: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  shipCount: number;
  negotiateCount: number;
  cutCount: number;
};

function parseCounts(data: string): {
  shipCount: number;
  negotiateCount: number;
  cutCount: number;
} {
  try {
    const parsed = JSON.parse(data);
    const items = parsed?.proposal?.items ?? [];
    let shipCount = 0;
    let negotiateCount = 0;
    let cutCount = 0;
    for (const item of items) {
      if (item.currentClassification === "ship") shipCount++;
      else if (item.currentClassification === "negotiate") negotiateCount++;
      else if (item.currentClassification === "cut") cutCount++;
    }
    return { shipCount, negotiateCount, cutCount };
  } catch {
    return { shipCount: 0, negotiateCount: 0, cutCount: 0 };
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function ScopesPage() {
  const session = await auth();
  const workspaceId = (session as { workspaceId?: string })?.workspaceId;

  let scopeList: ScopeListItem[] = [];

  if (workspaceId) {
    const rows = await db
      .select({
        id: scopes.id,
        type: scopes.type,
        title: scopes.title,
        data: scopes.data,
        createdAt: scopes.createdAt,
        updatedAt: scopes.updatedAt,
      })
      .from(scopes)
      .where(eq(scopes.workspaceId, workspaceId))
      .orderBy(desc(scopes.updatedAt));

    scopeList = rows.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      ...parseCounts(row.data),
    }));
  }

  if (scopeList.length === 0) {
    return (
      <>
        <h1 className={styles.pageHeading}>Scopes</h1>
        <p className={styles.pageDescription}>
          Your saved scope decisions. Lock a scope to save it here automatically.
        </p>
        <div className={styles.emptyState}>
          <span className={styles.emptyText}>No scopes yet</span>
          <Link href="/" className={styles.emptyAction}>
            + New Scope →
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className={styles.pageHeading}>Scopes</h1>
      <p className={styles.pageDescription}>
        Your saved scope decisions. Lock a scope to save it here automatically.
      </p>
      <div className={styles.scopeList}>
        {scopeList.map((scope) => (
          <Link
            key={scope.id}
            href={`/workspace/scopes/${scope.id}`}
            className={styles.scopeRow}
          >
            <div className={styles.scopeInfo}>
              <span className={styles.scopeTitle}>{scope.title}</span>
              <span className={styles.scopeMeta}>
                <span className={styles.scopeType}>
                  {scope.type === "product" ? "New Product" : "New Feature"}
                </span>
                <span className={styles.scopeDate}>
                  {formatDate(scope.updatedAt)}
                </span>
              </span>
            </div>
            <div className={styles.scopeCounts}>
              <span className={styles.countBadge}>{scope.shipCount} Ship</span>
              <span className={styles.countBadge}>
                {scope.negotiateCount} Negotiate
              </span>
              <span className={styles.countBadge}>{scope.cutCount} Cut</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
