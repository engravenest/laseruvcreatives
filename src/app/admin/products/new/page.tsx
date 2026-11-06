"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import { useCategories } from "@/lib/useCategories";
import { slugify } from "@/lib/catalog";
import { SeoFields, SlugPreview, ProductCatalogFields, type Seo, type SpecRow } from "@/components/admin/CatalogFields";
import { Product } from "@/types/product";
import ProductImageManager, { AdminProductImage } from "@/components/admin/ProductImageManager";

export default function AdminNewProductPage() {
  const router = useRouter();
  const CATEGORIES = useCategories();
  const [categorySlugs, setCategorySlugs] = useState<string[]>([]);
  const [seo, setSeo] = useState<Seo>({ title: "", description: "" });
  const [specs, setSpecs] = useState<SpecRow[]>([]);
  const [video, setVideo] = useState<NonNullable<Product["video"]>>({ provider: "youtube", id: "" });
  const [formError, setFormError] = useState("");
  const { isSaving, addProduct } = useAdmin();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [selectedPrimary, setCategorySlug] = useState<Product["categorySlug"]>("personalized-pens");
  const categorySlug = CATEGORIES.some(category => category.slug === selectedPrimary) ? selectedPrimary : (CATEGORIES[0]?.slug || "");
  const [price, setPrice] = useState<number>(1450);
  const [originalPrice, setOriginalPrice] = useState<number>(1800);
  const [inStock, setInStock] = useState<boolean>(true);
  const [badge, setBadge] = useState<Product["badge"]>("New");
  const [productImages, setProductImages] = useState<AdminProductImage[]>([
    {
      id: "img-default-1",
      url: "/images/cat-pens.jpg",
      altText: "Laser Engraved Custom Pen",
      isMain: true,
      order: 0,
    },
  ]);
  const [description, setDescription] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");
  const [deliveryEstimate, setDeliveryEstimate] = useState("2–3 business days across Pakistan via TCS");

  // Customization rules
  const [allowsText, setAllowsText] = useState(true);
  const [maxTextLength, setMaxTextLength] = useState(25);
  const [textLabel, setTextLabel] = useState("Name, Designation or Special Date");
  const [allowsLogo, setAllowsLogo] = useState(false);
  const [locations, setLocations] = useState("Pen Barrel, Clip Cap");
  const [includeScriptFont, setIncludeScriptFont] = useState(true);
  const [includeSansFont, setIncludeSansFont] = useState(true);
  const [includeSerifFont, setIncludeSerifFont] = useState(true);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(slugify(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const specNames = specs.map(row => row.name.trim());
    if (specNames.some(name => !name) || new Set(specNames).size !== specNames.length) {
      setFormError("Each specification needs a unique, non-empty name.");
      return;
    }

    const selectedCategory = CATEGORIES.find((c) => c.slug === categorySlug);

    const fontOptions = [];
    if (includeScriptFont) {
      fontOptions.push({
        id: "script",
        name: "Elegant Script Calligraphy",
        styleClass: "italic font-serif",
      });
    }
    if (includeSansFont) {
      fontOptions.push({
        id: "sans",
        name: "Modern Minimalist Sans",
        styleClass: "font-sans uppercase tracking-widest",
      });
    }
    if (includeSerifFont) {
      fontOptions.push({
        id: "serif",
        name: "Executive Bold Serif",
        styleClass: "font-serif tracking-wide font-bold",
      });
    }

    // Sort images with isMain first, then by order
    const sorted = [...productImages].sort((a, b) => {
      if (a.isMain && !b.isMain) return -1;
      if (!a.isMain && b.isMain) return 1;
      return a.order - b.order;
    });

    const imageUrls = sorted.map((img) => img.url);

    const newProduct = {
      name,
      slug: slug || `prod-${Date.now()}`,
      tagline,
      categorySlug,
      categorySlugs: [...new Set([categorySlug, ...categorySlugs])],
      seo,
      specs: Object.fromEntries(specs.map(row => [row.name.trim(), row.value.trim()])),
      video: video.id ? video : null,
      categoryName: selectedCategory ? selectedCategory.name : "Custom Gifts",
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      inStock,
      badge: badge || undefined,
      images: imageUrls.length > 0 ? imageUrls : ["/images/cat-pens.jpg"],
      productImages: sorted,
      description,
      detailedDescription,
      deliveryEstimate,
      rating: 5.0,
      reviewsCount: 1,
      customization: {
        allowsText,
        maxTextLength: Number(maxTextLength),
        textLabel,
        allowsLogo,
        logoLabel: "Upload Brand / Company Logo",
        supportedFormats: ["PNG", "JPG", "SVG", "PDF"],
        engravingLocations: locations.split(",").map((s) => s.trim()).filter(Boolean),
        fontOptions,
      },
    };

    if (await addProduct(newProduct)) router.push("/admin/products");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* ── Breadcrumb & Title ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 mb-1">
            <Link href="/admin/products" className="hover:text-amber-700 dark:hover:text-amber-400">
              Products
            </Link>
            <span>/</span>
            <span className="font-semibold text-zinc-900 dark:text-white">Add New Product</span>
          </nav>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Create New Product
          </h1>
        </div>

        <Link
          href="/admin/products"
          className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
        >
          Cancel
        </Link>
      </div>

      {/* ── Form ─────────────────────────────────────────────────────── */}
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
                placeholder="e.g. Executive Matte Black Rollerball Pen"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                required
                placeholder="executive-matte-black-pen"
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none font-mono"
              />
              <SlugPreview slug={slug}  kind="product" />
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
                placeholder="Precision fiber-laser etched in Pakistan"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
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
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="inStockCheck"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="inStockCheck" className="text-xs font-bold text-zinc-900 dark:text-white cursor-pointer">
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
              placeholder="Highlight craftsmanship, materials, and engraving style..."
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Detailed Description / Specifications
            </label>
            <textarea
              rows={3}
              value={detailedDescription}
              onChange={(e) => setDetailedDescription(e.target.value)}
              placeholder="Comprehensive specs (material, refill type, presentation box, warranty)..."
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Card 4: Laser Customization Rules Engine */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            4. Laser Customization Rules
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/60 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allowTextCheck"
                  checked={allowsText}
                  onChange={(e) => setAllowsText(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-amber-500"
                />
                <label htmlFor="allowTextCheck" className="text-xs font-bold text-zinc-900 dark:text-white cursor-pointer">
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
                  id="allowLogoCheck"
                  checked={allowsLogo}
                  onChange={(e) => setAllowsLogo(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-amber-500"
                />
                <label htmlFor="allowLogoCheck" className="text-xs font-bold text-zinc-900 dark:text-white cursor-pointer">
                  Enable Corporate Logo Upload
                </label>
              </div>
              <p className="text-[11px] text-zinc-500">
                Allows customers to upload PNG/JPG/SVG logos for company branding and executive orders.
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
              placeholder="Pen Barrel, Clip Cap, Presentation Case"
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Allowed Fonts */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Allowed Engraving Typography Fonts
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeScriptFont}
                  onChange={(e) => setIncludeScriptFont(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-amber-500"
                />
                <span className="italic font-serif">Elegant Script Calligraphy</span>
              </label>

              <label className="inline-flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSansFont}
                  onChange={(e) => setIncludeSansFont(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-amber-500"
                />
                <span className="font-sans uppercase tracking-wider">Modern Minimalist Sans</span>
              </label>

              <label className="inline-flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSerifFont}
                  onChange={(e) => setIncludeSerifFont(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-amber-500"
                />
                <span className="font-serif font-bold">Executive Bold Serif</span>
              </label>
            </div>
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
            Save & Publish Product
          </button>
        </div>
      </form>
    </div>
  );
}
