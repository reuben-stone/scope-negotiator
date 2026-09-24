import type { InsightCategory, Insight } from "@/types/domain";
import { useWorkflow } from "@/state/context";
import { Button } from "@/components/shared/Button";
import styles from "./UnderstandScreen.module.css";

const CATEGORIES: {
  key: InsightCategory;
  label: string;
  icon: string;
}[] = [
  { key: "known", label: "Known", icon: "\u2713" },
  { key: "assumed", label: "Assumed", icon: "?" },
  { key: "unknown", label: "Unknown", icon: "\u2014" },
  { key: "risk", label: "High Risk", icon: "!" },
];

export function UnderstandScreen() {
  const { state, dispatch } = useWorkflow();
  const insights = state.analysis?.insights ?? [];

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    items: insights.filter((i) => i.category === cat.key),
  }));

  function handleProceed() {
    dispatch({ type: "PROCEED_TO_CLARIFY" });
  }

  return (
    <div className={styles.screen}>
      <div className={styles.localNav}>
        <button
          type="button"
          className={styles.backLink}
          onClick={() => dispatch({ type: "BACK_TO_CONTEXT" })}
        >
          ← Back
        </button>
      </div>

      <div className={styles.content}>
        <h2 className={styles.heading}>
          {insights.length} observations. Read them.
        </h2>
        <p className={styles.subheading}>
          This is what the brief tells us, what it assumes, and what could change
          everything.
        </p>

        <div className={styles.board} role="list" aria-label="Scope analysis">
          {grouped.map((cat) => (
            <div key={cat.key} className={styles.category} role="listitem">
              <div className={styles.categoryHeader}>
                <span className={styles.categoryIcon} aria-hidden="true">
                  {cat.icon}
                </span>
                <span className={styles.categoryLabel}>{cat.label}</span>
                <span className={styles.categoryCount}>{cat.items.length}</span>
              </div>
              <div className={styles.insights}>
                {cat.items.length === 0 ? (
                  <p className={styles.empty}>None identified</p>
                ) : (
                  cat.items.map((insight: Insight) => (
                    <p
                      key={insight.id}
                      className={
                        cat.key === "risk" ? styles.riskInsight : styles.insight
                      }
                    >
                      {insight.statement}
                    </p>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="primary" onClick={handleProceed}>
          Continue →
        </Button>
      </div>

      <div className={styles.footerOuter}>
        <footer className={styles.footer}>
          <span>
            Scope Negotiator<sup>&reg;</sup>&ensp;|&ensp;Product Scoping
            System&ensp;|&ensp;V1.0
          </span>
          <span>Understand&ensp;|&ensp;Analysis&ensp;|&ensp;02 / 05</span>
        </footer>
      </div>
    </div>
  );
}
