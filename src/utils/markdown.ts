import type { LockedScope, ScopeItem } from "@/types/domain";

function formatItems(items: ScopeItem[], label: string): string {
  if (items.length === 0) return "";

  const lines = items.map((item) => {
    let entry = `### ${item.title}\n\n${item.description}`;
    entry += `\n\n- Effort: ${item.effort.toUpperCase()}`;
    entry += `\n- Risk: ${item.risk.toUpperCase()}`;
    if (item.userOverride) {
      entry += `\n- User override: AI proposed ${item.recommendedClassification.toUpperCase()} → final decision ${item.currentClassification.toUpperCase()}`;
    }
    return entry;
  });

  return `## ${label}\n\n${lines.join("\n\n")}`;
}

function formatDeferred(items: ScopeItem[], label: string): string {
  if (items.length === 0) return "";

  const lines = items.map((item) => {
    let entry = `### ${item.title} [${item.currentClassification.toUpperCase()}]\n\n${item.description}`;
    if (item.userOverride) {
      entry += `\n\n- User override: AI proposed ${item.recommendedClassification.toUpperCase()} → final decision ${item.currentClassification.toUpperCase()}`;
    }
    return entry;
  });

  return `## ${label}\n\n${lines.join("\n\n")}`;
}

export function generateMarkdown(
  locked: LockedScope,
  filteredCriteria?: string[]
): string {
  const { context, proposal } = locked;
  const shipped = proposal.items.filter(
    (i) => i.currentClassification === "ship"
  );
  const negotiated = proposal.items.filter(
    (i) => i.currentClassification === "negotiate"
  );
  const cut = proposal.items.filter(
    (i) => i.currentClassification === "cut"
  );
  const overrides = proposal.items.filter((i) => i.userOverride);

  const criteria = filteredCriteria ?? proposal.successCriteria;

  const sections: string[] = [
    `# Scope Locked`,
    `${shipped.length} ship · ${negotiated.length} negotiate · ${cut.length} cut${overrides.length > 0 ? ` · ${overrides.length} override${overrides.length !== 1 ? "s" : ""}` : ""}`,
  ];

  // Goal
  sections.push(`## Goal\n\n${proposal.goal}`);

  // Context
  const contextLines = [
    `- **Team / Capacity:** ${context.team}`,
    `- **Timeframe:** ${context.timeframe}`,
  ];
  if (context.constraints) {
    contextLines.push(`- **Key Constraints:** ${context.constraints}`);
  }
  sections.push(`## Context\n\n${contextLines.join("\n")}`);

  // Agreed Scope
  if (shipped.length > 0) {
    sections.push(formatItems(shipped, "Agreed Scope"));
  }

  // Deferred — Negotiate
  if (negotiated.length > 0) {
    sections.push(formatDeferred(negotiated, "Deferred / Negotiate"));
  }

  // Cut
  if (cut.length > 0) {
    sections.push(formatDeferred(cut, "Cut"));
  }

  // Success Criteria
  if (criteria.length > 0) {
    const criteriaLines = criteria.map((c) => `- ${c}`).join("\n");
    sections.push(`## Success Criteria\n\n${criteriaLines}`);
  }

  // Decisions Made
  if (overrides.length > 0) {
    const decisionLines = overrides.map(
      (i) =>
        `- **${i.title}**\n  - AI proposed: ${i.recommendedClassification.toUpperCase()}\n  - Final decision: ${i.currentClassification.toUpperCase()}`
    );
    sections.push(`## Decisions Made\n\n${decisionLines.join("\n\n")}`);
  }

  return sections.filter(Boolean).join("\n\n---\n\n") + "\n";
}
