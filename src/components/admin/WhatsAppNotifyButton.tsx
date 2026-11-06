"use client";

import React, { useState } from "react";
import { Order, OrderStatus } from "@/types/order";
import { buildCustomerWhatsAppUrl } from "@/lib/adminWhatsApp";

interface Props {
  order: Order;
  compact?: boolean;
}

export default function WhatsAppNotifyButton({ order, compact = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const statuses: { label: string; status: OrderStatus; icon: string }[] = [
    { label: "Send: Order Confirmed", status: "confirmed", icon: "✓" },
    { label: "Send: In Engraving Bed", status: "in_engraving", icon: "⚡" },
    { label: "Send: Dispatched + Tracking", status: "dispatched", icon: "📦" },
    { label: "Send: Delivered + Review", status: "delivered", icon: "🎉" },
  ];

  const handleLaunch = (status: OrderStatus) => {
    const url = buildCustomerWhatsAppUrl(order, status);
    window.open(url, "_blank");
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-900/50 hover:border-emerald-500 transition-colors shadow-sm ${
          compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-xs"
        }`}
        title={`WhatsApp ${order.customer.fullName} (${order.customer.phoneNumber})`}
      >
        {/* WhatsApp Icon */}
        <svg className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1.004.549 1.76.84 2.806.84 3.18 0 5.767-2.587 5.768-5.766.001-3.182-2.585-5.823-5.768-5.823zm3.364 8.223c-.144.405-.837.774-1.17.824-.312.045-.698.077-2.18-.535-1.787-.736-2.923-2.55-3.012-2.67-.09-.12-0.722-.962-.722-1.836 0-.874.457-1.303.62-1.482.164-.18.358-.225.477-.225.12 0 .239.001.344.006.11.005.258-.042.404.308.15.361.512 1.25.557 1.342.045.091.075.197.015.316-.06.12-.09.196-.18.3-.09.105-.189.234-.27.315-.091.09-.186.189-.08.371.106.182.47 0.776 1.01 1.257.695.62 1.28.812 1.462.903.181.09.288.076.395-.045.106-.12.457-.532.578-.713.12-.182.24-.151.405-.09.165.061 1.045.492 1.226.582.18.09.3.136.345.211.045.076.045.436-.099.841z" />
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.054 22l4.982-1.308C8.47 21.555 10.18 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.637 0-3.16-.484-4.437-1.314l-.318-.208-2.955.775.789-2.879-.228-.363C3.96 14.898 3.4 13.49 3.4 12c0-4.742 3.858-8.6 8.6-8.6 4.741 0 8.6 3.858 8.6 8.6 0 4.741-3.859 8.6-8.6 8.6z" />
        </svg>
        <span>WhatsApp</span>
        <svg className="h-3 w-3 text-emerald-700/70 dark:text-emerald-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-1.5 shadow-2xl backdrop-blur-xl">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Notify {order.customer.fullName.split(" ")[0]}
            </div>
            {statuses.map((item) => (
              <button
                key={item.status}
                type="button"
                onClick={() => handleLaunch(item.status)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
