"use client";

import { useState } from "react";
import { ProductItem } from "@/data/mockProducts";
import { formatPKR } from "@/lib/utils";

interface CustomizationModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customText: string, font: string) => void;
}

const FONT_OPTIONS = [
  { id: "script", name: "Elegant Script Calligraphy", style: "italic font-serif" },
  { id: "sans", name: "Modern Minimalist Sans", style: "font-sans uppercase tracking-widest" },
  { id: "serif", name: "Executive Bold Serif", style: "font-serif tracking-wide font-bold" },
];

export default function CustomizationModal({
  product,
  isOpen,
  onClose,
  onConfirm,
}: CustomizationModalProps) {
  const [engravingText, setEngravingText] = useState("Sarah Jennings");
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0]);
  const [placement, setPlacement] = useState("Center Body / Barrel");

  if (!isOpen || !product) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(engravingText, selectedFont.name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          aria-label="Close modal"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Personalize Your Item
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {product.name} • {formatPKR(product.price)}
            </p>
          </div>
        </div>

        {/* Live Engraving Simulation Box */}
        <div className="my-5 rounded-xl border border-dashed border-amber-400/80 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-4 text-center text-white">
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block mb-1">
            ⚡ Live Engraving Preview
          </span>
          <div className="flex min-h-[50px] items-center justify-center py-2 px-4 rounded bg-black/40">
            <span
              className={`text-xl sm:text-2xl text-amber-300 transition-all ${selectedFont.style}`}
            >
              {engravingText.trim() ? engravingText : "Your Name Here"}
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-2 block">
            Placement: {placement} • Permanent Laser Mark
          </span>
        </div>

        {/* Customization Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Engraving Name / Custom Message (Max 30 characters)
            </label>
            <input
              type="text"
              maxLength={30}
              value={engravingText}
              onChange={(e) => setEngravingText(e.target.value)}
              placeholder="e.g. Sarah Jennings or Muhammad Ali"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none ring-amber-500 focus:border-amber-500 focus:ring-1 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Select Engraving Typography
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {FONT_OPTIONS.map((f) => (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => setSelectedFont(f)}
                  className={`rounded-lg border px-3 py-2 text-left text-xs transition-all ${
                    selectedFont.id === f.id
                      ? "border-amber-500 bg-amber-50 text-amber-900 font-bold dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-500"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  <span className="block truncate">{f.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Engraving Position
            </label>
            <div className="flex gap-2">
              {["Center Body / Barrel", "Cap / Clip Area"].map((pos) => (
                <button
                  type="button"
                  key={pos}
                  onClick={() => setPlacement(pos)}
                  className={`rounded-lg border px-3 py-1.5 text-xs transition-all ${
                    placement === pos
                      ? "border-amber-500 bg-amber-50 text-amber-900 font-bold dark:bg-amber-950/40 dark:text-amber-300"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {product.customizationType === "both" && (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-400">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 block mb-0.5">
                🏢 Corporate Logo Upload Supported
              </span>
              You can send your vector or high-res logo via WhatsApp or upload during future checkout.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-zinc-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500"
            >
              Confirm &amp; Add to Cart
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
