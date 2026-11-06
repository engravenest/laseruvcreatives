export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Choose Your Product",
      description:
        "Select from our curated collection of metal pens, handcrafted wooden cases, insulated bottles, or executive gift boxes.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      step: "02",
      title: "Personalize It",
      description:
        "Type your recipient's name, message, or select your preferred font. For corporate orders, provide your company logo.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
    },
    {
      step: "03",
      title: "We Engrave It",
      description:
        "Our specialized studio precisely burns, etches, and UV-marks your details permanently into wood, steel, or anodized metal.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      step: "04",
      title: "Receive Your Gift",
      description:
        "Packaged in gift-ready presentation boxes and delivered nationwide across Pakistan with convenient Cash on Delivery.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-zinc-900 text-white relative overflow-hidden">
      {/* Decorative background grid effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Simple &amp; Seamless Experience
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-3 text-base text-zinc-400">
            From your creative idea to a customized engraved masterpiece delivered right to your doorstep in four easy steps.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, idx) => (
            <div
              key={item.step}
              className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 backdrop-blur-xs transition-all duration-300 hover:border-amber-500/50 hover:bg-zinc-950"
            >
              <div>
                {/* Step indicator header */}
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <span className="text-2xl font-black text-zinc-700 group-hover:text-amber-500/80 transition-colors">
                    {item.step}
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-bold text-zinc-100">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  {item.description}
                </p>
              </div>

              {/* Connecting line hint */}
              {idx < 3 && (
                <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-zinc-700">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
