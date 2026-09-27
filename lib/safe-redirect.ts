/**
 * Validates a `?redirect=` value for post-auth navigation.
 *
 * Only same-origin, rooted relative paths are allowed. Protocol-relative
 * (`//evil.com`) and backslash-normalized (`/\evil.com`) values are rejected to
 * prevent open-redirects. Anything invalid falls back to the provided path.
 */
export function safeRedirect(
  value: string | null | undefined,
  fallback = "/",
): string {
  if (!value) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (value.includes("\\")) return fallback;
  return value;
}
