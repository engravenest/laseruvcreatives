# LaserUVCreatives Task Checklist

Updated: 2026-11-06. Existing phases record implementation history. The catalog section records checks completed on 2026-11-06; documentation-only edits do not imply new runtime tests.

## Current follow-up checklist

- [x] Await successful checkout API response before confirmation and cart clearing; retain cart on failure.
- [x] Recalculate checkout prices/shipping server-side, validate item quantities/availability, and associate orders with the authenticated customer.
- [ ] Complete order ownership and allowed status/transition audits.
- [x] Check admin product and order mutation responses, display save failures, and update browser state only after server confirmation.
- [x] Fetch storefront catalog from `/api/products`, including empty-catalog handling; render shop/product pages from SQLite.
- [ ] Connect bulk inquiry creation/listing/status updates and refresh to server APIs.
- [ ] Persist settings server-side and apply relevant shipping/contact/announcement settings to storefront flows.
- [ ] Remove hardcoded bootstrap admin credentials; audit bootstrap role enforcement.
- [ ] Audit session authorization and OTP/password reset boundaries.
- [ ] Persist customer logo assets rather than filenames alone.
- [x] Persist product image metadata, category memberships, SEO, video, and variants during catalog saves.
- [ ] Finish broader image/variant contract cleanup and review legacy category constants.
- [ ] Validate deployment persistence or complete PostgreSQL schema/data/API migration.
- [x] Run full TypeScript and targeted catalog ESLint/regression checks (2026-11-06).
- [ ] Run production build, full-project lint review, and remaining auth/order/contact/browser end-to-end checks.
- [ ] Configure and verify transactional email and production deployment settings.

## Documentation synchronization (2026-11-03)

- [x] Reconcile constitution, specification, plan, and task descriptions with inspected source.
- [x] Distinguish SQLite APIs, browser-only features, and PostgreSQL scaffold.
- [x] Correct admin authentication and product editor route descriptions.
- [x] Record unresolved persistence/validation gaps without claiming they are fixed.


## Legend
- `[x]` Completed
- `[ ]` Not Started
- `[/]` In Progress

---

## Phase 1: Architectural Foundation & Route Decoupling
- [x] Create `src/types/admin.ts` with `AdminUser`, `AdminOrder`, `AdminMetric`, `BulkQuoteLead`, `StoreSettings` interfaces.
- [x] Update `src/app/layout.tsx` and create `ConditionalStorefrontLayout.tsx` so `/admin/*` routes do not render customer `CartAwareHeader` and `Footer`.
- [x] Confirm storefront navigation remains unaffected at `/`, `/shop`, `/products/[slug]`, `/cart`, and `/bulk-orders`.

---

## Phase 2: Administrative State & Seed Data Engine
- [x] Create `src/data/mockAdminOrders.ts` with 10+ realistic Pakistani e-commerce orders (Lahore, Karachi, Islamabad, etc.) featuring full personalization data and various fulfillment statuses.
- [x] Create `src/lib/adminWhatsApp.ts` with automated WhatsApp status update URL builders (Order Confirmed, In Engraving, Courier Dispatched, Delivered).
- [x] Create `src/context/AdminContext.tsx` providing reactive state for products, orders, bulk quotes, store settings, and authentication state with SQLite product/order APIs and browser caches; bulk leads/settings remain browser-local.

---

## Phase 3: Authentication Gatekeeper & Session Guard
- [x] Create `src/app/admin/login/page.tsx` featuring high-end luxury dark styling, email/password input and visual error alerts connected to server-side sessions.
- [x] Build `AdminAuthGuard` in `src/components/admin/AdminAuthGuard.tsx` to redirect unauthenticated visitors to `/admin/login`.

---

## Phase 4: Luxury Admin Layout Shell & Reusable UI Kit
- [x] Create `src/components/admin/AdminSidebar.tsx` with brand badge, navigation items, pending order counters, live store link, and mobile drawer.
- [x] Create `src/components/admin/AdminTopbar.tsx` with breadcrumbs, quick action buttons, and status indicator.
- [x] Create `src/components/admin/KpiCard.tsx` with glassmorphic background, PKR currency formatting, and trend indicators.
- [x] Create `src/components/admin/StatusBadge.tsx` with color-coded fulfillment status pills and glowing dots.
- [x] Create `src/components/admin/OrderStatusSelect.tsx` for fast inline status updates and courier dispatch modal.
- [x] Create `src/app/admin/layout.tsx` wrapping all administrative routes in `AdminProvider`, `AdminAuthGuard`, and `AdminLayoutShell`.

---

