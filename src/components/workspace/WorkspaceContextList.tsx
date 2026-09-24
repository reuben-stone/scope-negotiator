"use client";

import { useState, useCallback, useEffect } from "react";
import { useWorkspaceData } from "@/state/workspace-data";
import styles from "./WorkspaceContextList.module.css";

type ContextItem = {
  id: string;
  type: string;
  title: string | null;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  type: "product_context" | "team" | "memory";
  heading: string;
  description: string;
  emptyText: string;
  addLabel: string;
  titleLabel: string;
  titlePlaceholder: string;
  contentLabel: string;
  contentPlaceholder: string;
  deleteLabel?: string;
};

export function WorkspaceContextList({
  type,
  heading,
  description,
  emptyText,
  addLabel,
  titleLabel,
  titlePlaceholder,
  contentLabel,
  contentPlaceholder,
  deleteLabel = "Delete",
}: Props) {
  const { refresh } = useWorkspaceData();
  const [items, setItems] = useState<ContextItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`/api/workspace-context?type=${type}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleCreate = useCallback(async () => {
    if (!formTitle.trim() || !formContent.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/workspace-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title: formTitle.trim(), content: formContent.trim() }),
      });
      if (res.ok) {
        setFormTitle("");
        setFormContent("");
        setCreating(false);
        fetchItems();
        refresh();
      }
    } catch {
      // Silent fail
    } finally {
      setSaving(false);
    }
  }, [type, formTitle, formContent, fetchItems, refresh]);

  const handleUpdate = useCallback(async (id: string) => {
    if (!formTitle.trim() || !formContent.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/workspace-context/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: formTitle.trim(), content: formContent.trim() }),
      });
      if (res.ok) {
        setEditingId(null);
        setFormTitle("");
        setFormContent("");
        fetchItems();
        refresh();
      }
    } catch {
      // Silent fail
    } finally {
      setSaving(false);
    }
  }, [formTitle, formContent, fetchItems, refresh]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/workspace-context/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        if (editingId === id) {
          setEditingId(null);
          setFormTitle("");
          setFormContent("");
        }
        refresh();
      }
    } catch {
      // Silent fail
    }
  }, [editingId, refresh]);

  const startEdit = useCallback((item: ContextItem) => {
    setCreating(false);
    setEditingId(item.id);
    setFormTitle(item.title ?? "");
    setFormContent(item.content);
  }, []);

  const startCreate = useCallback(() => {
    setEditingId(null);
    setFormTitle("");
    setFormContent("");
    setCreating(true);
  }, []);

  const cancelForm = useCallback(() => {
    setCreating(false);
    setEditingId(null);
    setFormTitle("");
    setFormContent("");
  }, []);

  if (loading) {
    return (
      <>
        <h1 className={styles.pageHeading}>{heading}</h1>
        <p className={styles.pageDescription}>{description}</p>
      </>
    );
  }

  return (
    <>
      <h1 className={styles.pageHeading}>{heading}</h1>
      <p className={styles.pageDescription}>{description}</p>

      {/* Item list */}
      {items.length > 0 && (
        <div className={styles.list}>
          {items.map((item) => (
            <div key={item.id} className={styles.item}>
              {editingId === item.id ? (
                <div className={styles.form}>
                  <label className={styles.formLabel}>{titleLabel}</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder={titlePlaceholder}
                  />
                  <label className={styles.formLabel}>{contentLabel}</label>
                  <textarea
                    className={styles.formTextarea}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder={contentPlaceholder}
                    rows={5}
                  />
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={cancelForm}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className={styles.saveButton}
                      onClick={() => handleUpdate(item.id)}
                      disabled={saving || !formTitle.trim() || !formContent.trim()}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.itemHeader}>
                    <span className={styles.itemTitle}>{item.title}</span>
                    <div className={styles.itemActions}>
                      <button
                        type="button"
                        className={styles.editButton}
                        onClick={() => startEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => handleDelete(item.id)}
                      >
                        {deleteLabel}
                      </button>
                    </div>
                  </div>
                  <p className={styles.itemContent}>{item.content}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && !creating && (
        <div className={styles.emptyState}>
          <span className={styles.emptyText}>{emptyText}</span>
          <button type="button" className={styles.addButton} onClick={startCreate}>
            {addLabel}
          </button>
        </div>
      )}

      {/* Create form */}
      {creating && (
        <div className={styles.createForm}>
          <label className={styles.formLabel}>{titleLabel}</label>
          <input
            type="text"
            className={styles.formInput}
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder={titlePlaceholder}
            autoFocus
          />
          <label className={styles.formLabel}>{contentLabel}</label>
          <textarea
            className={styles.formTextarea}
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            placeholder={contentPlaceholder}
            rows={6}
          />
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelButton} onClick={cancelForm}>
              Cancel
            </button>
            <button
              type="button"
              className={styles.saveButton}
              onClick={handleCreate}
              disabled={saving || !formTitle.trim() || !formContent.trim()}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* Add button (when items exist and not creating) */}
      {items.length > 0 && !creating && !editingId && (
        <button type="button" className={styles.addButton} onClick={startCreate}>
          {addLabel}
        </button>
      )}
    </>
  );
}
