"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAdmin } from "@/context/AdminContext";
import { formatPKR } from "@/lib/utils";
import StatusBadge from "@/components/admin/StatusBadge";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import WhatsAppNotifyButton from "@/components/admin/WhatsAppNotifyButton";
import JobSheetModal from "@/components/admin/JobSheetModal";
import { OrderStatus } from "@/types/order";

interface Props {
  params: Promise<{ id: string }>;
}

export default function AdminOrderDetailPage({ params }: Props) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const { getOrderById, updateOrderStatus } = useAdmin();

  const order = getOrderById(orderId);
  const [showJobSheet, setShowJobSheet] = useState(false);

  // Dispatch courier form
  const [carrier, setCarrier] = useState<"TCS" | "Leopard Courier" | "PostEx" | "Trax" | "Other">(
    order?.courier?.carrier || "TCS"
  );
  const [trackingNumber, setTrackingNumber] = useState(order?.courier?.trackingNumber || "");
  const [isUpdatingCourier, setIsUpdatingCourier] = useState(false);

  if (!order) {
    return (
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-12 text-center">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Order Not Found</h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-6">
          The requested Order ID "{orderId}" does not exist in the administrative system.
        </p>
        <Link
          href="/admin/orders"
          className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400"
        >
          Return to Orders
        </Link>
      </div>
    );
  }

  const handleSaveCourier = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingCourier(true);
    await updateOrderStatus(order.id, order.status, {
      carrier,
      trackingNumber: trackingNumber.trim(),
    });
    setIsUpdatingCourier(false);
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header & Actions ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 mb-1">
            <Link href="/admin/orders" className="hover:text-amber-700 dark:hover:text-amber-400">
              Orders
            </Link>
            <span>/</span>
            <span className="font-semibold text-zinc-900 dark:text-white">{order.orderNumber}</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl font-mono">
              {order.orderNumber}
            </h1>
            <StatusBadge status={order.status} size="lg" />
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-PK", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <OrderStatusSelect orderId={order.id} currentStatus={order.status} />

          <button
            type="button"
            onClick={() => setShowJobSheet(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-3.5 py-2 text-xs font-bold text-zinc-900 dark:text-white hover:border-zinc-500 transition-colors shadow-sm"
          >
            <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print Workshop Sheet</span>
          </button>

          <WhatsAppNotifyButton order={order} />
        </div>
      </div>

      {/* ── Two-Column Layout ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Left Column: Items & Customization ───────────────────────── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Items Card */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-4">
              Personalized Order Items ({order.items.length})
            </h2>

            <div className="space-y-6 divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
              {order.items.map((item, idx) => (
                <div key={item.id} className={`space-y-4 ${idx > 0 ? "pt-6" : ""}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="relative h-16 w-16 shrink-0 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
                            No Img
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{item.productName}</h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          {formatPKR(item.unitPrice)} × {item.quantity} units
                        </p>
                        {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                          <div className="mt-1 flex gap-2 text-[10px] text-zinc-600 dark:text-zinc-400">
                            {Object.entries(item.selectedVariants).map(([k, v]) => (
                              <span key={k} className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 capitalize">
                                {k}: {v}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-zinc-900 dark:text-white">
                        {formatPKR(item.unitPrice * item.quantity)}
                      </div>
                    </div>
                  </div>

                  {/* Engraving Specs Box */}
                  {item.customization ? (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                          ⚡ Laser Engraving Specification
                        </span>
                        <span className="text-[10px] text-zinc-600 dark:text-zinc-400">
                          Chars: {item.customization.engravingText?.length || 0}
                        </span>
                      </div>

                      {item.customization.engravingText && (
                        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3">
                          <span className="text-[10px] text-zinc-500 block mb-0.5">
                            Engraving Text:
                          </span>
                          <span className="font-mono text-base font-black text-amber-700 dark:text-amber-300 tracking-wide select-all">
                            "{item.customization.engravingText}"
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-zinc-500">Font Requested: </span>
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                            {item.customization.fontChoice || "Standard Studio Font"}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500">Placement: </span>
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                            {item.customization.engravingLocation || "Standard Placement"}
                          </span>
                        </div>
                      </div>

                      {item.customization.logoFileName && (
                        <div className="text-xs">
                          <span className="text-zinc-500">Logo File Uploaded: </span>
                          <span className="font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                            {item.customization.logoFileName}
                          </span>
                        </div>
                      )}

                      {item.customization.specialInstructions && (
                        <div className="rounded bg-white/80 dark:bg-zinc-900/80 p-2.5 text-xs text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                          <span className="font-bold text-amber-700 dark:text-amber-400">Customer Note: </span>
                          {item.customization.specialInstructions}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs italic text-zinc-500">
                      Standard un-engraved product line
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="mt-6 border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-2">
              <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                <span>Subtotal</span>
                <span>{formatPKR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                <span>Shipping Fee</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {order.shippingFee === 0 ? "Free" : formatPKR(order.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-zinc-900 dark:text-white border-t border-zinc-200 dark:border-zinc-800 pt-3">
                <span>Total Amount (COD)</span>
                <span className="text-base text-amber-700 dark:text-amber-400">{formatPKR(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Customer, Address & Courier ────────────────── */}
        <div className="space-y-6 lg:col-span-1">
          {/* Customer Details Card */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Customer Contact
            </h2>

            <div>
              <div className="text-base font-black text-zinc-900 dark:text-white">{order.customer.fullName}</div>
              <div className="mt-1 flex items-center gap-2">
                <a
                  href={`tel:${order.customer.phoneNumber}`}
                  className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
                >
                  {order.customer.phoneNumber}
                </a>
                <span className="text-zinc-600">•</span>
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400">{order.shippingAddress.city}</span>
              </div>
              {order.customer.email && (
                <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{order.customer.email}</div>
              )}
            </div>

            <div className="pt-2">
              <WhatsAppNotifyButton order={order} />
            </div>
          </div>

          {/* Pakistan Shipping Address Card */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Delivery Destination
            </h2>

            <div className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
              <p className="font-semibold">{order.shippingAddress.addressLine}</p>
              {order.shippingAddress.nearestLandmark && (
                <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                  Landmark: {order.shippingAddress.nearestLandmark}
                </p>
              )}
              <p className="mt-2 text-zinc-900 dark:text-white font-bold">
                {order.shippingAddress.city},{" "}
                <span className="text-zinc-600 dark:text-zinc-400 font-normal">
                  {order.shippingAddress.province}
                </span>
              </p>
              {order.shippingAddress.postalCode && (
                <p className="text-[10px] text-zinc-500 font-mono">
                  Postal: {order.shippingAddress.postalCode}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-2.5 text-[11px] font-medium text-emerald-300">
              💵 {order.paymentMethod} — {order.paymentStatus === "paid_on_delivery" ? "Paid ✓" : "Unpaid (Collect Cash)"}
            </div>
          </div>

          {/* Courier Assignment Card */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Courier Logistics
            </h2>

            <form onSubmit={handleSaveCourier} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Selected Courier
                </label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value as any)}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="TCS">TCS Express</option>
                  <option value="Leopard Courier">Leopard Courier</option>
                  <option value="PostEx">PostEx Logistics</option>
                  <option value="Trax">Trax Logistics</option>
                  <option value="Other">Other Local Courier</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Tracking / Consignment Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. TCS9920183PK"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-amber-500 focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit" disabled={isUpdatingCourier}
                className="w-full rounded-xl bg-zinc-100 dark:bg-zinc-800 py-2 text-xs font-bold text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                {isUpdatingCourier ? "Saving…" : "Save Courier Details"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Workshop Print Sheet Modal */}
      {showJobSheet && (
        <JobSheetModal
          order={order}
          isOpen={true}
          onClose={() => setShowJobSheet(false)}
        />
      )}
    </div>
  );
}
