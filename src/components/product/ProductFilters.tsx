"use client";

import { useCategories } from "@/lib/useCategories";

export type SortOption =
  | "featured"
  | "price-low"
  | "price-high"
  | "rating"
  | "newest";

interface ProductFiltersProps {
  selectedCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  selectedSort: SortOption;
  onSelectSort: (sort: SortOption) => void;
  totalProductsCount: number;
}

export default function ProductFilters({
  selectedCategory,
  onSelectCategory,
  selectedSort,
  onSelectSort,
  totalProductsCount,
}: ProductFiltersProps) {
  const CATEGORIES = useCategories();
  return (
    <div className="flex flex-col gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800">
      {/* Category Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => onSelectCategory("all")}
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
            selectedCategory === "all"
              ? "bg-zinc-900 text-white shadow-xs dark:bg-zinc-100 dark:text-zinc-950"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          }`}
        >
          All Items ({totalProductsCount})
        </button>

        {CATEGORIES.map((cat) => (
          <button
            type="button"
            key={cat.slug}
            onClick={() => onSelectCategory(cat.slug)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
              selectedCategory === cat.slug
                ? "bg-zinc-900 text-white shadow-xs dark:bg-zinc-100 dark:text-zinc-950"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Sorting & Result Counts Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span>Showing <strong className="text-zinc-900 dark:text-zinc-100">{totalProductsCount}</strong> items</span>
          {selectedCategory !== "all" && (
            <button
              type="button"
              onClick={() => onSelectCategory("all")}
              className="text-amber-600 hover:underline dark:text-amber-400 font-semibold"
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Sort Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            Sort By:
          </label>
          <select
            id="sort-select"
            value={selectedSort}
            onChange={(e) => onSelectSort(e.target.value as SortOption)}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-800 outline-none focus:border-amber-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <option value="featured">Featured / Best Sellers</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>
      </div>
    </div>
  );
}
