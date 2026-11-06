"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { formatPKR } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  className?: string;
}

export default function ProductCard({
  product,
  onAddToCart,
  className = "",
}: ProductCardProps) {
  const primaryImage = product.images[0] || "/images/cat-pens.jpg";

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-amber-500 ${className}`}
    >
      <div>
        {/* Clickable Image Container */}
        <Link
          href={`/products/${product.slug}`}
          className="relative block aspect-4/3 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800"
        >
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Badge */}
          {product.badge && (
            <div className="absolute top-3 left-3">
              <span className="rounded-full bg-zinc-950/80 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-white/10 shadow-xs">
                {product.badge}
              </span>
            </div>
          )}

          {/* Customization Badge */}
          {product.customization.allowsText && (
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/95 px-2 py-0.5 text-[10px] font-bold text-zinc-950 shadow-xs backdrop-blur-xs">
                <span>⚡ Custom Engraving</span>
              </span>
            </div>
          )}
        </Link>

        {/* Content Section */}
        <div className="p-4 sm:p-5">
          {/* Category & Stock */}
          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {product.categoryName}
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              In Stock
            </span>
          </div>

          {/* Product Name Title Link */}
          <Link href={`/products/${product.slug}`} className="block mt-2">
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 transition-colors group-hover:text-amber-600 dark:text-zinc-100 dark:group-hover:text-amber-400 line-clamp-2">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(product.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700"
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">
              {product.rating}
            </span>
            <span className="text-zinc-400 text-[11px]">
              ({product.reviewsCount})
            </span>
          </div>

          {/* Pricing */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-zinc-900 dark:text-white">
              {formatPKR(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-zinc-400 line-through">
                {formatPKR(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 sm:p-5 pt-0 grid grid-cols-2 gap-2">
        <Link
          href={`/products/${product.slug}`}
          className="w-full rounded-xl border border-amber-500/50 bg-amber-50 py-2.5 px-2 text-center text-xs font-bold text-amber-900 transition-all duration-150 hover:shadow-md active:scale-95 motion-reduce:transform-none hover:bg-amber-100 dark:border-amber-500/60 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50"
        >
          Customize
        </Link>

        {onAddToCart ? (
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            disabled={!product.inStock}
            className="w-full rounded-xl bg-zinc-900 py-2.5 px-2 text-center text-xs font-bold text-white transition-all duration-150 hover:shadow-md hover:bg-zinc-800 active:scale-95 motion-reduce:transform-none dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </button>
        ) : (
          <Link
            href={`/products/${product.slug}`}
            className="w-full rounded-xl bg-zinc-900 py-2.5 px-2 text-center text-xs font-bold text-white transition-all duration-150 hover:shadow-md hover:bg-zinc-800 active:scale-95 motion-reduce:transform-none dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
}
