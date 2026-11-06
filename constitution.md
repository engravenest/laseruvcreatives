# LaserUVCreatives System Constitution

Updated: 2026-11-06. This document defines required behavior. See `specification.md` for implemented behavior and `tasks.md` for remaining gaps.

## 1. Identity, Vision & Market Context
- **System Name**: LaserUVCreatives (LUC)
- **Domain**: Premium personalized laser engraving & UV printing e-commerce platform.
- **Primary Market**: Pakistan (nationwide coverage across all cities: Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Sialkot, Quetta, etc.).
- **Currency**: Pakistani Rupee (`PKR` / `Rs.`).
- **Core Value Proposition**: Luxury personalized items (executive metal pens, handcrafted rosewood pens, insulated stainless steel thermal bottles, executive corporate gift sets) with precision laser engraving, live customization preview, Cash on Delivery (COD) fulfillment, and WhatsApp-driven order communication.

---

## 2. Immutable Architecture Laws & Invariants

### 2.1 Separation of Customer Storefront, Dashboard, and Admin Surfaces
- The public storefront (`/`, `/shop`, `/products/[slug]`, `/cart`, `/checkout`, `/bulk-orders`, `/contact`, `/login`, `/register`, `/account`) and the administrative portal (`/admin/*`) MUST remain visually and architecturally decoupled.
- The storefront navigation (`CartAwareHeader`, `Header`, `Footer`) MUST NOT appear inside `/admin`.
- Administrative state, authentication guards, and mock/management stores MUST NOT introduce runtime overhead or hydration penalties to public storefront visitors.
- Customers (even when authenticated) MUST NOT have access to any administrative surface or administrative API. Role-based authorization (`admin` vs `customer`) must be enforced server-side.

### 2.2 Tech Stack & Versioning Constraints
- **Framework**: Next.js 16 (App Router; local development uses Webpack).
- **Core**: React 19 (`use client` vs Server Component discipline strictly maintained).
- **Styling**: Tailwind CSS v4 with curated design tokens.
- **Language**: TypeScript 5 in strict mode; all entities must have explicit interfaces.
- **Database & Storage**: Server-side persistent storage must be the single source of truth for accounts, orders, products, and contact submissions. The implemented backend is native `node:sqlite` at `data/laseruv.db`; Prisma/PostgreSQL is a separate, incomplete migration scaffold. Browser storage should be a secondary reactive cache; remaining bulk-lead and settings persistence gaps are tracked in `tasks.md`.
- **Node/PowerShell Execution**: In Windows PowerShell environments, use `npm.cmd` or `npx.cmd` to bypass PowerShell script execution policy limitations (`PSSecurityException`).

### 2.3 Visual Aesthetics & Design System
- **Theme Palette**:
  - Background: Deep Dark Slate / Zinc (`zinc-950`, `zinc-900`) and Crisp Off-White for Light Mode (`zinc-50`, `white`).
  - Primary Accent: Amber Gold (`amber-500`, `amber-400`, `amber-600`) symbolizing laser precision and premium craftsmanship.
  - Status Indicators: Emerald (`emerald-500` - Delivered/Active), Blue (`sky-500` - In Engraving), Violet (`violet-500` - Dispatched), Amber (`amber-500` - Pending Confirmation), Red (`rose-500` - Cancelled).
- **Atmosphere**: Luxury glassmorphism, subtle glowing borders (`border-zinc-800`), sleek typography (Geist Sans & Geist Mono), micro-animations, and clean, high-density data tables.
- **Zero Cheap Placeholders**: Use real mock data, realistic Pakistani names, actual product categories, and valid Pakistani telephone formats.

### 2.4 Pakistan E-Commerce & Logistics Rules
- **Currency Formatting**: Always use the central utility `formatPKR(amount)` from `@/lib/utils` (e.g. `Rs. 2,450`). Never hardcode `$` or unformatted raw numbers in customer/admin views.
- **Phone Validation**: Always validate Pakistani mobile numbers using `isValidPakistaniPhone(phone)` from `@/lib/utils` (accepts `03001234567`, `+923001234567`, etc.).
- **Payment Method**: Primary standard is `Cash on Delivery (COD)` only in the current checkout and payment type. Manual bank transfer verification is a future extension.
- **Logistics**: Standard domestic couriers (TCS, Leopard Courier, PostEx, Trax).
- **WhatsApp Integration**: Single source of truth for WhatsApp number and message templates in `@/constants/store` and `@/lib/whatsapp`.

