import type { ScopeContext, ScopeAnalysis, LockedScope } from "@/types/domain";

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
  const sections: string[] = [];

  sections.push(`<work_type>${context.workType}</work_type>`);

  if (context.productContext) {
    sections.push(`<product_context>\n${context.productContext}\n</product_context>`);
  }

  sections.push(`<current_request>\n${context.brief}\n</current_request>`);
  sections.push(`<team_context>\n${context.team}\n</team_context>`);
  sections.push(`<timeframe>${context.timeframe}</timeframe>`);

  if (context.constraints) {
    sections.push(`<constraints>\n${context.constraints}\n</constraints>`);
  }

  if (context.approvedMemory && context.approvedMemory.length > 0) {
    const memoryLines = context.approvedMemory.map((m) => `- ${m}`).join("\n");
    sections.push(`<approved_memory>\nThe following are human-approved constraints and preferences from previous scoping decisions. Treat them as authoritative context.\n${memoryLines}\n</approved_memory>`);
  }

  return sections.join("\n\n");
}

export function proposeSystemPrompt(): string {
  return `${SYSTEM_RULES}

You will receive:
1. ORIGINAL CONTEXT — the user's scope brief
2. ANALYSIS — structured observations from the analysis phase
3. HUMAN CLARIFICATIONS — the user's answers to clarification questions

Human clarification answers are authoritative and should directly influence the resulting scope proposal.

Propose a scope breakdown with:
- A concise title (3-7 words) that describes the final scoped outcome based on what is being shipped, not what was originally requested. Use normal product/engineering terminology. Do not use marketing language, vague labels, or simply copy the user's raw input. The title should be meaningful when viewed without the original brief.
- A concise goal statement
- Scope items, each classified as ship (should be in v1), negotiate (valuable but debatable for v1), or cut (defer or remove)
- Success criteria for the agreed scope

Each scope item requires two distinct text fields:

"description" — a concise, implementation-useful description of what the capability includes and, where relevant, its important boundaries. It should answer: "What are we actually building or deferring?" It should NOT explain why the item was classified.

"rationale" — the AI's reasoning for the proposed classification. It should answer: "Why did you recommend SHIP / NEGOTIATE / CUT for this item?" Reference actual constraints, clarifications and trade-offs where relevant.

These two fields must not be paraphrases of one another.

Each item also needs: title, effort (low/medium/high), risk (low/medium/high).

Scope items must represent product capabilities, features, deliverables or deliberately deferred work. Do not return planning activities such as defining requirements, clarifying capacity, establishing timelines or documenting constraints as scope items. Those inputs inform the recommendation; they are not themselves things to ship.

Use ship, negotiate and cut to express genuine trade-offs against the supplied team, timeframe and constraints. Do not force every category to contain items. Do not classify an item as ship merely because it is useful — ship means it credibly belongs in the proposed delivery scope given the available team and time.

These are proposals only. The user will override classifications as they see fit.`;
}

export function proposeUserPrompt(
  context: ScopeContext,
  analysis: ScopeAnalysis
): string {
  const sections: string[] = [];

  // Original context — structured sections
  const contextParts: string[] = [];
  contextParts.push(`<work_type>${context.workType}</work_type>`);
  if (context.productContext) {
    contextParts.push(`<product_context>\n${context.productContext}\n</product_context>`);
  }
  contextParts.push(`<current_request>\n${context.brief}\n</current_request>`);
  contextParts.push(`<team_context>\n${context.team}\n</team_context>`);
  contextParts.push(`<timeframe>${context.timeframe}</timeframe>`);
  if (context.constraints) {
    contextParts.push(`<constraints>\n${context.constraints}\n</constraints>`);
  }
  if (context.approvedMemory && context.approvedMemory.length > 0) {
    const memoryLines = context.approvedMemory.map((m) => `- ${m}`).join("\n");
    contextParts.push(`<approved_memory>\nHuman-approved constraints and preferences from previous scoping decisions. Treat as authoritative.\n${memoryLines}\n</approved_memory>`);
  }
  sections.push(`--- ORIGINAL CONTEXT ---\n${contextParts.join("\n\n")}`);

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

export function memorySystemPrompt(): string {
  return `${SYSTEM_RULES}

You will receive a completed scope negotiation outcome: the original context, final scope items, human overrides, and decisions made.

Propose 0-3 short, reusable memories that would be genuinely useful in future scoping sessions for this product/team.

Good memories are:
- Constraints or preferences that apply across multiple scopes
- Architectural or process decisions worth remembering
- Trade-offs the team has deliberately made

Bad memories are:
- Summaries of this specific scope
- Obvious facts already in the product context
- Temporary decisions unlikely to carry forward
- Anything already covered by existing approved memory

Each memory should be a single clear statement.

If nothing from this scope is genuinely worth remembering for future sessions, return an empty array. Do not manufacture memories.`;
}

export function memoryUserPrompt(locked: LockedScope): string {
  const { context, proposal } = locked;
  const overrides = proposal.items.filter((i) => i.userOverride);
  const shipped = proposal.items.filter((i) => i.currentClassification === "ship");
  const cut = proposal.items.filter((i) => i.currentClassification === "cut");

  const sections: string[] = [];

  sections.push(`WORK TYPE: ${context.workType}`);
  sections.push(`BRIEF: ${context.brief}`);
  if (context.productContext) {
    sections.push(`PRODUCT CONTEXT: ${context.productContext}`);
  }
  sections.push(`TEAM: ${context.team}`);
  sections.push(`TIMEFRAME: ${context.timeframe}`);
  if (context.constraints) {
    sections.push(`CONSTRAINTS: ${context.constraints}`);
  }
  sections.push(`GOAL: ${proposal.goal}`);
  sections.push(`SHIPPED: ${shipped.map((i) => i.title).join(", ")}`);
  sections.push(`CUT: ${cut.map((i) => i.title).join(", ")}`);

  if (overrides.length > 0) {
    const overrideLines = overrides.map(
      (i) => `${i.title}: AI proposed ${i.recommendedClassification} → human decided ${i.currentClassification}`
    );
    sections.push(`HUMAN OVERRIDES:\n${overrideLines.join("\n")}`);
  }

  if (context.approvedMemory && context.approvedMemory.length > 0) {
    sections.push(`EXISTING APPROVED MEMORY:\n${context.approvedMemory.map((m) => `- ${m}`).join("\n")}`);
  }

  return sections.join("\n\n");
}
