"use server";

import { type tApiResponse } from "@/types/api";
import { errorResponse, successResponse } from "@/lib/responses";
import { requireUser } from "@/app/data/user/require-user";
import {
  getMyWishlistCourses,
  type tWishlistPage,
} from "@/app/data/user/get-wishlist-courses";
import { WISHLIST_PAGE_SIZE } from "@/lib/constants/wishlist";

export async function getWishlistPageAction({
  page,
  pageSize = WISHLIST_PAGE_SIZE,
}: {
  page: number;
  pageSize?: number;
}): Promise<tApiResponse<tWishlistPage | null>> {
  await requireUser();

  try {
    const data = await getMyWishlistCourses({ page, pageSize });
    return successResponse("Wishlist loaded", data);
  } catch {
    return errorResponse("Failed to load wishlist", null);
  }
}
