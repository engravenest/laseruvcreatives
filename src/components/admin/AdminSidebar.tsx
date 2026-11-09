"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname();
  const { stats, products, bulkLeads, logout, resetDemoData } = useAdmin();

  const newLeadsCount = bulkLeads.filter((l) => l.status === "new").length;

  const navItems = [
    { name: "Website Pages", href: "/admin/pages", icon: <span aria-hidden="true">▤</span> },
    { name: "Coupons", href: "/admin/coupons", icon: <span aria-hidden="true">%</span> },
    { name: "Website Colors", href: "/admin/appearance", icon: <span aria-hidden="true">◉</span> },
    {
      name: "Dashboard",
      href: "/admin",
      exact: true,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: "Orders",
      href: "/admin/orders",
      badge: stats.pendingCount > 0 ? `${stats.pendingCount} new` : undefined,
      badgeColor: "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      name: "Products",
      href: "/admin/products",
      badge: `${products.length}`,
      badgeColor: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    { name: "Categories", href: "/admin/categories", icon: <span aria-hidden="true" className="text-lg">▦</span> },
    {
      name: "Bulk Inquiries",
      href: "/admin/bulk-quotes",
      badge: newLeadsCount > 0 ? `${newLeadsCount} new` : undefined,
      badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-md shadow-amber-500/20">
              <svg className="h-5 w-5 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            <div>
              <span className="text-sm font-black tracking-tight text-zinc-900 dark:text-white block">
                LaserUV
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block -mt-0.5">
                Admin Studio
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-900 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-amber-700 dark:text-amber-400" : "text-zinc-600 dark:text-zinc-400"}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions & Footer */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-3 space-y-2">
          {/* Live Storefront Link */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:border-amber-500/40 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>View Live Store</span>
            </div>
            <svg className="h-3.5 w-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>

          {/* Reset Demo Data Button */}
          <button
            type="button"
            onClick={() => {
              if (confirm("Reset admin demo data (orders, products, settings) to initial state?")) {
                resetDemoData();
              }
            }}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 px-2 py-1.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-900 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            <svg className="h-3.5 w-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset Demo Data
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-red-500/20 bg-red-950/20 py-2 text-xs font-bold text-red-400 hover:bg-red-900/30 hover:border-red-500/40 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
