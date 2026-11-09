"use client";
import type { SiteSection } from "@/types/site";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { useCategories } from "@/lib/useCategories";
import { productCategories } from "@/lib/catalog";
import { PRODUCTS } from "@/data/products";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useLiveProducts } from "@/lib/storeSync";

interface FeaturedProductsProps {
  section?: SiteSection;
  onUpdateCartCount?: (newCount: number) => void;
}

export default function FeaturedProducts({ onUpdateCartCount, section }: FeaturedProductsProps) {
  const liveProducts = useLiveProducts(PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { addItem, itemCount } = useCart();
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);
  useEffect(() => { onUpdateCartCount?.(itemCount); }, [itemCount, onUpdateCartCount]);

  const catalogCategories = useCategories();
  const categories = [{ id: "all", label: "All Items" }, ...catalogCategories.map(category => ({ id: category.slug, label: category.name }))];

  const filteredProducts =
    selectedCategory === "all"
      ? liveProducts
      : liveProducts.filter((p) => productCategories(p).includes(selectedCategory));

  const handleAddToCart = (product: Product) => {
    if (!product.inStock) return;
    const selectedVariants: Record<string, string> = {};
    product.variants?.forEach(variant => {
      const option = variant.options.find(option => option.inStock);
      if (option) selectedVariants[variant.id] = option.id;
    });
    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      unitPrice: product.price,
      image: product.images[0] || "/images/cat-pens.jpg",
      selectedVariants,
    }, 1);
    setToastMessage(`"${product.name}" added to cart!`);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <section id="featured-products" className="py-20 bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">
              <span>🇵🇰 Initial Launch Collection</span>
              <span>•</span>
              <span>Cash on Delivery</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">{section?.title ?? <> Featured Personalized Products </>}</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{section?.body ?? <> Laser-marked with recipient names, bespoke quotes, or brand logos. </>}</p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400"
          >
            <span>View Full Shop Catalogue ({PRODUCTS.length})</span>
            <span>→</span>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-4 dark:border-zinc-800">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? "bg-zinc-900 text-white shadow-xs dark:bg-zinc-100 dark:text-zinc-950"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-300 bg-white p-4 shadow-2xl dark:border-emerald-800 dark:bg-zinc-900 animate-bounce">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            ✓
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-900 dark:text-white">Cart Updated</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-300">{toastMessage}</p>
          </div>
        </div>
      )}
    </section>
  );
}
