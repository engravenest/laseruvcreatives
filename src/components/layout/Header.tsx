"use client";

import ThemeToggle from "@/components/ui/ThemeToggle";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

interface HeaderProps {
  onSearchOpen?: () => void;
  cartCount?: number;
}

export default function Header({ cartCount = 0 }: HeaderProps) {
  const router = useRouter();
  const { customer, logout } = useCustomerAuth();
  const firstName = customer?.fullName.trim().split(/\s+/)[0] || "Account";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push("/shop");
    setSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600 px-4 py-2 text-center text-xs font-semibold text-white tracking-wide shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between sm:justify-center gap-2">
          <span className="flex items-center gap-2 text-[11px] sm:text-xs">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>🇵🇰 Nationwide Delivery Across Pakistan</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Cash on Delivery (COD) Available</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Custom Laser &amp; UV Precision Engraving</span>
          </span>
          <span className="sm:hidden text-[10px] bg-black/20 px-2 py-0.5 rounded font-mono">
            COD
          </span>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Logo & Name Area */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 text-amber-400 shadow-md ring-1 ring-black/5 transition-transform group-hover:scale-105 dark:bg-zinc-100 dark:text-amber-600">
            {/* Custom Laser Icon */}
            <svg
              className="h-6 w-6 transition-transform group-hover:rotate-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            {/* Sparkle micro accent */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
              Laser<span className="text-amber-600 dark:text-amber-400">UV</span>Creatives
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Personalized Engraving Studio
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
          <Link
            href="/"
            className="text-zinc-950 transition-colors hover:text-amber-600 dark:text-white dark:hover:text-amber-400"
          >
            Home
          </Link>
          <Link
            href="/shop"
            className="transition-colors hover:text-amber-600 dark:hover:text-amber-400"
          >
            Shop
          </Link>
          <Link
            href="/shop"
            className="transition-colors hover:text-amber-600 dark:hover:text-amber-400"
          >
            Categories
          </Link>
          <Link
            href="/bulk-orders"
            className="transition-colors hover:text-amber-600 dark:hover:text-amber-400"
          >
            Bulk Orders
          </Link>
          <a
            href="/#why-us"
            className="transition-colors hover:text-amber-600 dark:hover:text-amber-400"
          >
            About
          </a>
          <Link
            href="/contact"
            className="transition-colors hover:text-amber-600 dark:hover:text-amber-400"
          >
            Contact
          </Link>
        </nav>

        {/* Actions Area: Search, Currency Badge, Sign In, Get a Quote CTA, Cart, Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger Button */}
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition-colors hover:border-amber-400 hover:text-amber-600 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-amber-500 dark:hover:text-amber-400"
            aria-label="Search products"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Desktop "Get a Quote" Button */}
          <Link
            href="/bulk-orders"
            id="desktop-bulk-quote-cta"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-2 text-xs font-bold text-zinc-950 shadow-sm transition-all hover:from-amber-400 hover:to-amber-500 hover:shadow-md active:scale-95"
            aria-label="Get a Bulk Order Quote"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Get a Quote</span>
          </Link>

          {/* Visible Customer Sign In / Account Button */}
          {customer ? (
            <Link
              href="/account"
              id="header-account-btn"
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-900 dark:text-amber-300 shadow-xs transition-colors hover:bg-amber-500/20"
              title="Customer Account & Orders"
            >
              <svg className="h-4 w-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="max-w-24 truncate sm:max-w-32">{firstName}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              id="header-sign-in-btn"
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-800 shadow-xs transition-colors hover:border-amber-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-amber-500"
              aria-label="Sign In"
            >
              <svg className="h-4 w-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Sign In</span>
            </Link>
          )}

          <Link
            href="/cart"
            id="header-cart-btn"
            className="relative flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-zinc-800 shadow-xs transition-colors hover:border-amber-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-amber-500"
            aria-label={`Shopping Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
          >
            <svg className="h-5 w-5 text-zinc-600 dark:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="hidden sm:inline text-xs font-semibold">Cart</span>
            {cartCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-extrabold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 transition-colors hover:bg-zinc-100 lg:hidden dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* Expandable Search Bar Overlay */}
      {searchOpen && (
        <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-3 shadow-inner dark:border-zinc-800 dark:bg-zinc-900">
          <form onSubmit={handleSearchSubmit} className="mx-auto flex max-w-3xl items-center gap-3">
            <div className="relative flex-1">
              <svg
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search engraved pens, wooden cases, customized bottles, gift sets..."
                className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-10 pr-4 text-sm text-zinc-900 outline-none ring-amber-500 focus:border-amber-500 focus:ring-1 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-zinc-200 bg-white px-5 py-6 shadow-xl lg:hidden dark:border-zinc-800 dark:bg-zinc-950">
          {/* Customer Auth Block in Mobile Navigation */}
          <div className="mb-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            {customer ? (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-zinc-950 font-bold text-xs">
                      {customer.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">
                        {customer.fullName}
                      </p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        {customer.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                  >
                    Sign Out
                  </button>
                </div>
                <Link
                  href="/account"
                  id="mobile-account-btn"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-1 block text-center rounded-lg bg-amber-500 py-1.5 text-xs font-bold text-zinc-950 shadow-xs hover:bg-amber-400"
                >
                  My Profile &amp; Orders
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  id="mobile-sign-in-btn"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 py-2.5 text-xs font-bold text-white dark:text-zinc-950 shadow-xs"
                >
                  <svg className="h-4 w-4 text-amber-400 dark:text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/register"
                  id="mobile-register-btn"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700 py-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-200"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {/* Prominent Bulk & Custom Orders Quote Button (Mobile) */}
            <Link
              href="/bulk-orders"
              id="mobile-bulk-quote-cta"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/5 border border-amber-500/40 p-3 text-base font-bold text-amber-950 dark:text-amber-300 shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-zinc-950 text-sm font-black shadow-xs">
                  📋
                </span>
                <div>
                  <span className="block leading-tight text-sm font-bold text-zinc-900 dark:text-white">
                    Bulk &amp; Custom Orders
                  </span>
                  <span className="text-[11px] font-normal text-zinc-600 dark:text-zinc-400">
                    Get custom quotation &amp; discounts
                  </span>
                </div>
              </div>
              <span className="rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-extrabold text-zinc-950 shadow-xs">
                Get Quote
              </span>
            </Link>

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-lg p-2.5 text-base font-semibold text-zinc-900 hover:bg-zinc-100 dark:text-white dark:hover:bg-zinc-900"
            >
              <span>Home</span>
              <span className="text-xs text-amber-600 font-normal">Active</span>
            </Link>
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-lg p-2.5 text-base font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              <span>Shop Catalogue</span>
              <span className="text-xs text-amber-600 font-semibold">Browse All</span>
            </Link>
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-lg p-2.5 text-base font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              <span>Product Categories</span>
              <span className="text-xs text-zinc-400">5 Categories</span>
            </Link>
            <Link
              href="/bulk-orders"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-lg p-2.5 text-base font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              <span>Get a Quote (Bulk Inquiries)</span>
              <span className="text-xs text-amber-500 font-semibold">Wholesale</span>
            </Link>
            <a
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-lg p-2.5 text-base font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              <span>How Engraving Works</span>
              <span className="text-xs text-zinc-400">4 Steps</span>
            </a>
            <a
              href="/#why-us"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-lg p-2.5 text-base font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              <span>Why Choose Us</span>
              <span className="text-xs text-zinc-400">Quality Guarantee</span>
            </a>
            <a
              href="/#reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-lg p-2.5 text-base font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              <span>Customer Reviews</span>
              <span className="text-xs text-amber-500 font-semibold">★ 5.0</span>
            </a>
            <Link
              href="/bulk-orders"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-lg p-2.5 text-base font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              <span>Contact &amp; Custom Orders</span>
              <span className="text-xs text-emerald-600 font-semibold">WhatsApp Quote</span>
            </Link>
          </div>

          {/* Mobile Footer Info */}
          <div className="mt-6 border-t border-zinc-200 pt-5 dark:border-zinc-800">
            <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                Currency: Pakistani Rupee
              </span>
              <span className="rounded bg-amber-50 px-2 py-0.5 font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                PKR (Rs.)
              </span>
            </div>
            <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
              💵 <strong>Cash on Delivery:</strong> Pay safely at your doorstep across Karachi, Lahore, Islamabad, and all cities in Pakistan.
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
