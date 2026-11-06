"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";
import { formatPKR } from "@/lib/utils";
import StatusBadge from "@/components/admin/StatusBadge";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import WhatsAppNotifyButton from "@/components/admin/WhatsAppNotifyButton";
import JobSheetModal from "@/components/admin/JobSheetModal";
import { Order, OrderStatus } from "@/types/order";

function OrdersContent() {
  const searchParams = useSearchParams();
  const initialStatusFilter = searchParams.get("status") || "all";

  const { orders, stats } = useAdmin();
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatusFilter);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedJobOrder, setSelectedJobOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (searchParams.get("status")) {
      setSelectedStatus(searchParams.get("status") || "all");
    }
  }, [searchParams]);

  // Extract unique cities
  const cities = Array.from(new Set(orders.map((o) => o.shippingAddress.city))).filter(Boolean);

  const filteredOrders = orders.filter((order) => {
    // Status filter
    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;

    // City filter
    const matchesCity =
      selectedCity === "all" || order.shippingAddress.city === selectedCity;

    // Search query
    const query = search.toLowerCase();
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(query) ||
      order.customer.fullName.toLowerCase().includes(query) ||
      order.customer.phoneNumber.includes(query) ||
      order.shippingAddress.city.toLowerCase().includes(query) ||
      order.items.some(
        (i) =>
          i.productName.toLowerCase().includes(query) ||
          i.customization?.engravingText?.toLowerCase().includes(query)
      );

    return matchesStatus && matchesCity && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              Workshop & Logistics Dispatch
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Customer Orders
          </h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Track engraving progress, update domestic courier status, and notify customers on WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 px-3.5 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
            Total Orders: {orders.length}
          </span>
        </div>
      </div>

      {/* ── Status Tabs ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-200 dark:border-zinc-800">
        {[
          { id: "all", label: "All Orders", count: orders.length },
          { id: "pending_confirmation", label: "Pending", count: stats.pendingCount },
          { id: "confirmed", label: "Confirmed", count: orders.filter((o) => o.status === "confirmed").length },
          { id: "in_engraving", label: "⚡ In Engraving", count: stats.inEngravingCount },
          { id: "dispatched", label: "📦 Dispatched", count: stats.dispatchedCount },
          { id: "delivered", label: "✓ Delivered", count: stats.deliveredCount },
          { id: "cancelled", label: "Cancelled", count: orders.filter((o) => o.status === "cancelled").length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedStatus(tab.id)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              selectedStatus === tab.id
                ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] ${
                selectedStatus === tab.id
                  ? "bg-zinc-50/20 dark:bg-zinc-950/20 text-zinc-950 font-black"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Search & City Filter Bar ─────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-4 backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by Order #, Customer, Phone, City, or Engraving Text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 py-2 pl-10 pr-4 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold">City:</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Pakistan Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Orders Table ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 shadow-xl backdrop-blur-md overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">No orders match your filter criteria.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedStatus("all");
                setSearch("");
                setSelectedCity("all");
              }}
              className="mt-3 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/60 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                <tr>
                  <th className="px-5 py-3.5">Order # & Date</th>
                  <th className="px-5 py-3.5">Customer & City</th>
                  <th className="px-5 py-3.5">Items & Laser Details</th>
                  <th className="px-5 py-3.5">COD Total</th>
                  <th className="px-5 py-3.5">Status & Stage</th>
                  <th className="px-5 py-3.5">Courier & Tracking</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                {filteredOrders.map((order) => {
                  const primaryItem = order.items[0];
                  return (
                    <tr key={order.id} className="hover:bg-zinc-100/30 dark:hover:bg-zinc-800/30 transition-colors">
                      {/* Order Number & Timestamp */}
                      <td className="px-5 py-4 whitespace-nowrap font-mono font-bold text-amber-700 dark:text-amber-400">
                        <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                          {order.orderNumber}
                        </Link>
                        <span className="block font-sans text-[10px] font-normal text-zinc-500">
                          {new Date(order.createdAt).toLocaleDateString("en-PK", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-zinc-900 dark:text-white">{order.customer.fullName}</div>
                        <div className="text-[11px] text-zinc-600 dark:text-zinc-400 font-mono">
                          {order.customer.phoneNumber}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          {order.shippingAddress.city}
                        </div>
                      </td>

                      {/* Items & Personalization */}
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
                            <span>Text:</span>
                            <span className="font-bold">
                              "{primaryItem.customization.engravingText}"
                            </span>
                          </div>
                        )}
                        {primaryItem?.customization?.fontChoice && (
                          <div className="text-[10px] text-zinc-500 truncate">
                            Font: {primaryItem.customization.fontChoice}
                          </div>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-black text-zinc-900 dark:text-white text-sm">{formatPKR(order.total)}</div>
                        <div className="text-[10px] text-zinc-500 font-semibold">
                          {order.paymentMethod}
                        </div>
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

                      {/* Courier & Tracking */}
                      <td className="px-5 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400 text-[11px]">
                        {order.courier ? (
                          <div>
                            <span className="font-bold text-zinc-900 dark:text-white block">
                              {order.courier.carrier}
                            </span>
                            <span className="font-mono text-[10px] text-amber-700 dark:text-amber-400">
                              {order.courier.trackingNumber}
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-600 italic">Not dispatched</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedJobOrder(order)}
                            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100/80 dark:bg-zinc-800/80 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                            title="Print Laser Workshop Sheet"
                          >
                            Job Sheet
                          </button>

                          <WhatsAppNotifyButton order={order} compact />

                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="rounded-lg p-1.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                            title="View Full Order Details"
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
        )}
      </div>

      {/* Workshop Print Sheet Modal */}
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

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-zinc-600 dark:text-zinc-400">Loading Orders...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
