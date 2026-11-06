"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import { useCategories } from "@/lib/useCategories";
import { slugify } from "@/lib/catalog";
import { SeoFields, SlugPreview, ProductCatalogFields, type Seo, type SpecRow } from "@/components/admin/CatalogFields";
import { Product } from "@/types/product";
import ProductImageManager, { AdminProductImage } from "@/components/admin/ProductImageManager";

interface Props {
  params: Promise<{ id: string }>;
}

export default function AdminEditProductPage({ params }: Props) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const router = useRouter();
  const CATEGORIES = useCategories();
  const [categorySlugs, setCategorySlugs] = useState<string[]>([]);
  const [seo, setSeo] = useState<Seo>({ title: "", description: "" });
  const [specs, setSpecs] = useState<SpecRow[]>([]);
  const [video, setVideo] = useState<NonNullable<Product["video"]>>({ provider: "youtube", id: "" });
  const [formError, setFormError] = useState("");
  const { isSaving, products, updateProduct } = useAdmin();

  const product = products.find((p) => p.id === productId || p.slug === productId);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [categorySlug, setCategorySlug] = useState<Product["categorySlug"]>("personalized-pens");
  const [price, setPrice] = useState<number>(1450);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [inStock, setInStock] = useState<boolean>(true);
  const [badge, setBadge] = useState<Product["badge"] | undefined>(undefined);
  const [productImages, setProductImages] = useState<AdminProductImage[]>([]);
  const [description, setDescription] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");
  const [deliveryEstimate, setDeliveryEstimate] = useState("");

  // Customization rules
  const [allowsText, setAllowsText] = useState(true);
  const [maxTextLength, setMaxTextLength] = useState(25);
  const [textLabel, setTextLabel] = useState("");
  const [allowsLogo, setAllowsLogo] = useState(false);
  const [locations, setLocations] = useState("");

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSlug(product.slug);
      setCategorySlugs(product.categorySlugs || [product.categorySlug]);
      setSeo(product.seo || { title: "", description: "" });
      setSpecs(Object.entries(product.specs || {}).map(([name, value]) => ({ name, value })));
      setVideo(product.video || { provider: "youtube", id: "" });
      setTagline(product.tagline || "");
      setCategorySlug(product.categorySlug);
      setPrice(product.price);
      setOriginalPrice(product.originalPrice);
      setInStock(product.inStock);
      setBadge(product.badge);

      // Normalize images
      const rawImgs = (product as any).productImages || product.images || [];
      const parsedImgs: AdminProductImage[] = rawImgs.map((item: any, idx: number) => {
        if (typeof item === "string") {
          return {
            id: `img-${product.id}-${idx}`,
            url: item,
            altText: `${product.name} View ${idx + 1}`,
            isMain: idx === 0,
            order: idx,
          };
        }
        return {
          id: item.id || `img-${product.id}-${idx}`,
          url: item.url,
          altText: item.altText || `${product.name} View ${idx + 1}`,
          isMain: item.isMain ?? (idx === 0),
          order: item.order ?? idx,
        };
      });

      setProductImages(
        parsedImgs.length > 0
          ? parsedImgs
          : [
              {
                id: `img-${product.id}-0`,
                url: "/images/cat-pens.jpg",
                altText: product.name,
                isMain: true,
                order: 0,
              },
            ]
      );

      setDescription(product.description || "");
      setDetailedDescription(product.detailedDescription || "");
      setDeliveryEstimate(product.deliveryEstimate || "");

      if (product.customization) {
        setAllowsText(product.customization.allowsText);
        setMaxTextLength(product.customization.maxTextLength || 25);
        setTextLabel(product.customization.textLabel || "");
        setAllowsLogo(product.customization.allowsLogo);
        setLocations(product.customization.engravingLocations?.join(", ") || "");
      }
    }
  }, [product]);

  if (!product) {
    return (
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-12 text-center">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Product Not Found</h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-6">
          The requested product ID does not exist in your store catalog.
        </p>
        <Link
          href="/admin/products"
          className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400"
        >
          Return to Products
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const specNames = specs.map(row => row.name.trim());
    if (specNames.some(name => !name) || new Set(specNames).size !== specNames.length) {
      setFormError("Each specification needs a unique, non-empty name.");
      return;
    }

    const selectedCategory = CATEGORIES.find((c) => c.slug === categorySlug);

    // Sort images with isMain first, then by order
    const sorted = [...productImages].sort((a, b) => {
      if (a.isMain && !b.isMain) return -1;
      if (!a.isMain && b.isMain) return 1;
      return a.order - b.order;
    });

    const imageUrls = sorted.map((img) => img.url);

    const updates: Partial<Product> = {
      name,
      slug,
      tagline,
      categorySlug,
      categorySlugs: [...new Set([categorySlug, ...categorySlugs])],
      seo,
      specs: Object.fromEntries(specs.map(row => [row.name.trim(), row.value.trim()])),
      video: video.id ? video : null,
      categoryName: selectedCategory ? selectedCategory.name : product.categoryName,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      inStock,
      badge: badge || undefined,
      images: imageUrls.length > 0 ? imageUrls : ["/images/cat-pens.jpg"],
      ...({ productImages: sorted } as any),
      description,
      detailedDescription,
      deliveryEstimate,
      customization: {
        ...product.customization,
        allowsText,
        maxTextLength: Number(maxTextLength),
        textLabel,
        allowsLogo,
        engravingLocations: locations.split(",").map((s) => s.trim()).filter(Boolean),
      },
    };

    if (await updateProduct(product.id, updates)) router.push("/admin/products");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <nav className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 mb-1">
            <Link href="/admin/products" className="hover:text-amber-700 dark:hover:text-amber-400">
              Products
            </Link>
            <span>/</span>
            <span className="font-semibold text-zinc-900 dark:text-white">Edit: {product.name}</span>
          </nav>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Edit Product
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
          >
            Live Preview ↗
          </Link>
          <Link
            href="/admin/products"
            className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
          >
            Cancel
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {formError && <p role="alert" className="text-red-600">{formError}</p>}
        {/* Card 1: Basic Information */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            1. Basic Information
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => { setName(e.target.value); setSlug(slugify(e.target.value)); }}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-amber-500 focus:outline-none font-mono"
              />
              <SlugPreview slug={slug} previous={product.slug} kind="product" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Primary category *
              </label>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value as any)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-amber-500 focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Short Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Badge
              </label>
              <select
                value={badge || ""}
                onChange={(e) => setBadge((e.target.value as any) || undefined)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="">No Badge</option>
                <option value="Bestseller">Bestseller</option>
                <option value="Popular">Popular</option>
                <option value="New">New</option>
                <option value="Trending">Trending</option>
                <option value="Limited">Limited</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 2: Pricing & Inventory */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            2. Pricing & Delivery (PKR)
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Selling Price (PKR) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-amber-500 focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Original Price (for discount)
              </label>
              <input
                type="number"
                min="0"
                value={originalPrice || ""}
                onChange={(e) =>
                  setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="inStockCheckEdit"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-amber-500"
              />
              <label htmlFor="inStockCheckEdit" className="text-xs font-bold text-zinc-900 dark:text-white cursor-pointer">
                Available In Stock
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Estimated Delivery Window
            </label>
            <input
              type="text"
              value={deliveryEstimate}
              onChange={(e) => setDeliveryEstimate(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Card 3: Media & Descriptions */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            3. Media & Description
          </h2>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Product Images &amp; Gallery *
            </label>
            <ProductImageManager
              images={productImages}
              onChange={setProductImages}
              productName={name || "Product"}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Short Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs text-zinc-900 dark:text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Detailed Specifications
            </label>
            <textarea
              rows={3}
              value={detailedDescription}
              onChange={(e) => setDetailedDescription(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs text-zinc-900 dark:text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Card 4: Laser Customization Rules */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            4. Laser Customization Rules
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/60 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allowTextCheckEdit"
                  checked={allowsText}
                  onChange={(e) => setAllowsText(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-amber-500"
                />
                <label htmlFor="allowTextCheckEdit" className="text-xs font-bold text-zinc-900 dark:text-white cursor-pointer">
                  Enable Customer Text Engraving
                </label>
              </div>

              {allowsText && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Max Character Length
                    </label>
                    <input
                      type="number"
                      value={maxTextLength}
                      onChange={(e) => setMaxTextLength(Number(e.target.value))}
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Input Field Label
                    </label>
                    <input
                      type="text"
                      value={textLabel}
                      onChange={(e) => setTextLabel(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/60 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allowLogoCheckEdit"
                  checked={allowsLogo}
                  onChange={(e) => setAllowsLogo(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-amber-500"
                />
                <label htmlFor="allowLogoCheckEdit" className="text-xs font-bold text-zinc-900 dark:text-white cursor-pointer">
                  Enable Corporate Logo Upload
                </label>
              </div>
              <p className="text-[11px] text-zinc-500">
                Allows corporate and retail customers to upload custom vector or raster logos.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Engraving Placement Locations (comma separated)
            </label>
            <input
              type="text"
              value={locations}
              onChange={(e) => setLocations(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <ProductCatalogFields categories={CATEGORIES} primary={categorySlug} selected={categorySlugs} onSelect={setCategorySlugs} specs={specs} onSpecs={setSpecs} video={video} onVideo={setVideo} />
        <SeoFields value={seo} onChange={setSeo} name={name} description={description} url={`/products/${slug}`} />
        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/admin/products"
            className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-xs font-bold text-zinc-950 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 active:scale-95 transition-all"
          >
            Update & Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
