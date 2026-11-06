"use client";

import React, { useState, useRef } from "react";

export interface AdminProductImage {
  id: string;
  url: string;
  altText: string;
  isMain: boolean;
  order: number;
}

interface ProductImageManagerProps {
  images: AdminProductImage[];
  onChange: (images: AdminProductImage[]) => void;
  productName?: string;
}

const MAX_SIZE_MB = 5;
const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"];

export default function ProductImageManager({
  images,
  onChange,
  productName = "Product",
}: ProductImageManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [replacingImageId, setReplacingImageId] = useState<string | null>(null);

  // Manual URL input modal/field
  const [customUrl, setCustomUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);

    // Validate files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError(`File "${file.name}" has an invalid type (${file.type}). Allowed: JPG, PNG, WEBP, SVG.`);
        return;
      }
      if (file.size > MAX_BYTES) {
        setUploadError(`File "${file.name}" exceeds 5MB (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
        return;
      }
    }

    setUploading(true);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setUploading(false);

      if (!res.ok) {
        setUploadError(data.error || "Failed to upload images.");
        return;
      }

      const uploaded: AdminProductImage[] = data.images.map((img: any, idx: number) => ({
        id: img.id,
        url: img.url,
        altText: img.altText || `${productName} - Image ${images.length + idx + 1}`,
        isMain: images.length === 0 && idx === 0,
        order: images.length + idx,
      }));

      const newImages = [...images, ...uploaded];
      // Ensure one main image exists
      if (!newImages.some((img) => img.isMain) && newImages.length > 0) {
        newImages[0].isMain = true;
      }

      onChange(newImages);
    } catch {
      setUploading(false);
      setUploadError("Network error while uploading images.");
    }
  };

  const handleAddManualUrl = () => {
    if (!customUrl.trim()) return;
    const newImg: AdminProductImage = {
      id: `img-url-${Date.now()}`,
      url: customUrl.trim(),
      altText: `${productName} Image`,
      isMain: images.length === 0,
      order: images.length,
    };
    onChange([...images, newImg]);
    setCustomUrl("");
    setShowUrlInput(false);
  };

  const setMainImage = (id: string) => {
    const updated = images.map((img) => ({
      ...img,
      isMain: img.id === id,
    }));
    onChange(updated);
  };

  const updateAltText = (id: string, text: string) => {
    const updated = images.map((img) => (img.id === id ? { ...img, altText: text } : img));
    onChange(updated);
  };

  const removeImage = (id: string) => {
    const remaining = images.filter((img) => img.id !== id);
    // If we removed the main image, make the first remaining image main
    if (remaining.length > 0 && !remaining.some((img) => img.isMain)) {
      remaining[0].isMain = true;
    }
    // Re-index orders
    const reindexed = remaining.map((img, idx) => ({ ...img, order: idx }));
    onChange(reindexed);
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === images.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const copy = [...images];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);

    const reindexed = copy.map((img, idx) => ({ ...img, order: idx }));
    onChange(reindexed);
  };

  // Replace single image
  const triggerReplace = (id: string) => {
    setReplacingImageId(id);
    replaceInputRef.current?.click();
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingImageId) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError(`File has invalid type (${file.type}). Allowed: JPG, PNG, WEBP, SVG.`);
      return;
    }
    if (file.size > MAX_BYTES) {
      setUploadError(`File exceeds 5MB (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("files", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setUploading(false);

      if (!res.ok) {
        setUploadError(data.error || "Failed to replace image.");
        return;
      }

      const newUrl = data.images[0].url;
      const updated = images.map((img) =>
        img.id === replacingImageId ? { ...img, url: newUrl } : img
      );
      onChange(updated);
      setReplacingImageId(null);
    } catch {
      setUploading(false);
      setUploadError("Network error while replacing image.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div className="rounded-2xl border-2 border-dashed border-zinc-300/80 dark:border-zinc-700/80 bg-zinc-50/60 dark:bg-zinc-950/60 p-6 text-center hover:border-amber-500/60 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />
        {/* Hidden input for single image replacement */}
        <input
          ref={replaceInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
          className="hidden"
          onChange={handleReplaceFile}
        />

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 mb-3 border border-amber-500/20">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        <p className="text-xs font-bold text-zinc-900 dark:text-white mb-1">
          Upload Multiple Product Images
        </p>
        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mb-4 max-w-sm mx-auto">
          JPG, PNG, WEBP, or SVG up to 5MB. Upload multiple angles, packaging views, and laser close-ups.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-zinc-950 shadow-sm hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
          >
            {uploading ? "Uploading Images to Server..." : "Browse & Upload Images"}
          </button>

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
          >
            + Add by URL
          </button>
        </div>

        {showUrlInput && (
          <div className="mt-4 mx-auto max-w-md flex items-center gap-2">
            <input
              type="text"
              placeholder="/products/pen-1.jpg or https://..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={handleAddManualUrl}
              className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300">
          ⚠️ {uploadError}
        </div>
      )}

      {/* Image Gallery List / Management */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {images.length} Image{images.length > 1 ? "s" : ""} Attached
            </span>
            <span>⭐ Star an image to select it as the Main Product Cover</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className={`rounded-2xl border p-3 flex items-start gap-3 transition-all ${
                  img.isMain
                    ? "border-amber-500/60 bg-amber-500/5 shadow-md shadow-amber-500/10"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/70"
                }`}
              >
                {/* Thumbnail */}
                <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-300/80 dark:border-zinc-700/80 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.altText} className="h-full w-full object-cover" />
                  {img.isMain && (
                    <span className="absolute bottom-1 left-1 rounded bg-amber-500 px-1 py-0.5 text-[9px] font-extrabold text-zinc-950">
                      MAIN
                    </span>
                  )}
                </div>

                {/* Controls & Alt Text */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setMainImage(img.id)}
                      className={`text-[11px] font-bold flex items-center gap-1 ${
                        img.isMain
                          ? "text-amber-700 dark:text-amber-400"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-amber-700 dark:hover:text-amber-400"
                      }`}
                    >
                      <span>{img.isMain ? "★ Main Image" : "☆ Set as Main"}</span>
                    </button>

                    {/* Order Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveImage(idx, "up")}
                        title="Move Up"
                        className="rounded p-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={idx === images.length - 1}
                        onClick={() => moveImage(idx, "down")}
                        title="Move Down"
                        className="rounded p-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </div>
                  </div>

                  {/* Alt Text Input */}
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 mb-0.5">
                      Image Alt Text (SEO &amp; Accessibility)
                    </label>
                    <input
                      type="text"
                      value={img.altText}
                      onChange={(e) => updateAltText(img.id, e.target.value)}
                      placeholder="e.g. Front view of engraved pen"
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1 text-xs text-zinc-900 dark:text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <button
                      type="button"
                      onClick={() => triggerReplace(img.id)}
                      className="text-zinc-600 dark:text-zinc-400 hover:text-amber-700 dark:hover:text-amber-400"
                    >
                      Replace File
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="text-rose-700 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
