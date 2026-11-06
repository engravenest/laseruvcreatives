import { isValidPakistaniPhone } from "./utils";

export const MAX_SAVED_ADDRESSES = 5;
export const SHIPPING_PROVINCES = ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad Capital Territory", "Azad Kashmir", "Gilgit-Baltistan"] as const;

export function getShippingFee(province: string): number {
  if (!(SHIPPING_PROVINCES as readonly string[]).includes(province)) throw new Error("Please select a valid province.");
  return province === "Punjab" ? 299 : 399;
}

export function validateShippingAddress(value: unknown): string | null {
  if (!value || typeof value !== "object") return "Please add a delivery address before placing your order.";
  const address = value as Record<string, unknown>;
  for (const field of ["fullName", "phoneNumber", "city", "province", "addressLine"]) {
    if (typeof address[field] !== "string" || !address[field].trim()) return "Please complete the recipient name, phone, city, province, and street address.";
  }
  if (!isValidPakistaniPhone(address.phoneNumber as string)) return "Please enter a valid Pakistani mobile number.";
  if (!(SHIPPING_PROVINCES as readonly string[]).includes(address.province as string)) return "Please select a valid province.";
  return null;
}

export function sameShippingAddress(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  return ["fullName", "phoneNumber", "city", "province", "addressLine", "nearestLandmark", "postalCode"].every(
    key => String(a[key] ?? "").trim().toLowerCase() === String(b[key] ?? "").trim().toLowerCase()
  );
}
