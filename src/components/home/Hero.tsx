import Image from "next/image";

export default function Hero({ title, description }: { title?: string; description?: string }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      {/* Decorative ambient gradient glow */}
      <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-20 left-10 h-80 w-80 rounded-full bg-amber-600/10 blur-[100px]" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Brand Copy & CTAs */}
          <div className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-xs">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Laser &amp; UV Precision Marking Studio</span>
              <span className="text-amber-500">•</span>
              <span>Pakistan Only</span>
            </div>

            {/* Headline */}
            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl xl:text-6xl">
              <span className="block text-amber-400 uppercase tracking-wider text-base sm:text-lg font-bold mb-2">
                Make It Personal
              </span>
              <span className="block leading-tight">
                {title || "Custom Engraved Gifts Made Just for You"}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-zinc-300">
              {description || "Transform everyday essentials into timeless personal keepsakes. We customize executive pens, natural wooden cases, insulated bottles, and luxury gift sets with high-precision laser & UV engraving."}
            </p>

            {/* Value Highlights Pill Row */}
            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-zinc-300">
              <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-3 py-1.5 border border-white/10">
                <span className="text-emerald-400">✓</span>
                <span>Names &amp; Initials</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-3 py-1.5 border border-white/10">
                <span className="text-emerald-400">✓</span>
                <span>Logo &amp; Brand Marking</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-3 py-1.5 border border-white/10">
                <span className="text-emerald-400">✓</span>
                <span>Cash on Delivery (PKR)</span>
              </div>
            </div>

            {/* Call to Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <a
                href="#featured-products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-7 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/25 transition-all hover:from-amber-400 hover:to-amber-500 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Shop Now</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>

              <a
                href="#categories"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-7 py-3.5 text-sm font-semibold text-zinc-100 backdrop-blur-sm transition-all hover:bg-zinc-700 hover:border-zinc-600"
              >
                <span>Explore Personalized Gifts</span>
              </a>
            </div>

            {/* Trust Footer line */}
            <div className="mt-10 flex items-center gap-6 pt-6 border-t border-zinc-800/80 text-xs text-zinc-400">
              <div>
                <span className="block font-bold text-zinc-200 text-sm">100%</span>
                <span>Permanent Laser Etch</span>
              </div>
              <div className="h-8 w-px bg-zinc-800" />
              <div>
                <span className="block font-bold text-zinc-200 text-sm">3–5 Days</span>
                <span>Nationwide Delivery</span>
              </div>
              <div className="h-8 w-px bg-zinc-800" />
              <div>
                <span className="block font-bold text-zinc-200 text-sm">COD</span>
                <span>Pay on Arrival</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Showcase Image with Floating Engraving Badge */}
          <div className="relative lg:col-span-5 flex justify-center">
            <div className="group relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-700/60 bg-zinc-900 shadow-2xl transition-all">
              <div className="aspect-16/10 sm:aspect-4/3 relative w-full overflow-hidden">
                <Image
                  src="/images/hero-gifts.jpg"
                  alt="LaserUVCreatives Luxury Engraved Gifts: Wooden Pen Case, Matte Metal Pen, and Engraved Insulated Flask"
                  fill
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 500px"
                />
                {/* Subtle gradient overlay at bottom of image */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
              </div>

              {/* Floating Badge on Image */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl border border-white/10 bg-zinc-900/90 p-3.5 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Live Customization Ready</h3>
                    <p className="text-[11px] text-zinc-400">Add names, messages &amp; corporate logos</p>
                  </div>
                </div>
                <span className="hidden sm:inline rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                  Ready in Pakistan
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
