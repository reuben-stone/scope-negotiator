import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ScopeItem } from "@/types/domain";
import { useWorkflow } from "@/state/context";
import { useAuth } from "@/state/auth";
import { useWorkspaceData } from "@/state/workspace-data";
import { generateMarkdown } from "@/utils/markdown";
import { filterCriteria } from "@/utils/filter-criteria";
import { Button } from "@/components/shared/Button";
import styles from "./LockScreen.module.css";

type ProposedMemory = {
  content: string;
  status: "pending" | "editing" | "kept" | "dismissed";
  editValue: string;
};

export function LockScreen() {
  const router = useRouter();
  const { state, reset, dispatch } = useWorkflow();
  const { isAuthenticated } = useAuth();
  const { refresh: refreshWorkspaceData } = useWorkspaceData();
  const [copied, setCopied] = useState(false);

  // Memory proposals
  const [memories, setMemories] = useState<ProposedMemory[]>([]);
  const [memoryLoading, setMemoryLoading] = useState(false);
  const [memoryFetched, setMemoryFetched] = useState(false);

  const locked = state.lockedScope;

  // Fetch memory proposals for authenticated users after lock
  useEffect(() => {
    if (!locked || !isAuthenticated || memoryFetched) return;
    setMemoryFetched(true);
    setMemoryLoading(true);

    fetch("/api/propose-memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        context: locked.context,
        analysis: locked.analysis,
        proposal: locked.proposal,
        lockedAt: locked.lockedAt,
      }),
    })
      .then((res) => (res.ok ? res.json() : { memories: [] }))
      .then((data: { memories: { content: string }[] }) => {
        setMemories(
          data.memories.map((m) => ({
            content: m.content,
            status: "pending",
            editValue: m.content,
          }))
        );
      })
      .catch(() => {})
      .finally(() => setMemoryLoading(false));
  }, [locked, isAuthenticated, memoryFetched]);

  const handleKeepMemory = useCallback(async (index: number) => {
    const memory = memories[index];
    const content = memory.status === "editing" ? memory.editValue : memory.content;
    try {
      const res = await fetch("/api/workspace-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "memory",
          title: content.slice(0, 60),
          content,
        }),
      });
      if (res.ok) {
        setMemories((prev) =>
          prev.map((m, i) => (i === index ? { ...m, status: "kept", content } : m))
        );
        refreshWorkspaceData();
      }
    } catch {
      // Silent fail
    }
  }, [memories, refreshWorkspaceData]);

  const handleDismissMemory = useCallback((index: number) => {
    setMemories((prev) =>
      prev.map((m, i) => (i === index ? { ...m, status: "dismissed" } : m))
    );
  }, []);

  const handleEditMemory = useCallback((index: number) => {
    setMemories((prev) =>
      prev.map((m, i) => (i === index ? { ...m, status: "editing" } : m))
    );
  }, []);

  const handleEditChange = useCallback((index: number, value: string) => {
    setMemories((prev) =>
      prev.map((m, i) => (i === index ? { ...m, editValue: value } : m))
    );
  }, []);

  if (!locked) return null;

  const { context, proposal } = locked;

  const shipped = useMemo(
    () => proposal.items.filter((i) => i.currentClassification === "ship"),
    [proposal.items]
  );
  const negotiated = useMemo(
    () => proposal.items.filter((i) => i.currentClassification === "negotiate"),
    [proposal.items]
  );
  const cut = useMemo(
    () => proposal.items.filter((i) => i.currentClassification === "cut"),
    [proposal.items]
  );
  const overrides = useMemo(
    () => proposal.items.filter((i) => i.userOverride),
    [proposal.items]
  );
  const notShipped = useMemo(() => [...negotiated, ...cut], [negotiated, cut]);
  const filteredCriteria = useMemo(
    () => filterCriteria(proposal.successCriteria, shipped, notShipped),
    [proposal.successCriteria, shipped, notShipped]
  );

  const handleCopy = useCallback(async () => {
    try {
      const md = generateMarkdown(locked, filteredCriteria);
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard write failed
    }
  }, [locked, filteredCriteria]);

  const pendingMemories = memories.filter(
    (m) => m.status === "pending" || m.status === "editing"
  );

  return (
    <div className={styles.screen}>
      {/* Local nav */}
      <div className={styles.localNav}>
        <button
          type="button"
          className={styles.backLink}
          onClick={() => dispatch({ type: "BACK_TO_NEGOTIATE" })}
        >
          ← Back to Negotiate
        </button>
      </div>

      <div className={`${styles.content} stageTransition`}>
        <h2 className={styles.heading}>{proposal.title || "Scope Locked"}</h2>
        <div className={styles.meta}>
          <span className={styles.metaBadge}>{shipped.length} Ship</span>
          <span className={styles.metaBadge}>{negotiated.length} Negotiate</span>
          <span className={styles.metaBadge}>{cut.length} Cut</span>
          {overrides.length > 0 && (
            <span className={styles.metaBadge}>
              {overrides.length} Override{overrides.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className={styles.workspace}>
          {/* Main document */}
          <div className={styles.document}>
            <div className={styles.section}>
              <h3 className={styles.sectionLabel}>Goal</h3>
              <p className={styles.sectionText}>{proposal.goal}</p>
            </div>

            {shipped.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionLabel}>Agreed Scope</h3>
                <ul className={styles.itemList}>
                  {shipped.map((item) => (
                    <li key={item.id} className={styles.item}>
                      <p className={styles.itemTitle}>
                        {item.title}
                        {item.userOverride && (
                          <span className={styles.overrideBadge}>Override</span>
                        )}
                      </p>
                      <p className={styles.itemDescription}>{item.description}</p>
                      <div className={styles.itemMeta}>
                        <span className={styles.badge}>Effort: {item.effort.toUpperCase()}</span>
                        <span className={styles.badge}>Risk: {item.risk.toUpperCase()}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {notShipped.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionLabel}>Deferred / Not in This Scope</h3>
                <ul className={styles.itemList}>
                  {notShipped.map((item) => (
                    <li key={item.id} className={styles.item}>
                      <p className={styles.itemTitle}>
                        {item.title}
                        <span className={styles.badge}>{item.currentClassification.toUpperCase()}</span>
                        {item.userOverride && (
                          <span className={styles.overrideBadge}>Override</span>
                        )}
                      </p>
                      <p className={styles.itemDescription}>{item.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {filteredCriteria.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionLabel}>Success Criteria</h3>
                <ul className={styles.criteriaList}>
                  {filteredCriteria.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {overrides.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionLabel}>Decisions Made</h3>
                <ul className={styles.decisionList}>
                  {overrides.map((item) => (
                    <li key={item.id}>
                      <strong>{item.title}</strong>
                      <br />
                      <span className={styles.decisionDetail}>
                        AI proposed: {item.recommendedClassification.toUpperCase()} → Final
                        decision: {item.currentClassification.toUpperCase()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Summary rail */}
          <aside className={styles.rail}>
            <div className={styles.railSection}>
              <h4 className={styles.railLabel}>Scope Summary</h4>
              <dl className={styles.railData}>
                <div className={styles.railRow}><dt>Ship</dt><dd>{shipped.length}</dd></div>
                <div className={styles.railRow}><dt>Negotiate</dt><dd>{negotiated.length}</dd></div>
                <div className={styles.railRow}><dt>Cut</dt><dd>{cut.length}</dd></div>
                {overrides.length > 0 && (
                  <div className={styles.railRow}><dt>Overrides</dt><dd>{overrides.length}</dd></div>
                )}
              </dl>
            </div>
            <div className={styles.railSection}>
              <h4 className={styles.railLabel}>Team / Capacity</h4>
              <p className={styles.railText}>{context.team}</p>
            </div>
            <div className={styles.railSection}>
              <h4 className={styles.railLabel}>Timeframe</h4>
              <p className={styles.railText}>{context.timeframe}</p>
            </div>
            {context.constraints && (
              <div className={styles.railSection}>
                <h4 className={styles.railLabel}>Key Constraints</h4>
                <p className={styles.railText}>{context.constraints}</p>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Memory proposals (authenticated only) */}
      {isAuthenticated && (memoryLoading || pendingMemories.length > 0) && (
        <div className={styles.memorySection}>
          <h3 className={styles.memorySectionLabel}>Remember for Next Time?</h3>
          {memoryLoading && (
            <p className={styles.memoryLoading}>Identifying reusable memories...</p>
          )}
          {pendingMemories.map((memory, i) => {
            const realIndex = memories.indexOf(memory);
            return (
              <div key={realIndex} className={styles.memoryCard}>
                {memory.status === "editing" ? (
                  <textarea
                    className={styles.memoryEdit}
                    value={memory.editValue}
                    onChange={(e) => handleEditChange(realIndex, e.target.value)}
                    rows={2}
                  />
                ) : (
                  <p className={styles.memoryContent}>{memory.content}</p>
                )}
                <div className={styles.memoryActions}>
                  <button
                    type="button"
                    className={styles.memoryKeep}
                    onClick={() => handleKeepMemory(realIndex)}
                  >
                    Keep
                  </button>
                  {memory.status !== "editing" && (
                    <button
                      type="button"
                      className={styles.memoryEditBtn}
                      onClick={() => handleEditMemory(realIndex)}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.memoryDismiss}
                    onClick={() => handleDismissMemory(realIndex)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            );
          })}
          {/* Show kept memories */}
          {memories.filter((m) => m.status === "kept").map((m, i) => (
            <div key={`kept-${i}`} className={styles.memoryKept}>
              <span className={styles.memoryKeptLabel}>Remembered ✓</span>
              <p className={styles.memoryContent}>{m.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Bottom actions */}
      <div className={styles.actions}>
        {!isAuthenticated && (
          <a href="/login" className={styles.savePrompt}>Sign In to Save →</a>
        )}
        {isAuthenticated && (
          <span className={styles.savedConfirm}>Saved to Workspace ✓</span>
        )}
        <div className={styles.actionsRight}>
          <Button variant="ghost" onClick={() => { reset(); router.push("/"); }}>
            New Scope
          </Button>
          <Button variant="primary" onClick={handleCopy} className={styles.copyButton}>
            <span className={styles.copyStack}>
              <span className={copied ? styles.labelHidden : styles.labelVisible}>
                Copy Markdown →
              </span>
              <span className={copied ? styles.labelVisible : styles.labelHidden}>
                ✓ Copied
              </span>
            </span>
          </Button>
          <span className={styles.srOnly} role="status" aria-live="polite">
            {copied ? "Markdown copied to clipboard" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
