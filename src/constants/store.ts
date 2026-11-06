/**
 * Store configuration constants for LaserUVCreatives.
 * Geared for the Pakistan market with PKR currency and Cash on Delivery.
 */
export const STORE_CONFIG = {
  name: "LaserUVCreatives",
  tagline: "Custom Laser & UV Engraved Gifts & Essentials",
  description:
    "Pakistan's premier personalized engraving studio for customized pens, wooden pens, executive gift sets, and custom engraved water bottles.",
  market: "Pakistan",
  currency: {
    code: "PKR",
    symbol: "Rs.",
    name: "Pakistani Rupee",
  },
  paymentMethods: ["Cash on Delivery (COD)"],
  shipping: {
    scope: "Nationwide (All Pakistan cities)",
    defaultCarrier: "TCS / Leopard / PostEx",
  },
  contact: {
    whatsapp: "923327009017",
    displayPhone: "03327009017",
    email: "engravenest@gmail.com",
    location: "Pakistan",
  },
  whatsappNumber: "923327009017",
  supportEmail: "engravenest@gmail.com",
  studioAddress: "Main Boulevard, Gulberg III / DHA Phase 5, Lahore, Pakistan",
} as const;

export const INITIAL_CATEGORIES = [
  {
    id: "customized-pens",
    name: "Customized Pens",
    description: "Laser-engraved metal, matte, and rollerball pens with custom name or designation.",
    badge: "Bestseller",
  },
  {
    id: "wooden-pens",
    name: "Wooden Pens & Cases",
    description: "Premium handcrafted wooden pens crafted with rich natural grain and precision engraving.",
    badge: "Popular",
  },
  {
    id: "gift-sets",
    name: "Executive Gift Sets",
    description: "Curated gift boxes including personalized pen, keychain, diary, or cardholder.",
    badge: "Ideal for Corporate",
  },
  {
    id: "water-bottles",
    name: "Customized Water Bottles",
    description: "Double-wall insulated stainless steel bottles engraved with personal names or corporate logos.",
    badge: "Trending",
  },
] as const;
