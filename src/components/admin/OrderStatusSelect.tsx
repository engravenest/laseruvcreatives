"use client";

import React, { useState } from "react";
import { OrderStatus } from "@/types/order";
import { useAdmin } from "@/context/AdminContext";

interface Props {
  orderId: string;
  currentStatus: OrderStatus;
  compact?: boolean;
}

export default function OrderStatusSelect({ orderId, currentStatus, compact = false }: Props) {
  const { updateOrderStatus, isSaving } = useAdmin();
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [carrier, setCarrier] = useState<"TCS" | "Leopard Courier" | "PostEx" | "Trax" | "Other">("TCS");
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (newStatus === "dispatched") {
      setShowCourierModal(true);
    } else {
      updateOrderStatus(orderId, newStatus);
    }
  };

  const submitDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const saved = await updateOrderStatus(orderId, "dispatched", {
      carrier,
      trackingNumber: trackingNumber.trim() || `PK-${Date.now().toString().slice(-6)}`,
    });
    if (saved) setShowCourierModal(false);
  };

  return (
    <div className="relative inline-block">
      <select
        disabled={isSaving}
        value={currentStatus}
        onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
        className={`rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-medium text-zinc-800 dark:text-zinc-200 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors cursor-pointer ${
          compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-xs"
        }`}
      >
        <option value="pending_confirmation">Pending Confirmation</option>
        <option value="confirmed">Confirmed (COD)</option>
        <option value="in_engraving">⚡ In Engraving</option>
        <option value="dispatched">📦 Dispatched</option>
        <option value="delivered">✓ Delivered</option>
        <option value="cancelled">✕ Cancelled</option>
      </select>

      {/* Courier Prompt Modal */}
      {showCourierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl">
            <h4 className="text-base font-bold text-zinc-900 dark:text-white mb-2">Dispatch Order with Courier</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
              Enter courier consignment details for domestic Pakistan shipping.
            </p>

            <form onSubmit={submitDispatch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Select Courier</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value as any)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-amber-500"
                >
                  <option value="TCS">TCS Express</option>
                  <option value="Leopard Courier">Leopard Courier</option>
                  <option value="PostEx">PostEx Logistics</option>
                  <option value="Trax">Trax Logistics</option>
                  <option value="Other">Other Local Courier</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tracking / Consignment #
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TCS78291038PK"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-600 focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCourierModal(false)}
                  className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={isSaving}
                  className="flex-1 rounded-lg bg-amber-500 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 shadow-md shadow-amber-500/20"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
