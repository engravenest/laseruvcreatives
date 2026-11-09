# LaserUVCreatives Implementation Plan

Updated: 2026-11-09. The phases below retain the original roadmap, with corrected authentication and persistence terminology. They do not certify current runtime behavior.

## Current follow-up priorities

1. Connect bulk leads and store settings to server APIs; apply saved settings to storefront flows.
2. Remove hardcoded bootstrap credentials; complete authorization, ownership, order-status, and OTP/password-reset audits.
3. Persist customer logo assets and finish remaining image/variant contract cleanup.
4. Configure and verify transactional email for registration, password resets, and contact messages.
5. Validate persistent SQLite/uploads, backups, public origin, and HTTPS for hosting, or complete PostgreSQL/object-storage migration.
6. Complete production build, full lint review, and browser end-to-end checks before launch.

Completed: server-confirmed checkout and admin saves; server-priced checkout and province shipping; guest cart persistence; shared theme; API-backed storefront catalog; category editing; SEO; multiple categories; specification editing; YouTube/Vimeo embeds; atomic slug redirects.


## 1. Executive Summary
The original roadmap below outlines the phased implementation strategy for building a high-performance, luxury-styled **Admin Dashboard** for LaserUVCreatives. The implementation will preserve complete separation between customer storefront routes and administrative tooling, providing the business owner with immediate command over inventory, order fulfillment, workshop laser engraving sheets, and customer WhatsApp communication.

---

## 2. Implementation Phases

```
┌────────────────────────────────────────────────────────┐
│ Phase 1: Architectural Foundation & Route Decoupling  │
├────────────────────────────────────────────────────────┤
│ Phase 2: Administrative State & Seed Data Engine       │
├────────────────────────────────────────────────────────┤
│ Phase 3: Authentication Gatekeeper & Session Guard     │
├────────────────────────────────────────────────────────┤
│ Phase 4: Luxury Admin Layout Shell & Reusable UI Kit   │
├────────────────────────────────────────────────────────┤
│ Phase 5: Executive Overview Dashboard (/admin)        │
├────────────────────────────────────────────────────────┤
│ Phase 6: Product Catalog Management (CRUD + Rules)     │
├────────────────────────────────────────────────────────┤
│ Phase 7: Order Management & Laser Workshop Job Sheet   │
├────────────────────────────────────────────────────────┤
│ Phase 8: Bulk Quote Leads & Store Settings Manager     │
├────────────────────────────────────────────────────────┤
│ Phase 9: Verification, TypeScript Integrity & Testing  │
└────────────────────────────────────────────────────────┘
```

---

### Phase 1: Architectural Foundation & Route Decoupling
- **Goal**: Guarantee that `/admin/*` routes have a completely clean, isolated layout without customer `CartAwareHeader` or `Footer`.
- **Key Deliverables**:
  1. Inspect and update `src/app/layout.tsx` or create dedicated route handling to prevent customer storefront chrome from rendering on `/admin` paths.
  2. Create `src/types/admin.ts` defining:
     - `AdminUser`: session credentials and profile.
     - `AdminOrder`: extended order model with workshop notes & courier fields.
     - `AdminMetric`: KPI calculation structures.
     - `BulkQuoteLead`: structured leads captured from bulk quotation inquiries.
     - `StoreSettings`: runtime configurable store parameters.

### Phase 2: Administrative State & Seed Data Engine
- **Goal**: Provide an instant, reactive admin state backed by SQLite product/order APIs with browser caches with rich, realistic Pakistani e-commerce seed data.
- **Key Deliverables**:
  1. Create `src/data/mockAdminOrders.ts`:
     - 10+ realistic Pakistani orders spanning Lahore, Karachi, Islamabad, Faisalabad, Peshawar, and Sialkot.
     - Genuine personalization details: custom executive names ("Dr. Arham Malik", "Advocate Zeeshan Khan", "Syeda Maryam Gilani"), font choices, engraving placements, and uploaded logo indicators.
     - Realistic order states: `pending_confirmation`, `confirmed`, `in_engraving`, `dispatched`, `delivered`, `cancelled`.
  2. Create `src/lib/adminWhatsApp.ts`:
     - Automated WhatsApp link generator creating polite, professional Urdu/English status notification messages.
     - Status-specific templates: Order Confirmation, In-Engraving, Courier Dispatched with tracking, Delivered.
  3. Create `src/context/AdminContext.tsx`:
     - Reactive provider managing `products`, `orders`, `bulkQuotes`, `settings`, and `auth`.
     - Products/orders refresh from APIs and cache under `luc_admin_*`; bulk leads/settings still require server integration.
     - Full CRUD methods: `updateOrderStatus`, `updateProduct`, `addProduct`, `deleteProduct`, `toggleStock`, `saveSettings`.

