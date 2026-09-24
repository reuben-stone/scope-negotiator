/**
 * Derive a short, useful title from the user's brief text.
 * No LLM call — purely deterministic extraction.
 *
 * Strategy: take the first sentence (or first ~60 chars at a word boundary)
 * of the brief, trimmed and cleaned up.
 */
export function deriveTitle(brief: string, maxLength = 60): string {
  const cleaned = brief.replace(/\s+/g, " ").trim();
  if (!cleaned) return "Untitled Scope";

  // Try first sentence
  const sentenceEnd = cleaned.search(/[.!?\n]/);
  const firstSentence =
    sentenceEnd > 0 ? cleaned.slice(0, sentenceEnd).trim() : cleaned;

  if (firstSentence.length <= maxLength) return firstSentence;

  // Truncate at word boundary
  const truncated = firstSentence.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 20 ? truncated.slice(0, lastSpace) : truncated) + "…";
}
