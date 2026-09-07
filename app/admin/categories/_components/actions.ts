"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { errorResponse, successResponse } from "@/lib/responses";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { adminLog } from "@/lib/activity/admin-log";
import {
  buildCategoryFieldChanges,
  snapshotCategory,
} from "@/lib/activity/snapshots/category";
import { formatSlug } from "@/lib/formatSlug";
import { categoryNameSchema } from "@/lib/zodSchemas";
import { MAX_CATEGORIES } from "@/lib/constants/categories";
import { z } from "zod";

const aj = arcjet
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
  )
  .withRule(
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 10,
    }),
  );

async function arcjetGuard(fingerprint: string) {
  const req = await request();
  const decision = await aj.protect(req, { fingerprint });
  return decision.isDenied();
}

function uniqueSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

export async function createCategoryAction({ name }: { name: string }) {
  const session = await requireAdmin();

  const parsed = categoryNameSchema.safeParse(name);
  if (!parsed.success) {
    return errorResponse(
      parsed.error.issues[0]?.message ?? "Invalid category name",
      z.treeifyError(parsed.error),
    );
  }

  try {
    if (await arcjetGuard(session.user.id)) {
      return errorResponse("Too many requests", null);
    }

    const trimmed = parsed.data.trim();

    const existing = await prisma.category.findFirst({
      where: { name: { equals: trimmed, mode: "insensitive" } },
      select: { id: true, name: true },
    });
    if (existing) {
      return errorResponse(`Category "${existing.name}" already exists`, null);
    }

    const count = await prisma.category.count();
    if (count >= MAX_CATEGORIES) {
      return errorResponse(
        `Cannot create more categories: the global limit of ${MAX_CATEGORIES} has been reached.`,
        null,
      );
    }

    const baseSlug = formatSlug(trimmed) || `category-${Date.now().toString(36)}`;
    const taken = new Set(
      (
        await prisma.category.findMany({
          where: { slug: { startsWith: baseSlug } },
          select: { slug: true },
        })
      ).map((c) => c.slug),
    );

    const category = await prisma.category.create({
      data: {
        name: trimmed,
        slug: uniqueSlug(baseSlug, taken),
      },
    });

    await adminLog({
      action: "CATEGORY_CREATED",
      entityType: "CATEGORY",
      entityId: category.id,
      entityLabel: category.name,
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/courses");

    return successResponse("Category created successfully", category);
  } catch {
    return errorResponse("Failed to create category", null);
  }
}

export async function updateCategoryAction({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const session = await requireAdmin();

  const parsed = categoryNameSchema.safeParse(name);
  if (!parsed.success) {
    return errorResponse(
      parsed.error.issues[0]?.message ?? "Invalid category name",
      z.treeifyError(parsed.error),
    );
  }

  try {
    if (await arcjetGuard(session.user.id)) {
      return errorResponse("Too many requests", null);
    }

    const trimmed = parsed.data.trim();

    const before = await prisma.category.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true },
    });
    if (!before) {
      return errorResponse("Category not found", null);
    }

    if (before.name.toLowerCase() !== trimmed.toLowerCase()) {
      const conflict = await prisma.category.findFirst({
        where: {
          id: { not: id },
          name: { equals: trimmed, mode: "insensitive" },
        },
        select: { id: true },
      });
      if (conflict) {
        return errorResponse(`Category "${trimmed}" already exists`, null);
      }
    }

    const baseSlug = formatSlug(trimmed) || `category-${Date.now().toString(36)}`;
    const taken = new Set(
      (
        await prisma.category.findMany({
          where: { slug: { startsWith: baseSlug }, NOT: { id } },
          select: { slug: true },
        })
      ).map((c) => c.slug),
    );
    const nextSlug =
      before.name.toLowerCase() === trimmed.toLowerCase()
        ? before.slug
        : uniqueSlug(baseSlug, taken);

    const category = await prisma.category.update({
      where: { id },
      data: { name: trimmed, slug: nextSlug },
    });

    const beforeSnapshot = snapshotCategory(before);
    const afterSnapshot = snapshotCategory(category);
    const changedFields = buildCategoryFieldChanges(
      beforeSnapshot,
      afterSnapshot,
    );

    if (Object.keys(changedFields).length > 0) {
      await adminLog({
        action: "CATEGORY_UPDATED",
        entityType: "CATEGORY",
        entityId: category.id,
        entityLabel: category.name,
        metadata: { fields: changedFields },
      });
    }

    revalidatePath("/admin/categories");
    revalidatePath("/admin/courses");

    return successResponse("Category updated successfully", category);
  } catch {
    return errorResponse("Failed to update category", null);
  }
}

export async function deleteCategoryAction({ id }: { id: string }) {
  const session = await requireAdmin();

  try {
    if (await arcjetGuard(session.user.id)) {
      return errorResponse("Too many requests", null);
    }

    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { courses: true } },
      },
    });

    if (!category) {
      return errorResponse("Category not found", null);
    }

    // Implicit many-to-many join rows are removed automatically by Postgres
    // when the category row is deleted, so we don't block deletion here even
    // when the category is in use. Courses themselves remain intact.
    await prisma.category.delete({ where: { id } });

    await adminLog({
      action: "CATEGORY_DELETED",
      entityType: "CATEGORY",
      entityId: category.id,
      entityLabel: category.name,
      metadata: {
        slug: category.slug,
        removedFromCourses: category._count.courses,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/courses");

    return successResponse("Category deleted successfully", null);
  } catch {
    return errorResponse("Failed to delete category", null);
  }
}