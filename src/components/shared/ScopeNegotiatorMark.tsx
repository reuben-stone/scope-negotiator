import styles from "./ScopeNegotiatorMark.module.css";

type Props = {
  className?: string;
};

export function ScopeNegotiatorMark({ className }: Props) {
  return (
    <div className={`${styles.container} ${className || ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.mark}
        src="/scope-negotiator-wordmark.png"
        alt="Scope Negotiator"
        draggable={false}
      />
    </div>
  );
}
