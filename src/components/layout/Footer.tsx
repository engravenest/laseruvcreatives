"use client";
import { useCategories } from "@/lib/useCategories";
import PageLinks from "@/components/site/PageLinks";
import Link from "next/link";
import { STORE_CONFIG } from "@/constants/store";

export default function Footer() {
  const categories = useCategories();
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 dark:border-zinc-800">
      {/* Top Value / Trust Highlight Banner */}
      <div className="border-b border-zinc-200 dark:border-zinc-900 bg-zinc-100/60 dark:bg-zinc-900/60">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-100">Cash on Delivery</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Pay in PKR upon doorstep arrival</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-100">Permanent Laser Etch</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Never fades, peels, or rubs off</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-100">All Pakistan Shipping</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Dispatched via TCS / Leopards / PostEx</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V4a2 2 0 10-2 2h2zm0 13a9 9 0 100-18 9 9 0 000 18z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-100">Ready-To-Gift Boxes</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Luxury velvet inserts &amp; ribbon pack</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Mission Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-zinc-950 font-black shadow-md">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-black text-zinc-900 dark:text-white">
                Laser<span className="text-amber-400">UV</span>Creatives
              </span>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-sm">
              Pakistan&apos;s premier personalized engraving studio. We turn ordinary writing instruments, drinkware, and executive sets into cherished keepsakes through state-of-the-art laser and UV marking.
            </p>

            <div className="mt-4 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
              🇵🇰 Single-vendor specialized studio based in Pakistan.
            </div>

            {/* Social Media Placeholders */}
            <div className="mt-6 flex items-center gap-3 text-xs">
              <span className="text-zinc-600 dark:text-zinc-500 text-[11px] uppercase font-bold tracking-wider">Follow Us:</span>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-amber-500 hover:text-zinc-950"
                aria-label="Instagram"
              >
                📸
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-amber-500 hover:text-zinc-950"
                aria-label="Facebook"
              >
                📘
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-amber-500 hover:text-zinc-950"
                aria-label="TikTok"
              >
                🎵
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-amber-500 hover:text-zinc-950"
                aria-label="LinkedIn"
              >
                💼
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Quick Links
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-amber-400 transition-colors">
                  Shop Products
                </Link>
              </li>
              <li>
                <Link href="/bulk-orders" className="text-amber-400 font-semibold hover:text-amber-300 transition-colors">
                  Bulk &amp; Custom Orders (Get Quote)
                </Link>
              </li>
              <li>
                <a href="/#categories" className="hover:text-amber-400 transition-colors">
                  All Categories
                </a>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-amber-400 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-amber-400 transition-colors">
                  My Account &amp; Orders
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-400 transition-colors">
                  Sign In / Register
                </Link>
              </li>
              <PageLinks />
            </ul>
          </div>

          {/* Product Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Product Categories
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              {categories.map(category => <li key={category.id}>
                <Link href={`/shop?category=${category.slug}`} className="hover:text-amber-400 transition-colors">{category.name}</Link>
              </li>)}
            </ul>
          </div>

          {/* Contact & Delivery Information */}
          <div id="contact">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Contact &amp; Delivery
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-amber-400">💬</span>
                <a
                  href={`https://wa.me/${STORE_CONFIG.contact.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition-colors"
                >
                  WhatsApp / Call: {STORE_CONFIG.contact.displayPhone}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">✉️</span>
                <a
                  href={`mailto:${STORE_CONFIG.contact.email}`}
                  className="hover:text-amber-400 transition-colors"
                >
                  Email: {STORE_CONFIG.contact.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">📍</span>
                <span>Studio: Lahore &amp; Karachi fulfillment hubs</span>
              </li>
              <li className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-900 text-[11px] text-zinc-600 dark:text-zinc-400">
                <strong className="text-zinc-200">Pakistan-Wide Courier:</strong> Delivered in 3–5 working days to Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Quetta, Multan, and all surrounding areas.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Phase 2 note */}
        <div className="mt-12 border-t border-zinc-200 dark:border-zinc-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600 dark:text-zinc-500">
          <p>© {new Date().getFullYear()} {STORE_CONFIG.name}. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Currency: <strong>PKR</strong></span>
            <span>•</span>
            <span>Payment: <strong>Cash on Delivery (COD)</strong></span>
            <span>•</span>
            <span className="text-amber-400">Phase 2: Modern Homepage</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
