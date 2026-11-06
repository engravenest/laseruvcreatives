"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import { videoEmbedUrl } from "@/lib/catalog";
import { formatPKR } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import ProductGallery from "./ProductGallery";
import QuantitySelector from "./QuantitySelector";
import CustomizationForm, { CustomizationFormValues } from "./CustomizationForm";
import ProductCard from "./ProductCard";

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailView({
  product: initialProduct,
  relatedProducts,
}: ProductDetailViewProps) {
  const product = initialProduct;
  const textInputRef = useRef<HTMLInputElement>(null);
  const [textError, setTextError] = useState("");

  const { addItem } = useCart();
  const router = useRouter();

  // State for quantity
  const [quantity, setQuantity] = useState(1);

  // State for selected variants (e.g. finish or color)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (product.variants) {
      product.variants.forEach((v) => {
        initial[v.id] = v.options[0]?.id || "";
      });
    }
    return initial;
  });

  // State for customization form values
  const [customizationValues, setCustomizationValues] = useState<CustomizationFormValues>({
    text: "",
    font: product.customization.fontOptions[0]?.name || "Script",
    location: product.customization.engravingLocations[0] || "Standard",
    instructions: "",
  });

  // Feedback states
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleVariantSelect = (variantId: string, optionId: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantId]: optionId,
    }));
  };

  const handleAddToCart = () => {
    if (product.customization.allowsText && !customizationValues.text.trim()) {
      setTextError(`Please enter ${product.customization.textLabel || "your engraving text"}.`);
      textInputRef.current?.focus();
      return false;
    }
    setTextError("");
    addItem(
      {
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        unitPrice: product.price,
        image: product.images[0] || "/images/cat-pens.jpg",
        selectedVariants,
        customization: {
          engravingText: customizationValues.text.trim() || undefined,
          fontChoice: customizationValues.font || undefined,
          engravingLocation: customizationValues.location || undefined,
          logoFileName: customizationValues.logoFileName || undefined,
          specialInstructions: customizationValues.instructions || undefined,
        },
      },
      quantity
    );
    setToastMessage(
      `Added ${quantity}× "${product.name}" to your cart!`
    );
    setTimeout(() => setToastMessage(null), 4000);
    return true;
  };

  const handleBuyNow = () => {
    // Add to cart then navigate to cart page
    if (handleAddToCart()) router.push("/cart");
  };

  const subtotal = product.price * quantity;

  return (
    <div className="min-h-screen bg-zinc-50 py-10 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-8">
          <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-amber-600 dark:hover:text-amber-400">
            Shop
          </Link>
          <span>/</span>
          <Link
            href={`/shop?category=${product.categorySlug}`}
            className="hover:text-amber-600 dark:hover:text-amber-400"
          >
            {product.categoryName}
          </Link>
          <span>/</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* Product Grid: Left Gallery, Right Details */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6">
            <div className="sticky top-28">
              <ProductGallery
                images={product.images}
                productName={product.name}
                badge={product.badge}
              />

              {videoEmbedUrl(product.video) && <section className="mt-6">
                <h2 className="mb-3 font-bold text-zinc-900 dark:text-white">Product video</h2>
                <iframe src={videoEmbedUrl(product.video)!} title={`${product.name} video`} className="aspect-video w-full rounded-2xl border-0" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
              </section>}
              {/* Quality & Trust Badges Box */}
              <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-3">
                  LaserUVCreatives Quality Guarantees
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold">✓</span>
                    <span>100% Permanent Laser Etch</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Cash on Delivery (COD)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold">✓</span>
                    <span>Gift Box Included</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Free WhatsApp Digital Proof</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Customization, Actions */}
          <div className="flex flex-col gap-6 lg:col-span-6">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                  {product.categoryName}
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  In Stock • Dispatch in 24-48h
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
                {product.name}
              </h1>

              {product.tagline && (
                <p className="mt-1 text-sm font-medium text-amber-600 dark:text-amber-400">
                  {product.tagline}
                </p>
              )}

              {/* Rating */}
              <div className="mt-3 flex items-center gap-2 text-xs">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {product.rating}
                </span>
                <span className="text-zinc-400">
                  ({product.reviewsCount} verified customer reviews in Pakistan)
                </span>
              </div>

              {/* Price Banner */}
              <div className="mt-4 flex items-baseline gap-3 rounded-2xl bg-zinc-100/80 p-4 dark:bg-zinc-900">
                <span className="text-3xl font-black text-zinc-950 dark:text-white">
                  {formatPKR(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-zinc-400 line-through">
                    {formatPKR(product.originalPrice)}
                  </span>
                )}
                <span className="ml-auto text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Free Laser Engraving Included
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              <p>{product.description}</p>
              {product.detailedDescription && (
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {product.detailedDescription}
                </p>
              )}
            </div>

            {/* Variants Selector (Color/Wood Finish) */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                {product.variants.map((v) => (
                  <div key={v.id}>
                    <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-2">
                      Select {v.name}:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {v.options.map((opt) => (
                        <button
                          type="button"
                          key={opt.id}
                          onClick={() => handleVariantSelect(v.id, opt.id)}
                          className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                            selectedVariants[v.id] === opt.id
                              ? "border-amber-500 bg-amber-500 text-zinc-950 shadow-xs"
                              : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Customization Form */}
            <CustomizationForm
              customization={product.customization}
              textRequired={product.customization.allowsText}
              textError={textError}
              textInputRef={textInputRef}
              onChange={(values) => {
                setCustomizationValues(values);
                if (values.text.trim()) setTextError("");
              }}
            />

            {/* Quantity Selector & Actions */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Order Quantity
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Subtotal: <strong className="text-zinc-900 dark:text-white">{formatPKR(subtotal)}</strong>
                  </span>
                </div>
                <QuantitySelector
                  quantity={quantity}
                  onChange={setQuantity}
                  min={1}
                  max={20}
                />
              </div>

              {/* Action Buttons: Add to Cart & Buy Now */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full rounded-xl border border-zinc-900 bg-white py-3.5 px-4 text-center text-sm font-bold text-zinc-950 transition-colors hover:bg-zinc-100 dark:border-white dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 active:scale-[0.98]"
                >
                  Add to Cart
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 px-4 text-center text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500 active:scale-[0.98]"
                >
                  Buy Now (COD)
                </button>
              </div>

              {/* Secondary Bulk Order CTA */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <Link
                  href={`/bulk-orders?product=${encodeURIComponent(product.name)}`}
                  id="product-bulk-quote-cta"
                  className="group flex items-center justify-between rounded-xl border border-dashed border-amber-400/90 bg-amber-50/70 p-3.5 transition-all hover:bg-amber-100/70 dark:border-amber-700/60 dark:bg-amber-950/20 dark:hover:bg-amber-950/40"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-base">
                      📦
                    </span>
                    <div>
                      <span className="block text-xs font-bold text-amber-950 dark:text-amber-200">
                        Need Bulk Quantity? Get a Quote
                      </span>
                      <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                        Special wholesale rates for 20+ units with logo engraving
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-amber-700 transition-transform group-hover:translate-x-0.5 dark:text-amber-400">
                    Get Quote →
                  </span>
                </Link>
              </div>


            </div>

            {/* Specifications & Inclusions */}
            {product.specs && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                  Product Specifications
                </h3>
                <dl className="grid grid-cols-1 gap-2 text-xs">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                      <dt className="text-zinc-500 dark:text-zinc-400">{key}</dt>
                      <dd className="font-semibold text-zinc-900 dark:text-zinc-200 text-right">{value}</dd>
                    </div>
                  ))}
                </dl>

                {product.includedItems && (
                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                      Package Includes:
                    </h4>
                    <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                      {product.includedItems.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t border-zinc-200 pt-12 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  You May Also Like
                </span>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
                  Related Personalized Items
                </h2>
              </div>
              <Link
                href="/shop"
                className="text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400"
              >
                View Full Catalog →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.slice(0, 3).map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>


      {/* Cart Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-300 bg-white p-4 shadow-2xl dark:border-emerald-800 dark:bg-zinc-900">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            ✓
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-900 dark:text-white">Added to Cart</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 max-w-xs">{toastMessage}</p>
            <Link
              href="/cart"
              className="mt-1 inline-block text-[11px] font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400"
            >
              View Cart →
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss"
            className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
