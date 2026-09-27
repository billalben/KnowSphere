export interface ReorderItem {
  id: string;
  position: number;
}

/**
 * Returns true only when `submitted` is a complete permutation of `existingIds`:
 * every id appears exactly once, no foreign ids are included, and the positions
 * form the contiguous range `firstPosition..firstPosition + N - 1` with no gaps
 * or duplicates. Guards the two-step negative-position reorder technique against
 * partial or tampered payloads.
 */
export function isCompletePermutation(
  submitted: ReorderItem[],
  existingIds: string[],
  firstPosition: number,
): boolean {
  if (submitted.length === 0) return false;
  if (submitted.length !== existingIds.length) return false;

  const submittedIds = new Set<string>();
  const positions = new Set<number>();

  for (const item of submitted) {
    if (typeof item.id !== "string" || item.id.length === 0) return false;
    if (!Number.isInteger(item.position)) return false;
    if (submittedIds.has(item.id)) return false;
    if (positions.has(item.position)) return false;
    submittedIds.add(item.id);
    positions.add(item.position);
  }

  if (existingIds.some((id) => !submittedIds.has(id))) return false;

  for (let i = 0; i < existingIds.length; i++) {
    if (!positions.has(firstPosition + i)) return false;
  }

  return true;
}
