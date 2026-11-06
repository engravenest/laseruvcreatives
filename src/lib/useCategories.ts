"use client";
import { useEffect, useState } from "react";
import { CATEGORIES } from "@/data/products";
import type { ProductCategory } from "@/types/product";

export function useCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>(CATEGORIES);
  useEffect(() => {
    let controller: AbortController;
    const refresh = () => {
      controller?.abort();
      controller = new AbortController();
      fetch("/api/categories", { cache: "no-store", signal: controller.signal })
        .then(response => response.ok ? response.json() : Promise.reject())
        .then(data => { if (Array.isArray(data.categories)) setCategories(data.categories); })
        .catch(() => {});
    };
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("luc_categories_updated", refresh);
    return () => { controller.abort(); window.removeEventListener("focus", refresh); window.removeEventListener("luc_categories_updated", refresh); };
  }, []);
  return categories;
}
