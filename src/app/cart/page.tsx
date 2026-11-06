"use client";

import { getShippingFee } from "@/lib/shipping";

import { useCart } from "@/context/CartContext";
import { formatPKR } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { items, itemCount, subtotal, total, removeItem, updateQuantity, clearCart } = useCart();

  // -------------------------------------------------------------------------
  // Empty State
  // -------------------------------------------------------------------------
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-4">
        <div className="mx-auto max-w-md text-center py-24">
          {/* Animated empty cart icon */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/30">
            <svg
              className="h-12 w-12 text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">
            Your Cart is Empty
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
            Discover our collection of personalized laser-engraved gifts crafted just for you.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500 active:scale-95"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Cart with Items
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-4">
            <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400">Home</Link>
            <span>/</span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Shopping Cart</span>
          </nav>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                Shopping Cart
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {itemCount} {itemCount === 1 ? "item" : "items"} — review your personalized order below
              </p>
            </div>
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-semibold text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* ── Two-column Layout ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ── Left: Cart Lines ─────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartLineCard
                key={item.id}
                item={item}
                onQuantityChange={updateQuantity}
                onRemove={removeItem}
              />
            ))}

            {/* Continue Shopping */}
            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-400 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* ── Right: Order Summary ─────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-4">
                Order Summary
              </h2>

              {/* Line items summary */}
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="line-clamp-1 max-w-[180px]">
                      {item.productName}
                      {item.quantity > 1 && (
                        <span className="ml-1 text-zinc-400">×{item.quantity}</span>
                      )}
                    </span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 shrink-0">
                      {formatPKR(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {formatPKR(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatPKR(getShippingFee("Punjab"))} Punjab / {formatPKR(getShippingFee("Sindh"))} elsewhere
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-zinc-900 dark:text-white border-t border-zinc-100 dark:border-zinc-800 pt-3 mt-1">
                  <span>Total before shipping (PKR)</span>
                  <span>{formatPKR(total)}</span>
                </div>
              </div>

              {/* COD Note */}
              <div className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 p-3 text-[11px] text-amber-900 dark:text-amber-300 leading-relaxed">
                💵 <strong>Cash on Delivery</strong> — Pay securely at your doorstep anywhere in Pakistan.
              </div>

              {/* Proceed to Checkout */}
              <Link
                href="/checkout"
                className="mt-4 block w-full text-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-4 text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500 active:scale-[0.98]"
              >
                Proceed to Checkout (COD)
              </Link>

              {/* Trust signals */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1"><span className="text-emerald-500">✓</span> Nationwide Delivery</span>
                <span className="flex items-center gap-1"><span className="text-emerald-500">✓</span> COD Available</span>
                <span className="flex items-center gap-1"><span className="text-amber-500">✓</span> Laser Engraved</span>
                <span className="flex items-center gap-1"><span className="text-amber-500">✓</span> WhatsApp Proof</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CartLineCard
// ---------------------------------------------------------------------------

interface CartLineCardProps {
  item: import("@/types/cart").CartItem;
  onQuantityChange: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

function CartLineCard({ item, onQuantityChange, onRemove }: CartLineCardProps) {
  const lineTotal = item.unitPrice * item.quantity;

  return (
    <div className="group flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
      {/* Product image */}
      <Link href={`/products/${item.productSlug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 sm:h-28 sm:w-28">
        <Image
          src={item.image}
          alt={item.productName}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="112px"
        />
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/products/${item.productSlug}`} className="block">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors line-clamp-2">
                {item.productName}
              </h3>
            </Link>

            {/* Selected variants */}
            {Object.keys(item.selectedVariants).length > 0 && (
              <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                {Object.entries(item.selectedVariants)
                  .map(([, v]) => v)
                  .join(" · ")}
              </p>
            )}

            {/* Customization summary */}
            {item.customization && (
              <div className="mt-1.5 space-y-0.5">
                {item.customization.engravingText && (
                  <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                    ✏️ Engraving: &ldquo;{item.customization.engravingText}&rdquo;
                  </p>
                )}
                {item.customization.fontChoice && (
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    Font: {item.customization.fontChoice}
                  </p>
                )}
                {item.customization.engravingLocation && (
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    Location: {item.customization.engravingLocation}
                  </p>
                )}
                {item.customization.logoFileName && (
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    Logo: {item.customization.logoFileName}{" "}
                    <span className="text-amber-600 dark:text-amber-400">(session upload)</span>
                  </p>
                )}
                {item.customization.specialInstructions && (
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 line-clamp-2">
                    Note: {item.customization.specialInstructions}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Remove button */}
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.productName} from cart`}
            className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Bottom row: quantity + price */}
        <div className="mt-3 flex items-center justify-between gap-4">
          {/* Inline quantity controls */}
          <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
            <button
              type="button"
              onClick={() => onQuantityChange(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
              className="flex h-8 w-8 items-center justify-center rounded-l-lg text-zinc-600 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:text-zinc-300 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:disabled:text-zinc-600"
            >
              −
            </button>
            <span className="min-w-[2rem] text-center text-sm font-bold text-zinc-900 dark:text-white">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              disabled={item.quantity >= 99}
              aria-label="Increase quantity"
              className="flex h-8 w-8 items-center justify-center rounded-r-lg text-zinc-600 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:text-zinc-300 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:disabled:text-zinc-600"
            >
              +
            </button>
          </div>

          {/* Line total */}
          <div className="text-right">
            <p className="text-base font-black text-zinc-900 dark:text-white">
              {formatPKR(lineTotal)}
            </p>
            {item.quantity > 1 && (
              <p className="text-[10px] text-zinc-400">
                {formatPKR(item.unitPrice)} each
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
