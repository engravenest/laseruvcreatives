"use client";

import CouponBox, { type AppliedCoupon } from "@/components/product/CouponBox";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { formatPKR, isValidPakistaniPhone } from "@/lib/utils";
import { STORE_CONFIG } from "@/constants/store";
import { saveOrderToStore } from "@/lib/storeSync";
import { getShippingFee } from "@/lib/shipping";
import { ShippingAddress } from "@/types/order";
import { Order } from "@/types/order";

const PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Azad Kashmir",
  "Gilgit-Baltistan",
] as const;

const POPULAR_CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Sialkot",
  "Gujranwala",
  "Quetta",
];

export default function CheckoutPage() {
  const { items, itemCount, subtotal, clearCart } = useCart();
  const { customer } = useCustomerAuth();


  // Form Fields
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [province, setProvince] = useState<(typeof PROVINCES)[number]>("Punjab");
  const [city, setCity] = useState("Lahore");
  const [customCity, setCustomCity] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [nearestLandmark, setNearestLandmark] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  const shippingFee = getShippingFee(province);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const couponSignature = JSON.stringify([customer?.id, items.map(item => [item.productId, item.quantity, item.unitPrice])]);
  const appliedCoupon = coupon?.signature === couponSignature ? coupon : null;
  const discount = appliedCoupon?.discount || 0;
  const total = subtotal + shippingFee - discount;
  const [savedAddresses, setSavedAddresses] = useState<(ShippingAddress & { id: string })[]>([]);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!customer) { setSavedAddresses([]); return; }
    let cancelled = false;
    fetch("/api/customer/profile").then(async response => {
      if (!response.ok) throw new Error("Could not load saved addresses. Please try again.");
      const data = await response.json();
      if (!cancelled) setSavedAddresses(data.savedAddresses || []);
    }).catch(error => { if (!cancelled) setSubmitError(error.message); });
    return () => { cancelled = true; };
  }, [customer]);

  // Autofill if customer is signed in
  useEffect(() => {
    if (customer) {
      if (!fullName && customer.fullName) setFullName(customer.fullName);
      if (!phoneNumber && customer.phone) setPhoneNumber(customer.phone);
      if (!email && customer.email) setEmail(customer.email);
    }
  }, [customer, fullName, phoneNumber, email]);

  // Validation errors
  const [errors, setErrors] = useState<{
    fullName?: string;
    phoneNumber?: string;
    city?: string;
    addressLine?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // ---------------------------------------------------------------------------
  // Validation & Submission
  // ---------------------------------------------------------------------------
  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Please enter your full name.";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Please enter your mobile phone number.";
    } else if (!isValidPakistaniPhone(phoneNumber)) {
      newErrors.phoneNumber =
        "Enter a valid Pakistani mobile number (e.g. 03001234567 or +923001234567).";
    }

    const effectiveCity = city === "Other" ? customCity.trim() : city;
    if (!effectiveCity) {
      newErrors.city = "Please enter your delivery city.";
    }

    if (!addressLine.trim()) {
      newErrors.addressLine = "Please enter your complete street / house address.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || !validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    const effectiveCity = city === "Other" ? customCity.trim() : city;
    // Generate order reference: LUC-XXXXXX
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `LUC-${randomDigits}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customer: {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim() || undefined,
      },
      shippingAddress: {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        city: effectiveCity,
        province,
        addressLine: addressLine.trim(),
        nearestLandmark: nearestLandmark.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
      },
      items: [...items],
      paymentMethod: "Cash on Delivery (COD)",
      paymentStatus: "unpaid",
      subtotal,
      couponCode: appliedCoupon?.code,
      discount,
      shippingFee,
      total,
      status: "pending_confirmation",
      createdAt: new Date().toISOString(),
      notes: orderNotes.trim() || undefined,
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newOrder),
      });
      const data = await response.json();
      if (!response.ok || !data.order) throw new Error(data.error || "Could not place your order. Please try again.");
      saveOrderToStore(data.order);
      setPlacedOrder(data.order);
      clearCart();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not place your order. Please try again.");
    } finally { setIsSubmitting(false); }
  };

  // ---------------------------------------------------------------------------
  // Build WhatsApp Confirmation Message
  // ---------------------------------------------------------------------------
  const getWhatsAppConfirmationUrl = (order: Order) => {
    const itemsText = order.items
      .map((item, idx) => {
        const custom = item.customization?.engravingText
          ? `\n   • Engraving: "${item.customization.engravingText}" (Font: ${item.customization.fontChoice || "Standard"}, Location: ${item.customization.engravingLocation || "Standard"})${item.customization.logoFileName ? ` [Logo: ${item.customization.logoFileName}]` : ""}`
          : "";
        return `${idx + 1}. *${item.productName}* (Qty: ${item.quantity}) - ${formatPKR(item.unitPrice * item.quantity)}${custom}`;
      })
      .join("\n");

    const messageLines = [
      `Assalam-o-Alaikum LaserUVCreatives,`,
      ``,
      `I have placed an order on your website and would like to confirm it:`,
      ``,
      `*Order Reference:* ${order.orderNumber}`,
      `*Customer Name:* ${order.customer.fullName}`,
      `*Contact Number:* ${order.customer.phoneNumber}`,
      `*Delivery Address:* ${order.shippingAddress.addressLine}, ${order.shippingAddress.city}, ${order.shippingAddress.province}`,
      `*Payment Method:* ${order.paymentMethod}`,
      ``,
      `*Items Ordered:*`,
      itemsText,
      ``,
      `*Subtotal:* ${formatPKR(order.subtotal)}`,
      `*Delivery Charges:* ${order.shippingFee === 0 ? "Free (Nationwide)" : formatPKR(order.shippingFee)}`,
      ...(order.discount ? [`*Coupon (${order.couponCode}):* -${formatPKR(order.discount)}`] : []),
      `*Total Amount (COD):* ${formatPKR(order.total)}`,
    ];

    if (order.notes) {
      messageLines.push(`*Customer Notes:* ${order.notes}`);
    }

    messageLines.push(``);
    messageLines.push(`Please confirm receipt and start laser engraving. Thank you!`);

    const cleanNumber = STORE_CONFIG.contact.whatsapp.replace(/[^0-9]/g, "");
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageLines.join("\n"))}`;
  };

  // ---------------------------------------------------------------------------
  // Confirmation State View
  // ---------------------------------------------------------------------------
  if (placedOrder) {
    const waUrl = getWhatsAppConfirmationUrl(placedOrder);

    return (
      <div className="min-h-screen bg-zinc-50 py-12 dark:bg-zinc-950">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl sm:p-10 dark:border-zinc-800 dark:bg-zinc-900">
            {/* Header Success Badge */}
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
                <svg
                  className="h-10 w-10 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <span className="rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Order Received • Cash on Delivery
              </span>

              <h1 className="mt-3 text-2xl font-black tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
                Thank You for Your Order!
              </h1>

              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Your order reference is{" "}
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  {placedOrder.orderNumber}
                </span>
                . Our workshop is preparing your personalized items.
              </p>
            </div>

            {/* ── WhatsApp Confirmation CTA Box (TASK 3) ───────────────── */}
            <div className="mt-8 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 p-6 dark:from-emerald-950/30 dark:via-zinc-900 dark:to-zinc-900">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </span>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Fast-Track Engraving via WhatsApp
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Send your order reference directly to our master craftsmen for priority queuing.
                  </p>
                </div>
              </div>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:from-emerald-500 hover:to-emerald-600 active:scale-[0.99]"
              >
                <span>Confirm Order on WhatsApp</span>
                <span className="font-mono text-xs opacity-90">({STORE_CONFIG.contact.displayPhone})</span>
                <span>→</span>
              </a>

              {/* Explicit Proof Disclosure */}
              <div className="mt-3 rounded-lg bg-amber-500/10 p-2.5 text-center text-xs font-semibold text-amber-800 dark:text-amber-300">
                ⚠️ <strong>Important Note:</strong> Clicking "Confirm Order on WhatsApp" will open WhatsApp with your order details pre-filled. Please make sure to press <strong>Send</strong> inside WhatsApp to complete your message to our team.
              </div>
            </div>

            {/* Order Details Breakdown */}
            <div className="mt-8 space-y-6 divide-y divide-zinc-200 dark:divide-zinc-800">
              {/* Customer & Shipping Summary */}
              <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 text-xs">
                <div>
                  <span className="font-bold text-zinc-500 dark:text-zinc-400 block mb-1">
                    Customer Details
                  </span>
                  <p className="font-bold text-zinc-900 dark:text-white">{placedOrder.customer.fullName}</p>
                  <p className="text-zinc-600 dark:text-zinc-400 font-mono">{placedOrder.customer.phoneNumber}</p>
                  {placedOrder.customer.email && (
                    <p className="text-zinc-500 dark:text-zinc-400">{placedOrder.customer.email}</p>
                  )}
                </div>

                <div>
                  <span className="font-bold text-zinc-500 dark:text-zinc-400 block mb-1">
                    Delivery Address (Pakistan)
                  </span>
                  <p className="font-medium text-zinc-900 dark:text-white">{placedOrder.shippingAddress.addressLine}</p>
                  {placedOrder.shippingAddress.nearestLandmark && (
                    <p className="text-zinc-500">Landmark: {placedOrder.shippingAddress.nearestLandmark}</p>
                  )}
                  <p className="font-bold text-zinc-900 dark:text-white">
                    {placedOrder.shippingAddress.city}, {placedOrder.shippingAddress.province}
                  </p>
                </div>
              </div>

              {/* Items List with Personalization */}
              <div className="pt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                  Personalized Items Ordered ({placedOrder.items.length})
                </h4>

                <div className="space-y-4">
                  {placedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-800/40"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 rounded-lg bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                            {item.image && (
                              <Image src={item.image} alt={item.productName} fill className="object-cover" sizes="48px" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-900 dark:text-white">{item.productName}</p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              {formatPKR(item.unitPrice)} × {item.quantity}
                            </p>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-zinc-900 dark:text-white">
                          {formatPKR(item.unitPrice * item.quantity)}
                        </span>
                      </div>

                      {item.customization?.engravingText && (
                        <div className="mt-2.5 rounded-lg bg-amber-50 border border-amber-200/60 p-2 text-xs dark:bg-amber-950/30 dark:border-amber-900/40">
                          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block uppercase">
                            Laser Engraving Text:
                          </span>
                          <span className="font-mono font-bold text-zinc-900 dark:text-white">
                            "{item.customization.engravingText}"
                          </span>
                          <span className="ml-2 text-[10px] text-zinc-500">
                            (Font: {item.customization.fontChoice || "Standard"}, Location: {item.customization.engravingLocation || "Standard"})
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Totals */}
              <div className="pt-6 space-y-2 text-xs">
                {(placedOrder.discount || 0) > 0 && <div className="flex justify-between text-green-700 dark:text-green-400"><span>Coupon ({placedOrder.couponCode})</span><span>−{formatPKR(placedOrder.discount || 0)}</span></div>}
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Subtotal</span>
                  <span>{formatPKR(placedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Nationwide Shipping</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {placedOrder.shippingFee === 0 ? "Free (Configured Rate)" : formatPKR(placedOrder.shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-zinc-900 dark:text-white border-t border-zinc-200 dark:border-zinc-800 pt-3">
                  <span>Total Amount (Cash on Delivery)</span>
                  <span className="text-amber-600 dark:text-amber-400">{formatPKR(placedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <Link
                href="/shop"
                className="text-xs font-semibold text-zinc-600 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-400"
              >
                Continue Shopping
              </Link>

              <Link
                href={customer ? "/account" : "/login?redirect=%2Faccount"}
                className="text-xs font-bold text-amber-600 hover:underline dark:text-amber-400"
              >
                My Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Empty Cart State
  // ---------------------------------------------------------------------------
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 py-16 dark:bg-zinc-950 flex items-center justify-center px-4">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-500 text-3xl">
            🛒
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">
            Your Cart is Empty
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
            Please add personalized items to your cart before proceeding to checkout.
          </p>
          <Link
            href="/shop"
            className="inline-flex rounded-xl bg-amber-500 px-6 py-3 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors"
          >
            Browse Personalized Products
          </Link>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Checkout Form
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-zinc-50 py-10 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-zinc-400">
          <Link href="/" className="hover:text-amber-500">Home</Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-amber-500">Cart</Link>
          <span>/</span>
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">Checkout</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            Checkout &amp; Delivery
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Enter your Pakistani shipping details. Cash on Delivery is available nationwide.
          </p>
        </div>

        {/* ── Two-Column Layout ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* ── Left Column: Shipping & Payment Form (8 cols) ─────────── */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmitOrder} noValidate className="space-y-6">
              {submitError && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{submitError}</p>}
              {customer && (
                <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <label htmlFor="saved-address" className="block text-sm font-semibold">Saved delivery addresses ({savedAddresses.length}/5)</label>
                  <p className="my-2 text-xs text-zinc-500">Choose a saved address or enter a complete address below. New addresses are saved when you place your order, up to five.</p>
                  <select id="saved-address" defaultValue="" className="w-full rounded-lg border p-2 dark:bg-zinc-900" onChange={event => {
                    const address = savedAddresses.find(item => item.id === event.target.value);
                    if (!address) return;
                    setFullName(address.fullName); setPhoneNumber(address.phoneNumber);
                    setProvince(address.province); setAddressLine(address.addressLine);
                    setCity(POPULAR_CITIES.includes(address.city) ? address.city : "Other");
                    setCustomCity(address.city); setNearestLandmark(address.nearestLandmark || "");
                    setPostalCode(address.postalCode || ""); setErrors({}); setSubmitError("");
                  }}>
                    <option value="">Enter an address below</option>
                    {savedAddresses.map(address => <option key={address.id} value={address.id}>{address.addressLine}, {address.city}, {address.province}</option>)}
                  </select>
                  <Link href="/account" className="mt-2 inline-block text-xs text-amber-600">Manage saved addresses</Link>
                </div>
              )}
              {/* Section 1: Customer Contact */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  1. Contact Information
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label htmlFor="fullName" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      required
                      placeholder="e.g. Muhammad Usman"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                      }}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 dark:bg-zinc-800 dark:text-white ${
                        errors.fullName
                          ? "border-red-500 focus:ring-red-400/30"
                          : "border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20 dark:border-zinc-700"
                      }`}
                    />
                    {errors.fullName && <p className="mt-1 text-xs text-red-500 font-medium">{errors.fullName}</p>}
                  </div>

                  {/* Pakistani Mobile Number */}
                  <div>
                    <label htmlFor="phoneNumber" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                      Pakistani Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      required
                      placeholder="03XXXXXXXXX (e.g. 03001234567)"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
                      }}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 dark:bg-zinc-800 dark:text-white ${
                        errors.phoneNumber
                          ? "border-red-500 focus:ring-red-400/30"
                          : "border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20 dark:border-zinc-700"
                      }`}
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-xs text-red-500 font-medium">{errors.phoneNumber}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                      Email Address <span className="text-zinc-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder="e.g. usman@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Pakistan Shipping Address */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  2. Shipping Address (Pakistan)
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Province Dropdown */}
                  <div>
                    <label htmlFor="province" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                      Province <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="province"
                      value={province}
                      onChange={(e) => setProvince(e.target.value as any)}
                      className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-900 focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    >
                      {PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label htmlFor="city" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="city"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
                      }}
                      className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-900 focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    >
                      {POPULAR_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="Other">Other City...</option>
                    </select>

                    {city === "Other" && (
                      <input
                        type="text"
                        placeholder="Type your city name"
                        value={customCity}
                        onChange={(e) => {
                          setCustomCity(e.target.value);
                          if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
                        }}
                        className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      />
                    )}
                    {errors.city && <p className="mt-1 text-xs text-red-500 font-medium">{errors.city}</p>}
                  </div>

                  {/* Complete Delivery Address */}
                  <div className="sm:col-span-2">
                    <label htmlFor="addressLine" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                      Complete Delivery Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="addressLine"
                      required
                      placeholder="e.g. House # 14-B, Street 5, Sector F-8/2 or DHA Phase 5"
                      value={addressLine}
                      onChange={(e) => {
                        setAddressLine(e.target.value);
                        if (errors.addressLine) setErrors((prev) => ({ ...prev, addressLine: undefined }));
                      }}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 dark:bg-zinc-800 dark:text-white ${
                        errors.addressLine
                          ? "border-red-500 focus:ring-red-400/30"
                          : "border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20 dark:border-zinc-700"
                      }`}
                    />
                    {errors.addressLine && (
                      <p className="mt-1 text-xs text-red-500 font-medium">{errors.addressLine}</p>
                    )}
                  </div>

                  {/* Nearest Landmark */}
                  <div>
                    <label htmlFor="nearestLandmark" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                      Nearest Landmark <span className="text-zinc-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      id="nearestLandmark"
                      placeholder="e.g. Near Gol Masjid or Packages Mall"
                      value={nearestLandmark}
                      onChange={(e) => setNearestLandmark(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label htmlFor="postalCode" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                      Postal Code <span className="text-zinc-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      placeholder="e.g. 54000"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none font-mono dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Optional Order Notes */}
                <div className="pt-2">
                  <label htmlFor="orderNotes" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    Special Delivery Instructions / Order Notes <span className="text-zinc-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="orderNotes"
                    rows={2}
                    placeholder="e.g. Please deliver after 2 PM or call before arriving..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Section 3: Payment Method (Cash on Delivery) */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  3. Payment Method
                </h2>

                <div className="rounded-xl border-2 border-amber-500 bg-amber-500/10 p-4 flex items-start gap-3">
                  <div className="mt-0.5 text-xl">💵</div>
                  <div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-white">
                      Cash on Delivery (COD)
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                      Pay securely with cash to the courier rider upon delivery at your doorstep anywhere in Pakistan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 py-4 text-center text-sm font-black text-zinc-950 shadow-lg shadow-amber-500/25 transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? "Processing Order..." : `Place Order (COD) • ${formatPKR(total)}`}
              </button>
            </form>
          </div>

          {/* ── Right Column: Order Summary & Item Personalizations (5 cols) ── */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Order Summary ({itemCount} {itemCount === 1 ? "item" : "items"})
                </h3>
                <Link href="/cart" className="text-xs font-semibold text-amber-600 hover:underline dark:text-amber-400">
                  Edit Cart
                </Link>
              </div>

              {/* Items List */}
              <div className="mt-4 space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 rounded-lg bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                          {item.image && (
                            <Image src={item.image} alt={item.productName} fill className="object-cover" sizes="48px" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1">
                            {item.productName}
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            Qty: <strong className="text-zinc-700 dark:text-zinc-300">{item.quantity}</strong> × {formatPKR(item.unitPrice)}
                          </p>
                          {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                            <div className="mt-0.5 text-[10px] text-zinc-400">
                              {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(", ")}
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="text-xs font-bold text-zinc-900 dark:text-white shrink-0">
                        {formatPKR(item.unitPrice * item.quantity)}
                      </span>
                    </div>

                    {/* Laser Engraving Details */}
                    {item.customization?.engravingText && (
                      <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200/60 p-2 text-[11px] dark:bg-amber-950/30 dark:border-amber-900/40">
                        <span className="font-bold text-amber-800 dark:text-amber-400 block text-[10px] uppercase">
                          Laser Engraving Text:
                        </span>
                        <span className="font-mono font-bold text-zinc-900 dark:text-white">
                          "{item.customization.engravingText}"
                        </span>
                        <div className="mt-0.5 flex flex-wrap gap-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                          {item.customization.fontChoice && <span>Font: {item.customization.fontChoice}</span>}
                          {item.customization.engravingLocation && <span>Loc: {item.customization.engravingLocation}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="mt-6 border-t border-zinc-100 pt-4 space-y-2 dark:border-zinc-800 text-xs">
                <CouponBox items={items} signature={couponSignature} applied={appliedCoupon} onChange={setCoupon} signedIn={Boolean(customer)} />
                {discount > 0 && <div className="flex justify-between text-green-700 dark:text-green-400"><span>Coupon discount</span><span>−{formatPKR(discount)}</span></div>}
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Subtotal</span>
                  <span>{formatPKR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Nationwide Courier Delivery</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatPKR(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-zinc-900 dark:text-white border-t border-zinc-100 dark:border-zinc-800 pt-3">
                  <span>Grand Total (PKR)</span>
                  <span className="text-amber-600 dark:text-amber-400">{formatPKR(total)}</span>
                </div>
              </div>

              {/* Trust signals */}
              <div className="mt-6 grid grid-cols-2 gap-2 text-[10px] text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                <span className="flex items-center gap-1">✓ Nationwide TCS / Leopard</span>
                <span className="flex items-center gap-1">✓ Precision Laser Proof</span>
                <span className="flex items-center gap-1">✓ Pay Cash at Doorstep</span>
                <span className="flex items-center gap-1">✓ Studio QC Tested</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
