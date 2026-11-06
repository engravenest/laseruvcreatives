/**
 * Cart TypeScript interfaces for LaserUVCreatives.
 * Supports full customization preservation per item.
 */

export interface CartItemCustomization {
  /** The engraved name / text chosen by the customer */
  engravingText?: string;
  /** Font name (e.g. "Elegant Script Calligraphy") */
  fontChoice?: string;
  /** Engraving location (e.g. "Pen Barrel") */
  engravingLocation?: string;
  /**
   * Object-URL or filename of an uploaded logo.
   * NOTE: Object URLs (blob:) are session-only and will not survive a page reload.
   * We store the filename for display purposes across sessions.
   */
  logoFileName?: string;
  /** Special instructions entered by customer */
  specialInstructions?: string;
}

export interface CartItem {
  /** Unique cart-line ID – generated at add-time (productId + variant hash + customization hash) */
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  /** Price per unit in PKR at time of add-to-cart */
  unitPrice: number;
  quantity: number;
  /** Primary image path for display */
  image: string;
  /** Selected variant option IDs keyed by variant ID  e.g. { finish: "matte-black" } */
  selectedVariants: Record<string, string>;
  customization?: CartItemCustomization;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  /** Shipping is calculated from the delivery province and enforced server-side */
  shippingFee: number;
  total: number;
}
