"use client";

import Link from "next/link";
import { useAuth } from "@/state/auth";
import { ScopeNegotiatorMark } from "@/components/shared/ScopeNegotiatorMark";
import styles from "./ContextScreen.module.css";

export function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();

  const handleSelectMode = (mode: "product" | "feature") => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("scope-negotiator:mode", mode);
    }
  };

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
            <div
              className={styles.authEntry}
              style={{
                opacity: isLoading ? 0 : 1,
                transition: "opacity 0.3s ease",
              }}
            >
              {isAuthenticated ? (
                <a href="/workspace" className={styles.authLink}>
                  Workspace →
                </a>
              ) : (
                <span className={styles.authPrompt}>
                  Already have a workspace?{" "}
                  <a href="/login" className={styles.authLink}>
                    Sign In →
                  </a>
                </span>
              )}
            </div>
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
            <Link
              href="/scope/new"
              prefetch={true}
              className={styles.modeCard}
              onClick={() => handleSelectMode("product")}
            >
              <span className={styles.modeIndex}>01</span>
              <span className={styles.modeContent}>
                <strong className={styles.modeTitle}>New Product</strong>
                <span className={styles.modeDescription}>Start from zero</span>
              </span>
              <span className={styles.modeArrow} aria-hidden="true">
                →
              </span>
            </Link>
            <Link
              href="/scope/new"
              prefetch={true}
              className={styles.modeCard}
              onClick={() => handleSelectMode("feature")}
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
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
