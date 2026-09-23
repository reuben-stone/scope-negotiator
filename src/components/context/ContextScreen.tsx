import { useState } from "react";
import type { WorkType, ScopeContext } from "@/types/domain";
import { useWorkflow } from "@/state/context";
import { Button } from "@/components/shared/Button";
import { FieldGroup, TextInput, Textarea } from "@/components/shared/Input";
import styles from "./ContextScreen.module.css";

export function ContextScreen() {
  const { submitContext } = useWorkflow();

  const [workType, setWorkType] = useState<WorkType | null>(null);
  const [productContext, setProductContext] = useState("");
  const [brief, setBrief] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [constraints, setConstraints] = useState("");

  const canSubmit =
    workType !== null &&
    brief.trim().length > 0 &&
    teamSize.trim().length > 0 &&
    timeframe.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !workType) return;

    const ctx: ScopeContext = {
      workType,
      brief: brief.trim(),
      teamSize: parseInt(teamSize, 10) || 1,
      timeframe: timeframe.trim(),
      ...(workType === "feature" && productContext.trim()
        ? { productContext: productContext.trim() }
        : {}),
      ...(constraints.trim() ? { constraints: constraints.trim() } : {}),
    };

    submitContext(ctx);
  }

  return (
    <div className={styles.screen}>
      <div className={styles.hero}>
        <h1 className={styles.heroHeading}>Your scope isn&apos;t ready yet.</h1>
        <p className={styles.heroSub}>
          Scope Negotiator turns ambitious ideas and ambiguous requests into
          credible, human-approved scope. AI proposes. You decide.
        </p>
      </div>

      <div className={styles.workTypeSection}>
        <p className={styles.workTypeLabel}>What are we scoping?</p>
        <div className={styles.workTypeOptions} role="radiogroup" aria-label="Work type">
          <button
            type="button"
            role="radio"
            aria-checked={workType === "product"}
            className={`${styles.workTypeButton} ${workType === "product" ? styles.workTypeButtonActive : ""}`}
            onClick={() => setWorkType("product")}
          >
            New Product
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={workType === "feature"}
            className={`${styles.workTypeButton} ${workType === "feature" ? styles.workTypeButtonActive : ""}`}
            onClick={() => setWorkType("feature")}
          >
            New Feature
          </button>
        </div>
      </div>

      {workType && (
        <form className={styles.form} onSubmit={handleSubmit}>
          {workType === "feature" && (
            <FieldGroup
              label="Existing product context"
              optional
              htmlFor="productContext"
              hint="Give Scope Negotiator enough context to understand what this change is being made to."
            >
              <Textarea
                id="productContext"
                value={productContext}
                onChange={(e) => setProductContext(e.target.value)}
                placeholder="Describe the existing product, its stack, users, and current state..."
              />
            </FieldGroup>
          )}

          <FieldGroup
            label={
              workType === "product"
                ? "What are you building?"
                : "What do you want to add or change?"
            }
            htmlFor="brief"
            hint={
              workType === "product"
                ? "The idea, the problem, the intended users, the desired outcome."
                : undefined
            }
          >
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
          </FieldGroup>

          <div className={styles.row}>
            <FieldGroup label="Team size" htmlFor="teamSize">
              <TextInput
                id="teamSize"
                type="number"
                min={1}
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                placeholder="2"
                required
              />
            </FieldGroup>

            <FieldGroup label="Timeframe" htmlFor="timeframe">
              <TextInput
                id="timeframe"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                placeholder="6 weeks"
                required
              />
            </FieldGroup>
          </div>

          <FieldGroup
            label="Constraints"
            optional
            htmlFor="constraints"
          >
            <Textarea
              id="constraints"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="Budget limits, technical constraints, compliance requirements..."
            />
          </FieldGroup>

          <div className={styles.actions}>
            <Button type="submit" variant="primary" disabled={!canSubmit}>
              Negotiate Scope →
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
