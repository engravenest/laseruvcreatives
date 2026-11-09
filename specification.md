# LaserUVCreatives System Specification

Updated: 2026-11-09. Describes the current implementation; dated validation results are recorded in `tasks.md`.

## 1. System Overview & Architecture

### 1.1 Project Purpose
LaserUVCreatives is a specialized Pakistani e-commerce platform dedicated to customized laser-engraved and UV-printed gifts, executive stationery, and corporate merchandise. The application blends real-time customization, local Pakistani currency (`PKR`), Cash on Delivery (COD), and WhatsApp integration for both retail shoppers and administrative operations.

### 1.2 Technology Stack
- **Framework**: Next.js 16.3.6 (App Router; `npm run dev` uses Webpack)
- **Frontend Core**: React 19.2.8
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`) + Vanilla CSS tokens
- **Type Safety**: TypeScript 5 with strict typing
- **Icons & Graphics**: Heroicons inline SVG & Tailwind icons
- **State Management**: React Context (`CartContext` for customer cart, `AdminContext` for admin state & storage)
- **Storage Layer**: Native node:sqlite persistence with browser caches and remaining browser-only features. Prisma/PostgreSQL is an incomplete migration scaffold.

---

## 2. Codebase Map & Directory Blueprint

```
laseruvcreatives/
├── constitution.md               # System principles, invariants, and architectural rules
├── specification.md              # Complete functional & technical specifications
├── plan.md                       # Implementation roadmap & phased strategy
├── tasks.md                      # Exhaustive task checklist
├── package.json                  # Next.js 16, React 19, Tailwind v4
├── next.config.ts                # Next.js compiler & asset config
├── tsconfig.json                 # TypeScript strict configuration with `@/*` aliases
└── src/
    ├── app/
    │   ├── layout.tsx            # Root fonts, CustomerAuthProvider, CartProvider, conditional storefront chrome
    │   ├── page.tsx              # Public home page (Hero, Categories, Reviews, CTA)
    │   ├── globals.css           # Global Tailwind v4 styles & base resets
    │   ├── shop/
    │   │   └── page.tsx          # Full product catalog with filters and search
    │   ├── products/
    │   │   └── [slug]/
    │   │       └── page.tsx      # Product detail view with live laser preview
    │   ├── cart/
    │   │   └── page.tsx          # Shopping cart with customization badges & COD
    │   ├── bulk-orders/
    │   │   └── page.tsx          # Corporate & bulk quotation inquiry builder
    │   └── admin/                # Dedicated Admin Portal (Isolated Layout)
    │       ├── layout.tsx        # Admin shell: sidebar, topbar, auth guard
    │       ├── page.tsx          # Executive dashboard: KPIs, revenue, quick actions
    │       ├── login/
    │       │   └── page.tsx      # Admin email/password authentication screen
    │       ├── products/
    │       │   ├── page.tsx      # Product list, stock toggle, search & filter
    │       │   ├── new/
    │       │   │   └── page.tsx  # Create new product with customization rules
    │       │   └── [id]/
    │       │       └── page.tsx  # Edit existing product & customization specs
    │       ├── categories/
    │       │   └── page.tsx      # Category titles, slugs, descriptions, SEO
    │       ├── orders/
    │       │   ├── page.tsx      # Order management table, filter by status
    │       │   └── [id]/
    │       │       └── page.tsx  # Order details, laser job sheet, WhatsApp dispatch
    │       ├── bulk-quotes/
    │       │   └── page.tsx      # Bulk quotation lead tracker & WhatsApp reply
    │       └── settings/
    │           └── page.tsx      # Store settings, WhatsApp number, courier config
    ├── components/
    │   ├── layout/
    │   │   ├── CartAwareHeader.tsx # Client wrapper injecting cart item count
    │   │   ├── Header.tsx          # Public store navigation header
    │   │   ├── Navbar.tsx          # Secondary category navigation bar
    │   │   ├── Footer.tsx          # Public store footer with Pakistan links
    │   │   └── ConditionalStorefrontLayout.tsx # Conditional storefront chrome
    │   ├── home/
    │   │   ├── Hero.tsx            # Hero section with primary CTAs
    │   │   ├── CategorySection.tsx # Category showcase cards
    │   │   ├── FeaturedProducts.tsx# Bestseller products grid
    │   │   ├── HowItWorks.tsx      # 4-step personalization workflow
    │   │   ├── WhyUs.tsx           # 5 pillars of LaserUVCreatives
    │   │   ├── ReviewsSection.tsx  # Customer testimonials from Lahore/Karachi/Islamabad
    │   │   └── CtaBanner.tsx       # Bottom call-to-action banner
    │   ├── product/
    │   │   ├── ProductCard.tsx     # Reusable product grid card
    │   │   ├── ProductGrid.tsx     # Responsive grid container
    │   │   ├── ProductFilters.tsx  # Category & sort controls
    │   │   ├── ProductGallery.tsx  # Image gallery & thumbnails
    │   │   ├── ProductDetailView.tsx # Product page container
    │   │   ├── CustomizationForm.tsx # Engraving text, font picker, logo upload
    │   │   ├── CustomizationModal.tsx# Quick customization popup
    │   │   └── QuantitySelector.tsx # Increment/decrement control
    │   ├── admin/
    │   │   ├── AdminSidebar.tsx    # Collapsible sidebar with navigation items
    │   │   ├── AdminTopbar.tsx     # Top bar with breadcrumbs & store link
    │   │   ├── KpiCard.tsx         # Metric display card with trend badges
    │   │   ├── StatusBadge.tsx     # Order status pill badge (Engraving, Dispatched, etc.)
    │   │   ├── OrderStatusSelect.tsx # Quick status changer dropdown
    │   │   ├── WhatsAppNotifyButton.tsx # One-click WhatsApp message dispatcher
    │   │   └── JobSheetModal.tsx   # Printable laser workshop engraving sheet
    │   └── ui/
    │       └── SearchBar.tsx       # Search input component
    ├── constants/
    │   └── store.ts              # Store brand, contact, currency, and initial categories
    ├── context/
    │   ├── CartContext.tsx       # Customer shopping cart provider & localStorage sync
    │   └── AdminContext.tsx      # Administrative state, orders, products & settings
    ├── data/
    │   ├── products.ts           # Seed catalog and categories with customization rules
    │   ├── mockProducts.ts       # Mock products for showcase
    │   ├── mockReviews.ts        # Customer reviews data
    │   └── mockAdminOrders.ts    # Realistic seed orders for admin management
    ├── lib/
    │   ├── serverDb.ts           # SQLite persistence, catalog migration, redirects
    │   ├── catalog.ts            # Slugs, memberships, validation, video URLs
    │   ├── catalogMetadata.ts    # Canonical origin from config/request
    │   ├── useCategories.ts      # Category API refresh hook
    │   ├── storeSync.ts          # Live product API hook and browser events
    │   ├── utils.ts              # formatPKR, isValidPakistaniPhone, class merger
    │   ├── whatsapp.ts           # Bulk quote & general WhatsApp link generators
    │   └── adminWhatsApp.ts      # Administrative customer order update message builders
    └── types/
        ├── product.ts            # Product, Category, Variant, Customization interfaces
        ├── cart.ts               # CartItem, CartItemCustomization, CartSummary
        ├── order.ts              # Order, OrderStatus, ShippingAddress, PaymentMethod
        └── admin.ts              # AdminUser, AdminMetric, BulkQuoteLead, StoreSettings
