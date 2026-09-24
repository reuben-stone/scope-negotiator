"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/state/auth";
import styles from "./WorkspaceSidebar.module.css";

const NAV_ITEMS = [
  { href: "/workspace", label: "Scopes" },
  { href: "/workspace/context", label: "Product Context" },
  { href: "/workspace/team", label: "Team" },
  { href: "/workspace/memory", label: "Memory" },
];

export function WorkspaceSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Scope Negotiator — back to start">
          <img
            src="/scope-negotiator-mark.png"
            alt=""
            className={styles.brandMark}
            aria-hidden="true"
          />
        </Link>
        <p className={styles.workspaceLabel}>Workspace</p>
      </div>

      <nav className={styles.nav} aria-label="Workspace navigation">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ""}`}
            aria-current={pathname === item.href ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={styles.newScope}>
        <Link href="/" className={styles.newScopeLink}>
          + New Scope
        </Link>
      </div>

      <div className={styles.utility}>
        <Link
          href="/workspace/account"
          className={`${styles.navItem} ${pathname === "/workspace/account" ? styles.navItemActive : ""}`}
        >
          Account
        </Link>
        <button
          type="button"
          className={styles.signOut}
          onClick={signOut}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
