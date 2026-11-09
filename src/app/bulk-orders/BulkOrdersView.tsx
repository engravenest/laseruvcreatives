"use client";

import type { SitePage } from "@/types/site";
import { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { STORE_CONFIG } from "@/constants/store";
import { PRODUCTS } from "@/data/products";
import {
  BulkQuoteData,
  buildWhatsAppQuoteUrl,
  formatBulkQuoteMessage,
} from "@/lib/whatsapp";
import { isValidPakistaniPhone } from "@/lib/utils";
import { saveBulkLeadToStore } from "@/lib/storeSync";
import { BulkQuoteLead } from "@/types/admin";

// Pre-defined popular delivery cities in Pakistan for quick selection
const POPULAR_PAKISTAN_CITIES = [
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
  "Other City",
];

// Pre-defined bulk quantity quick tiers
const QUANTITY_TIERS = [25, 50, 100, 250, 500, 1000];

// Bulk Order Examples / Use Cases for visual reference
const BULK_USE_CASES = [
  {
    icon: "🏢",
    title: "Corporate & Executive Gifts",
    description:
      "Employee onboarding kits, executive branded pens, company logo insulated bottles, and client appreciation gift sets.",
    badge: "Most Popular",
    suggestedQty: "50–500 pcs",
  },
  {
    icon: "💍",
    title: "Wedding & Nikah Favors",
    description:
      "Artisanal wooden pens engraved with the couple's names & wedding date, matching engraved wooden gift boxes, and bridesmaids/groomsmen favors.",
    badge: "Keepsake",
    suggestedQty: "50–300 pcs",
  },
  {
    icon: "🎓",
    title: "School, College & University",
    description:
      "Graduation souvenirs, alumni batch reunion gifts, student council honors, and teacher appreciation engraved writing instruments.",
    badge: "Academia",
    suggestedQty: "100–1000 pcs",
  },
  {
    icon: "👔",
    title: "Employee Milestones & Awards",
    description:
      "Work anniversary commemorations, high-performer recognitions, sales team rewards, and annual gala giveaways with individual employee names.",
    badge: "HR & People",
    suggestedQty: "25–200 pcs",
  },
  {
    icon: "🎪",
    title: "Conferences, Seminars & Events",
    description:
      "VIP speaker presentation boxes, delegate writing sets, symposium gifts, and commemorative thermal flasks.",
    badge: "Events",
    suggestedQty: "100–500 pcs",
  },
  {
    icon: "🏷️",
    title: "Promotional & Brand Merchandise",
    description:
      "High-perceived-value client giveaways, exhibition swag, trade show incentives, and durable PR packages that last for years.",
    badge: "Branding",
    suggestedQty: "50–1000+ pcs",
  },
];

interface FormErrors {
  fullName?: string;
  whatsappNumber?: string;
  productName?: string;
  quantity?: string;
  deliveryCity?: string;
}

function BulkOrdersContent({ page }: { page: SitePage }) {
  const searchParams = useSearchParams();
  const prefilledProduct = searchParams.get("product") || "";

  // Form State
  const [fullName, setFullName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [email, setEmail] = useState("");
  const [productName, setProductName] = useState(prefilledProduct);
  const [quantity, setQuantity] = useState<number | string>(50);
  const [customizationRequirements, setCustomizationRequirements] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("Lahore");
  const [customCity, setCustomCity] = useState("");
  const [requiredDate, setRequiredDate] = useState("");
  const [additionalRequirements, setAdditionalRequirements] = useState("");

  // Logo upload state (client-side preview simulation)
  const [logoFile, setLogoFile] = useState<{
    name: string;
    preview?: string;
    sizeKb: number;
  } | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  // Validation & Submission States
  const [errors, setErrors] = useState<FormErrors>({});
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [generatedWhatsAppUrl, setGeneratedWhatsAppUrl] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  const formTopRef = useRef<HTMLDivElement>(null);

  // Sync if query param changes dynamically
  useEffect(() => {
    if (prefilledProduct && !productName) {
      setProductName(prefilledProduct);
    }
  }, [prefilledProduct, productName]);

  // Handle logo file upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      setLogoError("File size exceeds 10MB limit. Please upload a smaller logo.");
      return;
    }

    setLogoError(null);
    const isImage = file.type.startsWith("image/");
    const previewUrl = isImage ? URL.createObjectURL(file) : undefined;

    setLogoFile({
      name: file.name,
      preview: previewUrl,
      sizeKb: Math.round(file.size / 1024),
    });
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoError(null);
  };

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Please enter your full name.";
    }

    const cleanPhone = whatsappNumber.replace(/[\s-]/g, "");
    if (!cleanPhone) {
      newErrors.whatsappNumber = "WhatsApp / Mobile number is required.";
    } else if (!isValidPakistaniPhone(whatsappNumber) && cleanPhone.length < 10) {
      newErrors.whatsappNumber =
        "Please enter a valid Pakistani mobile number (e.g. 0300 1234567 or +92 300 1234567).";
    }

    if (!productName.trim()) {
      newErrors.productName = "Please specify the product or item type.";
    }

    const qtyNum = Number(quantity);
    if (!quantity || isNaN(qtyNum) || qtyNum <= 0) {
      newErrors.quantity = "Estimated quantity must be greater than zero.";
    }

    const effectiveCity = deliveryCity === "Other City" ? customCity : deliveryCity;
    if (!effectiveCity.trim()) {
      newErrors.deliveryCity = "Please enter your preferred delivery city.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submission handler — Generates WhatsApp URL and redirects
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to form error section if needed
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const effectiveCity = deliveryCity === "Other City" ? customCity : deliveryCity;

    const quotePayload: BulkQuoteData = {
      fullName,
      whatsappNumber,
      email: email || undefined,
      productName,
      quantity,
      customizationRequirements,
      deliveryCity: effectiveCity,
      requiredDate: requiredDate || undefined,
      additionalRequirements: additionalRequirements || undefined,
      logoFileName: logoFile?.name,
    };

    // Generate WhatsApp URL using central configuration
    const waUrl = buildWhatsAppQuoteUrl(quotePayload);
    setGeneratedWhatsAppUrl(waUrl);
    setSubmittedSuccess(true);

    // Save lead to admin dashboard store
    try {
      const newLead: BulkQuoteLead = {
        id: `lead-${Date.now()}`,
        quoteNumber: `QUOTE-${Math.floor(100 + Math.random() * 900)}`,
        fullName,
        whatsappNumber,
        email: email || undefined,
        productName,
        quantity,
        deliveryCity: effectiveCity,
        requiredDate: requiredDate || undefined,
        customizationRequirements,
        logoFileName: logoFile?.name,
        additionalRequirements: additionalRequirements || undefined,
        status: "new",
        createdAt: new Date().toISOString(),
      };
      saveBulkLeadToStore(newLead);
    } catch (e) {
      console.error(e);
    }

    // Open WhatsApp in new tab/window
    if (typeof window !== "undefined") {
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Copy inquiry text to clipboard
  const handleCopyInquiry = () => {
    const effectiveCity = deliveryCity === "Other City" ? customCity : deliveryCity;
    const msg = formatBulkQuoteMessage({
      fullName,
      whatsappNumber,
      email: email || undefined,
      productName,
      quantity,
      customizationRequirements,
      deliveryCity: effectiveCity,
      requiredDate: requiredDate || undefined,
      additionalRequirements: additionalRequirements || undefined,
      logoFileName: logoFile?.name,
    });

    navigator.clipboard.writeText(msg).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 3000);
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-10 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-zinc-900 dark:text-white">
            Bulk &amp; Custom Orders
          </span>
        </nav>

        {/* Hero Section */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 mb-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 mb-4 border border-amber-500/20">
              <span>🇵🇰 Wholesale &amp; Corporate Studio</span>
              <span>•</span>
              <span>All Pakistan Delivery</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">{page.title}</h1>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-zinc-600 dark:text-zinc-300 font-medium">{page.description}</p>

            {/* Quick Guarantees Row */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-bold text-sm dark:text-emerald-400">
                  ✓
                </span>
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Volume Tier Discounts
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-bold text-sm dark:text-emerald-400">
                  ✓
                </span>
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Free WhatsApp Mockup
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-bold text-sm dark:text-emerald-400">
                  ✓
                </span>
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Individual Names at Scale
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-bold text-sm dark:text-emerald-400">
                  ✓
                </span>
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  COD or Bank Transfer
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid: Form (Col 1-7) & Sidebar/Examples (Col 8-12) */}
        <div ref={formTopRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Quotation Form Container ───────────────────────────────── */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-5 dark:border-zinc-800 mb-6">
                <div>
                  <h2 className="text-xl font-black text-zinc-900 dark:text-white">
                    Request a Custom Quotation
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Fill out the specifications below. Our studio team will calculate wholesale rates and message you back promptly on WhatsApp.
                  </p>
                </div>
                <span className="hidden sm:inline-flex rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                  No Account Required
                </span>
              </div>

              {/* Success Notification Banner */}
              {submittedSuccess && generatedWhatsAppUrl && (
                <div className="mb-6 rounded-2xl border border-emerald-500/40 bg-emerald-50 p-5 dark:bg-emerald-950/30 dark:border-emerald-500/30">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🎉</span>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                        Quotation Request Prepared!
                      </h3>
                      <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                        WhatsApp has been opened in a new tab with your pre-filled inquiry. If it didn&apos;t open automatically, use the buttons below:
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2.5">
                        <a
                          href={generatedWhatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-colors"
                        >
                          <span>💬 Open WhatsApp Again</span>
                        </a>
                        <button
                          type="button"
                          onClick={handleCopyInquiry}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600/40 bg-white px-3.5 py-2 text-xs font-bold text-emerald-800 shadow-2xs hover:bg-emerald-100/50 dark:bg-zinc-900 dark:text-emerald-300 transition-colors"
                        >
                          <span>{copiedText ? "✓ Copied to Clipboard!" : "📋 Copy Message Text"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {/* ── Section 1: Contact Information ────────────────────── */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    1. Contact Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5"
                      >
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                        }}
                        placeholder="e.g. Muhammad Usman"
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 dark:bg-zinc-800 dark:text-white ${
                          errors.fullName
                            ? "border-red-500 focus:ring-red-400/30"
                            : "border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20 dark:border-zinc-700"
                        }`}
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-xs text-red-500 font-medium">{errors.fullName}</p>
                      )}
                    </div>

                    {/* WhatsApp / Mobile Number */}
                    <div>
                      <label
                        htmlFor="whatsappNumber"
                        className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5"
                      >
                        WhatsApp / Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          id="whatsappNumber"
                          value={whatsappNumber}
                          onChange={(e) => {
                            setWhatsappNumber(e.target.value);
                            if (errors.whatsappNumber) setErrors((prev) => ({ ...prev, whatsappNumber: undefined }));
                          }}
                          placeholder="e.g. 0300 1234567"
                          className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 dark:bg-zinc-800 dark:text-white ${
                            errors.whatsappNumber
                              ? "border-red-500 focus:ring-red-400/30"
                              : "border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20 dark:border-zinc-700"
                          }`}
                        />
                      </div>
                      {errors.whatsappNumber ? (
                        <p className="mt-1 text-xs text-red-500 font-medium">{errors.whatsappNumber}</p>
                      ) : (
                        <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                          We will send quotation and design mockups to this number.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email (Optional) */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5"
                    >
                      Email Address <span className="text-zinc-400 font-normal">(Optional for official invoice)</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. usman@company.com"
                      className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* ── Section 2: Order Specifications ───────────────────── */}
                <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    2. Order Requirements
                  </h3>

                  {/* Product / Product Type */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="productName"
                        className="block text-xs font-bold text-zinc-800 dark:text-zinc-200"
                      >
                        Product / Product Type <span className="text-red-500">*</span>
                      </label>
                      {prefilledProduct && (
                        <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                          Prefilled from product page
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      id="productName"
                      value={productName}
                      onChange={(e) => {
                        setProductName(e.target.value);
                        if (errors.productName) setErrors((prev) => ({ ...prev, productName: undefined }));
                      }}
                      placeholder="e.g. Customized Wooden Pen with Box, 500ml Insulated Bottle..."
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 dark:bg-zinc-800 dark:text-white ${
                        errors.productName
                          ? "border-red-500 focus:ring-red-400/30"
                          : "border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20 dark:border-zinc-700"
                      }`}
                    />
                    {errors.productName && (
                      <p className="mt-1 text-xs text-red-500 font-medium">{errors.productName}</p>
                    )}

                    {/* Quick suggestion pills from catalog */}
                    <div className="mt-2.5">
                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mr-2">
                        Quick Select:
                      </span>
                      <div className="inline-flex flex-wrap gap-1.5 mt-1">
                        {PRODUCTS.slice(0, 4).map((p) => (
                          <button
                            type="button"
                            key={p.id}
                            onClick={() => {
                              setProductName(p.name);
                              if (errors.productName) setErrors((prev) => ({ ...prev, productName: undefined }));
                            }}
                            className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                              productName === p.name
                                ? "border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-bold"
                                : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                            }`}
                          >
                            {p.name.split("with")[0] || p.name}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setProductName("Custom Corporate Gift Box Set")}
                          className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        >
                          Custom Gift Box Set
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Estimated Quantity */}
                  <div>
                    <label
                      htmlFor="quantity"
                      className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5"
                    >
                      Estimated Quantity <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        id="quantity"
                        min="1"
                        step="1"
                        value={quantity}
                        onChange={(e) => {
                          setQuantity(e.target.value);
                          if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: undefined }));
                        }}
                        className={`w-36 rounded-xl border px-3.5 py-2.5 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 dark:bg-zinc-800 dark:text-white ${
                          errors.quantity
                            ? "border-red-500 focus:ring-red-400/30"
                            : "border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20 dark:border-zinc-700"
                        }`}
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {QUANTITY_TIERS.map((tier) => (
                          <button
                            type="button"
                            key={tier}
                            onClick={() => {
                              setQuantity(tier);
                              if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: undefined }));
                            }}
                            className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                              Number(quantity) === tier
                                ? "border-amber-500 bg-amber-500 text-zinc-950 font-bold"
                                : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                            }`}
                          >
                            {tier} pcs
                          </button>
                        ))}
                      </div>
                    </div>
                    {errors.quantity && (
                      <p className="mt-1 text-xs text-red-500 font-medium">{errors.quantity}</p>
                    )}
                  </div>

                  {/* Customization Requirements */}
                  <div>
                    <label
                      htmlFor="customizationRequirements"
                      className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5"
                    >
                      Customization Requirements
                    </label>
                    <textarea
                      id="customizationRequirements"
                      rows={3}
                      value={customizationRequirements}
                      onChange={(e) => setCustomizationRequirements(e.target.value)}
                      placeholder="e.g. Individual employee names engraved on each pen barrel, company logo marked on box top, font preference..."
                      className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                    <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                      💡 Tip: You can send a list of individual names via Excel/WhatsApp later.
                    </p>
                  </div>

                  {/* Logo / Design Upload UI */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                      Logo / Design Reference <span className="text-zinc-400 font-normal">(Optional)</span>
                    </label>

                    {!logoFile ? (
                      <label className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 p-6 text-center cursor-pointer transition-colors hover:border-amber-400 hover:bg-amber-50/20 dark:border-zinc-700 dark:hover:border-amber-500 dark:hover:bg-zinc-800/50">
                        <svg
                          className="h-8 w-8 text-zinc-400 group-hover:text-amber-500 transition-colors mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
                          Click to upload logo or vector artwork
                        </span>
                        <span className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                          Supports PNG, JPG, SVG, PDF up to 10MB
                        </span>
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.svg,.pdf"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50/60 p-3.5 dark:border-amber-900/60 dark:bg-amber-950/20">
                        <div className="flex items-center gap-3">
                          {logoFile.preview ? (
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-amber-200 dark:border-amber-800 bg-white">
                              <Image
                                src={logoFile.preview}
                                alt="Logo Preview"
                                fill
                                className="object-contain p-1"
                              />
                            </div>
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs">
                              FILE
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                              {logoFile.name}
                            </p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              {logoFile.sizeKb} KB · Ready to share on WhatsApp
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="rounded-lg p-1.5 text-xs text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 transition-colors"
                          aria-label="Remove uploaded file"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    )}
                    {logoError && (
                      <p className="mt-1 text-xs text-red-500 font-medium">{logoError}</p>
                    )}
                  </div>
                </div>

                {/* ── Section 3: Delivery Details ───────────────────────── */}
                <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    3. Delivery &amp; Timeline
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Preferred Delivery City */}
                    <div>
                      <label
                        htmlFor="deliveryCity"
                        className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5"
                      >
                        Preferred Delivery City <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="deliveryCity"
                        value={deliveryCity}
                        onChange={(e) => {
                          setDeliveryCity(e.target.value);
                          if (errors.deliveryCity) setErrors((prev) => ({ ...prev, deliveryCity: undefined }));
                        }}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 dark:bg-zinc-800 dark:text-white ${
                          errors.deliveryCity
                            ? "border-red-500 focus:ring-red-400/30"
                            : "border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20 dark:border-zinc-700"
                        }`}
                      >
                        {POPULAR_PAKISTAN_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>

                      {deliveryCity === "Other City" && (
                        <div className="mt-2">
                          <input
                            type="text"
                            value={customCity}
                            onChange={(e) => {
                              setCustomCity(e.target.value);
                              if (errors.deliveryCity) setErrors((prev) => ({ ...prev, deliveryCity: undefined }));
                            }}
                            placeholder="Enter your city name in Pakistan"
                            className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                          />
                        </div>
                      )}
                      {errors.deliveryCity && (
                        <p className="mt-1 text-xs text-red-500 font-medium">{errors.deliveryCity}</p>
                      )}
                    </div>

                    {/* Required Delivery Date */}
                    <div>
                      <label
                        htmlFor="requiredDate"
                        className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5"
                      >
                        Required Delivery Date <span className="text-zinc-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="date"
                        id="requiredDate"
                        value={requiredDate}
                        onChange={(e) => setRequiredDate(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      />
                      <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                        Standard bulk lead time is 3–7 business days.
                      </p>
                    </div>
                  </div>

                  {/* Additional Requirements */}
                  <div>
                    <label
                      htmlFor="additionalRequirements"
                      className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5"
                    >
                      Additional Requirements / Notes <span className="text-zinc-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      id="additionalRequirements"
                      rows={2}
                      value={additionalRequirements}
                      onChange={(e) => setAdditionalRequirements(e.target.value)}
                      placeholder="e.g. Budget range per unit (PKR), velvet pouch packaging preferred, urgency note..."
                      className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* ── Prominent WhatsApp CTA Button ─────────────────────── */}
                <div className="pt-2">
                  <button
                    type="submit"
                    id="submit-whatsapp-quote"
                    className="w-full group flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 p-4 text-center font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:from-emerald-500 hover:to-emerald-600 hover:shadow-xl hover:shadow-emerald-600/35 active:scale-[0.99]"
                  >
                    {/* WhatsApp Icon */}
                    <svg className="h-6 w-6 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                    <div className="text-left">
                      <span className="block text-base sm:text-lg font-black tracking-wide leading-none">
                        Get Quote on WhatsApp
                      </span>
                      <span className="text-[11px] font-medium text-emerald-100">
                        Opens WhatsApp with your details pre-filled · Direct Studio Chat
                      </span>
                    </div>
                  </button>

                  <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
                    🔒 Your inquiry goes directly to LaserUVCreatives studio management. No spam guaranteed.
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* ── Right Column: Bulk-Order Examples & Trust (Col 8-12) ──── */}
          <div className="lg:col-span-5 space-y-6">
            {/* Direct WhatsApp Callout Card */}
            <div className="rounded-3xl border border-amber-300 bg-gradient-to-br from-amber-50 via-white to-amber-100/50 p-6 shadow-xs dark:border-amber-900/60 dark:bg-zinc-900 dark:from-zinc-900 dark:to-amber-950/20">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-zinc-950 font-black text-lg shadow-sm">
                  ⚡
                </span>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Need an Immediate Quote?
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Chat with our production manager
                  </p>
                </div>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                Have urgent deadlines or custom branding files? You can also message our WhatsApp line directly with your requirements:
              </p>
              <a
                href={`https://wa.me/${STORE_CONFIG.contact.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hello LaserUVCreatives, I am inquiring about a bulk / corporate order.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-xs font-bold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                <span>💬 WhatsApp: {STORE_CONFIG.contact.whatsapp}</span>
              </a>
            </div>

            {/* Bulk Order Use Cases & Categories (FEATURE 6) */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
                Popular Bulk Order Use Cases
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
                We fulfill personalized orders across all industries in Pakistan:
              </p>

              <div className="space-y-4">
                {BULK_USE_CASES.map((uc) => (
                  <div
                    key={uc.title}
                    className="group rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4 transition-colors hover:border-amber-300 hover:bg-amber-50/30 dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:border-amber-800"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{uc.icon}</span>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                          {uc.title}
                        </h4>
                      </div>
                      <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                        {uc.badge}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {uc.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-200/50 dark:border-zinc-700/50">
                      <span>Typical Order: {uc.suggestedQty}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setProductName(uc.title);
                          formTopRef.current?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="text-amber-600 hover:underline dark:text-amber-400"
                      >
                        Inquire This →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How Bulk Orders Work */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-4">
                How Bulk Ordering Works
              </h3>
              <ol className="space-y-3.5 text-xs text-zinc-600 dark:text-zinc-300">
                <li className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-zinc-950 font-bold text-[10px]">
                    1
                  </span>
                  <div>
                    <strong className="text-zinc-900 dark:text-white">Submit Specifications:</strong> Enter your product, quantity, and logo/name instructions.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-zinc-950 font-bold text-[10px]">
                    2
                  </span>
                  <div>
                    <strong className="text-zinc-900 dark:text-white">Wholesale Rate &amp; Mockup:</strong> We reply with discounted rates and share a digital 3D/HD mockup on WhatsApp.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-zinc-950 font-bold text-[10px]">
                    3
                  </span>
                  <div>
                    <strong className="text-zinc-900 dark:text-white">Sample Approval:</strong> For large corporate runs, we can mark a single sample for physical approval.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-zinc-950 font-bold text-[10px]">
                    4
                  </span>
                  <div>
                    <strong className="text-zinc-900 dark:text-white">Production &amp; Nationwide Delivery:</strong> Dispatched via tracked courier (TCS/Leopards/PostEx) to any city in Pakistan.
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fallback skeleton while Suspense hydrates query params
function BulkOrdersSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 py-12 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 animate-pulse">
        <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-6" />
        <div className="h-40 bg-zinc-200 dark:bg-zinc-800 rounded-3xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 h-96 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
          <div className="lg:col-span-5 h-96 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

export default function BulkOrdersPage({ page }: { page: SitePage }) {
  return (
    <Suspense fallback={<BulkOrdersSkeleton />}>
      <BulkOrdersContent page={page} />
    </Suspense>
  );
}
