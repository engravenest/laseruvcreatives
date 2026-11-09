import type { Metadata } from "next";
import type { SitePage } from "@/types/site";
import { catalogMetadataBase } from "@/lib/catalogMetadata";
export async function pageMetadata(page: SitePage): Promise<Metadata> {
  const title = page.seo.title || `${page.title} | LaserUVCreatives`;
  const description = page.seo.description || page.description;
  return { metadataBase: await catalogMetadataBase(), title: { absolute: title }, description, keywords: page.seo.keywords?.split(",").map(value => value.trim()).filter(Boolean) || [], alternates: { canonical: `/${page.slug}` }, openGraph: { title, description }, twitter: { title, description } };
}
