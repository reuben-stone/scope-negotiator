import Link from "next/link";
import styles from "./workspace.module.css";

export default function ScopesPage() {
  return (
    <>
      <h1 className={styles.pageHeading}>Scopes</h1>
      <p className={styles.pageDescription}>
        Your saved scope negotiations. Resume unfinished scopes or review locked
        decisions.
      </p>
      <div className={styles.emptyState}>
        <span className={styles.emptyText}>No scopes yet</span>
        <Link href="/" className={styles.emptyAction}>
          + New Scope →
        </Link>
      </div>
    </>
  );
}
