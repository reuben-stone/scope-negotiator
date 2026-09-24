"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { PersistedScope } from "@/lib/db/persisted-scope";
import type { ScopeItem } from "@/types/domain";
import { generateMarkdown } from "@/utils/markdown";
import { Button } from "@/components/shared/Button";
import styles from "./SavedScopeView.module.css";

function filterCriteria(
  criteria: string[],
  shipped: ScopeItem[],
  notShipped: ScopeItem[]
): string[] {
  const notShippedTitles = notShipped.map((i) => i.title.toLowerCase());
  return criteria.filter((criterion) => {
    const lower = criterion.toLowerCase();
    return !notShippedTitles.some(
      (title) => title.length > 4 && lower.includes(title)
    );
  });
}

type Props = {
  id: string;
  title: string;
  type: "product" | "feature";
  data: PersistedScope;
  updatedAt: Date;
};

export function SavedScopeView({ id, title, type, data, updatedAt }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Lock scroll when modal is open
  useEffect(() => {
    if (confirmDelete) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [confirmDelete]);

  const { context, analysis, proposal } = data;

  const shipped = useMemo(
    () => proposal.items.filter((i) => i.currentClassification === "ship"),
    [proposal.items]
  );
  const negotiated = useMemo(
    () => proposal.items.filter((i) => i.currentClassification === "negotiate"),
    [proposal.items]
  );
  const cut = useMemo(
    () => proposal.items.filter((i) => i.currentClassification === "cut"),
    [proposal.items]
  );
  const overrides = useMemo(
    () => proposal.items.filter((i) => i.userOverride),
    [proposal.items]
  );
  const notShipped = useMemo(() => [...negotiated, ...cut], [negotiated, cut]);
  const filteredCriteria = useMemo(
    () => filterCriteria(proposal.successCriteria, shipped, notShipped),
    [proposal.successCriteria, shipped, notShipped]
  );

  const handleCopy = useCallback(async () => {
    try {
      const locked = { context, analysis, proposal, lockedAt: data.lockedAt };
      const md = generateMarkdown(locked, filteredCriteria);
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard write failed
    }
  }, [context, analysis, proposal, data.lockedAt, filteredCriteria]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/scopes/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/workspace");
      }
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }, [id, router]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.heading}>{title}</h1>
        <div className={styles.meta}>
          <span className={styles.metaBadge}>
            {type === "product" ? "New Product" : "New Feature"}
          </span>
          <span className={styles.metaBadge}>{shipped.length} Ship</span>
          <span className={styles.metaBadge}>{negotiated.length} Negotiate</span>
          <span className={styles.metaBadge}>{cut.length} Cut</span>
          {overrides.length > 0 && (
            <span className={styles.metaBadge}>
              {overrides.length} Override{overrides.length !== 1 ? "s" : ""}
            </span>
          )}
          <span className={styles.dateLabel}>
            {updatedAt.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className={styles.workspace}>
        {/* Main document */}
        <div className={styles.document}>
          <div className={styles.section}>
            <h3 className={styles.sectionLabel}>Goal</h3>
            <p className={styles.sectionText}>{proposal.goal}</p>
          </div>

          {shipped.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionLabel}>Agreed Scope</h3>
              <ul className={styles.itemList}>
                {shipped.map((item) => (
                  <li key={item.id} className={styles.item}>
                    <p className={styles.itemTitle}>
                      {item.title}
                      {item.userOverride && (
                        <span className={styles.overrideBadge}>Override</span>
                      )}
                    </p>
                    <p className={styles.itemDescription}>
                      {item.description}
                    </p>
                    <div className={styles.itemMeta}>
                      <span className={styles.badge}>
                        Effort: {item.effort.toUpperCase()}
                      </span>
                      <span className={styles.badge}>
                        Risk: {item.risk.toUpperCase()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {notShipped.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionLabel}>
                Deferred / Not in This Scope
              </h3>
              <ul className={styles.itemList}>
                {notShipped.map((item) => (
                  <li key={item.id} className={styles.item}>
                    <p className={styles.itemTitle}>
                      {item.title}
                      <span className={styles.badge}>
                        {item.currentClassification.toUpperCase()}
                      </span>
                      {item.userOverride && (
                        <span className={styles.overrideBadge}>Override</span>
                      )}
                    </p>
                    <p className={styles.itemDescription}>
                      {item.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {filteredCriteria.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionLabel}>Success Criteria</h3>
              <ul className={styles.criteriaList}>
                {filteredCriteria.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {overrides.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionLabel}>Decisions Made</h3>
              <ul className={styles.decisionList}>
                {overrides.map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}</strong>
                    <br />
                    <span className={styles.decisionDetail}>
                      AI proposed:{" "}
                      {item.recommendedClassification.toUpperCase()} → Final
                      decision: {item.currentClassification.toUpperCase()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Summary rail */}
        <aside className={styles.rail}>
          <div className={styles.railSection}>
            <h4 className={styles.railLabel}>Scope Summary</h4>
            <dl className={styles.railData}>
              <div className={styles.railRow}>
                <dt>Ship</dt>
                <dd>{shipped.length}</dd>
              </div>
              <div className={styles.railRow}>
                <dt>Negotiate</dt>
                <dd>{negotiated.length}</dd>
              </div>
              <div className={styles.railRow}>
                <dt>Cut</dt>
                <dd>{cut.length}</dd>
              </div>
              {overrides.length > 0 && (
                <div className={styles.railRow}>
                  <dt>Overrides</dt>
                  <dd>{overrides.length}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className={styles.railSection}>
            <h4 className={styles.railLabel}>Team / Capacity</h4>
            <p className={styles.railText}>{context.team}</p>
          </div>

          <div className={styles.railSection}>
            <h4 className={styles.railLabel}>Timeframe</h4>
            <p className={styles.railText}>{context.timeframe}</p>
          </div>

          {context.constraints && (
            <div className={styles.railSection}>
              <h4 className={styles.railLabel}>Key Constraints</h4>
              <p className={styles.railText}>{context.constraints}</p>
            </div>
          )}

          {/* Analysis context (collapsed) */}
          {analysis.insights.length > 0 && (
            <div className={styles.railSection}>
              <h4 className={styles.railLabel}>Key Observations</h4>
              <ul className={styles.observationList}>
                {analysis.insights
                  .filter((i) => i.category === "risk" || i.category === "unknown")
                  .slice(0, 4)
                  .map((insight) => (
                    <li key={insight.id} className={styles.observation}>
                      <span className={styles.observationCategory}>
                        {insight.category === "risk" ? "Risk" : "Unknown"}
                      </span>
                      {insight.statement}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.deleteLink}
          onClick={() => setConfirmDelete(true)}
        >
          Delete Scope
        </button>
        <Button variant="primary" onClick={handleCopy}>
          <span className={styles.copyStack}>
            <span className={copied ? styles.labelHidden : styles.labelVisible}>
              Copy Markdown →
            </span>
            <span className={copied ? styles.labelVisible : styles.labelHidden}>
              ✓ Copied
            </span>
          </span>
        </Button>
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className={styles.modalOverlay} onClick={() => setConfirmDelete(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalHeading}>Delete This Scope?</h3>
            <p className={styles.modalText}>
              This permanently deletes the saved scope and its decision history.
              This cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalDelete}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete Scope"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
