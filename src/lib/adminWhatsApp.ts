import { Order, OrderStatus } from "@/types/order";
import { BulkQuoteLead } from "@/types/admin";
import { formatPKR } from "./utils";
import { STORE_CONFIG } from "@/constants/store";

/**
 * Clean phone number to digits only with Pakistan country code 92.
 * E.g. "03008451294" -> "923008451294"
 */
export function normalizeCustomerWhatsAppNumber(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "92" + cleaned.slice(1);
  } else if (!cleaned.startsWith("92")) {
    cleaned = "92" + cleaned;
  }
  return cleaned;
}

/**
 * Builds tailored customer update message according to order status.
 */
export function buildOrderStatusWhatsAppMessage(order: Order, targetStatus: OrderStatus): string {
  const customerName = order.customer.fullName;
  const orderNum = order.orderNumber;
  const total = formatPKR(order.total);
  const itemsSummary = order.items
    .map((item) => {
      const engraving = item.customization?.engravingText
        ? ` [Engraved: "${item.customization.engravingText}"]`
        : "";
      return `• ${item.productName} (x${item.quantity})${engraving}`;
    })
    .join("\n");

  switch (targetStatus) {
    case "confirmed":
      return [
        `Assalam-o-Alaikum ${customerName},`,
        ``,
        `Thank you for ordering with *LaserUVCreatives*! ✨`,
        `Your Order *#${orderNum}* has been *Confirmed* for Cash on Delivery (COD).`,
        ``,
        `*Items Ordered:*`,
        itemsSummary,
        ``,
        `*Total COD Amount:* ${total}`,
        `*Delivery Address:* ${order.shippingAddress.addressLine}, ${order.shippingAddress.city}`,
        ``,
        `Our workshop craftsmen will begin your precision laser engraving shortly. We will update you once your pieces hit the engraving bed!`,
        ``,
        `LaserUVCreatives Studio`,
        `${STORE_CONFIG.contact.email}`,
      ].join("\n");

    case "in_engraving":
      return [
        `Assalam-o-Alaikum ${customerName},`,
        ``,
        `Exciting update on your LaserUVCreatives Order *#${orderNum}*! ⚡`,
        `Your personalized item(s) are *Currently On Our Laser Engraving Bed*.`,
        ``,
        `Our master engraver is etching your custom designs with high-precision fiber laser optics. Once engraving is done, your items will undergo ultrasonic cleaning, inspection, and luxury gift packaging.`,
        ``,
        `We will notify you the moment your parcel is handed over to the courier!`,
        ``,
        `LaserUVCreatives Workshop Team`,
      ].join("\n");

    case "dispatched":
      const courierName = order.courier?.carrier || "TCS";
      const tracking = order.courier?.trackingNumber || "Assigned shortly";
      return [
        `Assalam-o-Alaikum ${customerName},`,
        ``,
        `Great news! Your LaserUVCreatives Order *#${orderNum}* has been *Dispatched*! 📦🚀`,
        ``,
        `*Courier:* ${courierName}`,
        `*Tracking Number:* ${tracking}`,
        `*COD Amount to Pay Rider:* ${total}`,
        `*Destination:* ${order.shippingAddress.city}`,
        ``,
        `Standard delivery is 2–3 working days. Please ensure someone is available at the address with the exact cash amount for the rider.`,
        ``,
        `Thank you for supporting Pakistani craftsmanship!`,
        `LaserUVCreatives`,
      ].join("\n");

    case "delivered":
      return [
        `Assalam-o-Alaikum ${customerName},`,
        ``,
        `Your LaserUVCreatives Order *#${orderNum}* has been marked as *Delivered*! 🎉`,
        ``,
        `We hope your personalized item(s) exceeded your expectations in feel, finish, and engraving precision.`,
        ``,
        `If you loved your pieces, please reply with a quick photo or share your feedback. It means the world to our local artisan team!`,
        ``,
        `LaserUVCreatives Team`,
      ].join("\n");

    case "cancelled":
      return [
        `Assalam-o-Alaikum ${customerName},`,
        ``,
        `This is regarding your LaserUVCreatives Order *#${orderNum}*.`,
        `As discussed, your order has been cancelled. If this was an error or you would like to reactivate it, please reply to this message.`,
        ``,
        `LaserUVCreatives Team`,
      ].join("\n");

    default:
      return [
        `Assalam-o-Alaikum ${customerName},`,
        ``,
        `Regarding your LaserUVCreatives Order *#${orderNum}*:`,
        `Total: ${total}`,
        `Please let us know if you have any questions or customization edits.`,
      ].join("\n");
  }
}

/**
 * Builds direct WhatsApp redirect URL with pre-filled message.
 */
export function buildCustomerWhatsAppUrl(order: Order, status: OrderStatus): string {
  const phone = normalizeCustomerWhatsAppNumber(order.customer.phoneNumber);
  const message = buildOrderStatusWhatsAppMessage(order, status);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds direct WhatsApp quotation reply URL for bulk corporate leads.
 */
export function buildBulkLeadWhatsAppUrl(lead: BulkQuoteLead): string {
  const phone = normalizeCustomerWhatsAppNumber(lead.whatsappNumber);
  const message = [
    `Assalam-o-Alaikum ${lead.fullName},`,
    ``,
    `Thank you for your bulk inquiry regarding *${lead.productName}* for ${lead.companyName || "your organization"} (${lead.quantity} units).`,
    ``,
    `We have reviewed your customization requirements ("${lead.customizationRequirements}") and delivery schedule for ${lead.deliveryCity}.`,
    ``,
    lead.quotedAmountPKR
      ? `Our official discounted corporate rate is *${formatPKR(lead.quotedAmountPKR)}* including precision laser branding & velvet box packaging.`
      : `We are ready to share our official corporate quotation and sample photos.`,
    ``,
    `Please let us know how you would like to proceed.`,
    ``,
    `Best regards,`,
    `LaserUVCreatives Corporate Desk`,
  ].join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
