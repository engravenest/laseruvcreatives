"use client";
import type { Product, ProductCategory } from "@/types/product";
import { videoEmbedUrl } from "@/lib/catalog";

export const catalogInput = "mt-1 w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white";
export const catalogCard = "space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white";
export type Seo = { title: string; description: string; keywords?: string };
export type SpecRow = { name: string; value: string };

export function SeoFields({ value, onChange, name, description, url }: { value: Seo; onChange: (value: Seo) => void; name: string; description: string; url: string }) {
  return <section className={catalogCard}>
    <h2 className="font-bold">Search engine optimization (SEO)</h2>
    <p className="text-sm text-zinc-500">Leave blank to use the title and description. Aim for around 60 characters for the title and 160 for the description.</p>
    <label className="block text-sm">SEO title<input className={catalogInput} value={value.title} maxLength={200} placeholder={name} onChange={e => onChange({ ...value, title: e.target.value })} /></label>
    <label className="block text-sm">Meta description<textarea className={catalogInput} rows={3} value={value.description} maxLength={500} placeholder={description} onChange={e => onChange({ ...value, description: e.target.value })} /></label>
    <label className="block text-sm">Meta keywords (comma-separated)<input className={catalogInput} value={value.keywords || ""} maxLength={1000} placeholder="personalized gifts, engraved pens, corporate gifts Pakistan" onChange={e => onChange({ ...value, keywords: e.target.value })} /></label>
    <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
      <p className="text-xs text-zinc-500">Search preview</p><p className="break-all text-sm text-green-700 dark:text-green-400">{url}</p>
      <p className="text-lg text-blue-700 dark:text-blue-400">{value.title || name || "Page title"}</p><p className="text-sm">{value.description || description}</p>
    </div>
  </section>;
}

export function SlugPreview({ slug, previous, kind }: { slug: string; previous?: string; kind: "product" | "category" }) {
  const prefix = kind === "product" ? "/products/" : "/shop?category=";
  return <div className="space-y-1 rounded-xl bg-zinc-100 p-3 text-sm break-all dark:bg-zinc-800" aria-live="polite">
    <p>URL preview: <strong>{prefix}{slug}</strong></p>
    {previous && previous !== slug && <p>On save, the old URL {prefix}{previous} will permanently redirect to this URL.</p>}
    <p className="text-xs text-zinc-500">Preview only. Changes apply after you submit the form.</p>
  </div>;
}

export function ProductCatalogFields({ categories, primary, selected, onSelect, specs, onSpecs, video, onVideo }: {
  categories: ProductCategory[]; primary: string; selected: string[]; onSelect: (value: string[]) => void;
  specs: SpecRow[]; onSpecs: (value: SpecRow[]) => void; video: NonNullable<Product["video"]>; onVideo: (value: NonNullable<Product["video"]>) => void;
}) {
  return <>
    <section className={catalogCard}><h2 className="font-bold">Additional categories</h2><p className="text-sm text-zinc-500">A product can appear in several categories. The primary category is always included.</p>
      <div className="flex flex-wrap gap-4">{categories.map(category => <label key={category.id} className="flex items-center gap-2 text-sm"><input type="checkbox" disabled={category.slug === primary} checked={category.slug === primary || selected.includes(category.slug)} onChange={e => onSelect(e.target.checked ? [...selected, category.slug] : selected.filter(slug => slug !== category.slug))} />{category.name}{category.slug === primary ? " (primary)" : ""}</label>)}</div>
    </section>
    <section className={catalogCard}><h2 className="font-bold">Product specifications</h2>
      {specs.map((spec, index) => <div key={index} className="flex flex-wrap items-center gap-2">
        <input required aria-label={`Specification ${index + 1} name`} placeholder="e.g. Material" className={`${catalogInput} flex-1`} value={spec.name} onChange={e => onSpecs(specs.map((row, i) => i === index ? { ...row, name: e.target.value } : row))} />
        <input required aria-label={`Specification ${index + 1} value`} placeholder="e.g. Stainless steel" className={`${catalogInput} flex-1`} value={spec.value} onChange={e => onSpecs(specs.map((row, i) => i === index ? { ...row, value: e.target.value } : row))} />
        <button type="button" className="p-2 text-sm text-red-600" onClick={() => onSpecs(specs.filter((_, i) => i !== index))}>Remove</button>
      </div>)}
      <button type="button" className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700" onClick={() => onSpecs([...specs, { name: "", value: "" }])}>Add specification</button>
    </section>
    <section className={catalogCard}><h2 className="font-bold">Product video</h2><p className="text-sm text-zinc-500">Add a video hosted on YouTube or Vimeo by its ID. Clear the ID to remove the video. The video must allow embedding.</p>
      <label className="block text-sm">Provider<select className={catalogInput} value={video.provider} onChange={e => onVideo({ provider: e.target.value as "youtube" | "vimeo", id: "" })}><option value="youtube">YouTube</option><option value="vimeo">Vimeo</option></select></label>
      <label className="block text-sm">Video ID<input className={catalogInput} value={video.id} pattern={video.provider === "youtube" ? "[a-zA-Z0-9_-]{11}" : "[0-9]+"} placeholder={video.provider === "youtube" ? "e.g. dQw4w9WgXcQ" : "e.g. 123456789"} onChange={e => onVideo({ ...video, id: e.target.value.trim() })} /></label>
      {videoEmbedUrl(video) && <iframe className="aspect-video w-full rounded-xl" src={videoEmbedUrl(video)!} title="Product video preview" loading="lazy" allowFullScreen />}
    </section>
  </>;
}
