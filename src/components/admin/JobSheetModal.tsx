"use client";

import React from "react";
import { Order } from "@/types/order";
import { formatPKR } from "@/lib/utils";

interface Props {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export default function JobSheetModal({ order, isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden my-8">
        {/* Top Control Bar (Hidden during print) */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-6 py-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Workshop Laser Job Sheet</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors shadow-md"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Sheet
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-6 bg-white text-zinc-950 print:p-0">
          {/* Header */}
          <div className="border-b-2 border-zinc-950 pb-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-black uppercase tracking-tight">LaserUVCreatives</h1>
                <p className="text-[11px] font-semibold text-zinc-600">
                  Precision Laser Engraving & UV Printing Studio (Pakistan)
                </p>
              </div>
              <div className="text-right">
                <div className="inline-block rounded border-2 border-zinc-950 px-3 py-1 text-sm font-black tracking-wider">
                  JOB: {order.orderNumber}
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Date: {new Date(order.createdAt).toLocaleDateString("en-PK", { dateStyle: "medium" })}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-bold text-zinc-600">Client: </span>
                <span className="font-semibold">{order.customer.fullName}</span> ({order.customer.phoneNumber})
              </div>
              <div className="text-right">
                <span className="font-bold text-zinc-600">Destination: </span>
                <span className="font-semibold">{order.shippingAddress.city}</span> ({order.paymentMethod})
              </div>
            </div>
          </div>

          {/* Engraving Specs Box */}
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={item.id} className="rounded-lg border-2 border-dashed border-zinc-300 p-4">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-bold text-sm">
                    Item #{idx + 1}: {item.productName}
                  </span>
                  <span className="text-xs font-bold bg-zinc-100 px-2 py-0.5 rounded">
                    Quantity: {item.quantity}
                  </span>
                </div>

                {item.customization ? (
                  <div className="space-y-2 mt-2">
                    {/* Engraving Text Highlight */}
                    <div className="rounded bg-amber-50 border border-amber-200 p-3">
                      <span className="text-[10px] uppercase font-bold text-amber-900 block mb-1">
                        Exact Laser Engraving Text:
                      </span>
                      <div className="text-lg font-black tracking-wide text-zinc-900 select-all font-mono">
                        "{item.customization.engravingText || "None specified"}"
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-1 block">
                        Character Count: {item.customization.engravingText?.length || 0}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <span className="font-bold text-zinc-600">Font Requested: </span>
                        <span className="font-semibold text-zinc-900">{item.customization.fontChoice || "Standard"}</span>
                      </div>
                      <div>
                        <span className="font-bold text-zinc-600">Location: </span>
                        <span className="font-semibold text-zinc-900">{item.customization.engravingLocation || "Standard"}</span>
                      </div>
                    </div>

                    {item.customization.logoFileName && (
                      <div className="text-xs">
                        <span className="font-bold text-zinc-600">Logo File: </span>
                        <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded text-[11px]">
                          {item.customization.logoFileName}
                        </span>
                      </div>
                    )}

                    {item.customization.specialInstructions && (
                      <div className="text-xs text-zinc-700 bg-zinc-50 p-2 rounded border border-zinc-200">
                        <span className="font-bold">Technician Note: </span>
                        {item.customization.specialInstructions}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs italic text-zinc-500">Standard non-customized inventory item</p>
                )}
              </div>
            ))}
          </div>

          {/* QA & Sign-off Footer */}
          <div className="mt-6 pt-4 border-t-2 border-zinc-950 grid grid-cols-3 gap-4 text-center text-xs">
            <div className="border-t border-zinc-400 pt-2">
              <span className="text-[10px] text-zinc-500 uppercase block">Laser Operator</span>
              <span className="font-semibold">Sign / Initials</span>
            </div>
            <div className="border-t border-zinc-400 pt-2">
              <span className="text-[10px] text-zinc-500 uppercase block">QC & Cleaning</span>
              <span className="font-semibold">Inspected ✓</span>
            </div>
            <div className="border-t border-zinc-400 pt-2">
              <span className="text-[10px] text-zinc-500 uppercase block">Packaging</span>
              <span className="font-semibold">Boxed for COD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
