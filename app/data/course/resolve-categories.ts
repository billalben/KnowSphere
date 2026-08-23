import "server-only";

import type { Prisma, PrismaClient } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";

import { formatSlug } from "@/lib/formatSlug";
import { MAX_CATEGORIES } from "@/lib/constants/categories";

export { MAX_CATEGORIES };

type CategoryClient = PrismaClient | Prisma.TransactionClient;

export type ResolvedCategory = {
  id: string;
  name: string;
  slug: string;
};

/**
 * Idempotently resolves a list of free-text category names into Category rows.
 *
 * - Trims, drops empties, dedupes case-insensitively, preserves first-seen casing.
 * - For each unique name, upserts by `name`. New rows get a slug derived from the name
 *   with a numeric suffix if the base slug is already taken.
 * - Throws `CATEGORY_LIMIT_EXCEEDED` if upserting would push the total over the cap.
 */
export async function resolveCategories(
  names: string[],
  client: CategoryClient = prisma,
): Promise<ResolvedCategory[]> {
  const seen = new Map<string, string>(); // lowercased -> original casing
  for (const raw of names) {
    const trimmed = raw.trim();
    const key = trimmed.toLowerCase();
    if (!key) continue;
    if (!seen.has(key)) seen.set(key, trimmed);
  }

  const uniqueNames = Array.from(seen.values());
  if (uniqueNames.length === 0) return [];

  const existing = await client.category.findMany({
    where: {
      OR: uniqueNames.map((name) => ({
        name: { equals: name, mode: "insensitive" as const },
      })),
    },
    select: { id: true, name: true, slug: true },
  });

  const byLowercase = new Map(existing.map((c) => [c.name.toLowerCase(), c]));
  const resolved: ResolvedCategory[] = [];
  const toCreate: string[] = [];

  for (const name of uniqueNames) {
    const existingRow = byLowercase.get(name.toLowerCase());
    if (existingRow) {
      resolved.push(existingRow);
    } else {
      toCreate.push(name);
    }
  }

  if (toCreate.length > 0) {
    const currentCount = await client.category.count();
    const roomLeft = MAX_CATEGORIES - currentCount;
    if (toCreate.length > roomLeft) {
      throw new CATEGORY_LIMIT_EXCEEDED(
        `Cannot create ${toCreate.length} new categor${toCreate.length === 1 ? "y" : "ies"}: the global limit of ${MAX_CATEGORIES} categories has been reached.`,
      );
    }

    const takenSlugs = new Set<string>(
      (
        await client.category.findMany({
          where: { slug: { in: toCreate.map(deriveBaseSlug) } },
          select: { slug: true },
        })
      ).map((c) => c.slug),
    );

    for (const name of toCreate) {
      const base = deriveBaseSlug(name);
      const slug = pickAvailableSlug(base, takenSlugs);
      takenSlugs.add(slug);

      const created = await client.category.create({
        data: { name, slug },
        select: { id: true, name: true, slug: true },
      });
      resolved.push(created);
    }
  }

  return resolved;
}

function deriveBaseSlug(name: string): string {
  const slug = formatSlug(name);
  return slug || `category-${Date.now().toString(36)}`;
}

function pickAvailableSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

export class CATEGORY_LIMIT_EXCEEDED extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CATEGORY_LIMIT_EXCEEDED";
  }
}