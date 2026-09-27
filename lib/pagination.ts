export type PaginationInput = {
  page?: number;
  pageSize?: number;
};

export type Pagination = {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
};

interface NormalizeOptions {
  defaultPageSize?: number;
  maxPageSize?: number;
}

/**
 * Clamps client-supplied pagination to safe bounds so a negative page can't
 * produce a negative `skip` and an unbounded `pageSize` can't fetch a huge page.
 */
export function normalizePagination(
  { page, pageSize }: PaginationInput,
  { defaultPageSize = 10, maxPageSize = 50 }: NormalizeOptions = {},
): Pagination {
  const safePage =
    typeof page === "number" && Number.isFinite(page) && page >= 1
      ? Math.floor(page)
      : 1;

  const safePageSize =
    typeof pageSize === "number" && Number.isFinite(pageSize)
      ? Math.min(Math.max(Math.floor(pageSize), 1), maxPageSize)
      : defaultPageSize;

  return {
    page: safePage,
    pageSize: safePageSize,
    skip: (safePage - 1) * safePageSize,
    take: safePageSize,
  };
}
