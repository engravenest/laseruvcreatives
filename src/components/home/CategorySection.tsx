"use client";
import { useCategories } from "@/lib/useCategories";
import Image from "next/image";

export default function CategorySection() {
  const CATEGORIES = useCategories();
  return (
    <section id="categories" className="py-20 bg-zinc-50 dark:bg-zinc-950/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Laser &amp; UV Collections
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
            Shop by Category
          </h2>
          <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
            Select from our initial lineup of personalized products, each carefully prepared and permanently marked in our Pakistan workshop.
          </p>
        </div>

        {/* Categories Grid: 2 top large cards + 3 bottom cards for harmonious visual rhythm */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat, idx) => (
            <div
              key={cat.id}
              className={`group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-amber-600 ${
                idx === 0 || idx === 1 ? "lg:col-span-1" : ""
              }`}
            >
              {/* Category Image */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {/* Gradient tint */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-zinc-950/20 to-transparent" />

                {/* Badge Tag */}
                <div className="absolute top-3.5 left-3.5">
                  <span className="rounded-full bg-zinc-900/80 backdrop-blur-sm px-3 py-1 text-[11px] font-semibold text-amber-300 border border-white/10">
                    Personalized gifts
                  </span>
                </div>

                {/* Bottom title overlay on image */}
                <div className="absolute bottom-3 left-3.5 right-3.5">
                  <span className="text-xs font-medium text-amber-200">{cat.productCount} products</span>
                  <h3 className="text-lg font-bold text-white drop-shadow-xs">{cat.name}</h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col justify-between">
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {cat.description}
                </p>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <a
                    href={`/shop?category=${cat.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                  >
                    <span>View Products</span>
                    <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  <span className="text-[10px] font-semibold uppercase text-zinc-400">COD in PKR</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
