"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

type Mode = "signin" | "register";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name: name || undefined }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "Registration failed");
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid email or password");
      }

      router.push("/workspace");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.screen}>
      <div className={styles.left}>
        <h1 className={styles.heading}>
          Your team shouldn&apos;t have to explain itself every time.
        </h1>
        <p className={styles.copy}>
          Sign in to save scopes, team context and approved memory across
          negotiations.
        </p>
        <p className={styles.principle}>
          AI Proposes. You Decide. Software Remembers.
        </p>
      </div>

      <div className={styles.right}>
        <form onSubmit={handleSubmit} className={styles.card}>
          <h2 className={styles.cardHeading}>
            {mode === "signin" ? "Sign In" : "Create Account"}
          </h2>

          {mode === "register" && (
            <div className={styles.field}>
              <label htmlFor="name" className={styles.label}>
                Name
              </label>
              <input
                id="name"
                type="text"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Optional"
                autoComplete="name"
              />
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "register" ? "Minimum 8 characters" : ""}
              required
              minLength={8}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
            />
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className={styles.submit}
            disabled={loading}
          >
            {loading
              ? "..."
              : mode === "signin"
                ? "Sign In →"
                : "Create Account →"}
          </button>

          <div className={styles.switchMode}>
            {mode === "signin" ? (
              <button
                type="button"
                className={styles.switchLink}
                onClick={() => { setMode("register"); setError(null); }}
              >
                Create an account →
              </button>
            ) : (
              <button
                type="button"
                className={styles.switchLink}
                onClick={() => { setMode("signin"); setError(null); }}
              >
                Already have an account? Sign in →
              </button>
            )}
          </div>
        </form>

        <a href="/" className={styles.guestLink}>
          ← Continue as guest
        </a>
      </div>
    </div>
  );
}
