/**
 * Normalizes an admin-provided slug, falling back to deriving one from the
 * course title when the slug is blank.
 */
export function deriveCourseSlug(
  slug: string | undefined | null,
  title: string,
): string {
  const fromSlug = formatSlug(typeof slug === "string" ? slug : "");
  return fromSlug.length > 0 ? fromSlug : formatSlug(title);
}

export function formatSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, "") // Remove special characters
    .replace(/-+/g, "-") // Replace multiple hyphens with a single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens
}
