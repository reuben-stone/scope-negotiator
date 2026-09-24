"use client";

import { useAuth } from "@/state/auth";
import styles from "../workspace.module.css";

export default function AccountPage() {
  const { user } = useAuth();

  return (
    <>
      <h1 className={styles.pageHeading}>Account</h1>
      <p className={styles.pageDescription}>
        Your Scope Negotiator workspace identity and preferences.
      </p>
      {user && (
        <div className={styles.emptyState}>
          <span className={styles.emptyText}>{user.name}</span>
          <span className={styles.emptyText}>{user.email}</span>
        </div>
      )}
    </>
  );
}
