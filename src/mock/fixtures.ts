import type {
  ScopeAnalysis,
  ScopeProposal,
} from "@/types/domain";

export const MOCK_ANALYSIS: ScopeAnalysis = {
  insights: [
    {
      id: "k1",
      category: "known",
      statement:
        "The platform already handles ticket ingestion and manual agent responses — the routing and display infrastructure exists.",
    },
    {
      id: "k2",
      category: "known",
      statement:
        "Team is 2 engineers with a 6-week window. That's roughly 10 effective engineering-weeks after meetings, reviews and context-switching.",
    },
    {
      id: "a1",
      category: "assumed",
      statement:
        "\"AI-powered support\" means LLM-generated reply suggestions reviewed by agents — not fully autonomous responses from day one.",
    },
    {
      id: "a2",
      category: "assumed",
      statement:
        "The existing Node API can be extended with new endpoints rather than requiring a separate service.",
    },
    {
      id: "u1",
      category: "unknown",
      statement:
        "What does \"handle common questions automatically\" mean in practice? Auto-respond without agent review, or auto-draft for approval?",
    },
    {
      id: "u2",
      category: "unknown",
      statement:
        "Does the Zendesk integration need to be bidirectional (sync status back) or one-way (import tickets)?",
    },
    {
      id: "r1",
      category: "risk",
      statement:
        "\"Safe enough for customer-facing use\" is undefined. Without explicit quality thresholds, this constraint will expand to block launch.",
    },
    {
      id: "r2",
      category: "risk",
      statement:
        "Zendesk integration, analytics dashboard and autonomous handling are each multi-week efforts. Attempting all three in 6 weeks with 2 engineers is not credible.",
    },
  ],
  questions: [
    {
      id: "q1",
      question:
        "Does the first release need to handle tickets autonomously, or is agent-reviewed AI suggestions sufficient for launch?",
      whyItMatters:
        "Autonomous handling requires confidence thresholds, fallback routing, and significantly more safety testing. Supervised suggestions can ship in a fraction of the time.",
    },
    {
      id: "q2",
      question:
        "Is Zendesk integration required for the initial release, or can it follow as a fast-follow once the core AI capability is proven?",
      whyItMatters:
        "Zendesk integration involves OAuth, webhook configuration, field mapping, and ongoing sync — easily 2-3 weeks of the available timeline.",
    },
    {
      id: "q3",
      question:
        "What constitutes \"safe enough\"? Is there an existing review process, or does this team need to define acceptable error rates before shipping?",
      whyItMatters:
        "Without a concrete safety bar, this constraint becomes a moving target that delays launch indefinitely.",
    },
  ],
};

export const MOCK_PROPOSAL: ScopeProposal = {
  goal: "Deliver agent-assisted AI reply suggestions for the existing support platform, with measurable quality gates, within 6 weeks.",
  items: [
    {
      id: "s1",
      title: "AI reply suggestions for agents",
      description:
        "When an agent opens a ticket, the system generates a suggested reply based on ticket content and historical responses. Agent reviews, edits if needed, and sends.",
      reasoning:
        "Core value proposition. Supervised suggestions are shippable within the timeline and satisfy the safety constraint.",
      effort: "high",
      risk: "medium",
      recommendedClassification: "ship",
      currentClassification: "ship",
      userOverride: false,
    },
    {
      id: "s2",
      title: "Ticket classification and routing",
      description:
        "Automatically tag incoming tickets by category and urgency. Route to appropriate agent or queue.",
      reasoning:
        "Relatively straightforward NLP task. Improves agent efficiency and is a prerequisite for any future automation.",
      effort: "medium",
      risk: "low",
      recommendedClassification: "ship",
      currentClassification: "ship",
      userOverride: false,
    },
    {
      id: "s3",
      title: "Response quality tracking",
      description:
        "Track suggestion acceptance rate, edit distance, and agent feedback. Surface basic metrics in an internal dashboard.",
      reasoning:
        "Required to define and measure the \"safe enough\" constraint. Without this, there's no evidence base for expanding to automation later.",
      effort: "medium",
      risk: "low",
      recommendedClassification: "ship",
      currentClassification: "ship",
      userOverride: false,
    },
    {
      id: "s4",
      title: "Common question auto-drafts",
      description:
        "For high-confidence ticket categories, auto-generate a draft reply and present it for one-click agent approval.",
      reasoning:
        "Valuable but depends on having enough data from the suggestion system to identify high-confidence categories. Better as a fast-follow.",
      effort: "medium",
      risk: "medium",
      recommendedClassification: "negotiate",
      currentClassification: "negotiate",
      userOverride: false,
    },
    {
      id: "s5",
      title: "Analytics dashboard",
      description:
        "Dedicated dashboard showing ticket volumes, AI usage stats, response times, and customer satisfaction trends.",
      reasoning:
        "Useful but not critical for launch. Basic quality metrics (shipped above) cover the safety requirement. A full dashboard is a separate product surface.",
      effort: "high",
      risk: "low",
      recommendedClassification: "negotiate",
      currentClassification: "negotiate",
      userOverride: false,
    },
    {
      id: "s6",
      title: "Zendesk integration",
      description:
        "Bidirectional sync with Zendesk: import tickets, push responses, sync status.",
      reasoning:
        "Major integration effort (OAuth, webhooks, field mapping, error handling). At 2-3 weeks, it consumes half the timeline and isn't needed to prove the AI capability works.",
      effort: "high",
      risk: "high",
      recommendedClassification: "cut",
      currentClassification: "cut",
      userOverride: false,
    },
    {
      id: "s7",
      title: "Fully autonomous ticket handling",
      description:
        "AI responds to tickets without agent review for qualifying categories.",
      reasoning:
        "Requires confidence thresholds, fallback logic, extensive testing, and a defined safety bar that doesn't exist yet. Premature for a first release.",
      effort: "high",
      risk: "high",
      recommendedClassification: "cut",
      currentClassification: "cut",
      userOverride: false,
    },
  ],
  successCriteria: [
    "Agents can view and use AI-generated reply suggestions for every incoming ticket.",
    "Ticket classification assigns category and urgency with visible accuracy.",
    "Suggestion acceptance rate and edit distance are tracked and reportable.",
    "No AI-generated content reaches customers without agent review and approval.",
    "System handles production ticket volume without degrading platform performance.",
  ],
};
