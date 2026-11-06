"use client";

import { useId, useState, type Ref } from "react";
import Image from "next/image";
import { CustomizationOption } from "@/types/product";

export interface CustomizationFormValues {
  text: string;
  font: string;
  location: string;
  instructions: string;
  logoFileName?: string;
  logoPreviewUrl?: string;
}

interface CustomizationFormProps {
  customization: CustomizationOption;
  onChange: (values: CustomizationFormValues) => void;
  className?: string;
  textRequired?: boolean;
  textError?: string;
  textInputRef?: Ref<HTMLInputElement>;
}

export default function CustomizationForm({
  customization,
  onChange,
  className = "",
  textRequired = false,
  textError,
  textInputRef,
}: CustomizationFormProps) {
  const textId = useId();
  const [text, setText] = useState("");
  const [selectedFont, setSelectedFont] = useState(customization.fontOptions[0] || {
    id: "script",
    name: "Elegant Script Calligraphy",
    styleClass: "italic font-serif",
  });
  const [location, setLocation] = useState(customization.engravingLocations[0] || "Standard Body");
  const [instructions, setInstructions] = useState("");
  const [logoFile, setLogoFile] = useState<{ name: string; preview: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const displayedError = textError || error;

  const updateParent = (
    newText = text,
    newFont = selectedFont,
    newLoc = location,
    newInst = instructions,
    newLogo = logoFile
  ) => {
    onChange({
      text: newText,
      font: newFont.name,
      location: newLoc,
      instructions: newInst,
      logoFileName: newLogo?.name,
      logoPreviewUrl: newLogo?.preview,
    });
  };

  const handleTextChange = (val: string) => {
    if (val.length > customization.maxTextLength) {
      setError(`Maximum ${customization.maxTextLength} characters allowed.`);
      return;
    }
    setError(null);
    setText(val);
    updateParent(val);
  };

  const handleFontChange = (font: typeof selectedFont) => {
    setSelectedFont(font);
    updateParent(text, font);
  };

  const handleLocationChange = (loc: string) => {
    setLocation(loc);
    updateParent(text, selectedFont, loc);
  };

  const handleInstructionsChange = (val: string) => {
    setInstructions(val);
    updateParent(text, selectedFont, location, val);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit. Please upload a smaller logo.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const logoData = { name: file.name, preview: previewUrl };
    setLogoFile(logoData);
    updateParent(text, selectedFont, location, instructions, logoData);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    updateParent(text, selectedFont, location, instructions, null);
  };

  return (
    <div className={`rounded-2xl border border-amber-300/80 bg-amber-50/40 p-5 dark:border-amber-900/60 dark:bg-amber-950/20 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-200/80 pb-3 dark:border-amber-900/80">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs">
            ⚡
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Personalization &amp; Engraving Details
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Specify your custom name, message, or company logo instructions.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
          Included Free
        </span>
      </div>

      {/* Live Engraving Simulation Box */}
      <div className="mt-4 rounded-xl border border-dashed border-amber-400 bg-zinc-950 p-4 text-center text-white shadow-inner">
        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block mb-1">
          ⚡ Live Laser Engraving Preview
        </span>
        <div className="flex min-h-[50px] items-center justify-center px-4 py-2 bg-black/50 rounded-lg">
          <span className={`text-xl sm:text-2xl text-amber-300 transition-all ${selectedFont.styleClass}`}>
            {text.trim() ? text : customization.placeholderText || "Recipient Name"}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-zinc-400">
          <span>Placement: <strong className="text-zinc-200">{location}</strong></span>
          <span>•</span>
          <span>Permanent Fiber Laser</span>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {/* Name / Text Input */}
        {customization.allowsText && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor={textId} className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                {customization.textLabel || "Engraving Text / Name"}
                {textRequired && <span className="ml-1 text-red-600 dark:text-red-400">* (Required)</span>}
              </label>
              <span className={`text-[11px] font-mono ${
                text.length >= customization.maxTextLength
                  ? "text-red-500 font-bold"
                  : "text-zinc-400"
              }`}>
                {text.length}/{customization.maxTextLength} chars
              </span>
            </div>
            <input
              type="text"
              id={textId}
              ref={textInputRef}
              required={textRequired}
              aria-invalid={Boolean(displayedError)}
              aria-describedby={displayedError ? `${textId}-error` : undefined}
              value={text}
              maxLength={customization.maxTextLength}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={customization.placeholderText || "Enter name or title..."}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none ring-amber-500 transition-all focus:border-amber-500 focus:ring-1 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
            {displayedError && <p id={`${textId}-error`} role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">{displayedError}</p>}
          </div>
        )}

        {/* Font Style Selection */}
        {customization.fontOptions && customization.fontOptions.length > 0 && (
          <div>
            <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
              Choose Typography / Font Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {customization.fontOptions.map((font) => (
                <button
                  type="button"
                  key={font.id}
                  onClick={() => handleFontChange(font)}
                  className={`rounded-xl border p-2.5 text-left text-xs transition-all ${
                    selectedFont.id === font.id
                      ? "border-amber-500 bg-white shadow-xs text-amber-900 font-bold dark:border-amber-500 dark:bg-zinc-900 dark:text-amber-300 ring-1 ring-amber-500/30"
                      : "border-zinc-200 bg-white/70 text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300"
                  }`}
                >
                  <span className="block truncate text-[11px] text-zinc-400 mb-0.5">Style</span>
                  <span className={`block truncate ${font.styleClass}`}>{font.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Engraving Location */}
        {customization.engravingLocations && customization.engravingLocations.length > 1 && (
          <div>
            <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
              Engraving Placement
            </label>
            <div className="flex flex-wrap gap-2">
              {customization.engravingLocations.map((loc) => (
                <button
                  type="button"
                  key={loc}
                  onClick={() => handleLocationChange(loc)}
                  className={`rounded-lg border px-3 py-1.5 text-xs transition-all ${
                    location === loc
                      ? "border-amber-500 bg-amber-500 text-zinc-950 font-bold"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Optional Logo Upload UI (UI Only / Local preview) */}
        {customization.allowsLogo && (
          <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/60">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                {customization.logoLabel || "Company / Vector Logo (Optional)"}
              </label>
              <span className="text-[10px] text-zinc-400">
                {customization.supportedFormats?.join(", ") || "PNG, SVG, JPG"}
              </span>
            </div>

            {logoFile ? (
              <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50/60 p-3 dark:border-emerald-800 dark:bg-emerald-950/40">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-emerald-200 bg-white p-1">
                    <Image
                      src={logoFile.preview}
                      alt="Logo preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 truncate max-w-[200px]">
                      {logoFile.name}
                    </p>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                      ✓ Ready for engraving reference
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white/80 p-4 text-center cursor-pointer transition-colors hover:border-amber-500 hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/60 dark:hover:border-amber-500">
                <svg className="h-6 w-6 text-zinc-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
                  Click to choose logo file
                </span>
                <span className="text-[11px] text-zinc-400 mt-0.5">
                  Stored locally for order mockup (Max 5MB)
                </span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml, .pdf"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            )}

            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 italic">
              ℹ️ Uploaded files are treated as design instructions. We share a high-definition WhatsApp digital mockup for your approval before engraving.
            </p>
          </div>
        )}

        {/* Special Instructions */}
        <div>
          <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
            Special Instructions / Engraving Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={instructions}
            onChange={(e) => handleInstructionsChange(e.target.value)}
            placeholder="e.g. Please align the name horizontally, or use Urdu calligraphy nastaliq..."
            className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 outline-none ring-amber-500 focus:border-amber-500 focus:ring-1 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
}
