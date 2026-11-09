import { CartItem } from "./cart";

/**
 * Order & Checkout TypeScript interfaces for LaserUVCreatives.
 */

export type OrderStatus =
  | "pending_confirmation"
  | "confirmed"
  | "in_engraving"
  | "dispatched"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "Cash on Delivery (COD)";

export interface ShippingAddress {
  fullName: string;
  phoneNumber: string; // e.g. "03001234567"
  city: string; // e.g. "Lahore", "Karachi", "Islamabad", etc.
  province: "Punjab" | "Sindh" | "Khyber Pakhtunkhwa" | "Balochistan" | "Islamabad Capital Territory" | "Azad Kashmir" | "Gilgit-Baltistan";
  addressLine: string;
  nearestLandmark?: string;
  postalCode?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "LUC-1001"
  customer: {
    fullName: string;
    phoneNumber: string;
    email?: string;
  };
  shippingAddress: ShippingAddress;
  items: CartItem[];
  paymentMethod: PaymentMethod;
  paymentStatus: "unpaid" | "paid_on_delivery";
  couponCode?: string;
  discount?: number;
  subtotal: number; // PKR
  shippingFee: number; // PKR
  total: number; // PKR
  status: OrderStatus;
  createdAt: string;
  courier?: {
    carrier: "TCS" | "Leopard Courier" | "PostEx" | "Trax" | "Other";
    trackingNumber?: string;
    dispatchedAt?: string;
  };
  notes?: string;
}
