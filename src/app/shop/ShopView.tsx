"use client";

import type { SitePage } from "@/types/site";
import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { productCategories } from "@/lib/catalog";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useLiveProducts } from "@/lib/storeSync";
import SearchBar from "@/components/ui/SearchBar";
import ProductFilters, { SortOption } from "@/components/product/ProductFilters";
import ProductGrid from "@/components/product/ProductGrid";

function ShopContent({ initialProducts, page }: { initialProducts: Product[]; page: SitePage }) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const { addItem } = useCart();
  const liveProducts = useLiveProducts(initialProducts);

  const [searchQuery, setSearchQuery] = useState("");
  const selectedCategory = initialCategory;
  const router = useRouter();
  const setSelectedCategory = (category: string) => {
    const query = new URLSearchParams(searchParams.toString());
    if (category === "all") query.delete("category"); else query.set("category", category);
    router.push(`/shop${query.size ? `?${query}` : ""}`, { scroll: false });
  };
  const [selectedSort, setSelectedSort] = useState<SortOption>("featured");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Client-side filtering & search
  const filteredProducts = useMemo(() => {
    return liveProducts.filter((product) => {
      // Category match
      const matchesCategory =
        selectedCategory === "all" || productCategories(product).includes(selectedCategory);

      // Search match
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.categoryName.toLowerCase().includes(query) ||
        (product.specs &&
          Object.values(product.specs).some((val) =>
            val.toLowerCase().includes(query)
          ));

      return matchesCategory && matchesSearch;
    });
  }, [liveProducts, searchQuery, selectedCategory]);

  // Client-side sorting
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (selectedSort) {
      case "price-low":
        return list.sort((a, b) => a.price - b.price);
      case "price-high":
        return list.sort((a, b) => b.price - a.price);
      case "rating":
        return list.sort((a, b) => b.rating - a.rating);
      case "newest":
        return list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      case "featured":
      default:
        // Rank Bestsellers and Popular first
        return list.sort((a, b) => {
          const score = (p: Product) => (p.badge === "Bestseller" ? 2 : p.badge ? 1 : 0);
          return score(b) - score(a);
        });
    }
  }, [filteredProducts, selectedSort]);

  const handleAddToCart = (product: Product) => {
    // Build default selectedVariants (first option for each variant)
    const defaultVariants: Record<string, string> = {};
    if (product.variants) {
      product.variants.forEach((v) => {
        defaultVariants[v.id] = v.options[0]?.id || "";
      });
    }
    addItem(
      {
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        unitPrice: product.price,
        image: product.images[0] || "/images/cat-pens.jpg",
        selectedVariants: defaultVariants,
        customization: undefined,
      },
      1
    );
    setToastMessage(`"${product.name}" added to cart!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedSort("featured");
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-10 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Header */}
        <nav className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-6">
          <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-zinc-900 dark:text-white">Shop Catalogue</span>
        </nav>

        {/* Page Title & Intro */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">
              <span>🇵🇰 All Pakistan Catalog</span>
              <span>•</span>
              <span>Cash on Delivery</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">{page.title}</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">{page.description}</p>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-80">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, wood, metal..."
            />
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-6">
          <ProductFilters
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedSort={selectedSort}
            onSelectSort={setSelectedSort}
            totalProductsCount={sortedProducts.length}
          />
        </div>

        {/* Product Grid */}
        <div className="mt-8">
          <ProductGrid
            products={sortedProducts}
            onAddToCart={handleAddToCart}
            onResetFilters={handleResetFilters}
          />
        </div>
      </div>

      {/* Cart Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-300 bg-white p-4 shadow-2xl dark:border-emerald-800 dark:bg-zinc-900">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            ✓
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-900 dark:text-white">Added to Cart</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-300">{toastMessage}</p>
            <Link
              href="/cart"
              className="mt-1 inline-block text-[11px] font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400"
            >
              View Cart →
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss"
            className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default function ShopView({ initialProducts, page }: { initialProducts: Product[]; page: SitePage }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex items-center gap-3 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          Loading Catalog...
        </div>
      </div>
    }>
      <ShopContent initialProducts={initialProducts} page={page} />
    </Suspense>
  );
}
