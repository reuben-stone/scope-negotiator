"use client";

import { useState, useEffect } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [menuOpen]);

  return (
    <aside className={styles.sidebar}>
      {/* ── Desktop: full sidebar (unchanged) ── */}
      <div className={styles.desktopSidebar}>
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
      </div>

      {/* ── Mobile: compact masthead + collapsible menu ── */}
      <div className={styles.mobileMasthead}>
        <div className={styles.mastheadBar}>
          <div className={styles.mastheadLeft}>
            <Link href="/" className={styles.brand} aria-label="Scope Negotiator — back to start">
              <img
                src="/scope-negotiator-mark.png"
                alt=""
                className={styles.mastheadMark}
                aria-hidden="true"
              />
            </Link>
            <span className={styles.mastheadLabel}>Workspace</span>
          </div>
          <button
            type="button"
            className={styles.menuToggle}
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="workspace-mobile-menu"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>

        {menuOpen && (
          <nav
            id="workspace-mobile-menu"
            className={styles.mobileMenu}
            aria-label="Workspace navigation"
          >
            <div className={styles.mobileMenuNav}>
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.mobileMenuItem} ${pathname === item.href ? styles.mobileMenuItemActive : ""}`}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className={styles.mobileMenuNewScope}>
              <Link href="/" className={styles.newScopeLink}>
                + New Scope
              </Link>
            </div>

            <div className={styles.mobileMenuUtility}>
              <Link
                href="/workspace/account"
                className={`${styles.mobileMenuItem} ${pathname === "/workspace/account" ? styles.mobileMenuItemActive : ""}`}
              >
                Account
              </Link>
              <button
                type="button"
                className={styles.mobileMenuSignOut}
                onClick={signOut}
              >
                Sign Out
              </button>
            </div>
          </nav>
        )}
      </div>
    </aside>
  );
}
