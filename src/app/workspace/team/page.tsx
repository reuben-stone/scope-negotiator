import styles from "../workspace.module.css";

export default function TeamPage() {
  return (
    <>
      <h1 className={styles.pageHeading}>Team</h1>
      <p className={styles.pageDescription}>
        Default team capacity and delivery constraints. Applied automatically
        when starting new scopes, overridable per-scope.
      </p>
      <div className={styles.emptyState}>
        <span className={styles.emptyText}>No team defaults configured</span>
        <button type="button" className={styles.emptyAction}>
          + Set Team Defaults →
        </button>
      </div>
    </>
  );
}
