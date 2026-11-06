import React from "react";
import { OrderStatus } from "@/types/order";

interface StatusBadgeProps {
  status: OrderStatus;
  size?: "sm" | "md" | "lg";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "pending_confirmation":
        return {
          label: "Pending Confirmation",
          bg: "bg-amber-950/40 border-amber-500/30 text-amber-700 dark:text-amber-400",
          dot: "bg-amber-400 animate-pulse",
        };
      case "confirmed":
        return {
          label: "Confirmed (COD)",
          bg: "bg-blue-950/40 border-blue-500/30 text-blue-400",
          dot: "bg-blue-400",
        };
      case "in_engraving":
        return {
          label: "In Engraving",
          bg: "bg-cyan-950/40 border-cyan-500/30 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]",
          dot: "bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-ping",
        };
      case "dispatched":
        return {
          label: "Dispatched",
          bg: "bg-purple-950/40 border-purple-500/30 text-purple-300",
          dot: "bg-purple-400",
        };
      case "delivered":
        return {
          label: "Delivered",
          bg: "bg-emerald-950/40 border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
          dot: "bg-emerald-400",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          bg: "bg-rose-950/40 border-rose-500/30 text-rose-700 dark:text-rose-400",
          dot: "bg-rose-400",
        };
      default:
        return {
          label: status,
          bg: "bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300",
          dot: "bg-zinc-400",
        };
    }
  };

  const config = getStatusConfig();
  const sizeClasses =
    size === "sm"
      ? "text-[10px] px-2 py-0.5"
      : size === "lg"
      ? "text-xs px-3.5 py-1.5"
      : "text-[11px] px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border ${config.bg} ${sizeClasses}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}
