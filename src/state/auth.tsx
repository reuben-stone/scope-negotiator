"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";

type User = {
  id: string;
  name: string | null;
  email: string;
};

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  signIn: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  const user: User | null = session?.user
    ? {
        id: session.user.id ?? "",
        name: session.user.name ?? null,
        email: session.user.email ?? "",
      }
    : null;

  const signIn = () => {
    nextAuthSignIn(undefined, { callbackUrl: "/workspace" });
  };

  const signOut = () => {
    nextAuthSignOut({ callbackUrl: "/" });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
