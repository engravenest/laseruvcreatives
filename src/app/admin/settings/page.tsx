"use client";

import React, { useState, useEffect } from "react";
import { useAdmin } from "@/context/AdminContext";

export default function AdminSettingsPage() {
  const { settings, updateSettings, resetDemoData } = useAdmin();

  const [storeName, setStoreName] = useState(settings.storeName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [studioAddress, setStudioAddress] = useState(settings.studioAddress);
  const [defaultCourier, setDefaultCourier] = useState(settings.defaultCourier);
  const [announcementText, setAnnouncementText] = useState(settings.announcementText);
  const [announcementEnabled, setAnnouncementEnabled] = useState(settings.announcementEnabled);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(settings.freeShippingThreshold);

  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setStoreName(settings.storeName);
    setTagline(settings.tagline);
    setWhatsappNumber(settings.whatsappNumber);
    setSupportEmail(settings.supportEmail);
    setStudioAddress(settings.studioAddress);
    setDefaultCourier(settings.defaultCourier);
    setAnnouncementText(settings.announcementText);
    setAnnouncementEnabled(settings.announcementEnabled);
    setFreeShippingThreshold(settings.freeShippingThreshold);
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName,
      tagline,
      whatsappNumber,
      supportEmail,
      studioAddress,
      defaultCourier,
      announcementText,
      announcementEnabled,
      freeShippingThreshold: Number(freeShippingThreshold),
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              System Configuration
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Store Settings
          </h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Configure contact parameters, domestic couriers, announcement banners, and shipping rules.
          </p>
        </div>

        {savedNotice && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 shadow-lg">
            ✓ Settings Saved Successfully
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Branding & Studio */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            1. Brand Identity & Physical Studio
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Store Name
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Laser Studio Address (Pakistan)
              </label>
              <input
                type="text"
                value={studioAddress}
                onChange={(e) => setStudioAddress(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Contact Channels & WhatsApp */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            2. Contact Channels & WhatsApp Bridge
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Store Official WhatsApp Number
              </label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="923327009017"
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-amber-500 focus:outline-none font-mono"
              />
              <p className="mt-1 text-[11px] text-zinc-500">
                Central number used by all customer click-to-chat links and quote requests.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Customer Support Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="engravenest@gmail.com"
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Domestic Couriers & Free Shipping */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            3. Domestic Logistics & Cash on Delivery (COD)
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Default Courier Partner
              </label>
              <select
                value={defaultCourier}
                onChange={(e) => setDefaultCourier(e.target.value as any)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="TCS">TCS Express (Nationwide)</option>
                <option value="Leopard Courier">Leopard Courier</option>
                <option value="PostEx">PostEx COD Express</option>
                <option value="Trax">Trax Logistics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Free Delivery Threshold (PKR)
              </label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-amber-500 focus:outline-none font-bold"
              />
              <p className="mt-1 text-[11px] text-zinc-500">
                Orders above this PKR amount qualify for Free Nationwide Shipping.
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: Storefront Announcement Bar */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              4. Storefront Header Announcement Bar
            </h2>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="announcementCheck"
                checked={announcementEnabled}
                onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-amber-500"
              />
              <label htmlFor="announcementCheck" className="text-xs font-bold text-zinc-900 dark:text-white cursor-pointer">
                Display on Storefront
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Banner Text Message
            </label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="e.g. Free Laser Engraving & Nationwide COD on All Executive Pens"
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => {
              if (confirm("Reset all store demo data and settings?")) {
                resetDemoData();
              }
            }}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          >
            Reset All Demo Data
          </button>

          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-xs font-bold text-zinc-950 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 active:scale-95 transition-all"
          >
            Save Store Settings
          </button>
        </div>
      </form>
    </div>
  );
}
