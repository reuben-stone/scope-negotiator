import type { ScopeContext, ScopeAnalysis, ScopeProposal } from "@/types/domain";
import { MOCK_ANALYSIS, MOCK_PROPOSAL } from "./fixtures";

/**
 * Mock service boundary.
 * In production, these functions will call server-side API routes
 * that communicate with an LLM. The signatures remain the same.
 */

export function analyzeScope(_context: ScopeContext): ScopeAnalysis {
  return structuredClone(MOCK_ANALYSIS);
}

export function generateProposal(
  _context: ScopeContext,
  _analysis: ScopeAnalysis
): ScopeProposal {
  return structuredClone(MOCK_PROPOSAL);
}
