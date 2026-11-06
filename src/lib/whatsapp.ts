import { STORE_CONFIG } from "@/constants/store";

export interface BulkQuoteData {
  fullName: string;
  whatsappNumber: string;
  email?: string;
  productName: string;
  quantity: number | string;
  customizationRequirements: string;
  deliveryCity: string;
  requiredDate?: string;
  additionalRequirements?: string;
  logoFileName?: string;
}

/**
 * Returns the cleaned international WhatsApp number (digits only, e.g. "923000000000").
 * Single central configuration source for WhatsApp across the entire site.
 */
export function getCleanWhatsAppNumber(): string {
  return STORE_CONFIG.contact.whatsapp.replace(/[^0-9]/g, "");
}

/**
 * Generates the formatted plain-text quotation request message matching LaserUVCreatives requirements.
 */
export function formatBulkQuoteMessage(data: BulkQuoteData): string {
  const name = data.fullName.trim();
  const phone = data.whatsappNumber.trim();
  const email = data.email?.trim();
  const product = data.productName.trim();
  const quantity = String(data.quantity).trim();
  const customization = data.customizationRequirements.trim() || "Standard engraving";
  const logoInfo = data.logoFileName ? ` (Design/Logo uploaded: ${data.logoFileName})` : "";
  const city = data.deliveryCity.trim();
  const date = data.requiredDate?.trim() || "Flexible";
  const additional = data.additionalRequirements?.trim() || "None";

  const lines: string[] = [
    "Hello LaserUVCreatives,",
    "",
    "I would like to request a quotation for a bulk/custom order.",
    "",
    `Name: ${name}`,
    `WhatsApp: ${phone}`,
  ];

  if (email) {
    lines.push(`Email: ${email}`);
  }

  lines.push(`Product: ${product}`);
  lines.push(`Quantity: ${quantity}`);
  lines.push(`Customization: ${customization}${logoInfo}`);
  lines.push(`Delivery City: ${city}`);
  lines.push(`Required Date: ${date}`);
  lines.push(`Additional Requirements: ${additional}`);
  lines.push("");
  lines.push("Please share your best quotation and available options.");
  lines.push("");
  lines.push("Thank you.");

  return lines.join("\n");
}

/**
 * Builds the WhatsApp web / app redirect URL with URI-encoded text.
 */
export function buildWhatsAppQuoteUrl(data: BulkQuoteData): string {
  const message = formatBulkQuoteMessage(data);
  const cleanNumber = getCleanWhatsAppNumber();
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds a direct general WhatsApp chat URL for customer inquiries.
 */
export function buildGeneralWhatsAppUrl(optionalMessage?: string): string {
  const cleanNumber = getCleanWhatsAppNumber();
  if (!optionalMessage) {
    return `https://wa.me/${cleanNumber}`;
  }
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(optionalMessage)}`;
}
