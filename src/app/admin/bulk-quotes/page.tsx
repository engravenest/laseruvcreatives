"use client";

import React, { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { formatPKR } from "@/lib/utils";
import { buildBulkLeadWhatsAppUrl } from "@/lib/adminWhatsApp";
import { BulkQuoteLead } from "@/types/admin";

export default function AdminBulkQuotesPage() {
  const { bulkLeads, updateLeadStatus } = useAdmin();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [editingQuotedId, setEditingQuotedId] = useState<string | null>(null);
  const [quotedAmount, setQuotedAmount] = useState<number>(0);

  const filteredLeads = bulkLeads.filter((lead) => {
    return selectedStatus === "all" || lead.status === selectedStatus;
  });

  const handleLaunchWhatsApp = (lead: BulkQuoteLead) => {
    const url = buildBulkLeadWhatsAppUrl(lead);
    window.open(url, "_blank");
  };

  const handleSaveQuote = (leadId: string) => {
    updateLeadStatus(leadId, "quote_sent", quotedAmount);
    setEditingQuotedId(null);
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              B2B Corporate Inquiries
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Bulk Quotation Requests
          </h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Track inquiries submitted through the store bulk-order configurator and respond via WhatsApp.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
          Total Leads: {bulkLeads.length}
        </div>
      </div>

      {/* ── Status Filter Tabs ───────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-800">
        {[
          { id: "all", label: "All Leads" },
          { id: "new", label: "New (Action Required)" },
          { id: "contacted", label: "Contacted" },
          { id: "quote_sent", label: "Quote Sent" },
          { id: "converted", label: "Converted / Closed" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedStatus(tab.id)}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              selectedStatus === tab.id
                ? "bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Leads Table ──────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 shadow-xl backdrop-blur-md overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-600 dark:text-zinc-400">
            No bulk inquiry leads found for the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/60 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                <tr>
                  <th className="px-5 py-3.5">Quote # & Date</th>
                  <th className="px-5 py-3.5">Client & Company</th>
                  <th className="px-5 py-3.5">Product & Quantity</th>
                  <th className="px-5 py-3.5">Customization Requirements</th>
                  <th className="px-5 py-3.5">Status & Quoted Rate</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-zinc-100/30 dark:hover:bg-zinc-800/30 transition-colors">
                    {/* Quote ID & Date */}
                    <td className="px-5 py-4 whitespace-nowrap font-mono font-bold text-cyan-400">
                      {lead.quoteNumber}
                      <span className="block font-sans text-[10px] font-normal text-zinc-500">
                        {new Date(lead.createdAt).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </td>

                    {/* Client & Organization */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-zinc-900 dark:text-white">{lead.fullName}</div>
                      {lead.companyName && (
                        <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                          {lead.companyName}
                        </div>
                      )}
                      <div className="text-[10px] text-zinc-600 dark:text-zinc-400 font-mono">
                        {lead.whatsappNumber}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        City: <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{lead.deliveryCity}</span>
                      </div>
                    </td>

                    {/* Product & Quantity */}
                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-semibold text-zinc-900 dark:text-white line-clamp-1">{lead.productName}</div>
                      <div className="mt-1 inline-block rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-2 py-0.5 text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                        Quantity: {lead.quantity} units
                      </div>
                      {lead.requiredDate && (
                        <div className="text-[10px] text-zinc-600 dark:text-zinc-400 mt-1">
                          Target: {lead.requiredDate}
                        </div>
                      )}
                    </td>

                    {/* Customization Specs */}
                    <td className="px-5 py-4 max-w-xs">
                      <div className="text-zinc-700 dark:text-zinc-300 line-clamp-2">
                        {lead.customizationRequirements}
                      </div>
                      {lead.logoFileName && (
                        <div className="mt-1 text-[10px] text-cyan-400 font-mono">
                          Logo: {lead.logoFileName}
                        </div>
                      )}
                    </td>

                    {/* Status & Quoted Amount */}
                    <td className="px-5 py-4 whitespace-nowrap space-y-1.5">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value as any)}
                        className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-2.5 py-1 text-xs text-zinc-900 dark:text-white focus:border-cyan-500"
                      >
                        <option value="new">New Lead</option>
                        <option value="contacted">Contacted</option>
                        <option value="quote_sent">Quote Sent</option>
                        <option value="converted">Converted / Won</option>
                        <option value="declined">Declined</option>
                      </select>

                      <div>
                        {editingQuotedId === lead.id ? (
                          <div className="flex items-center gap-1 mt-1">
                            <input
                              type="number"
                              placeholder="PKR"
                              value={quotedAmount}
                              onChange={(e) => setQuotedAmount(Number(e.target.value))}
                              className="w-24 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-1.5 py-0.5 text-xs text-zinc-900 dark:text-white font-bold"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveQuote(lead.id)}
                              className="rounded bg-cyan-500 px-1.5 py-0.5 text-[10px] font-bold text-zinc-950"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {lead.quotedAmountPKR ? (
                              <span className="font-black text-amber-700 dark:text-amber-400 text-xs">
                                {formatPKR(lead.quotedAmountPKR)}
                              </span>
                            ) : (
                              <span className="text-[10px] text-zinc-500 italic">No quote set</span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingQuotedId(lead.id);
                                setQuotedAmount(lead.quotedAmountPKR || 0);
                              }}
                              className="text-[10px] text-zinc-600 dark:text-zinc-400 hover:text-cyan-400 underline"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => handleLaunchWhatsApp(lead)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-900/50 hover:border-emerald-500 transition-colors shadow-sm"
                        title="Open WhatsApp with customized quotation template"
                      >
                        <svg className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1.004.549 1.76.84 2.806.84 3.18 0 5.767-2.587 5.768-5.766.001-3.182-2.585-5.823-5.768-5.823zm3.364 8.223c-.144.405-.837.774-1.17.824-.312.045-.698.077-2.18-.535-1.787-.736-2.923-2.55-3.012-2.67-.09-.12-0.722-.962-.722-1.836 0-.874.457-1.303.62-1.482.164-.18.358-.225.477-.225.12 0 .239.001.344.006.11.005.258-.042.404.308.15.361.512 1.25.557 1.342.045.091.075.197.015.316-.06.12-.09.196-.18.3-.09.105-.189.234-.27.315-.091.09-.186.189-.08.371.106.182.47 0.776 1.01 1.257.695.62 1.28.812 1.462.903.181.09.288.076.395-.045.106-.12.457-.532.578-.713.12-.182.24-.151.405-.09.165.061 1.045.492 1.226.582.18.09.3.136.345.211.045.076.045.436-.099.841z" />
                          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.054 22l4.982-1.308C8.47 21.555 10.18 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.637 0-3.16-.484-4.437-1.314l-.318-.208-2.955.775.789-2.879-.228-.363C3.96 14.898 3.4 13.49 3.4 12c0-4.742 3.858-8.6 8.6-8.6 4.741 0 8.6 3.858 8.6 8.6 0 4.741-3.859 8.6-8.6 8.6z" />
                        </svg>
                        <span>Reply on WhatsApp</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
