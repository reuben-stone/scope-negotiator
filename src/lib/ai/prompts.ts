import type { ScopeContext, ScopeAnalysis } from "@/types/domain";

const SYSTEM_RULES = `You are a scope analyst for software product development.

Core rules:
- Never replace ambiguity with generated certainty.
- Do not invent missing requirements, team capabilities, technical constraints, or architecture.
- Distinguish supplied facts from your inference.
- Preserve meaningful unresolved uncertainty.
- If information is genuinely unknown, represent it as unknown rather than fabricating an answer.
- Only ask clarification questions whose answers could materially change scope. Do not manufacture questions to fill a quota.`;

export function analyzeSystemPrompt(): string {
  return `${SYSTEM_RULES}

You will receive a product/feature scope context. Analyse it and return structured observations.

Categorise each insight as:
- known: facts stated or directly implied in the brief
- assumed: reasonable inferences not explicitly confirmed
- unknown: gaps where missing information could change scope
- risk: factors that threaten delivery if unaddressed

Return up to 10 insights total. Return 0-3 clarification questions, only where the answer could materially change what ships. It is acceptable to return 0 questions if the brief is clear enough.`;
}

export function analyzeUserPrompt(context: ScopeContext): string {
  const lines: string[] = [
    `WORK TYPE: ${context.workType}`,
    `BRIEF: ${context.brief}`,
    `TEAM / CAPACITY: ${context.team}`,
    `TIMEFRAME: ${context.timeframe}`,
  ];
  if (context.productContext) {
    lines.push(`EXISTING PRODUCT CONTEXT: ${context.productContext}`);
  }
  if (context.constraints) {
    lines.push(`CONSTRAINTS: ${context.constraints}`);
  }
  return lines.join("\n");
}

export function proposeSystemPrompt(): string {
  return `${SYSTEM_RULES}

You will receive:
1. ORIGINAL CONTEXT — the user's scope brief
2. ANALYSIS — structured observations from the analysis phase
3. HUMAN CLARIFICATIONS — the user's answers to clarification questions

Human clarification answers are authoritative and should directly influence the resulting scope proposal.

Propose a scope breakdown with:
- A concise goal statement
- Scope items, each classified as ship (should be in v1), negotiate (valuable but debatable for v1), or cut (defer or remove)
- Each item needs: title, description (optional), reasoning for classification, effort (low/medium/high), risk (low/medium/high)
- Success criteria for the agreed scope

These are proposals only. The user will override classifications as they see fit.`;
}

export function proposeUserPrompt(
  context: ScopeContext,
  analysis: ScopeAnalysis
): string {
  const sections: string[] = [];

  // Original context
  const contextLines = [
    `WORK TYPE: ${context.workType}`,
    `BRIEF: ${context.brief}`,
    `TEAM / CAPACITY: ${context.team}`,
    `TIMEFRAME: ${context.timeframe}`,
  ];
  if (context.productContext) {
    contextLines.push(`EXISTING PRODUCT CONTEXT: ${context.productContext}`);
  }
  if (context.constraints) {
    contextLines.push(`CONSTRAINTS: ${context.constraints}`);
  }
  sections.push(`--- ORIGINAL CONTEXT ---\n${contextLines.join("\n")}`);

  // Analysis
  const insightLines = analysis.insights.map(
    (i) => `[${i.category.toUpperCase()}] ${i.statement}`
  );
  sections.push(`--- ANALYSIS ---\n${insightLines.join("\n")}`);

  // Human clarifications
  const answered = analysis.questions.filter((q) => q.answer?.trim());
  if (answered.length > 0) {
    const clarLines = answered.map(
      (q) => `Q: ${q.question}\nA: ${q.answer}`
    );
    sections.push(`--- HUMAN CLARIFICATIONS ---\n${clarLines.join("\n\n")}`);
  } else {
    sections.push("--- HUMAN CLARIFICATIONS ---\nNo clarification questions were asked.");
  }

  return sections.join("\n\n");
}