### Phase 3: Authentication Gatekeeper & Session Guard
- **Goal**: Secure administrative pages with email/password login and database-backed sessions.
- **Key Deliverables**:
  1. Create `src/app/admin/login/page.tsx`:
     - High-end dark aesthetic with glowing gold accents.
     - Email/password submission to `/api/admin/login`, salted password verification, and HTTP-only session cookies.
     - Seven-day database-backed session using an HTTP-only cookie; browser storage must not authorize access.
  2. Build `AdminAuthGuard`:
     - Wraps administrative pages.
     - Redirects unauthenticated visitors to `/admin/login` while preserving intended destination.

### Phase 4: Luxury Admin Layout Shell & Reusable UI Kit
- **Goal**: Establish a unified, responsive admin dashboard shell with navigation, top bar, and consistent UI primitives.
- **Key Deliverables**:
  1. `src/app/admin/layout.tsx`: Root administrative layout wrapping `AdminProvider` and `AdminLayoutShell`.
  2. `src/components/admin/AdminSidebar.tsx`:
     - Brand logo with laser engraving icon.
     - Navigation items with real-time badges (e.g., active orders count).
     - Mobile drawer support for managing orders from a smartphone.
     - Direct "View Live Store" link and Logout button.
  3. `src/components/admin/AdminTopbar.tsx`:
     - Dynamic breadcrumb navigation.
     - Quick "Add Product" button.
     - Current admin status badge (a status label reflecting actual backend state).
  4. Core Reusable Admin Components:
     - `KpiCard.tsx`: Metric card with icon, value in PKR, change indicator, and subtext.
     - `StatusBadge.tsx`: Color-coded pill badge for order statuses with glowing dot.
     - `OrderStatusSelect.tsx`: Fast inline status updater dropdown.

### Phase 5: Executive Overview Dashboard (`/admin/page.tsx`)
- **Goal**: Give the business owner an instant high-level snapshot of their business upon logging in.
- **Key Deliverables**:
  1. KPI Row:
     - **Total Revenue (PKR)**: Currently sums all non-cancelled orders, including pending orders; separate booked value from collected revenue in follow-up work.
     - **Active Orders**: Count of orders currently requiring action (`pending_confirmation` + `in_engraving`).
     - **Workshop Queue**: Count of items currently on the engraving bed.
     - **Today's Orders & Deliveries**: Velocity metrics.
  2. Status Distribution Banner:
     - Visual breakdown of orders by pipeline stage.
  3. Recent Orders Quick-Action Table:
     - Last 5 orders with customer name, city, items summary, amount, and 1-click status / WhatsApp dispatch buttons.
  4. Quick Launch Action Bar:
     - "Create Product", "View All Orders", "Review Bulk Leads", "Store Settings".

### Phase 6: Product Catalog Management (`/admin/products/*`)
- **Goal**: Allow complete control over store inventory and laser customization rules.
- **Key Deliverables**:
  1. `/admin/products/page.tsx`:
     - Table listing all products with thumbnail, SKU/ID, category, price (PKR), stock toggle, and action buttons.
     - Live search filter and category selector.
     - One-click `inStock` toggle updating both store and admin in real time.
  2. `/admin/products/new/page.tsx` & `/admin/products/[id]/page.tsx`:
     - Full product editor form: Name, live slug preview, primary/additional categories, price in PKR, original price, description, images, specifications, SEO, and YouTube/Vimeo ID. Saving a changed slug creates a permanent redirect.
     - **Customization Settings Configurator**:
       - Toggle Text Engraving (enable/disable, max characters, placeholder).
       - Toggle Logo Engraving (enable/disable, supported formats).
       - Engraving Location Tags (e.g. "Pen Barrel", "Clip Cap", "Gift Box Lid").
       - Allowed Font Styles selector.

