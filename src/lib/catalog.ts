import type { Product, ProductCategory } from "@/types/product";

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function productCategories(product: Pick<Product, "categorySlug" | "categorySlugs">): string[] {
  return [...new Set([product.categorySlug, ...(product.categorySlugs || [])])];
}

export function videoEmbedUrl(video: Product["video"]) {
  if (!video) return null;
  if (video.provider === "youtube" && /^[a-zA-Z0-9_-]{11}$/.test(video.id)) return `https://www.youtube-nocookie.com/embed/${video.id}`;
  if (video.provider === "vimeo" && /^\d+$/.test(video.id)) return `https://player.vimeo.com/video/${video.id}`;
  return null;
}

export class CatalogError extends Error {}

export function validateCatalog(data: Partial<Product & ProductCategory>) {
  if (typeof data.name !== "string" || !data.name.trim()) throw new CatalogError("A title is required.");
  if (typeof data.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) throw new CatalogError("Enter a slug using lowercase letters, numbers, and hyphens.");
  if (data.slug === "all") throw new CatalogError('The slug "all" is reserved.');
  if (data.seo) {
    if (data.seo.keywords !== undefined && (typeof data.seo.keywords !== "string" || data.seo.keywords.length > 1000)) throw new CatalogError("Meta keywords must be text with at most 1000 characters.");
    if (typeof data.seo.title !== "string" || typeof data.seo.description !== "string" || data.seo.title.length > 200 || data.seo.description.length > 500) throw new CatalogError("SEO title must be under 200 characters and description under 500.");
  }
  if (data.video && !videoEmbedUrl(data.video)) throw new CatalogError("Enter an 11-character YouTube ID or a numeric Vimeo ID.");
  if (data.specs && (typeof data.specs !== "object" || Array.isArray(data.specs) || Object.entries(data.specs).some(([key, value]) => !key.trim() || typeof value !== "string"))) throw new CatalogError("Specifications must have a name and a text value.");
}
