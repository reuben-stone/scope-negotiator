import type { WorkflowStage } from "@/types/workflow";
import styles from "./WorkflowFooter.module.css";

const STAGE_INFO: Record<WorkflowStage, string> = {
  context: "Context\u2002|\u2002User Input\u2002|\u200201 / 05",
  understand: "Understand\u2002|\u2002Analysis\u2002|\u200202 / 05",
  clarify: "Clarify\u2002|\u2002User Input\u2002|\u200203 / 05",
  negotiate: "Negotiate\u2002|\u2002User Decision\u2002|\u200204 / 05",
  lock: "Lock\u2002|\u2002Scope Locked\u2002|\u200205 / 05",
};

type Props = {
  stage: WorkflowStage;
  loading?: boolean;
  error?: boolean;
};

export function WorkflowFooter({ stage, loading, error }: Props) {
  const rightText = error
    ? "Error"
    : loading
      ? "Processing"
      : STAGE_INFO[stage];

  return (
    <div className={styles.footerOuter}>
      <footer className={styles.footer}>
        <span>
          Scope Negotiator&ensp;|&ensp;Product Scoping
          System&ensp;|&ensp;V1.0
        </span>
        <span>{rightText}</span>
      </footer>
    </div>
  );
}