```

---

## 3. Core Data Schemas

### 3.1 Product & Customization (`src/types/product.ts`)
```typescript
export type ProductCustomizationType = "text" | "logo" | "both" | "none";

export interface CustomizationOption {
  allowsText: boolean;
  maxTextLength: number;         // e.g. 25 or 30 characters
  textLabel?: string;            // e.g. "Name or Designation"
  allowsLogo: boolean;
  logoLabel?: string;            // e.g. "Upload Company / Brand Logo"
  supportedFormats?: string[];   // ["PNG", "JPG", "SVG", "PDF"]
  engravingLocations: string[];  // ["Pen Barrel", "Clip Cap", "Gift Box Cover"]
  fontOptions: { id: string; name: string; styleClass: string }[];
  placeholderText?: string;
  notes?: string;
}

export interface ProductVariant {
  id: string;
  name: string; // "Color", "Finish", "Wood Type"
  options: {
    id: string;
    label: string;
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
  price: number;                 // Integer PKR (e.g. 1450)
  originalPrice?: number;        // For discount display
  categorySlug: string;          // Primary category
  categorySlugs?: string[];      // All selected categories
  seo?: { title: string; description: string };
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
```

### 3.2 Cart & Customization (`src/types/cart.ts`)
```typescript
export interface CartItemCustomization {
  engravingText?: string;
  fontChoice?: string;
  engravingLocation?: string;
  logoFileName?: string;
  specialInstructions?: string;
}

export interface CartItem {
  id: string;                    // Unique hash (productId + variant + customization)
  productId: string;
  productSlug: string;
  productName: string;
  unitPrice: number;             // PKR
  quantity: number;
  image: string;
  selectedVariants: Record<string, string>;
  customization?: CartItemCustomization;
}
```

### 3.3 Orders & Fulfillment (`src/types/order.ts`)
```typescript
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
  phoneNumber: string;           // Pakistani mobile (e.g. 03001234567)
  city: string;                  // e.g. Lahore, Karachi, Islamabad
  province: "Punjab" | "Sindh" | "Khyber Pakhtunkhwa" | "Balochistan" | "Islamabad Capital Territory" | "Azad Kashmir" | "Gilgit-Baltistan";
  addressLine: string;
  nearestLandmark?: string;
  postalCode?: string;
}

export interface Order {
  id: string;
  orderNumber: string;           // e.g. "LUC-1001"
  customer: {
    fullName: string;
    phoneNumber: string;
    email?: string;
  };
  shippingAddress: ShippingAddress;
  items: CartItem[];
  paymentMethod: PaymentMethod;
  paymentStatus: "unpaid" | "paid_on_delivery";
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  courier?: {
    carrier: "TCS" | "Leopard Courier" | "PostEx" | "Trax" | "Other";
    trackingNumber?: string;
    dispatchedAt?: string;
  };
  notes?: string;
}
```

---

## 4. Admin Dashboard Detailed Specification

### 4.1 Route Hierarchy
- `/admin` : Executive KPI dashboard, sales metrics, quick stats, active engraving queue, recent orders.
- `/admin/login` : Administrator email/password authentication with a database-backed HTTP-only session cookie.
- `/admin/products` : Complete product inventory table with quick in-stock toggles, category filtering, search, and action menus.
- `/admin/products/new` : Comprehensive product creation form with full customization rules configurator (allowed fonts, engraving locations, max characters, logo upload toggle).
- `/admin/products/[id]` : Product editor with SEO, multiple categories, specification rows, hosted video ID, and slug preview; changes save on submission.
- `/admin/categories` : Edit existing category titles, slugs, descriptions, and SEO; save redirects and membership changes atomically.
- `/admin/orders` : Order management hub with tabbed filtering (`All`, `Pending`, `In Engraving`, `Dispatched`, `Delivered`, `Cancelled`), multi-field search, and status quick-actions.
- `/admin/orders/[id]` : Deep order inspection:
  - Line items with highlighted custom engraving text and font style.
  - One-click WhatsApp message dispatcher to send status updates directly to the customer.
  - Workshop Laser Job Sheet view (printable modal for the engraving operator).
  - Courier assignment (TCS, Leopard, PostEx) and tracking number entry.
- `/admin/bulk-quotes` : Dedicated lead tracker for corporate inquiries submitted via `/bulk-orders`.
- `/admin/settings` : Store parameters (WhatsApp contact numbers, email, default courier, notification messages, announcement bar toggle).

### 4.2 Administrative Navigation & Layout (`src/app/admin/layout.tsx`)
- Does NOT render the customer `CartAwareHeader` or `Footer`.
- Left Sidebar:
  - Brand header: LaserUVCreatives Admin with laser icon badge.
  - Links:
    - Overview (`/admin`)
    - Orders (`/admin/orders`) with unread/pending badge
    - Products (`/admin/products`)
    - Categories (`/admin/categories`)
    - Bulk Inquiries (`/admin/bulk-quotes`)
    - Store Settings (`/admin/settings`)
  - Bottom controls:
    - "View Live Store" link (opens `/` in new tab)
    - Admin profile & Logout button
- Top Header:
  - Breadcrumbs showing current page.
  - Quick action: "Add Product" button.
  - Quick search shortcut.
  - Admin status indicator ("Production Mode - Local Storage Sync").

### 4.3 WhatsApp Customer Notification Engine (`src/lib/adminWhatsApp.ts`)
The Admin system generates direct `https://wa.me/{phone}?text=...` links for key order milestones:
1. **Order Confirmation**:
   > *"Assalam-o-Alaikum [Name]! Thank you for ordering with LaserUVCreatives. Your Order #[OrderNumber] for [Items] (Total: Rs. [Total]) has been confirmed for Cash on Delivery. Our workshop will start precision laser engraving shortly."*
2. **In Engraving (Workshop Stage)**:
   > *"Hi [Name]! Great news — your personalized items for Order #[OrderNumber] with engraving text '[Text]' are currently on our laser engraving bed. We will inspect and polish your order next."*
3. **Dispatched with Courier Tracking**:
   > *"Assalam-o-Alaikum [Name]! Your LaserUVCreatives Order #[OrderNumber] has been dispatched via [Courier] with Tracking Number: [TrackingNumber]. Please keep Rs. [Total] cash ready for the rider. Delivery takes 2-3 business days across Pakistan."*
4. **Delivered & Feedback**:
   > *"Dear [Name], your order #[OrderNumber] has been delivered! We hope you love the craftsmanship. Please reply with a photo of your customized item or tag us!"*

### 4.4 Workshop Laser Job Sheet (Engraver Modal)
- Dedicated print-friendly view for the workshop craftsman.
- Displays:
  - Order Number & Date.
  - Product Name & Selected Variant (e.g. Matte Black Rollerball).
  - Exact Engraving Text enclosed in high-contrast box with character count.
  - Chosen Font Style Name & visual preview.
  - Engraving Location (e.g. "Pen Barrel, center-aligned").
  - Attached Logo indicator / file name.
  - Special Instructions note.

---

## 5. Current storage and integration boundaries

| Area | Implementation | Remaining limitation |
|---|---|---|
| Accounts, OTPs, sessions | SQLite through `src/lib/serverDb.ts` and `src/lib/auth.ts` | Requires a Node runtime supporting `node:sqlite` and persistent writable disk |
| Products | SQLite API CRUD; admin refresh caches records | Shop/details render database records; `useLiveProducts` fetches `/api/products`, including an empty catalog |
| Categories and redirects | SQLite `categories` and `catalog_redirects` | Public GET `/api/categories`; admin-only PUT; old product/category slugs resolve to current URLs |
| Orders | SQLite creation/read/status APIs, plus browser cache | Checkout waits for server acceptance before confirmation/cart clearing; server calculates catalog prices and province shipping |
| Cart | `CartContext`, localStorage | Browser/device-local |
| Bulk leads | `saveBulkLeadToStore`, admin browser state | SQLite table/helpers exist but UI is not connected to a bulk-quote API |
| Settings | `AdminContext`, localStorage | No active settings API or SQLite settings table; storefront propagation is incomplete |
| Contact | SQLite save followed by Resend/SMTP | Failed delivery returns 502 after the inquiry has been stored |
| Product uploads | Admin-only API writing `public/uploads/products` | Local files require persistent deployment storage |

Actual admin cache keys are `luc_admin_products`, `luc_admin_orders`, `luc_admin_bulk_leads`, and `luc_admin_settings`. Events include `luc_products_updated`, `luc_orders_updated`, `luc_bulk_leads_updated`, and `luc_categories_updated`. Browser events/storage do not synchronize different customers' devices. Admin bulk-lead state loads at initialization without subscribing to lead update events.

`AdminContext` exposes `addProduct`, `updateProduct`, `deleteProduct`, `toggleStock`, `updateOrderStatus`, `getOrderById`, `addOrder`, `updateLeadStatus`, `updateSettings`, `login`, `logout`, `refreshData`, and `resetDemoData`. Product and order mutations update local state after the server confirms the change. Failed requests display a dismissible error in the admin dashboard. Demo reset changes browser state/storage rather than resetting SQLite. Dashboard revenue currently sums all non-cancelled orders, including pending orders; it does not represent collected revenue.

### 5.1 Database and data contracts

`data/laseruv.db` initializes lazily, enables WAL and foreign keys, and contains `users`, `sessions`, `products`, `orders`, `order_items`, `contact_submissions`, `bulk_quotes`, `categories`, and `catalog_redirects`. The additive catalog migration also introduces `products.catalog_json` for category memberships, SEO, video, and variants. Empty catalog/order tables receive seed products/demo orders. Initial admin credentials use `ADMIN_EMAIL` and `ADMIN_PASSWORD` with a hardcoded fallback still present in source; removing that fallback remains outstanding.

Canonical interfaces live in `src/types/product.ts`, `cart.ts`, `order.ts`, and `admin.ts`. Preserve engraving text, font, location, logo filename, instructions, and selected variants through cart/order processing. Customer logo selection currently retains a filename rather than a durable uploaded asset. Database image normalization supports metadata (`id`, `url`, `altText`, `isMain`, `order`), while storefront consumers use flat URL arrays. Product create/update preserves structured image metadata; variants are stored in catalog JSON with seed fallback for older products. Broader contract cleanup remains a follow-up.

`prisma/schema.prisma` defines PostgreSQL Product, Order, OrderItem, BulkQuoteLead, and StoreSettings models. `src/lib/prisma.ts` configures a Prisma client using `DATABASE_URL`. Current API handlers use SQLite `serverDb`; the PostgreSQL schema lacks the active account/session/OTP model. Migration requires schema reconciliation, data transfer, API integration, and verification. A zero-refactor migration is not established.

## 6. Authentication and API map

- Customer pages: `/login`, `/register`, `/forgot-password`, `/account`; checkout supports guests.
- Customer auth APIs under `/api/auth`: `register`, `login`, `me`, `logout`, `verify-otp`, `resend-otp`, `forgot-password`, `reset-password`.
- Account APIs under `/api/customer`: `profile`, `orders`, `change-password`.
- Admin auth: `/api/admin/login`, `/api/admin/me`, `/api/admin/logout`.
- Catalog: public GET `/api/products` and `/api/products/[id]`; admin POST/PUT/DELETE mutations.
- Categories: public GET `/api/categories`; authenticated admin PUT `/api/categories` with the category ID.
- Orders: `/api/orders` allows guest creation, admin list reads, and customer reads scoped by user/email; `/api/orders/[id]` handles detail/status operations.
- Contact: POST `/api/contact` validates fields/honeypot, stores the inquiry, then sends email with the customer's Reply-To.
- Upload: POST `/api/admin/upload` accepts `file`/`files`, JPG/PNG/WEBP/SVG/GIF, maximum 5 MB per file, after admin authorization.

Passwords use salted scrypt; session tokens are stored as SHA-256 hashes in SQLite. Cookies `luc_customer_session` and `luc_admin_session` are HTTP-only, SameSite=lax, secure in production, and last seven days. Admin session validation checks the role. Six-digit OTPs expire after ten minutes, allow five failed attempts per code, and have a sixty-second resend cooldown. Password reset reuses OTP verification and revokes user sessions.

`src/proxy.ts` redirects protected account/admin page navigation when the respective cookie is absent, excluding `/admin/login`. It checks presence only; handlers must validate sessions and ownership. The admin guard adds session checking. Root customer-auth/cart providers also wrap admin pages; AdminProvider belongs to the admin layout.

## 7. Configuration and operations

`src/constants/store.ts` centralizes brand, PKR, COD, Pakistan coverage, WhatsApp `923327009017`, phone `03327009017`, and support email `engravenest@gmail.com`. Formatting/phone helpers live in `src/lib/utils.ts`. Shipping costs Rs. 299 for Punjab and Rs. 399 for other supported provinces/territories, enforced by the order API. A complete delivery address is required. Signed-in checkout saves new addresses and permits reuse, with a maximum of five enforced by checkout and profile APIs. Confirmation links to the customer dashboard. Database categories are authoritative for active catalog editors, filters, homepage, and footer. Legacy `INITIAL_CATEGORIES` constants remain separate from the seed catalog.

Email uses `RESEND_API_KEY` first, otherwise `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`; `EMAIL_FROM` controls sender identity. Missing configuration or provider failure returns an error. Provider acceptance does not guarantee inbox delivery. WhatsApp integrations open prefilled links for a person to send.

Package scripts are `dev`, `build`, `start`, and `lint`. Use `npm.cmd`/`npx.cmd` on Windows PowerShell. Follow `AGENTS.md` and read relevant installed Next.js guides in `node_modules/next/dist/docs/` before framework edits. No build or runtime checks were performed for this documentation update.

## Shared color theme (2026-11-03)

The site uses light styling as its fallback and follows device color preference until a user chooses Light or Dark. A single sun/moon button in the header (including admin) switches directly between light and dark without a dropdown. Device preference applies until the first manual choice. The choice is stored in `luc_theme`; the root dark class controls Tailwind variants across routes. Contact, account, authentication, admin screens, and footer support both themes.


## Catalog management (2026-11-06)

Products and categories have optional SEO titles/descriptions and comma-separated meta keywords. `/admin/categories` edits the seeded categories, including titles, slugs, descriptions, and SEO. Product editors support multiple categories (one primary), editable specification name/value rows, and an optional YouTube or Vimeo video ID. Videos must permit embedding; this is hosted-video embedding, not direct video-file storage.

The SQLite catalog adds `products.catalog_json`, `categories`, and `catalog_redirects` without replacing existing data. Category renames update product memberships in the same transaction. Redirects reference entity IDs so all historical slugs resolve directly to the current slug. Slugs are previewed while typing and only persisted on successful submission; collision failures roll back the save. Public reads use SQLite; category writes require an authenticated admin.

Product pages and shop pages use request-time database data and generated SEO metadata. Category URLs remain `/shop?category=slug`; old product/category URLs permanently redirect (308). Public filters, home categories, and footer categories refresh from the APIs. Optional `NEXT_PUBLIC_SITE_URL` pins the canonical origin; otherwise metadata uses the request host. The bulk panel's nationwide-delivery sentence is removed.

On product detail pages, the engraving text field (including Company Name or Custom Text) is required when text customization is enabled. Empty or whitespace-only values block Add to Cart and Buy Now, with a focused field and inline error. Logo-only products are unaffected.

## Website management extension (2026-11-09)

Admin navigation now includes `/admin/pages`, `/admin/coupons`, and `/admin/appearance`. Authenticated CRUD APIs live at `/api/admin/site/[resource]` for pages, coupons, and colors. `site_documents` stores pages/themes; `coupons` stores definitions; `coupon_uses` keeps the order ID, customer ID, code and actual discount. Migrations are additive.

Pages: built-in Home, Shop, Contact and Bulk Orders have editable titles, introduction text and SEO title/description/keywords. Home also exposes section headings, introductory content and visibility for Categories, Featured Products, How It Works, Why Us, Reviews and CTA. Additional plain-text sections can be added. Existing interactive forms and catalog widgets remain functional. New single-segment URLs such as `/about-us` use draft/published status and optional footer links; drafts return 404 publicly. Saved slugs remain fixed. Editor previews do not publish automatically.

Colors: Amber (#f59e0b), Emerald (#10b981), Royal blue (#3b82f6), and Rose (#f43f5e) presets plus custom six-digit hex values for primary color and light/dark backgrounds, surfaces and text. Preview is local until Save. Settings apply to the storefront, preserving the admin editing palette and the existing device/manual light-dark preference. Public `/api/site` exposes colors and published footer links, never coupon eligibility or drafts.

Coupons: fixed PKR or whole-number percentage discounts, create/edit/activate/deactivate/delete, expiry in UTC, minimum subtotal, total usage limit (0 = unlimited), per-customer usage limit, and optional assigned email list. All products qualify. Customers must sign in with a verified account; guest checkout remains available without coupons. Checkout Apply validates prices via `/api/coupons/validate`; order placement checks again in a SQLite transaction and stores redemption atomically. One coupon per order; product discount is capped at subtotal and cannot consume shipping. Uses are counted on placement and are not automatically restored on cancellation. Deletion hides/deactivates the code while retaining historical usage and order totals.

Live deployment requires pushing these source changes, pulling safely on hosting, building with Webpack and restarting. Live database and uploads must be preserved.
