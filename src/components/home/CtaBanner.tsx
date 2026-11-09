import type { SiteSection } from "@/types/site";
export default function CtaBanner({ section }: { section?: SiteSection }) {
  return (
    <section id="contact" className="py-16 sm:py-20 bg-gradient-to-r from-amber-600 via-amber-700 to-zinc-900 text-white relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-black/30 p-8 sm:p-12 lg:p-16 border border-white/15 backdrop-blur-md">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            {/* Left Content */}
            <div className="lg:col-span-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-amber-300 border border-white/15">
                <span>🇵🇰 Direct Engraving Studio in Pakistan</span>
              </span>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">{section?.title ?? <> Ready to Create Something Truly Meaningful? </>}</h2>
              <p className="mt-4 text-base sm:text-lg text-zinc-200 max-w-2xl leading-relaxed">{section?.body ?? <> Whether you need a single engraved pen for a loved one or 500 branded gift boxes for a corporate annual event, we deliver crisp precision with nationwide Cash on Delivery. </>}</p>

              {/* Value Badges */}
              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-zinc-200">
                <span className="flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 backdrop-blur-xs">
                  ✓ Free Digital Design Preview
                </span>
                <span className="flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 backdrop-blur-xs">
                  ✓ Cash on Delivery (COD)
                </span>
                <span className="flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 backdrop-blur-xs">
                  ✓ Bulk Corporate Discounts
                </span>
              </div>
            </div>

            {/* Right Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 lg:col-span-4 justify-center">
              <a
                href="#featured-products"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 text-sm font-bold text-zinc-950 shadow-xl transition-all hover:bg-amber-100 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Browse &amp; Customize Products</span>
                <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>

              <a
                href="https://wa.me/923000000000?text=Hi%20LaserUVCreatives,%20I%20am%20interested%20in%20a%20custom%20engraved%20product!"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-xs transition-all hover:bg-white/20"
              >
                <span>💬 WhatsApp Custom Consultation</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
