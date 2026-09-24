import { useState, useCallback, useMemo } from "react";
import type { ScopeItem } from "@/types/domain";
import { useWorkflow } from "@/state/context";
import { generateMarkdown } from "@/utils/markdown";
import { Button } from "@/components/shared/Button";
import styles from "./LockScreen.module.css";

/**
 * Filter success criteria to only include those relevant to shipped items.
 * A criterion is excluded if it references the title of an item that is
 * NOT in the final ship scope. This is a conservative heuristic.
 */
function filterCriteria(
  criteria: string[],
  shipped: ScopeItem[],
  notShipped: ScopeItem[]
): string[] {
  const notShippedTitles = notShipped.map((i) => i.title.toLowerCase());

  return criteria.filter((criterion) => {
    const lower = criterion.toLowerCase();
    // Exclude if criterion clearly references a non-shipped item
    return !notShippedTitles.some(
      (title) => title.length > 4 && lower.includes(title)
    );
  });
}

export function LockScreen() {
  const { state, reset, dispatch } = useWorkflow();
  const [copied, setCopied] = useState(false);

  const locked = state.lockedScope;
  if (!locked) return null;

  const { context, proposal } = locked;

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

  const notShipped = useMemo(
    () => [...negotiated, ...cut],
    [negotiated, cut]
  );

  const filteredCriteria = useMemo(
    () => filterCriteria(proposal.successCriteria, shipped, notShipped),
    [proposal.successCriteria, shipped, notShipped]
  );

  const handleCopy = useCallback(async () => {
    try {
      const md = generateMarkdown(locked, filteredCriteria);
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard write failed
    }
  }, [locked, filteredCriteria]);

  return (
    <div className={styles.screen}>
      {/* Local nav */}
      <div className={styles.localNav}>
        <button
          type="button"
          className={styles.backLink}
          onClick={() => dispatch({ type: "BACK_TO_NEGOTIATE" })}
        >
          ← Back to Negotiate
        </button>
      </div>

      <div className={styles.content}>
        <h2 className={styles.heading}>Scope Locked</h2>
        <div className={styles.meta}>
          <span className={styles.metaBadge}>{shipped.length} Ship</span>
          <span className={styles.metaBadge}>
            {negotiated.length} Negotiate
          </span>
          <span className={styles.metaBadge}>{cut.length} Cut</span>
          {overrides.length > 0 && (
            <span className={styles.metaBadge}>
              {overrides.length} Override{overrides.length !== 1 ? "s" : ""}
            </span>
          )}
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
                      {item.description && (
                        <p className={styles.itemDescription}>
                          {item.description}
                        </p>
                      )}
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
                      {item.description && (
                        <p className={styles.itemDescription}>
                          {item.description}
                        </p>
                      )}
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
          </aside>
        </div>
      </div>

      {/* Bottom actions */}
      <div className={styles.actions}>
        <Button variant="ghost" onClick={reset}>
          New Scope
        </Button>
        <Button
          variant="primary"
          onClick={handleCopy}
          className={styles.copyButton}
        >
          <span className={styles.copyStack}>
            <span
              className={copied ? styles.labelHidden : styles.labelVisible}
            >
              Copy Markdown →
            </span>
            <span
              className={copied ? styles.labelVisible : styles.labelHidden}
            >
              ✓ Copied
            </span>
          </span>
        </Button>
        <span className={styles.srOnly} role="status" aria-live="polite">
          {copied ? "Markdown copied to clipboard" : ""}
        </span>
      </div>

      {/* Footer */}
      <div className={styles.footerOuter}>
        <footer className={styles.footer}>
          <span>
            Scope Negotiator<sup>&reg;</sup>&ensp;|&ensp;Product Scoping
            System&ensp;|&ensp;V1.0
          </span>
          <span>Lock&ensp;|&ensp;Scope Locked&ensp;|&ensp;05 / 05</span>
        </footer>
      </div>
    </div>
  );
}
