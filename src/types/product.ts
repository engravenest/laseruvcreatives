/**
 * Product & Customization TypeScript interfaces for LaserUVCreatives.
 * Clean, database-ready schema ready for future Supabase or PostgreSQL integration.
 */

export type ProductCustomizationType = "text" | "logo" | "both" | "none";

export interface CustomizationOption {
  allowsText: boolean;
  maxTextLength: number; // e.g. 25 or 30 characters
  textLabel?: string; // e.g. "Name or Designation"
  allowsLogo: boolean;
  logoLabel?: string; // e.g. "Upload Company / Brand Logo"
  supportedFormats?: string[]; // e.g. ["PNG", "JPG", "SVG", "PDF"]
  engravingLocations: string[]; // e.g. ["Pen Barrel", "Clip Cap", "Gift Box Cover"]
  fontOptions: { id: string; name: string; styleClass: string }[];
  placeholderText?: string;
  notes?: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Color", "Wood Type", "Finish"
  options: {
    id: string;
    label: string; // e.g. "Matte Black", "Rose Gold", "Walnut"
    inStock: boolean;
  }[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  description: string;
  detailedDescription?: string;
  price: number; // in PKR
  originalPrice?: number; // for showing discount
  categorySlug: string;
  categorySlugs?: string[];
  seo?: { title: string; description: string; keywords?: string };
  video?: { provider: "youtube" | "vimeo"; id: string } | null;
  categoryName: string;
  images: string[];
  inStock: boolean;
  rating: number;
  reviewsCount: number;
  badge?: "Bestseller" | "Popular" | "New" | "Trending" | "Limited";
  customization: CustomizationOption;
  variants?: ProductVariant[];
  specs?: Record<string, string>;
  includedItems?: string[];
  deliveryEstimate?: string;
  createdAt?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  seo?: { title: string; description: string; keywords?: string };
  description: string;
  image: string;
  productCount: number;
}
