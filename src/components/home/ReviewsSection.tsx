import { MOCK_REVIEWS } from "@/data/mockReviews";

export default function ReviewsSection() {
  return (
    <section id="reviews" className="py-20 bg-white dark:bg-zinc-950 border-t border-zinc-200/80 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Verified Feedback
            </span>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
              What Our Customers Say
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Trusted by gift-givers and corporate executives across Pakistan.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800">
            <div className="flex text-amber-500 text-sm">
              {"★".repeat(5)}
            </div>
            <span className="text-xs font-bold text-amber-950 dark:text-amber-300">
              4.9 / 5.0 Average Rating
            </span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MOCK_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div>
                {/* Rating and date */}
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400 text-sm">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <span className="text-[11px] text-zinc-400">{rev.date}</span>
                </div>

                {/* Purchased product tag */}
                <div className="mt-3">
                  <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    Purchased: {rev.productName}
                  </span>
                </div>

                {/* Review Text */}
                <p className="mt-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              {/* Customer Info */}
              <div className="mt-6 pt-4 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {rev.customerName}
                  </h4>
                  <span className="text-[11px] text-zinc-400">
                    📍 {rev.city}, Pakistan
                  </span>
                </div>
                {rev.verifiedPurchase && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <span>✓ Verified</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
