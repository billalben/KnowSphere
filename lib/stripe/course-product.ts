import "server-only";

import { stripe } from "@/lib/stripe";

export type CourseProductInput = {
  title: string;
  description?: string;
  priceCents: number;
};

export async function createCourseProduct({
  title,
  description,
  priceCents,
}: CourseProductInput): Promise<{ productId: string; priceId: string }> {
  const product = await stripe.products.create({
    name: title,
    ...(description !== undefined && { description }),
    default_price_data: {
      currency: "usd",
      unit_amount: priceCents,
    },
  });

  return {
    productId: product.id,
    priceId: String(product.default_price),
  };
}

/**
 * Best-effort product cleanup. A missing or already-deleted product must never
 * fail the caller, so errors are swallowed.
 */
export async function deleteCourseProduct(productId: string): Promise<void> {
  try {
    await stripe.products.del(productId);
  } catch {
    // no-op
  }
}

/**
 * Best-effort cleanup when only the price id is known (Stripe prices are
 * immutable, so the product id has to be resolved from the price).
 */
export async function deleteCourseProductByPriceId(
  priceId: string,
): Promise<void> {
  try {
    const price = await stripe.prices.retrieve(priceId);
    const productId =
      typeof price.product === "string" ? price.product : price.product.id;
    await stripe.products.del(productId);
  } catch {
    // no-op
  }
}

export type SyncCourseProductInput = {
  currentPriceId: string;
  title: string;
  description?: string;
  priceCents: number;
};

export type SyncCourseProductResult = {
  productId: string;
  priceId: string;
  previousPriceId: string | null;
  createdPriceId: string | null;
};

/**
 * Brings a course's Stripe product in line with its editable fields. Product
 * name/description are updated in place; because prices are immutable, a price
 * change creates a new price, makes it the default, and archives the old one.
 */
export async function syncCourseProduct({
  currentPriceId,
  title,
  description,
  priceCents,
}: SyncCourseProductInput): Promise<SyncCourseProductResult> {
  const currentPrice = await stripe.prices.retrieve(currentPriceId);
  const productId =
    typeof currentPrice.product === "string"
      ? currentPrice.product
      : currentPrice.product.id;

  await stripe.products.update(productId, {
    name: title,
    description: description ?? "",
  });

  if (
    currentPrice.unit_amount === priceCents &&
    currentPrice.currency === "usd"
  ) {
    return {
      productId,
      priceId: currentPriceId,
      previousPriceId: null,
      createdPriceId: null,
    };
  }

  const newPrice = await stripe.prices.create({
    product: productId,
    currency: "usd",
    unit_amount: priceCents,
  });

  await stripe.products.update(productId, { default_price: newPrice.id });
  // Archive the previous price so it can't be selected for new checkouts.
  await stripe.prices.update(currentPriceId, { active: false }).catch(() => {});

  return {
    productId,
    priceId: newPrice.id,
    previousPriceId: currentPriceId,
    createdPriceId: newPrice.id,
  };
}

/**
 * Best-effort compensation when the DB write that should persist the new price
 * fails: restore the old default price and re-activate it.
 */
export async function revertCourseProduct(
  result: SyncCourseProductResult,
): Promise<void> {
  if (!result.createdPriceId || !result.previousPriceId) return;

  try {
    await stripe.products.update(result.productId, {
      default_price: result.previousPriceId,
    });
    await stripe.prices.update(result.previousPriceId, { active: true });
    await stripe.prices.update(result.createdPriceId, { active: false });
  } catch {
    // Best-effort; there is no further recovery available here.
  }
}
