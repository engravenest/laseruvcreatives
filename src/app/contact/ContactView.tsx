"use client";

import type { SitePage } from "@/types/site";
import { useState } from "react";
import { STORE_CONFIG } from "@/constants/store";

export default function ContactPage({ page }: { page: SitePage }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  // Honeypot field for bot spam prevention
  const [honeypot, setHoneypot] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          subject: subject.trim(),
          message: message.trim(),
          honeypot,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Failed to send your inquiry. Please try again.");
        return;
      }

      setSuccess(
        data.message ||
          "Thank you! Your message has been sent to engravenest@gmail.com. We will respond within 24 hours."
      );
      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch {
      setLoading(false);
      setError("Network error occurred while sending your message. Please check your connection.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-14 px-4 sm:px-6 lg:px-8 selection:bg-amber-500 selection:text-zinc-950">
      {/* Background glow accents */}
      <div className="pointer-events-none fixed top-1/4 right-10 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" />
      <div className="pointer-events-none fixed bottom-1/4 left-10 h-96 w-96 rounded-full bg-amber-600/5 blur-3xl" />

      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 mb-3">
            <span>✨ Get In Touch</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">{page.title}</h1>
          <p className="mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">{page.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information & Channels */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 p-6 backdrop-blur-xl shadow-xl space-y-5">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Studio Contact Info</h3>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Email Address</h4>
                  <a
                    href={`mailto:${STORE_CONFIG.supportEmail}`}
                    className="text-xs text-amber-700 dark:text-amber-400 font-semibold hover:underline"
                  >
                    {STORE_CONFIG.supportEmail}
                  </a>
                  <p className="text-[11px] text-zinc-500">Direct inquiries &amp; quote requests</p>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.54 1.761.819 2.796.819 3.179 0 5.767-2.587 5.768-5.766.001-3.18-2.587-5.766-5.768-5.766m0-2c4.288 0 7.768 3.479 7.768 7.766 0 4.288-3.48 7.766-7.768 7.766-1.328 0-2.485-.34-3.535-.935L4 20l1.196-4.373A7.747 7.747 0 014.263 11.938c0-4.287 3.48-7.766 7.768-7.766z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">WhatsApp Dispatch Desk</h4>
                  <a
                    href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    +{STORE_CONFIG.whatsappNumber}
                  </a>
                  <p className="text-[11px] text-zinc-500">Fast responses: 9:00 AM – 10:00 PM PKT</p>
                </div>
              </div>

              {/* Studio Location */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Studio &amp; Workshop</h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug">
                    {STORE_CONFIG.studioAddress}
                  </p>
                </div>
              </div>

              {/* Nationwide Logistics */}
              <div className="rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/80 p-3.5 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                🚚 <strong>Nationwide Courier:</strong> Dispatched via TCS &amp; Leopard with Cash on Delivery (COD) across Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, and all Pakistani cities.
              </div>
            </div>
          </div>

          {/* Contact Form Container */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Send an Inquiry</h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-6">
                All inquiries are transmitted securely to <span className="text-amber-700 dark:text-amber-400 font-mono font-semibold">engravenest@gmail.com</span>.
              </p>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-semibold text-rose-700 dark:text-rose-300">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 shrink-0 text-rose-700 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-300">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{success}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot field for bot spam prevention (invisible to users) */}
                <div className="hidden" aria-hidden="true">
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Your Full Name <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="contact-name"
                      required
                      placeholder="e.g. Asad Rehman"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/70 px-4 py-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-500 outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Email Address <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      required
                      placeholder="e.g. asad@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/70 px-4 py-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-500 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      id="contact-phone"
                      placeholder="e.g. 03001234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/70 px-4 py-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-500 outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Subject <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="contact-subject"
                      required
                      placeholder="e.g. Corporate Gift Set Inquiry"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/70 px-4 py-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-500 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Your Message <span className="text-amber-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    placeholder="Describe your personalization requirements, product quantities, or delivery date..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/70 px-4 py-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-500 outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  id="contact-submit-btn"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 text-xs font-bold text-zinc-950 shadow-md shadow-amber-500/25 transition-all hover:from-amber-400 hover:to-amber-500 active:scale-98 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin text-zinc-950" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Transmitting Message to Server...</span>
                    </>
                  ) : (
                    <span>Send Message to engravenest@gmail.com →</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
