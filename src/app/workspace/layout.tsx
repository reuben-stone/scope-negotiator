"use client";

import { useAuth } from "@/state/auth";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import styles from "./workspace.module.css";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, signIn } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className={styles.gateScreen}>
        <div className={styles.gateContent}>
          <h1 className={styles.gateHeading}>Workspace</h1>
          <p className={styles.gateText}>
            Sign in to access your saved scopes, product context, team defaults
            and approved memory.
          </p>
          <button
            type="button"
            className={styles.gateButton}
            onClick={signIn}
          >
            Sign In →
          </button>
          <a href="/" className={styles.gateBack}>
            ← Back to Scope Negotiator
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <WorkspaceSidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
