import styles from "../workspace.module.css";

export default function MemoryPage() {
  return (
    <>
      <h1 className={styles.pageHeading}>Memory</h1>
      <p className={styles.pageDescription}>
        Human-approved memories that Scope Negotiator may reuse when relevant.
        Every memory here was explicitly approved by you.
      </p>
      <div className={styles.emptyState}>
        <span className={styles.emptyText}>No approved memories</span>
        <span className={styles.emptyText}>
          Memories are proposed after locking scope and require your approval
        </span>
      </div>
    </>
  );
}
