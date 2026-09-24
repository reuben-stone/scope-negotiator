import type { WorkflowStage } from "@/types/workflow";
import { STAGES } from "@/types/workflow";
import styles from "./WorkflowHeader.module.css";

const STAGE_LABELS: Record<WorkflowStage, string> = {
  context: "CONTEXT",
  understand: "UNDERSTAND",
  clarify: "CLARIFY",
  negotiate: "NEGOTIATE",
  lock: "LOCK",
};

type Props = {
  currentStage: WorkflowStage;
  onReset: () => void;
};

export function WorkflowHeader({ currentStage, onReset }: Props) {
  const currentIndex = STAGES.indexOf(currentStage);

  return (
    <header className={styles.header} role="banner">
      {/* Desktop layout */}
      <div className={styles.desktopInner}>
        <button
          type="button"
          className={styles.brand}
          onClick={onReset}
          aria-label="Scope Negotiator — back to start"
        >
          <img
            src="/scope-negotiator-mark.png"
            alt=""
            className={styles.brandMark}
            aria-hidden="true"
          />
        </button>
        <nav className={styles.stages} aria-label="Workflow progress">
          {STAGES.map((stage, i) => {
            const isCompleted = i < currentIndex;
            const isCurrent = stage === currentStage;

            return (
              <span key={stage} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && <span className={styles.arrow} aria-hidden="true">→</span>}
                <span
                  className={`${styles.stage} ${isCompleted ? styles.completed : ""} ${isCurrent ? styles.current : ""}`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  <span className={styles.stageNumber}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.stageName}>{STAGE_LABELS[stage]}</span>
                </span>
              </span>
            );
          })}
        </nav>
      </div>

      {/* Mobile layout */}
      <div className={styles.mobileInner}>
        <div className={styles.mobileRow}>
          <button
            type="button"
            className={styles.brand}
            onClick={onReset}
          >
            SCOPE NEGOTIATOR
          </button>
          <span className={styles.mobileCounter}>
            {String(currentIndex + 1).padStart(2, "0")} / {String(STAGES.length).padStart(2, "0")}
          </span>
        </div>
        <div className={styles.mobileRow}>
          <span
            className={styles.mobileStage}
            role="status"
            aria-label={`Step ${currentIndex + 1} of ${STAGES.length}: ${STAGE_LABELS[currentStage]}`}
          >
            {String(currentIndex + 1).padStart(2, "0")} {STAGE_LABELS[currentStage]}
          </span>
          <div className={styles.progressBlocks} aria-hidden="true">
            {STAGES.map((stage, i) => (
              <span
                key={stage}
                className={`${styles.progressBlock} ${i < currentIndex ? styles.progressDone : ""} ${i === currentIndex ? styles.progressCurrent : ""}`}
              />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
