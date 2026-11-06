import { Order, OrderStatus } from "./order";
import { Product } from "./product";

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: "superadmin" | "manager" | "craftsman";
  lastLogin?: string;
}

export interface AdminMetric {
  id: string;
  title: string;
  value: string;
  rawNumber?: number;
  change?: string;
  isPositive?: boolean;
  subtext: string;
  iconName: "currency" | "orders" | "laser" | "truck" | "box" | "users";
}

export interface BulkQuoteLead {
  id: string;
  quoteNumber: string; // e.g. "QUOTE-301"
  fullName: string;
  companyName?: string;
  whatsappNumber: string;
  email?: string;
  productName: string;
  quantity: number | string;
  deliveryCity: string;
  requiredDate?: string;
  customizationRequirements: string;
  logoFileName?: string;
  additionalRequirements?: string;
  status: "new" | "contacted" | "quote_sent" | "converted" | "declined";
  quotedAmountPKR?: number;
  notes?: string;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  whatsappNumber: string;
  supportEmail: string;
  studioAddress: string;
  defaultCourier: "TCS" | "Leopard Courier" | "PostEx" | "Trax";
  announcementText: string;
  announcementEnabled: boolean;
  freeShippingThreshold: number; // PKR
  minimumOrderValue: number;    // PKR
  currencySymbol: string;
}

export interface AdminOrderActivity {
  id: string;
  timestamp: string;
  author: string;
  action: string;
  note?: string;
}
