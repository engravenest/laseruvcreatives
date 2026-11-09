import { getPage } from "@/lib/siteStore";
import { pageMetadata } from "@/lib/pageMetadata";
import PageSections from "@/components/site/PageSections";
import { catalogMetadataBase } from "@/lib/catalogMetadata";
import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { serverDb } from "@/lib/serverDb";
import ShopView from "./ShopView";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const slug = typeof params.category === "string" ? params.category : "";
  const category = serverDb.getCategories().find(item => item.slug === slug);
  if (!category) return pageMetadata(getPage("shop")!);
  const title = category?.seo?.title || (category ? `${category.name} | LaserUVCreatives` : "Shop | LaserUVCreatives");
  const description = category?.seo?.description || category?.description || "Shop personalized gifts and laser engraved products.";
  return { metadataBase: await catalogMetadataBase(), title: { absolute: title }, description, keywords: category?.seo?.keywords?.split(",").map((keyword: string) => keyword.trim()).filter(Boolean) || [], alternates: { canonical: category ? `/shop?category=${category.slug}` : "/shop" }, openGraph: { title, description }, twitter: { title, description } };
}
export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;
  if (typeof params.category === "string") {
    const slug = serverDb.resolveCatalogSlug("category", params.category);
    if (slug) {
      const query = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) value.forEach(item => query.append(key, item));
        else if (value !== undefined) query.set(key, value);
      }
      query.set("category", slug);
      permanentRedirect(`/shop?${query}`);
    }
  }
  const page = getPage("shop")!;
  return <><ShopView initialProducts={serverDb.getProducts()} page={page} /><PageSections sections={page.sections} /></>;
}
