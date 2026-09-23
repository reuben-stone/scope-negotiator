import type { LockedScope, ScopeItem } from "@/types/domain";

function formatEffort(effort: string): string {
  return effort.toUpperCase();
}

function formatItems(items: ScopeItem[], label: string): string {
  if (items.length === 0) return "";

  const lines = items.map((item) => {
    let entry = `- **${item.title}**`;
    if (item.description) entry += `\n  ${item.description}`;
    entry += `\n  Effort: ${formatEffort(item.effort)} · Risk: ${formatEffort(item.risk)}`;
    if (item.userOverride) entry += ` · _User override_`;
    return entry;
  });

  return `## ${label}\n\n${lines.join("\n\n")}`;
}

export function generateMarkdown(locked: LockedScope): string {
  const { context, proposal } = locked;
  const shipped = proposal.items.filter(
    (i) => i.currentClassification === "ship"
  );
  const deferred = proposal.items.filter(
    (i) => i.currentClassification !== "ship"
  );

  const overrides = proposal.items.filter((i) => i.userOverride);

  const sections: string[] = [
    `# SCOPE LOCKED`,
    `${context.teamSize} engineer${context.teamSize !== 1 ? "s" : ""} · ${context.timeframe} · ${shipped.length} ship · ${deferred.length} deferred`,
    `## GOAL\n\n${proposal.goal}`,
    formatItems(shipped, "AGREED SCOPE"),
    formatItems(
      deferred.filter((i) => i.currentClassification === "negotiate"),
      "NEGOTIATED"
    ),
    formatItems(
      deferred.filter((i) => i.currentClassification === "cut"),
      "DEFERRED"
    ),
  ];

  if (overrides.length > 0) {
    const decisionLines = overrides.map(
      (i) =>
        `- **${i.title}**: moved from ${i.recommendedClassification.toUpperCase()} → ${i.currentClassification.toUpperCase()}`
    );
    sections.push(`## DECISIONS MADE\n\n${decisionLines.join("\n")}`);
  }

  if (proposal.successCriteria.length > 0) {
    const criteria = proposal.successCriteria
      .map((c) => `- ${c}`)
      .join("\n");
    sections.push(`## SUCCESS CRITERIA\n\n${criteria}`);
  }

  if (context.constraints) {
    sections.push(`## KEY CONSTRAINTS\n\n${context.constraints}`);
  }

  return sections.filter(Boolean).join("\n\n---\n\n") + "\n";
}