## Phase 5: Executive Overview Dashboard (`/admin`)
- [x] Build `/admin/page.tsx` with derived KPI metrics (non-cancelled order value in PKR, Active Orders, Workshop Queue, Today's Sales); revenue is not collected cash.
- [x] Implement visual order status pipeline distribution bar.
- [x] Implement recent orders table with customer details, PKR amount, status badge, 1-click status changer, and WhatsApp notification button.
- [x] Add quick-launch action cards (Add New Product, View All Orders, Review Bulk Leads, Store Settings).

---

## Phase 6: Product Catalog Management (`/admin/products/*`)
- [x] Build `/admin/products/page.tsx` displaying full product inventory table with image thumbnails, categories, PKR prices, and 1-click in-stock toggle switches.
- [x] Add live search bar and category filter pills to the products table.
- [x] Build `/admin/products/new/page.tsx` with comprehensive form: basic info, pricing, category, badge, images, and customization rules editor (text length, logo upload, engraving locations, font choices).
- [x] Build `/admin/products/[id]/page.tsx` allowing in-place editing and real-time syncing to the catalog.

---

## Phase 7: Order Management & Laser Workshop System (`/admin/orders/*`)
- [x] Build `/admin/orders/page.tsx` with tabbed filtering by status (`All`, `Pending`, `In Engraving`, `Dispatched`, `Delivered`, `Cancelled`), search by customer name/phone/order ID, and courier summaries.
- [x] Build `/admin/orders/[id]/page.tsx` with customer info card, shipping address card, customized items breakdown (exact engraving text, chosen font, placement), and courier assignment controls (TCS, Leopard, PostEx).
- [x] Build `src/components/admin/JobSheetModal.tsx` providing a clean, printable Laser Engraving Job Sheet for workshop technicians.
- [x] Build `src/components/admin/WhatsAppNotifyButton.tsx` triggering pre-filled WhatsApp status updates to customer mobile numbers in 1 click.

---

## Phase 8: Corporate Bulk Inquiries & Store Settings (`/admin/bulk-quotes`, `/admin/settings`)
- [x] Build `/admin/bulk-quotes/page.tsx` listing corporate inquiries with company name, required quantity, target delivery date, customization notes, and 1-click WhatsApp reply.
- [x] Build `/admin/settings/page.tsx` allowing the store manager to update WhatsApp contact numbers, support email, studio location, default couriers, and announcement banner text.

---

## Phase 9: Historical Verification Reports (not rerun on 2026-11-03)
- [x] Run Next.js Turbopack TypeScript check (`npx tsc --noEmit`) to guarantee zero compilation errors (Passed cleanly with 0 errors).
- [x] Verify that customer storefront pages (`/`, `/shop`, `/products/[slug]`, `/cart`, `/bulk-orders`) return HTTP 200 without layout leaks.
- [x] Verify administrative routes (`/admin`, `/admin/login`, `/admin/orders`, `/admin/products`, `/admin/bulk-quotes`, `/admin/settings`) all return HTTP 200.

---

## Phase 10: COD Checkout, Business Contact & Storefront-Admin Sync
- [x] Centralize business contact details in `src/constants/store.ts` (WhatsApp: 923327009017, Display Phone: 03327009017, Email: engravenest@gmail.com).
- [x] Update Footer, Admin Settings, and WhatsApp link generators with centralized contact info.
- [x] Build functional `/checkout` page with Full Name, Pakistani phone validation, Province dropdown, City, Address, and Optional Notes.
- [x] Support Cash on Delivery (COD), with Rs. 299 shipping in Punjab and Rs. 399 in other supported provinces/territories.
- [x] Generate order reference (`LUC-XXXXXX`) and provide post-checkout order confirmation view.
- [x] Implement "Confirm Order on WhatsApp" button with pre-filled order data and explicit delivery disclosure.
- [x] Connect storefront checkout orders to `/admin/orders` via `storeSync.ts` and dispatch `"luc_orders_updated"`.
- [x] Connect storefront bulk quotation requests to `/admin/bulk-quotes` via `saveBulkLeadToStore`.
- [x] Connect shop and featured-product lists through `useLiveProducts`; render product details from SQLite on request.


## Shipping and address update (2026-11-03)

- [x] Apply Rs. 299 Punjab / Rs. 399 other province shipping and calculate totals server-side.
- [x] Require complete delivery addresses and allow a maximum of five saved customer addresses.
- [x] Add checkout saved-address selection and customer dashboard confirmation link; remove bottom navigation arrows.
- [x] Run scratch/check-shipping.cjs checks for rates, totals, validation, address limit/reuse, and guests.
- [x] Confirm checkout returns HTTP 200 locally.
- [x] Fix the admin password update during initial setup. Full TypeScript check and five isolated admin login handler checks passed on 2026-11-04.

## Shared color theme (2026-11-03)

The site uses light styling as its fallback and follows device color preference until a user chooses Light or Dark. A single sun/moon button in the header (including admin) switches directly between light and dark without a dropdown. Device preference applies until the first manual choice. The choice is stored in `luc_theme`; the root dark class controls Tailwind variants across routes. Contact, account, authentication, admin screens, and footer support both themes.

## Guest cart correction (2026-11-03)

- [x] Replace featured-product demo counter with shared CartContext additions and live header count.
- [x] Preserve saved guest cart during initial hydration before writing browser storage.
- [x] Add consistent press/hover motion to product-card Add to Cart and Customize actions.
- [x] Run scratch/check-guest-cart.cjs regression checks (shared count, repeat additions, reload persistence); homepage returns HTTP 200.


## Catalog editing update (2026-11-06)

- [x] Add product/category SEO title, description, meta keywords, previews, and server-rendered metadata/canonical URLs.
- [x] Add `/admin/categories` with authenticated saves and database-backed category names/slugs.
- [x] Support primary plus additional product categories in shop/home/admin filtering.
- [x] Preview slugs as titles change; persist edits and permanent redirects atomically on submit.
- [x] Preserve older URLs through repeated renames and slug reversions; reject collisions.
- [x] Add editable specification rows and YouTube/Vimeo ID embeds to product editors/details.
- [x] Remove the delivery sentence below the bulk quantity panel.
- [x] Run `node scratch/check-catalog.cjs` against an isolated temporary database, including persistence, metadata, 308 redirects, 404 handling, and failed-save rollback.
- [x] Verify local shop, product, and admin routes return HTTP 200; check delivery-line removal and canonical markup.
- [x] Final validation: full TypeScript check and targeted ESLint checks passed; canonical URLs use the request host and unauthenticated category writes return 401.

## Required engraving text (2026-11-06)

- [x] On product details, require nonblank engraving text when text customization is enabled; mark the field required, show an inline error and focus it, and block both Add to Cart and Buy Now until filled.
