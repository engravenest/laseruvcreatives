"use client";
import { useState } from "react";
import { formatPKR } from "@/lib/utils";
export interface AppliedCoupon { code: string; discount: number; signature: string }
export default function CouponBox({ items, signature, applied, onChange, signedIn }: {
  items: { productId: string; quantity: number }[]; signature: string; applied: AppliedCoupon | null;
  onChange: (coupon: AppliedCoupon | null) => void; signedIn: boolean;
}) {
  const [code, setCode] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  return <div className="my-4 space-y-2 border-y border-zinc-200 py-4 dark:border-zinc-700">
    <label htmlFor="checkout-coupon" className="text-sm font-bold">Coupon code</label>
    <div className="flex gap-2"><input id="checkout-coupon" maxLength={40} value={code} onChange={event => setCode(event.target.value.toUpperCase())} placeholder="Enter code" className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
      <button type="button" disabled={busy || !code.trim()} className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-bold text-zinc-950 disabled:opacity-50" onClick={async () => {
        setError(""); setBusy(true);
        try {
          const response = await fetch("/api/coupons/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, items }) });
          const data = await response.json(); if (!response.ok) throw new Error(data.error || "Could not apply coupon.");
          onChange({ code: data.code, discount: data.discount, signature });
        } catch (error) { onChange(null); setError(error instanceof Error ? error.message : "Could not apply coupon."); }
        finally { setBusy(false); }
      }}>{busy ? "Checking…" : "Apply"}</button></div>
    {!signedIn && <p className="text-xs">Sign in to redeem a coupon. Guest checkout is still available.</p>}
    {error && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    {applied && <div className="flex justify-between gap-2 text-sm"><p role="status">{applied.code}: save {formatPKR(applied.discount)}</p><button type="button" className="underline" onClick={() => { onChange(null); setError(""); }}>Remove</button></div>}
  </div>;
}
