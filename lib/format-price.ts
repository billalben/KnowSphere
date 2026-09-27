export function formatPrice(priceCents: number): string {
  if (!priceCents) return "Free";
  return `$${(priceCents / 100).toFixed(2)}`;
}
