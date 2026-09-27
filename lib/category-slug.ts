import { formatSlug } from "@/lib/formatSlug";

export function deriveBaseSlug(name: string): string {
  const slug = formatSlug(name);
  return slug || `category-${Date.now().toString(36)}`;
}

export function pickAvailableSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}
