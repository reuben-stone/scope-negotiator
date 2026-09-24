"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useAuth } from "./auth";

export type SavedContext = {
  id: string;
  title: string | null;
  content: string;
};

type WorkspaceData = {
  products: SavedContext[];
  teams: SavedContext[];
  memories: string[];
  refresh: () => void;
};

const WorkspaceDataContext = createContext<WorkspaceData>({
  products: [],
  teams: [],
  memories: [],
  refresh: () => {},
});

export function WorkspaceDataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [data, setData] = useState<{
    products: SavedContext[];
    teams: SavedContext[];
    memories: string[];
  }>({ products: [], teams: [], memories: [] });

  const fetchAll = useCallback(() => {
    return Promise.all([
      fetch("/api/workspace-context?type=product_context")
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []) as Promise<SavedContext[]>,
      fetch("/api/workspace-context?type=team")
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []) as Promise<SavedContext[]>,
      fetch("/api/workspace-context?type=memory")
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []) as Promise<SavedContext[]>,
    ]).then(([products, teams, memoryItems]) => {
      setData({
        products,
        teams,
        memories: memoryItems.map((m) => m.content),
      });
    });
  }, []);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    fetchAll();
  }, [isAuthenticated, isLoading, fetchAll]);

  const value = useMemo(
    () => ({ ...data, refresh: fetchAll }),
    [data, fetchAll]
  );

  return (
    <WorkspaceDataContext.Provider value={value}>
      {children}
    </WorkspaceDataContext.Provider>
  );
}

export function useWorkspaceData() {
  return useContext(WorkspaceDataContext);
}
