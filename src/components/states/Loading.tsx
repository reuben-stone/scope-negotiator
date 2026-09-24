import { useState, useEffect } from "react";
import styles from "./Loading.module.css";

type Props = {
  message?: string;
  statusMessages?: string[];
};

const ANALYSIS_STATUS = [
  "Reading product context",
  "Identifying what\u2019s known",
  "Identifying assumptions",
  "Checking unknowns",
  "Assessing scope risk",
];

const PROPOSAL_STATUS = [
  "Reviewing your answers",
  "Weighing constraints",
  "Identifying trade-offs",
  "Building scope proposal",
];

const BLOCK_COUNT = 8;

export function Loading({
  message = "Negotiating...",
  statusMessages,
}: Props) {
  const statuses = statusMessages ?? (
    message.toLowerCase().includes("analys") ? ANALYSIS_STATUS : PROPOSAL_STATUS
  );

  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((i) => (i + 1) % statuses.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [statuses.length]);

  return (
    <div className={styles.screen}>
      <div className={styles.container} role="status" aria-live="polite">
        <p className={styles.heading}>{message}</p>
        <div className={styles.blocks} aria-hidden="true">
          {Array.from({ length: BLOCK_COUNT }, (_, i) => (
            <div
              key={i}
              className={styles.block}
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className={styles.status}>{statuses[statusIndex]}</p>
      </div>

      <div className={styles.footerOuter}>
        <footer className={styles.footer}>
          <span>
            Scope Negotiator<sup>&reg;</sup>&ensp;|&ensp;Product Scoping
            System&ensp;|&ensp;V1.0
          </span>
          <span>Processing</span>
        </footer>
      </div>
    </div>
  );
}
