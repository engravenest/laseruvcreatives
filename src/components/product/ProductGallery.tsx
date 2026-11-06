"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageObject {
  url: string;
  altText?: string;
  isMain?: boolean;
}

interface ProductGalleryProps {
  images: (string | ImageObject)[];
  productName: string;
  badge?: string;
}

export default function ProductGallery({
  images,
  productName,
  badge,
}: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  // Normalize image inputs
  const normalizedImages: { url: string; alt: string }[] = (images || []).map((img, idx) => {
    if (typeof img === "string") {
      return { url: img, alt: `${productName} view ${idx + 1}` };
    }
    return {
      url: img.url,
      alt: img.altText || `${productName} view ${idx + 1}`,
    };
  });

  const active = normalizedImages[selectedImage] || normalizedImages[0] || {
    url: "/images/cat-pens.jpg",
    alt: productName,
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Large Image Container */}
      <div className="relative aspect-4/3 sm:aspect-1/1 w-full overflow-hidden rounded-2xl border border-zinc-200/90 bg-zinc-100 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <Image
          src={active.url}
          alt={active.alt}
          fill
          unoptimized
          priority
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
        />

        {/* Badge overlay */}
        {badge && (
          <div className="absolute top-4 left-4">
            <span className="rounded-full bg-zinc-950/80 backdrop-blur-xs px-3 py-1 text-xs font-bold text-amber-300 border border-white/10 shadow-xs">
              {badge}
            </span>
          </div>
        )}

        {/* Laser Engraving Guarantee Ribbon */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl bg-zinc-950/85 px-3.5 py-2 backdrop-blur-md border border-white/10 text-white">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-amber-400">⚡</span>
            <span className="font-semibold text-[11px] sm:text-xs">Permanent Precision Laser &amp; UV Marking</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">100% Crisp</span>
        </div>
      </div>

      {/* Thumbnail Previews (if more than 1 image) */}
      {normalizedImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {normalizedImages.map((img, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                selectedImage === idx
                  ? "border-amber-500 shadow-md ring-2 ring-amber-500/20"
                  : "border-zinc-200 opacity-70 hover:opacity-100 dark:border-zinc-800"
              }`}
              aria-label={`View photo ${idx + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                unoptimized
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
