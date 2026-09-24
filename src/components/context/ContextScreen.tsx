import { useState, useEffect } from "react";
import type { WorkType } from "@/types/domain";
import { useAuth } from "@/state/auth";
import { ScopeNegotiatorMark } from "@/components/shared/ScopeNegotiatorMark";
import { ContextFlow } from "@/components/context-flow/ContextFlow";
import styles from "./ContextScreen.module.css";

export function ContextScreen() {
  const { isAuthenticated, signIn } = useAuth();
  const [mode, setMode] = useState<WorkType | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [mode]);

  if (mode) {
    return (
      <ContextFlow mode={mode} onChangeType={() => setMode(null)} />
    );
  }

  return (
    <div className={styles.screen}>
      <div className={styles.entryComposition}>
        <div className={styles.heroSection}>
          <div className={styles.heroLeft}>
            <p className={styles.systemLabel}>Product Scoping System / 001</p>
            <h1 className={styles.heroHeading}>
              Your Scope<br />
              Isn&apos;t Ready Yet.
            </h1>
            <p className={styles.heroCopy}>
              Scope Negotiator turns ambitious or ambiguous product ideas and
              feature requests into credible, human-approved scope.
            </p>
            <p className={styles.heroPrinciple}>AI Proposes. You Decide.</p>
          </div>
          <div className={styles.heroRight}>
            <ScopeNegotiatorMark />
          </div>
        </div>

        <hr className={styles.divider} />

        <div className={styles.modeSection}>
          <p className={styles.sectionMeta}>Mode / 01</p>
          <p className={styles.modeHeading}>What are we scoping?</p>
          <div
            className={styles.modeGrid}
            role="radiogroup"
            aria-label="Work type"
          >
            <button
              type="button"
              role="radio"
              aria-checked={false}
              className={styles.modeCard}
              onClick={() => setMode("product")}
            >
              <span className={styles.modeIndex}>01</span>
              <span className={styles.modeContent}>
                <strong className={styles.modeTitle}>New Product</strong>
                <span className={styles.modeDescription}>Start from zero</span>
              </span>
              <span className={styles.modeArrow} aria-hidden="true">
                →
              </span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={false}
              className={styles.modeCard}
              onClick={() => setMode("feature")}
            >
              <span className={styles.modeIndex}>02</span>
              <span className={styles.modeContent}>
                <strong className={styles.modeTitle}>New Feature</strong>
                <span className={styles.modeDescription}>
                  Add to something real
                </span>
              </span>
              <span className={styles.modeArrow} aria-hidden="true">
                →
              </span>
            </button>
          </div>

          <div className={styles.authEntry}>
            {isAuthenticated ? (
              <a href="/workspace" className={styles.authLink}>
                Workspace →
              </a>
            ) : (
              <span className={styles.authPrompt}>
                Already have a workspace?{" "}
                <button
                  type="button"
                  className={styles.authLink}
                  onClick={signIn}
                >
                  Sign In →
                </button>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.footerOuter}>
        <footer className={styles.footer}>
          <span className={styles.footerLeft}>
            Scope Negotiator<sup>&reg;</sup>&ensp;|&ensp;Product Scoping
            System&ensp;|&ensp;V1.0
          </span>
          <span className={styles.footerRight}>
            Context&ensp;|&ensp;User Input&ensp;|&ensp;01 / 05
          </span>
        </footer>
      </div>
    </div>
  );
}
