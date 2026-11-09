import type { DatabaseSync } from "node:sqlite";
import type { Coupon } from "@/types/site";
export class StoreInputError extends Error {}
export function couponSchema(db: DatabaseSync) {
  db.exec(`CREATE TABLE IF NOT EXISTS coupons (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, data_json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS coupon_uses (order_id TEXT PRIMARY KEY, coupon_id TEXT NOT NULL, user_id TEXT NOT NULL, discount INTEGER NOT NULL, code TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS coupon_uses_customer ON coupon_uses(coupon_id, user_id);`);
}
export function checkCoupon(db: DatabaseSync, code: string, userId: string | null, subtotal: number) {
  couponSchema(db);
  if (!userId) throw new StoreInputError("Sign in to use a coupon.");
  const user = db.prepare("SELECT email, is_email_verified FROM users WHERE id = ?").get(userId);
  if (!user || !user.is_email_verified) throw new StoreInputError("Verify your account before using a coupon.");
  const row = db.prepare("SELECT data_json FROM coupons WHERE code = ?").get(code.trim().toUpperCase());
  if (!row) throw new StoreInputError("Coupon not found.");
  const coupon = JSON.parse(String(row.data_json)) as Coupon;
  if (!coupon.active || coupon.deleted) throw new StoreInputError("This coupon is inactive.");
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() <= Date.now()) throw new StoreInputError("This coupon has expired.");
  if (coupon.emails.length && !coupon.emails.includes(String(user.email).toLowerCase())) throw new StoreInputError("This coupon is assigned to another customer.");
  if (subtotal < coupon.minimumSubtotal) throw new StoreInputError(`This coupon requires a product subtotal of Rs. ${coupon.minimumSubtotal}.`);
  const total = Number(db.prepare("SELECT COUNT(*) AS count FROM coupon_uses WHERE coupon_id = ?").get(coupon.id)!.count);
  const used = Number(db.prepare("SELECT COUNT(*) AS count FROM coupon_uses WHERE coupon_id = ? AND user_id = ?").get(coupon.id, userId)!.count);
  if (used >= coupon.perUserLimit) throw new StoreInputError("You have reached this coupon's usage limit.");
  if (coupon.totalLimit && total >= coupon.totalLimit) throw new StoreInputError("This coupon has reached its total usage limit.");
  const discount = Math.min(subtotal, coupon.kind === "percent" ? Math.floor(subtotal * coupon.amount / 100) : coupon.amount);
  return { coupon, discount };
}
