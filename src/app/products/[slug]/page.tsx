import { catalogMetadataBase } from "@/lib/catalogMetadata";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { serverDb } from "@/lib/serverDb";
import { productCategories } from "@/lib/catalog";
import ProductDetailView from "@/components/product/ProductDetailView";

export const dynamic = "force-dynamic";
interface PageProps { params: Promise<{ slug: string }> }
function findProduct(slug: string) {
  const redirected = serverDb.resolveCatalogSlug("product", slug);
  if (redirected) permanentRedirect(`/products/${redirected}`);
  const product = serverDb.getProductBySlug(slug);
  if (!product) notFound();
  return product;
}
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = findProduct((await params).slug);
  const title = product.seo?.title || `${product.name} | LaserUVCreatives (Pakistan)`;
  const description = product.seo?.description || product.description;
  return { metadataBase: await catalogMetadataBase(), title: { absolute: title }, description, keywords: product.seo?.keywords?.split(",").map((keyword: string) => keyword.trim()).filter(Boolean) || [], alternates: { canonical: `/products/${product.slug}` }, openGraph: { title, description, images: product.images }, twitter: { title, description } };
}
export default async function ProductDetailPage({ params }: PageProps) {
  const product = findProduct((await params).slug);
  const categories = productCategories(product);
  const relatedProducts = serverDb.getProducts().filter(item => item.id !== product.id && productCategories(item).some(category => categories.includes(category)));
  return <ProductDetailView product={product} relatedProducts={relatedProducts} />;
}
