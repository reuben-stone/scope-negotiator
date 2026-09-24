import type { ScopeItem } from "@/types/domain";

export function filterCriteria(
  criteria: string[],
  shipped: ScopeItem[],
  notShipped: ScopeItem[]
): string[] {
  const notShippedTitles = notShipped.map((i) => i.title.toLowerCase());
  return criteria.filter((criterion) => {
    const lower = criterion.toLowerCase();
    return !notShippedTitles.some(
      (title) => title.length > 4 && lower.includes(title)
    );
  });
}
