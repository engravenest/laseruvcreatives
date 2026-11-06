export default function WhyUs() {
  const pillars = [
    {
      title: "Personalized Products",
      description:
        "Every single item is tailored to your exact recipient. Whether it is an individual name, custom Urdu calligraphy, or an anniversary date, we make it one-of-a-kind.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      title: "Quality Laser & UV Engraving",
      description:
        "We never use vinyl stickers or temporary prints that peel away. Our industrial fiber lasers and UV printers achieve deep, crisp, permanent marks that last a lifetime.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: "Gift-Ready Presentation",
      description:
        "No extra gift wrapping required. Our products arrive nestled in luxurious presentation boxes, velvet inserts, and satin ribbons ready to impress your loved one or client.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V4a2 2 0 10-2 2h2zm0 13a9 9 0 100-18 9 9 0 000 18z" />
        </svg>
      ),
    },
    {
      title: "Pakistan-Wide Delivery & COD",
      description:
        "From Karachi to Khyber, we dispatch through premier courier partners (TCS, Leopard, PostEx). Pay safely in Pakistani Rupees when the parcel reaches your door.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Direct Customer Service",
      description:
        "As a dedicated single-vendor studio, you communicate directly with the artisans. We share digital previews before engraving to ensure 100% spelling accuracy.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="why-us" className="py-20 bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-200/80 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            The LaserUVCreatives Promise
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
            Why Choose LaserUVCreatives?
          </h2>
          <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
            We combine high-tech precision engraving machines with genuine passion for meaningful gifting.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((item, idx) => (
            <div
              key={item.title}
              className={`rounded-2xl border border-zinc-200 bg-white p-7 shadow-xs transition-all duration-300 hover:border-amber-400/80 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-amber-500/80 ${
                idx === 3 ? "sm:col-span-1 lg:col-span-1" : ""
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400 mb-5">
                {item.icon}
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {item.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
