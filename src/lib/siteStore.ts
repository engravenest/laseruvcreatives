import { randomUUID } from "node:crypto";
import { getDatabase } from "@/lib/serverDb";
import { BUILTIN_PAGES, DEFAULT_COLORS, RESERVED_SLUGS } from "@/lib/siteDefaults";
import { couponSchema, StoreInputError } from "@/lib/coupons";
import type { Coupon, SiteColors, SitePage } from "@/types/site";
const initialized = new WeakSet<object>();
function database() {
  const db = getDatabase();
  if (!initialized.has(db)) {
    db.exec("CREATE TABLE IF NOT EXISTS site_documents (kind TEXT NOT NULL, id TEXT NOT NULL, data_json TEXT NOT NULL, PRIMARY KEY(kind, id))");
    couponSchema(db);
    for (const page of BUILTIN_PAGES) db.prepare("INSERT OR IGNORE INTO site_documents VALUES ('page', ?, ?)").run(page.id, JSON.stringify(page));
    initialized.add(db);
  }
  return db;
}
export function getPages(): SitePage[] {
  return database().prepare("SELECT data_json FROM site_documents WHERE kind = 'page' ORDER BY rowid").all().map(row => JSON.parse(String(row.data_json)));
}
export function getPage(slug: string) { return getPages().find(page => page.slug === slug); }
export function savePage(input: SitePage) {
  const pages = getPages();
  const existing = pages.find(page => page.id === input.id);
  const builtIn = Boolean(existing?.builtIn);
  if (typeof input.title !== "string" || !input.title.trim() || input.title.length > 200) throw new StoreInputError("Enter a page title (up to 200 characters).");
  if (!builtIn && (typeof input.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug) || RESERVED_SLUGS.has(input.slug))) throw new StoreInputError("Choose a valid, unused page slug, such as about-us.");
  if (existing && existing.slug !== input.slug) throw new StoreInputError("The URL of an existing page cannot be changed.");
  if (pages.some(page => page.slug === input.slug && page.id !== existing?.id)) throw new StoreInputError("A page already uses this URL.");
  if (typeof input.description !== "string" || input.description.length > 5000) throw new StoreInputError("Page description is too long.");
  if (!input.seo || typeof input.seo.title !== "string" || input.seo.title.length > 200 || typeof input.seo.description !== "string" || input.seo.description.length > 500 || (input.seo.keywords !== undefined && (typeof input.seo.keywords !== "string" || input.seo.keywords.length > 1000))) throw new StoreInputError("Check SEO title, description and keywords lengths.");
  if (!Array.isArray(input.sections) || input.sections.length > 30 || input.sections.some(section => typeof section.id !== "string" || typeof section.title !== "string" || typeof section.body !== "string" || section.title.length > 200 || section.body.length > 20000)) throw new StoreInputError("Use up to 30 sections with titles under 200 and content under 20,000 characters.");
  if (new Set(input.sections.map(section => section.id)).size !== input.sections.length) throw new StoreInputError("Section identifiers must be unique.");
  const page: SitePage = { id: existing?.id || randomUUID(), slug: builtIn ? existing!.slug : input.slug, title: input.title.trim(), description: input.description, seo: input.seo, sections: input.sections.map(section => ({ id: section.id, title: section.title, body: section.body, enabled: Boolean(section.enabled) })), published: builtIn || Boolean(input.published), builtIn, showInFooter: Boolean(input.showInFooter) };
  database().prepare("INSERT OR REPLACE INTO site_documents VALUES ('page', ?, ?)").run(page.id, JSON.stringify(page));
  return page;
}
export function deletePage(id: string) {
  const page = getPages().find(page => page.id === id);
  if (!page || page.builtIn) throw new StoreInputError("Only custom pages can be deleted.");
  database().prepare("DELETE FROM site_documents WHERE kind = 'page' AND id = ?").run(id);
}
export function getColors(): SiteColors {
  const row = database().prepare("SELECT data_json FROM site_documents WHERE kind = 'theme' AND id = 'colors'").get();
  return row ? { ...DEFAULT_COLORS, ...JSON.parse(String(row.data_json)) } : DEFAULT_COLORS;
}
export function saveColors(input: SiteColors) {
  const colors = { ...DEFAULT_COLORS };
  for (const key of Object.keys(colors) as (keyof SiteColors)[]) {
    if (typeof input[key] !== "string" || !/^#[0-9a-fA-F]{6}$/.test(input[key])) throw new StoreInputError("Every color must be a six-digit hex code, such as #f59e0b.");
    colors[key] = input[key];
  }
  database().prepare("INSERT OR REPLACE INTO site_documents VALUES ('theme', 'colors', ?)").run(JSON.stringify(colors));
  return colors;
}
export function getCoupons(): Coupon[] {
  const db = database();
  return db.prepare("SELECT data_json FROM coupons ORDER BY rowid DESC").all().map(row => {
    const coupon = JSON.parse(String(row.data_json)) as Coupon;
    return { ...coupon, uses: Number(db.prepare("SELECT COUNT(*) AS count FROM coupon_uses WHERE coupon_id = ?").get(coupon.id)!.count) };
  }).filter(coupon => !coupon.deleted);
}
export function saveCoupon(input: Coupon) {
  const db = database();
  const existing = getCoupons().find(coupon => coupon.id === input.id);
  const code = typeof input.code === "string" ? input.code.trim().toUpperCase() : "";
  if (!/^[A-Z0-9_-]{3,40}$/.test(code)) throw new StoreInputError("Coupon codes need 3–40 letters, numbers, hyphens or underscores.");
  if (existing && code !== existing.code) throw new StoreInputError("An existing coupon code cannot be changed.");
  if (!['fixed', 'percent'].includes(input.kind) || !Number.isSafeInteger(input.amount) || input.amount <= 0 || (input.kind === 'percent' && input.amount > 100)) throw new StoreInputError("Enter a positive whole amount; percentage must be 1–100.");
  if (!Number.isSafeInteger(input.perUserLimit) || input.perUserLimit < 1 || !Number.isSafeInteger(input.totalLimit) || input.totalLimit < 0 || !Number.isSafeInteger(input.minimumSubtotal) || input.minimumSubtotal < 0) throw new StoreInputError("Use whole-number limits: per customer at least 1; total limit and minimum subtotal at least 0.");
  if (!Array.isArray(input.emails) || input.emails.length > 500 || input.emails.some(email => typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))) throw new StoreInputError("Enter valid customer email addresses.");
  if (typeof input.expiresAt !== 'string' || (input.expiresAt && !Number.isFinite(Date.parse(input.expiresAt)))) throw new StoreInputError("Enter a valid expiry date.");
  const conflict = db.prepare("SELECT id FROM coupons WHERE code = ?").get(code);
  if (conflict && conflict.id !== existing?.id) throw new StoreInputError("This coupon code has already been used. Choose another code.");
  const coupon: Coupon = { id: existing?.id || randomUUID(), code, kind: input.kind, amount: input.amount, active: Boolean(input.active), perUserLimit: input.perUserLimit, totalLimit: input.totalLimit, minimumSubtotal: input.minimumSubtotal, emails: [...new Set(input.emails.map(email => email.trim().toLowerCase()))], expiresAt: input.expiresAt };
  db.prepare("INSERT OR REPLACE INTO coupons VALUES (?, ?, ?)").run(coupon.id, code, JSON.stringify(coupon));
  return coupon;
}
export function deleteCoupon(id: string) {
  const coupon = getCoupons().find(item => item.id === id);
  if (!coupon) throw new StoreInputError("Coupon not found.");
  database().prepare("UPDATE coupons SET data_json = ? WHERE id = ?").run(JSON.stringify({ ...coupon, deleted: true, active: false }), id);
}
