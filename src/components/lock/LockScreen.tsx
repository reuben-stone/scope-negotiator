import { useState, useCallback } from "react";
import { useWorkflow } from "@/state/context";
import { generateMarkdown } from "@/utils/markdown";
import { Button } from "@/components/shared/Button";
import styles from "./LockScreen.module.css";

export function LockScreen() {
  const { state, reset } = useWorkflow();
  const [copied, setCopied] = useState(false);

  const locked = state.lockedScope;
  if (!locked) return null;

  const { context, proposal } = locked;
  const shipped = proposal.items.filter(
    (i) => i.currentClassification === "ship"
  );
  const negotiated = proposal.items.filter(
    (i) => i.currentClassification === "negotiate"
  );
  const cut = proposal.items.filter(
    (i) => i.currentClassification === "cut"
  );
  const deferred = [...negotiated, ...cut];
  const overrides = proposal.items.filter((i) => i.userOverride);

  const handleCopy = useCallback(async () => {
    const md = generateMarkdown(locked);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [locked]);

  return (
    <div className={styles.screen}>
      <h2 className={styles.heading}>Scope Locked</h2>
      <div className={styles.meta}>
        <span className={styles.metaBadge}>
          {context.teamSize} Engineer{context.teamSize !== 1 ? "s" : ""}
        </span>
        <span className={styles.metaBadge}>{context.timeframe}</span>
        <span className={styles.metaBadge}>{shipped.length} Ship</span>
        <span className={styles.metaBadge}>{deferred.length} Deferred</span>
      </div>

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

        {deferred.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionLabel}>Deferred</h3>
            <ul className={styles.itemList}>
              {deferred.map((item) => (
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
                      {item.currentClassification.toUpperCase()}
                    </span>
                  </div>
                </li>
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
                  <strong>{item.title}</strong>: moved from{" "}
                  {item.recommendedClassification.toUpperCase()} →{" "}
                  {item.currentClassification.toUpperCase()}
                </li>
              ))}
            </ul>
          </div>
        )}

        {proposal.successCriteria.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionLabel}>Success Criteria</h3>
            <ul className={styles.criteriaList}>
              {proposal.successCriteria.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {context.constraints && (
          <div className={styles.section}>
            <h3 className={styles.sectionLabel}>Key Constraints</h3>
            <p className={styles.sectionText}>{context.constraints}</p>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <Button variant="primary" onClick={handleCopy}>
          {copied ? "Copied" : "Copy Markdown"}
        </Button>
        {copied && (
          <span className={styles.copyConfirm}>
            Copied to clipboard
          </span>
        )}
        <Button variant="ghost" onClick={reset}>
          Start Over
        </Button>
      </div>
    </div>
  );
}
