"use client";

import ThemeToggle from "@/components/ui/ThemeToggle";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  onOpenSidebar: () => void;
}

export default function AdminTopbar({ onOpenSidebar }: Props) {
  const pathname = usePathname();

  // Generate breadcrumbs from path
  const segments = pathname.split("/").filter(Boolean);

  const getBreadcrumbTitle = (seg: string) => {
    switch (seg) {
      case "admin":
        return "Dashboard";
      case "orders":
        return "Orders Fulfillment";
      case "pages": return "Website Pages";
      case "coupons": return "Coupons";
      case "appearance": return "Website Colors";
      case "categories":
        return "Categories";
      case "products":
        return "Products Catalog";
      case "new":
        return "Add New Product";
      case "edit":
        return "Edit Product";
      case "bulk-quotes":
        return "Corporate Bulk Inquiries";
      case "settings":
        return "Store Settings";
      default:
        return seg.length > 12 ? `${seg.slice(0, 10)}...` : seg;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 px-4 sm:px-6 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
          className="rounded-lg p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white lg:hidden"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Breadcrumb Trail */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
          <Link href="/admin" className="font-semibold text-zinc-600 dark:text-zinc-400 hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
            Admin
          </Link>
          {segments.length > 1 && (
            <>
              <span className="text-zinc-600">/</span>
              <span className="font-bold text-zinc-900 dark:text-white capitalize">
                {getBreadcrumbTitle(segments[1])}
              </span>
            </>
          )}
          {segments.length > 2 && (
            <>
              <span className="text-zinc-600">/</span>
              <span className="font-medium text-amber-700 dark:text-amber-400">
                {getBreadcrumbTitle(segments[2])}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* System Status Pill */}
        <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 px-3 py-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>PKR Store Online</span>
        </div>

        {/* Quick Add Product Button */}
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-2 text-xs font-bold text-zinc-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all active:scale-95"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Add Product</span>
          <span className="sm:hidden">New</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
