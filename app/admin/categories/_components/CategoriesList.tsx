import { EmptyState } from "@/components/general/EmptyState";
import { TagIcon } from "lucide-react";

import { adminGetCategories } from "@/app/data/admin/admin-get-categories";
import { MAX_CATEGORIES } from "@/lib/constants/categories";

import { CategoryRow } from "./CategoryRow";

export async function CategoriesList() {
  const categories = await adminGetCategories();

  if (categories.length === 0) {
    return (
      <EmptyState
        icon={TagIcon}
        title="No categories yet"
        description="Create your first category to start organising courses."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground tabular-nums">
            {categories.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground tabular-nums">
            {MAX_CATEGORIES}
          </span>{" "}
          categories used
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <CategoryRow key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}