### Phase 7: Order Management & Laser Workshop Job Sheet (`/admin/orders/*`)
- **Goal**: Full order pipeline management with workshop printing and customer WhatsApp messaging.
- **Key Deliverables**:
  1. `/admin/orders/page.tsx`:
     - Tabbed filters: `All Orders`, `Pending Confirmation`, `In Engraving`, `Dispatched`, `Delivered`, `Cancelled`.
     - Search by customer name, phone number, city, or order ID (e.g. `LUC-1002`).
     - Courier tracking summary for dispatched orders.
  2. `/admin/orders/[id]/page.tsx`:
     - Customer details card with click-to-call and click-to-WhatsApp.
     - Shipping address card formatted for Pakistan couriers.
     - Customized line items list displaying exact engraving text, selected font, and engraving location.
     - Courier dispatch assigner: select courier (TCS, Leopard, PostEx) and record tracking number.
  3. `src/components/admin/JobSheetModal.tsx`:
     - High-contrast, clean workshop print sheet for the laser engraving technician.
     - Contains exact text, character count, font style, and physical placement instructions.
  4. `src/components/admin/WhatsAppNotifyButton.tsx`:
     - Opens pre-filled WhatsApp chat with the customer containing the current milestone message in 1 click.

### Phase 8: Corporate Bulk Inquiries & Store Settings (`/admin/bulk-quotes`, `/admin/settings`)
- **Goal**: Manage B2B corporate gift quotation inquiries and configure store parameters.
- **Key Deliverables**:
  1. `/admin/bulk-quotes/page.tsx`:
     - List corporate quotation requests with company name, required quantity, target date, and custom notes.
     - Direct WhatsApp reply button linking to the corporate procurement contact.
  2. `/admin/settings/page.tsx`:
     - General settings: Store WhatsApp number, support email, physical studio city.
     - Logistics: Default courier options and shipping fee policy.
     - Announcement banner text toggle for storefront.

### Phase 9: Verification, Quality Assurance & Build Check
- **Goal**: Ensure zero compile errors, pristine responsive design, and seamless performance.
- **Key Deliverables**:
  1. Verify TypeScript types compile cleanly without warnings.
  2. Validate storefront pages (`/`, `/shop`, `/cart`, `/bulk-orders`) remain 100% operational.
  3. Test full administrative flow: Login -> Dashboard -> Edit Product -> Change Order Status -> Print Job Sheet -> WhatsApp Link Generator.

## Checkout progress (2026-11-03)

Implemented province shipping, server-calculated order totals, required delivery addresses, five-address limit and reuse, server-confirmed checkout, and customer dashboard confirmation navigation. Targeted shipping/route checks pass and checkout returns HTTP 200. The admin login method mismatch was fixed on 2026-11-04. The full TypeScript check passed again after the catalog update on 2026-11-06.

## Shared color theme (2026-11-03)

The site uses light styling as its fallback and follows device color preference until a user chooses Light or Dark. A single sun/moon button in the header (including admin) switches directly between light and dark without a dropdown. Device preference applies until the first manual choice. The choice is stored in `luc_theme`; the root dark class controls Tailwind variants across routes. Contact, account, authentication, admin screens, and footer support both themes.


## Completed catalog extension (2026-11-06)

Category editing, product/category SEO, multiple product memberships, specification editing, hosted video IDs, and transactional slug redirects are implemented. Next deployment checks should include the configured public origin, video embedding permissions, and persistent SQLite storage. Validation is recorded in `tasks.md`.

## Completed website management extension (2026-11-09)

Dashboard page/section editing and custom draft pages, page SEO, persisted storefront colors with previews, and per-customer/customer-assigned coupons are implemented locally. Coupons use server-side pricing and atomic usage tracking. Next deployment step: reconcile existing hosting edits with GitHub, back up live SQLite/uploads, deploy code, build, and restart. The older general Store Settings and bulk-lead browser-storage follow-ups are separate from these new persisted editors.
