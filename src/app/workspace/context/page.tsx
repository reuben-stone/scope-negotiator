import styles from "../workspace.module.css";

export default function ProductContextPage() {
  return (
    <>
      <h1 className={styles.pageHeading}>Product Context</h1>
      <p className={styles.pageDescription}>
        Persistent product information that carries across scoping sessions.
        Prevents re-entering the same context for every new feature.
      </p>
      <div className={styles.emptyState}>
        <span className={styles.emptyText}>No products saved</span>
        <button type="button" className={styles.emptyAction}>
          + Add Product →
        </button>
      </div>
    </>
  );
}
