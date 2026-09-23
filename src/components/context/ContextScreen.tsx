import { useState } from "react";
import type { WorkType, ScopeContext } from "@/types/domain";
import { useWorkflow } from "@/state/context";
import { Button } from "@/components/shared/Button";
import { TextInput, Textarea } from "@/components/shared/Input";
import styles from "./ContextScreen.module.css";

export function ContextScreen() {
  const { submitContext } = useWorkflow();

  const [workType, setWorkType] = useState<WorkType | null>(null);
  const [productContext, setProductContext] = useState("");
  const [brief, setBrief] = useState("");
  const [team, setTeam] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [constraints, setConstraints] = useState("");

  const canSubmit =
    workType !== null &&
    brief.trim().length > 0 &&
    team.trim().length > 0 &&
    timeframe.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !workType) return;

    const ctx: ScopeContext = {
      workType,
      brief: brief.trim(),
      team: team.trim(),
      timeframe: timeframe.trim(),
      ...(workType === "feature" && productContext.trim()
        ? { productContext: productContext.trim() }
        : {}),
      ...(constraints.trim() ? { constraints: constraints.trim() } : {}),
    };

    submitContext(ctx);
  }

  const briefFieldIndex = workType === "feature" ? "02" : "01";
  const deliveryIndex = workType === "feature" ? "03" : "02";
  const timeframeIndex = workType === "feature" ? "04" : "03";
  const constraintsIndex = workType === "feature" ? "05" : "04";

  return (
    <div className={styles.screen}>
      {/* Logotype */}
      <div className={styles.logotype}>
        <p className={styles.systemLabel}>Product Scoping System / 001</p>
        <h1 className={styles.logoText}>
          Scope<br />
          Negotiator<span className={styles.logoReg}>&reg;</span>
        </h1>
      </div>

      {/* Hero */}
      <div className={styles.hero}>
        <p className={styles.heroHeading} role="doc-subtitle">
          Your Scope<br />
          Isn&apos;t Ready<br />
          Yet.
        </p>
        <p className={styles.heroCopy}>
          Scope Negotiator turns ambitious or ambiguous product ideas and feature
          requests into credible, human-approved scope.
        </p>
        <p className={styles.heroPrinciple}>AI Proposes. You Decide.</p>
      </div>

      <hr className={styles.divider} />

      {/* Work type */}
      <div className={styles.workTypeSection}>
        <p className={styles.sectionMeta}>Mode</p>
        <p className={styles.workTypeLabel}>What are we scoping?</p>
        <div className={styles.workTypeOptions} role="radiogroup" aria-label="Work type">
          <button
            type="button"
            role="radio"
            aria-checked={workType === "product"}
            className={`${styles.workTypeButton} ${workType === "product" ? styles.workTypeButtonActive : ""}`}
            onClick={() => setWorkType("product")}
          >
            <span className={styles.workTypeIndex}>01</span>
            <span className={styles.workTypeName}>New Product</span>
            <span className={styles.workTypeHint}>Start from zero</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={workType === "feature"}
            className={`${styles.workTypeButton} ${workType === "feature" ? styles.workTypeButtonActive : ""}`}
            onClick={() => setWorkType("feature")}
          >
            <span className={styles.workTypeIndex}>02</span>
            <span className={styles.workTypeName}>New Feature</span>
            <span className={styles.workTypeHint}>Add to something real</span>
          </button>
        </div>
      </div>

      {/* Form */}
      {workType && (
        <form className={styles.form} onSubmit={handleSubmit}>
          {workType === "feature" && (
            <div className={styles.formSection}>
              <span className={styles.fieldMeta}>01 / Existing Product</span>
              <label className={styles.fieldLabel} htmlFor="productContext">
                Tell us what already exists.
                <span className={styles.fieldOptional}> — Optional</span>
              </label>
              <p className={styles.fieldHint}>
                Give Scope Negotiator enough context to understand what this
                change is being made to.
              </p>
              <Textarea
                id="productContext"
                value={productContext}
                onChange={(e) => setProductContext(e.target.value)}
                placeholder="The product, its stack, users, and current state..."
              />
            </div>
          )}

          <div className={styles.formSection}>
            <span className={styles.fieldMeta}>
              {briefFieldIndex} / Brief
            </span>
            <label className={styles.fieldLabel} htmlFor="brief">
              {workType === "product"
                ? "What are you building?"
                : "What do you want to add or change?"}
            </label>
            {workType === "product" && (
              <p className={styles.fieldHint}>
                The idea, the problem, the intended users, the desired outcome.
              </p>
            )}
            <Textarea
              id="brief"
              large
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder={
                workType === "product"
                  ? "Describe what you want to build..."
                  : "Describe the feature or change..."
              }
              required
            />
          </div>

          <div className={styles.formSection}>
            <span className={styles.fieldMeta}>
              {deliveryIndex} / Team &amp; Capacity
            </span>
            <label className={styles.fieldLabel} htmlFor="team">
              Who is available?
            </label>
            <p className={styles.fieldHint}>
              Describe the team and their availability. Capability gaps are
              something the analysis can surface.
            </p>
            <Textarea
              id="team"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              placeholder="2 full-stack engineers, full-time. Designer available 2 days/week."
              required
            />
          </div>

          <div className={styles.formSection}>
            <span className={styles.fieldMeta}>
              {timeframeIndex} / Timeframe
            </span>
            <label className={styles.fieldLabel} htmlFor="timeframe">
              How long do you have?
            </label>
            <TextInput
              id="timeframe"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              placeholder="6 weeks"
              required
            />
          </div>

          <div className={styles.formSection}>
            <span className={styles.fieldMeta}>
              {constraintsIndex} / Constraints
            </span>
            <label className={styles.fieldLabel} htmlFor="constraints">
              Hard Boundaries
              <span className={styles.fieldOptional}> — Optional</span>
            </label>
            <p className={styles.fieldHint}>
              What cannot move? Deadlines, technical limits, compliance
              requirements, non-negotiable dependencies.
            </p>
            <Textarea
              id="constraints"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="Must ship before customer launch. No new infrastructure. Must use existing auth system."
            />
          </div>

          <div className={styles.statusBar}>
            <span
              className={`${styles.statusText} ${canSubmit ? styles.statusReady : ""}`}
            >
              {canSubmit
                ? "Ready to negotiate"
                : "Waiting for input"}
            </span>
            <Button type="submit" variant="primary" disabled={!canSubmit}>
              Negotiate Scope →
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
