"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import { formatPKR } from "@/lib/utils";
import KpiCard from "@/components/admin/KpiCard";
import StatusBadge from "@/components/admin/StatusBadge";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import WhatsAppNotifyButton from "@/components/admin/WhatsAppNotifyButton";
import JobSheetModal from "@/components/admin/JobSheetModal";
import { Order } from "@/types/order";

export default function AdminDashboardPage() {
  const { stats, orders, products, bulkLeads } = useAdmin();
  const [selectedJobOrder, setSelectedJobOrder] = useState<Order | null>(null);

  // Take the 6 most recent orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const pendingLeads = bulkLeads.filter((l) => l.status === "new");

  return (
    <div className="space-y-8">
      {/* ── Top Header / Welcome Banner ─────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              Laser Workshop Command
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Executive Overview
          </h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Real-time management for personalized engraving orders across Pakistan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all shadow-sm"
          >
            <span>All Orders ({orders.length})</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-zinc-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all active:scale-95"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* ── KPI Metrics Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Pipeline Revenue"
          value={formatPKR(stats.totalRevenue)}
          change="+18.4%"
          isPositive={true}
          subtext="COD & Confirmed Orders"
          accentColor="amber"
          icon={
            <svg className="h-6 w-6 text-amber-700 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <KpiCard
          title="Active Orders Queue"
          value={`${stats.activeOrdersCount} Orders`}
          change={`${stats.pendingCount} Pending`}
          isPositive={stats.pendingCount === 0}
          subtext="Needs confirmation or engraving"
          accentColor="cyan"
          icon={
            <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          }
        />

        <KpiCard
          title="On Engraving Bed"
          value={`${stats.inEngravingCount} Items`}
          change="⚡ Active Optics"
          isPositive={true}
          subtext="In laser etching or QC"
          accentColor="purple"
          icon={
            <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />

        <KpiCard
          title="Delivered / Completed"
          value={`${stats.deliveredCount} Orders`}
          change={`${stats.dispatchedCount} in Transit`}
          isPositive={true}
          subtext="Nationwide TCS / Leopards"
          accentColor="emerald"
          icon={
            <svg className="h-6 w-6 text-emerald-700 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          }
        />
      </div>

      {/* ── Status Distribution Pipeline ─────────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-6 backdrop-blur-md">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-4">
          Fulfillment Pipeline Stages
        </h3>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          <Link
            href="/admin/orders?status=pending_confirmation"
            className="flex flex-col rounded-xl border border-amber-500/20 bg-amber-950/20 p-3 hover:border-amber-500/50 transition-colors"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Pending Confirmation
            </span>
            <span className="mt-1 text-2xl font-black text-amber-700 dark:text-amber-300">{stats.pendingCount}</span>
            <span className="text-[10px] text-zinc-500 mt-1">Call / WhatsApp Customer</span>
          </Link>

          <Link
            href="/admin/orders?status=in_engraving"
            className="flex flex-col rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3 hover:border-cyan-500/50 transition-colors"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              ⚡ In Engraving
            </span>
            <span className="mt-1 text-2xl font-black text-cyan-300">{stats.inEngravingCount}</span>
            <span className="text-[10px] text-zinc-500 mt-1">Workshop Bed</span>
          </Link>

          <Link
            href="/admin/orders?status=dispatched"
            className="flex flex-col rounded-xl border border-purple-500/20 bg-purple-950/20 p-3 hover:border-purple-500/50 transition-colors"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
              📦 Dispatched
            </span>
            <span className="mt-1 text-2xl font-black text-purple-300">{stats.dispatchedCount}</span>
            <span className="text-[10px] text-zinc-500 mt-1">TCS / Leopard / PostEx</span>
          </Link>

          <Link
            href="/admin/orders?status=delivered"
            className="flex flex-col rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 hover:border-emerald-500/50 transition-colors"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              ✓ Delivered
            </span>
            <span className="mt-1 text-2xl font-black text-emerald-300">{stats.deliveredCount}</span>
            <span className="text-[10px] text-zinc-500 mt-1">COD Collected</span>
          </Link>

          <Link
            href="/admin/bulk-quotes"
            className="flex flex-col rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-950/60 p-3 hover:border-zinc-500 transition-colors"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Corporate Bulk Leads
            </span>
            <span className="mt-1 text-2xl font-black text-zinc-900 dark:text-white">{pendingLeads.length}</span>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 mt-1">Quotations to send</span>
          </Link>
        </div>
      </div>

      {/* ── Recent Orders Action Table ─────────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 shadow-xl backdrop-blur-md overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 p-5">
          <div>
            <h2 className="text-base font-black text-zinc-900 dark:text-white">Recent Customer Orders</h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Review personalizations, advance fulfillment statuses, and launch WhatsApp notifications.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
          >
            View All ({orders.length}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              <tr>
                <th className="px-5 py-3.5">Order</th>
                <th className="px-5 py-3.5">Customer & City</th>
                <th className="px-5 py-3.5">Items & Engraving Details</th>
                <th className="px-5 py-3.5">Total (COD)</th>
                <th className="px-5 py-3.5">Fulfillment Stage</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
              {recentOrders.map((order) => {
                const primaryItem = order.items[0];
                return (
                  <tr key={order.id} className="hover:bg-zinc-100/30 dark:hover:bg-zinc-800/30 transition-colors">
                    {/* Order ID & Date */}
                    <td className="px-5 py-4 whitespace-nowrap font-mono font-bold text-amber-700 dark:text-amber-400">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                        {order.orderNumber}
                      </Link>
                      <span className="block font-sans text-[10px] font-normal text-zinc-500">
                        {new Date(order.createdAt).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-zinc-900 dark:text-white">{order.customer.fullName}</div>
                      <div className="text-[11px] text-zinc-600 dark:text-zinc-400">{order.customer.phoneNumber}</div>
                      <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                        {order.shippingAddress.city}
                      </div>
                    </td>

                    {/* Items & Engraving Details */}
                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1">
                        {primaryItem?.productName}{" "}
                        {order.items.length > 1 && (
                          <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-normal">
                            (+{order.items.length - 1} more)
                          </span>
                        )}
                      </div>
                      {primaryItem?.customization?.engravingText && (
                        <div className="mt-1 inline-flex items-center gap-1 rounded bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300 font-mono">
                          <span>Engraving:</span>
                          <span className="font-bold">
                            "{primaryItem.customization.engravingText}"
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Total (PKR) */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-black text-zinc-900 dark:text-white">{formatPKR(order.total)}</div>
                      <div className="text-[10px] text-zinc-500">{order.paymentMethod}</div>
                    </td>

                    {/* Status & Inline Changer */}
                    <td className="px-5 py-4 whitespace-nowrap space-y-1.5">
                      <div>
                        <StatusBadge status={order.status} size="sm" />
                      </div>
                      <div>
                        <OrderStatusSelect orderId={order.id} currentStatus={order.status} compact />
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Workshop Sheet Trigger */}
                        <button
                          type="button"
                          onClick={() => setSelectedJobOrder(order)}
                          className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100/80 dark:bg-zinc-800/80 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                          title="Print Laser Workshop Sheet"
                        >
                          Job Sheet
                        </button>

                        {/* WhatsApp Notify */}
                        <WhatsAppNotifyButton order={order} compact />

                        {/* Details Link */}
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="rounded-lg p-1.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                          title="View Order Details"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Printable Workshop Job Sheet Modal ─────────────────────────── */}
      {selectedJobOrder && (
        <JobSheetModal
          order={selectedJobOrder}
          isOpen={true}
          onClose={() => setSelectedJobOrder(null)}
        />
      )}
    </div>
  );
}
