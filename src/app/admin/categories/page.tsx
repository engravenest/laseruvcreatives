"use client";
import { useState } from "react";
import type { ProductCategory } from "@/types/product";
import { useCategories } from "@/lib/useCategories";
import { slugify } from "@/lib/catalog";
import { SeoFields, SlugPreview, catalogCard, catalogInput } from "@/components/admin/CatalogFields";

function CategoryEditor({ category }: { category: ProductCategory }) {
  const [saved, setSaved] = useState(category);
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [description, setDescription] = useState(category.description);
  const [seo, setSeo] = useState(category.seo || { title: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  return <form className="space-y-6" onSubmit={async event => {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/categories", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: category.id, name, slug, description, seo }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save category.");
      setSaved(data.category);
      setMessage("Category saved.");
      window.dispatchEvent(new Event("luc_categories_updated"));
      window.dispatchEvent(new Event("luc_products_updated"));
    } catch (error) { setError(error instanceof Error ? error.message : "Could not save category."); }
    finally { setSaving(false); }
  }}>
    <fieldset disabled={saving} className="space-y-6">
      <section className={catalogCard}>
        <h2 className="text-lg font-bold">Edit category</h2>
        <label className="block text-sm">Category title<input required className={catalogInput} value={name} onChange={e => { setName(e.target.value); setSlug(slugify(e.target.value)); setMessage(""); }} /></label>
        <label className="block text-sm">Slug<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" className={catalogInput} value={slug} onChange={e => setSlug(e.target.value)} /></label>
        <SlugPreview slug={slug} previous={saved.slug} kind="category" />
        <label className="block text-sm">Description<textarea rows={3} className={catalogInput} value={description} onChange={e => setDescription(e.target.value)} /></label>
      </section>
      <SeoFields value={seo} onChange={setSeo} name={name} description={description} url={`/shop?category=${slug}`} />
      {error && <p role="alert" className="text-red-600">{error}</p>}
      {message && <p role="status" className="text-green-700 dark:text-green-400">{message}</p>}
      <button className="rounded-xl bg-amber-500 px-6 py-3 font-bold text-zinc-950 disabled:opacity-50" type="submit">{saving ? "Saving…" : "Save category"}</button>
    </fieldset>
  </form>;
}

export default function CategoriesPage() {
  const categories = useCategories();
  const [selected, setSelected] = useState<string | null>(null);
  const category = categories.find(category => category.id === selected);
  return <div className="mx-auto max-w-4xl space-y-6">
    <h1 className="text-3xl font-black text-zinc-900 dark:text-white">Categories</h1>
    <label className="block text-sm text-zinc-900 dark:text-white">Choose a category to edit<select className={catalogInput} value={selected || ""} onChange={e => setSelected(e.target.value)}><option value="" disabled>Select category</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name} ({category.productCount} products)</option>)}</select></label>
    {category && <CategoryEditor key={category.id} category={category} />}
  </div>;
}
