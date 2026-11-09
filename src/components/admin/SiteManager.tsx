"use client";
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import type { SitePage, SiteColors, Coupon } from "@/types/site";
import { DEFAULT_COLORS, COLOR_PRESETS } from "@/lib/siteDefaults";
import { SeoFields, catalogInput, catalogCard } from "@/components/admin/CatalogFields";
import { slugify } from "@/lib/catalog";
import { siteThemeStyle } from "@/lib/siteTheme";

type Mode = "pages" | "coupons" | "colors";
function Field({ title, children }: { title: string; children: ReactNode }) { return <label className="block text-sm font-medium">{title}{children}</label>; }
const emptyPage = (): SitePage => ({ id: "", title: "", slug: "", description: "", seo: { title: "", description: "", keywords: "" }, sections: [], published: false, builtIn: false, showInFooter: false });
const emptyCoupon = (): Coupon => ({ id: "", code: "", kind: "percent", amount: 10, active: false, perUserLimit: 1, totalLimit: 0, minimumSubtotal: 0, emails: [], expiresAt: "" });
export default function SiteManager({ mode }: { mode: Mode }) {
  const [pages, setPages] = useState<SitePage[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [page, setPage] = useState<SitePage | null>(null);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [emailText, setEmailText] = useState("");
  const [colors, setColors] = useState<SiteColors>(DEFAULT_COLORS);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/site/${mode}`, { cache: "no-store", signal: controller.signal }).then(async response => {
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      if (mode === "pages") setPages(data.value); else if (mode === "coupons") setCoupons(data.value); else setColors(data.value);
      setReady(true);
    }).catch(error => { if (error.name !== "AbortError") setError(error.message || "Could not load settings."); });
    return () => controller.abort();
  }, [mode]);
  async function change(value: SitePage | SiteColors | Coupon | { id: string }, method = "PUT") {
    if (saving.current) return;
    saving.current = true; setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/admin/site/${mode}`, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Could not save.");
      if (mode === "pages") {
        if (method === "DELETE") { setPages(pages.filter(item => item.id !== (value as SitePage).id)); setPage(null); }
        else { setPages([...pages.filter(item => item.id !== data.value.id), data.value]); setPage(data.value); }
      } else if (mode === "coupons") {
        if (method === "DELETE") { setCoupons(coupons.filter(item => item.id !== (value as Coupon).id)); setCoupon(null); }
        else { setCoupons([...coupons.filter(item => item.id !== data.value.id), { ...data.value, uses: coupons.find(item => item.id === data.value.id)?.uses || 0 }]); setCoupon(data.value); setEmailText(data.value.emails.join(", ")); }
      }
      setMessage(method === "DELETE" ? "Deleted." : "Saved successfully. Open or refresh the storefront to see published changes.");
    } catch (error) { setError(error instanceof Error ? error.message : "Could not save."); }
    finally { saving.current = false; setBusy(false); }
  }
  const heading = mode === "pages" ? "Website pages & SEO" : mode === "coupons" ? "Coupons" : "Website colors";
  return <div className="mx-auto max-w-5xl space-y-6 text-zinc-900 dark:text-white">
    <h1 className="text-3xl font-black">{heading}</h1>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
    {message && <p role="status" className="rounded-xl bg-green-50 p-4 text-green-800">{message}</p>}
    {!ready ? <p>Loading…</p> : <fieldset disabled={busy} className="space-y-6 disabled:opacity-70">
      {mode === "pages" && <>
        <p className="text-sm">Edit existing page headings, descriptions, content sections and SEO. Create drafts now and add content later. Saved published changes appear on the website.</p>
        <div className="flex flex-wrap gap-3">{pages.map(item => <button type="button" className="rounded-xl border px-4 py-2 text-sm" key={item.id} onClick={() => { setPage(structuredClone(item)); setMessage(""); }}>{item.title} {!item.published && "(Draft)"}</button>)}<button className="rounded-xl bg-amber-500 px-4 py-2 font-bold text-zinc-950" onClick={() => { setPage(emptyPage()); setMessage(""); }}>+ New page</button></div>
        {page && <form className="space-y-5" onSubmit={event => { event.preventDefault(); void change(page); }}>
          <section className={catalogCard}>
            <Field title="Page title"><input required maxLength={200} className={catalogInput} value={page.title} onChange={event => setPage({ ...page, title: event.target.value, slug: page.id ? page.slug : slugify(event.target.value) })} /></Field>
            <Field title="URL slug"><input disabled={Boolean(page.id)} required={!page.builtIn} className={catalogInput} value={page.slug} onChange={event => setPage({ ...page, slug: event.target.value })} /></Field><p className="text-xs">URL: /{page.slug}. Saved URLs stay fixed to protect existing links.</p>
            <Field title="Page introduction / description"><textarea maxLength={5000} rows={4} className={catalogInput} value={page.description} onChange={event => setPage({ ...page, description: event.target.value })} /></Field>
            {!page.builtIn && <Field title="Status"><select className={catalogInput} value={page.published ? "published" : "draft"} onChange={event => setPage({ ...page, published: event.target.value === "published" })}><option value="draft">Draft (not public)</option><option value="published">Published</option></select></Field>}
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={page.showInFooter} onChange={event => setPage({ ...page, showInFooter: event.target.checked })} />Show a link in the website footer when published</label>
          </section>
          {page.sections.map((section, index) => <section className={catalogCard} key={section.id}>
            <div className="flex justify-between"><h2 className="font-bold">Section {index + 1}</h2><button type="button" className="text-red-600" onClick={() => setPage({ ...page, sections: page.sections.filter((_, i) => i !== index) })}>Remove</button></div>
            <Field title="Section heading"><input maxLength={200} className={catalogInput} value={section.title} onChange={event => setPage({ ...page, sections: page.sections.map((row, i) => i === index ? { ...row, title: event.target.value } : row) })} /></Field>
            <Field title="Section content (plain text; line breaks are preserved)"><textarea maxLength={20000} rows={6} className={catalogInput} value={section.body} onChange={event => setPage({ ...page, sections: page.sections.map((row, i) => i === index ? { ...row, body: event.target.value } : row) })} /></Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={section.enabled} onChange={event => setPage({ ...page, sections: page.sections.map((row, i) => i === index ? { ...row, enabled: event.target.checked } : row) })} />Show section</label>
          </section>)}
          <button type="button" className="rounded-xl border px-4 py-2" onClick={() => setPage({ ...page, sections: [...page.sections, { id: crypto.randomUUID(), title: "", body: "", enabled: true }] })}>+ Add content section</button>
          <SeoFields value={page.seo} onChange={seo => setPage({ ...page, seo })} name={page.title} description={page.description} url={`/${page.slug}`} />
          <section className={catalogCard}><h2 className="font-bold">Content preview</h2><h3 className="text-2xl">{page.title}</h3><p className="whitespace-pre-wrap">{page.description}</p>{page.sections.filter(section => section.enabled).map(section => <div key={section.id}><h4 className="font-bold">{section.title}</h4><p className="whitespace-pre-wrap">{section.body}</p></div>)}</section>
          <div className="flex flex-wrap gap-4"><button type="submit" className="rounded-xl bg-amber-500 px-5 py-3 font-bold text-zinc-950">{busy ? "Saving…" : "Save page"}</button>{page.id && page.published && <a href={`/${page.slug}`} target="_blank" rel="noreferrer" className="p-3 underline">View published page</a>}{page.id && !page.builtIn && <button type="button" className="p-3 text-red-600" onClick={() => { if (window.confirm("Delete this page? Its URL will return not found.")) void change({ id: page.id }, "DELETE"); }}>Delete page</button>}</div>
        </form>}
      </>}
      {mode === "coupons" && <>
        <p className="text-sm">Coupons apply to all products, before shipping. Customers must sign in with a verified account. One coupon per order. Usage is counted when an order is placed, including orders later cancelled.</p>
        <button className="rounded-xl bg-amber-500 px-4 py-2 font-bold text-zinc-950" onClick={() => { setCoupon(emptyCoupon()); setEmailText(""); setMessage(""); }}>+ Create coupon</button>
        <div className="space-y-3">{coupons.map(item => <div key={item.id} className={`${catalogCard} flex flex-wrap items-center justify-between gap-3`}><div><strong>{item.code}</strong> — {item.kind === "percent" ? `${item.amount}%` : `Rs. ${item.amount}`} · {item.active ? "Active" : "Inactive"}<p className="text-xs">{item.uses || 0} uses · {item.perUserLimit} per customer · {item.emails.length ? "Selected customers" : "All customers"}</p></div><div className="flex gap-4"><button onClick={() => { setCoupon(structuredClone(item)); setEmailText(item.emails.join(", ")); setMessage(""); }}>Edit</button><button onClick={() => void change({ ...item, active: !item.active })}>{item.active ? "Deactivate" : "Activate"}</button><button className="text-red-600" onClick={() => { if (window.confirm(`Delete ${item.code}? Past orders and usage history will be retained.`)) void change({ id: item.id }, "DELETE"); }}>Delete</button></div></div>)}</div>
        {coupon && <form className={catalogCard} onSubmit={event => { event.preventDefault(); void change({ ...coupon, emails: emailText.split(/[;,\n]/).map(email => email.trim()).filter(Boolean) }); }}>
          <Field title="Coupon code"><input required disabled={Boolean(coupon.id)} className={catalogInput} value={coupon.code} onChange={event => setCoupon({ ...coupon, code: event.target.value.toUpperCase() })} /></Field>
          <Field title="Discount type"><select className={catalogInput} value={coupon.kind} onChange={event => setCoupon({ ...coupon, kind: event.target.value as Coupon["kind"] })}><option value="percent">Percentage</option><option value="fixed">Fixed amount (PKR)</option></select></Field>
          {([['amount', 'Discount value', 1], ['perUserLimit', 'Uses per customer', 1], ['totalLimit', 'Total uses allowed (0 = unlimited)', 0], ['minimumSubtotal', 'Minimum product subtotal (PKR)', 0]] as const).map(([key, title, min]) => <Field key={key} title={title}><input className={catalogInput} type="number" required min={min} step={1} max={key === "amount" && coupon.kind === "percent" ? 100 : undefined} value={coupon[key]} onChange={event => setCoupon({ ...coupon, [key]: Number(event.target.value) })} /></Field>)}
          <Field title="Assigned customer emails (comma-separated; leave blank for all customers)"><textarea rows={3} className={catalogInput} value={emailText} onChange={event => setEmailText(event.target.value)} /></Field>
          <Field title="Expires at (UTC; optional)"><input type="datetime-local" className={catalogInput} value={coupon.expiresAt ? coupon.expiresAt.slice(0, 16) : ""} onChange={event => setCoupon({ ...coupon, expiresAt: event.target.value ? `${event.target.value}:00.000Z` : "" })} /></Field>
          <label className="flex items-center gap-2"><input type="checkbox" checked={coupon.active} onChange={event => setCoupon({ ...coupon, active: event.target.checked })} />Active</label>
          <button className="rounded-xl bg-amber-500 px-5 py-3 font-bold text-zinc-950">{busy ? "Saving…" : "Save coupon"}</button>
        </form>}
      </>}
      {mode === "colors" && <form className="space-y-5" onSubmit={event => { event.preventDefault(); void change(colors); }}>
        <p className="text-sm">Choose a preset or edit hex codes. Preview below; website colors change only after Save. Your light/dark toggle remains available.</p>
        <div className="flex flex-wrap gap-3">{COLOR_PRESETS.map(preset => <button key={preset.name} type="button" className="rounded-xl border px-4 py-2" onClick={() => setColors({ ...preset.colors })}><span className="mr-2 inline-block h-4 w-4 rounded-full" style={{ backgroundColor: preset.colors.primary }} />{preset.name} {preset.colors.primary}</button>)}</div>
        <section className={`${catalogCard} grid gap-4 sm:grid-cols-2`}>{(Object.keys(colors) as (keyof SiteColors)[]).map(key => <div key={key}><Field title={key.replace(/([A-Z])/g, " $1")}><div className="flex items-center gap-3"><input aria-label={`${key} color picker`} type="color" value={/^#[0-9a-f]{6}$/i.test(colors[key]) ? colors[key] : "#000000"} onChange={event => setColors({ ...colors, [key]: event.target.value })} /><input required pattern="#[0-9a-fA-F]{6}" className={catalogInput} value={colors[key]} onChange={event => setColors({ ...colors, [key]: event.target.value })} /></div></Field></div>)}</section>
        <div className="grid gap-4 sm:grid-cols-2" style={siteThemeStyle(colors) as CSSProperties}>{[false, true].map(dark => <div key={String(dark)} className="rounded-2xl border p-6" style={{ backgroundColor: dark ? colors.darkBackground : colors.lightBackground, color: dark ? colors.darkText : colors.lightText }}><h2 className="text-xl font-bold">{dark ? "Dark" : "Light"} preview</h2><div className="my-4 rounded-xl p-4" style={{ backgroundColor: dark ? colors.darkSurface : colors.lightSurface }}>Personalized gifts made for you.</div><span className="inline-block rounded-xl px-5 py-3 font-bold text-black" style={{ backgroundColor: colors.primary }}>Shop now</span></div>)}</div>
        <button className="rounded-xl bg-amber-500 px-5 py-3 font-bold text-zinc-950">{busy ? "Saving…" : "Save website colors"}</button>
      </form>}
    </fieldset>}
  </div>;
}
