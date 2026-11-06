"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAdmin } from "@/context/AdminContext";
import { formatPKR } from "@/lib/utils";
import { useCategories } from "@/lib/useCategories";
import { productCategories } from "@/lib/catalog";

export default function AdminProductsPage() {
  const CATEGORIES = useCategories();
  const { products, toggleStock, deleteProduct } = useAdmin();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || productCategories(p).includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              Inventory & Customization Engine
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Products Catalog
          </h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Manage pricing, live laser engraving rules, font configurations, and stock availability.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-zinc-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all active:scale-95"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add New Product</span>
        </Link>
      </div>

      {/* ── Search & Filter Controls ─────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-4 backdrop-blur-md">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by product name, category, or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 py-2.5 pl-10 pr-4 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              selectedCategory === "all"
                ? "bg-amber-500 text-zinc-950 shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-white"
            }`}
          >
            All ({products.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedCategory === cat.slug
                  ? "bg-amber-500 text-zinc-950 shadow-sm font-bold"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-white"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Products Table ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 shadow-xl backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/60 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              <tr>
                <th className="px-5 py-3.5">Product & Image</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Price (PKR)</th>
                <th className="px-5 py-3.5">In-Stock Status</th>
                <th className="px-5 py-3.5">Laser Customization Specs</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-100/30 dark:hover:bg-zinc-800/30 transition-colors">
                  {/* Thumbnail & Title */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 overflow-hidden">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
                            No img
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-zinc-900 dark:text-white text-sm line-clamp-1">{product.name}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">/{product.slug}</div>
                        {product.badge && (
                          <span className="mt-1 inline-block rounded bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.2 text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase">
                            {product.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-5 py-4 whitespace-nowrap text-zinc-700 dark:text-zinc-300 font-medium">
                    {productCategories(product).map(slug => CATEGORIES.find(category => category.slug === slug)?.name || slug).join(", ")}
                  </td>

                  {/* Price */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="font-black text-zinc-900 dark:text-white text-sm">{formatPKR(product.price)}</div>
                    {product.originalPrice && (
                      <div className="text-[10px] text-zinc-500 line-through">
                        {formatPKR(product.originalPrice)}
                      </div>
                    )}
                  </td>

                  {/* In-Stock Toggle */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => toggleStock(product.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all ${
                        product.inStock
                          ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-900/60"
                          : "border-red-500/30 bg-red-950/40 text-red-400 hover:bg-red-900/60"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          product.inStock ? "bg-emerald-400" : "bg-red-400"
                        }`}
                      />
                      <span>{product.inStock ? "In Stock" : "Out of Stock"}</span>
                    </button>
                  </td>

                  {/* Customization Specs */}
                  <td className="px-5 py-4 max-w-xs text-[11px]">
                    <div className="flex flex-wrap gap-1">
                      {product.customization?.allowsText && (
                        <span className="rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-1.5 py-0.5 text-zinc-700 dark:text-zinc-300">
                          Text (Max {product.customization.maxTextLength} chars)
                        </span>
                      )}
                      {product.customization?.allowsLogo && (
                        <span className="rounded bg-amber-950/30 border border-amber-500/20 px-1.5 py-0.5 text-amber-700 dark:text-amber-300 font-semibold">
                          Logo Etching
                        </span>
                      )}
                    </div>
                    {product.customization?.engravingLocations?.length > 0 && (
                      <div className="mt-1 text-[10px] text-zinc-500 truncate">
                        Locs: {product.customization.engravingLocations.join(", ")}
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100/80 dark:bg-zinc-800/80 p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        title="Preview Live on Store"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>

                      <Link
                        href={`/admin/products/${product.id}`}
                        className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100/80 dark:bg-zinc-800/80 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-500 hover:text-zinc-950 transition-colors"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
                            deleteProduct(product.id);
                          }
                        }}
                        className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-950 hover:text-red-400 transition-colors"
                        title="Delete Product"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