### 2.5 Personalization State Invariants
- Every customized item in the cart or order MUST preserve:
  - `engravingText`: The custom name, designation, or message.
  - `fontChoice`: Selected typography style (e.g., "Elegant Script Calligraphy").
  - `engravingLocation`: Chosen placement (e.g., "Pen Barrel", "Clip Cap", "Gift Box Lid").
  - `logoFileName`: Uploaded logo identifier if logo engraving was selected.
  - `specialInstructions`: Free-form customer instructions.
- Customizations must never be stripped during checkout, cart modification, or administrative order processing.

---

## 3. Authentication, Security & Governance Rules

### 3.1 Customer Authentication & Registration
- Customer registration requires full name, valid email, and password (minimum 8 characters).
- Account activation requires 6-digit email OTP verification.
- OTP rules: 10-minute expiry, 60-second resend cooldown, maximum 5 attempts per code.
- **Security Invariant**: Never expose OTP codes in client UI responses or server console logs in production.
- Customer session must be stored in HTTP-only, SameSite=lax secure cookies.
- Customer cart in `CartContext` MUST be preserved throughout login, registration, and logout. Guest checkout remains available at `/checkout`.

### 3.2 Administrative Governance & Role Authorization
- Administrative surface `/admin/*` requires dedicated server-side authentication at `/admin/login`.
- Public registration MUST NEVER create admin accounts.
- Client-side PIN-only protection is replaced by secure server-side authentication (`/api/admin/login`) with scrypt password hashing and HTTP-only session cookies (`luc_admin_session`).
- Administrative mutations and private administrative reads MUST verify admin role authorization. Login is public by necessity; product reads and guest order creation are public, while authenticated customers may read their own orders. Cookie presence in `src/proxy.ts` is only a navigation check; handlers must validate the session and applicable ownership.

### 3.3 Email Delivery Invariants
- Contact Us inquiries must be sent to `engravenest@gmail.com` with `Reply-To` set to the customer's email address.
- Transactional emails (OTP, password reset) and contact inquiries must use server-side integrations (Resend or SMTP).
- **Zero Simulation Rule**: Never simulate successful email delivery if credentials are not configured or provider fails; return honest, descriptive error responses.

---

## 4. Coding Conventions & Code Integrity
- **Single Source of Truth**: Contact information, brand name, and currency defaults must be imported from `@/constants/store`.
- **Imports**: Use Next.js path aliases (`@/components/...`, `@/types/...`, `@/lib/...`, `@/context/...`).
- **Clean Diffs**: Do not remove existing features or comments; extend the system modularly.
- **Framework Guidance**: Follow `AGENTS.md` and read the relevant installed guide in `node_modules/next/dist/docs/` before changing Next.js code.
- **Persistence Integrity**: Confirm server acceptance before reporting a saved order or administrative mutation; validate order ownership, prices, quantities, and status on the server. These are requirements, not claims that the current implementation fulfills them.
- **Documentation Maintenance**: Keep `constitution.md`, `specification.md`, `plan.md`, and `tasks.md` synchronized after major architectural changes.

## Checkout shipping and address policy

- Shipping is Rs. 299 within Punjab and Rs. 399 for other supported provinces/territories. The server must calculate this charge.
- Every order requires a complete delivery address. Customer accounts may save at most five addresses; guest checkout remains available with a complete entered address.
- Confirm orders only after successful server persistence. Customer confirmation navigation leads to the customer dashboard, never an admin portal.

## Shared color theme (2026-11-03)

The site uses light styling as its fallback and follows device color preference until a user chooses Light or Dark. A single sun/moon button in the header (including admin) switches directly between light and dark without a dropdown. Device preference applies until the first manual choice. The choice is stored in `luc_theme`; the root dark class controls Tailwind variants across routes. Contact, account, authentication, admin screens, and footer support both themes.


## Catalog editing policy (2026-11-06)

- SQLite is authoritative for storefront products, category memberships, SEO, and slug redirects.
- Title changes preview a slug without writing data. Successful submission saves edits and old-slug redirects together; failed submissions must not change either.
- A product has one primary category and may belong to additional categories. Category renames preserve every membership.
- Product specifications and hosted-video IDs are admin editable. Only validated YouTube/Vimeo IDs may form embed URLs.
