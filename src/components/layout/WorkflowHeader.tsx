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
      <div className={styles.headerInner}>
        <button
          type="button"
          className={styles.brand}
          onClick={onReset}
        >
          SCOPE NEGOTIATOR<span className={styles.reg}>&reg;</span>
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
    </header>
  );
}
