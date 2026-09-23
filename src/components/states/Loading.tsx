import styles from "./Loading.module.css";

type Props = {
  message?: string;
};

export function Loading({ message = "Negotiating..." }: Props) {
  return (
    <div className={styles.container} role="status" aria-live="polite">
      <p className={styles.text}>{message}</p>
      <div className={styles.bar} aria-hidden="true">
        <div className={styles.barFill} />
      </div>
    </div>
  );
}
