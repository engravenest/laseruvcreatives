import Link from "next/link";
import { STORE_CONFIG } from "@/constants/store";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600 px-4 py-1.5 text-center text-xs font-medium text-white tracking-wide">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          🇵🇰 Nationwide Delivery Across Pakistan • Cash on Delivery (COD) Available
        </span>
      </div>

      {/* Main Navigation Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-amber-400 shadow-sm transition-transform group-hover:scale-105 dark:bg-zinc-100 dark:text-amber-600">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {STORE_CONFIG.name}
            </span>
            <span className="block text-[11px] font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Precision Laser & UV Engraving
            </span>
          </div>
        </Link>

        {/* Navigation Links (Placeholders for upcoming phases) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <Link
            href="/"
            className="text-zinc-900 transition-colors hover:text-amber-600 dark:text-zinc-50 dark:hover:text-amber-400"
          >
            Home
          </Link>
          <span className="text-zinc-400 cursor-not-allowed hover:text-zinc-500" title="Coming in next phase">
            Custom Pens
          </span>
          <span className="text-zinc-400 cursor-not-allowed hover:text-zinc-500" title="Coming in next phase">
            Wooden Pens
          </span>
          <span className="text-zinc-400 cursor-not-allowed hover:text-zinc-500" title="Coming in next phase">
            Gift Sets
          </span>
          <span className="text-zinc-400 cursor-not-allowed hover:text-zinc-500" title="Coming in next phase">
            Water Bottles
          </span>
        </nav>

        {/* Right Action / Cart Indicator */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <span>PKR (Rs.)</span>
          </div>
          <div
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            title="Cart will be enabled in future phase"
          >
            <svg
              className="h-4 w-4 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span>Cart</span>
            <span className="rounded-full bg-amber-500/10 px-1.5 py-0.2 text-[10px] font-bold text-amber-600 dark:text-amber-400">
              0
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
