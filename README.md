# LaserUVCreatives

Updated: 2026-11-06.

Personalized laser engraving and UV gift store for Pakistan, with PKR pricing, Cash on Delivery, customer accounts, and a separate admin panel. Built with Next.js 16.3.6, React 19, TypeScript, Tailwind CSS 4, and SQLite.

## Run locally on Windows

Use a Node.js version that supports `node:sqlite`. From PowerShell:

```powershell
cd D:\laseruvcreatives
npm.cmd install
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm.cmd run dev
```

Keep your existing `.env.local` when restarting. Open [the store](http://localhost:3000), [admin login](http://localhost:3000/admin/login), [products](http://localhost:3000/admin/products), or [categories](http://localhost:3000/admin/categories). Local development uses Webpack through the existing `dev` script.

The active database is `data/laseruv.db`; it initializes automatically. Product uploads are stored under `public/uploads/products`. These local files and `.env.local` are ignored by Git and are not uploaded with the source repository. Admin authentication uses database accounts and bootstrap environment settings; do not publish passwords or API keys in documentation.

## Current features

- Guest cart with saved browser state and navbar count; customer login, dashboard, and saved addresses.
- COD checkout with server-calculated totals: Rs. 299 shipping in Punjab, Rs. 399 in other supported provinces/territories. Every order needs a complete address; signed-in customers may save up to five.
- Admin product/order management with errors shown when saving fails.
- Product and category SEO titles/descriptions and comma-separated meta keywords, search previews, and generated metadata/canonical URLs.
- One primary category plus additional categories per product, with matching storefront filters.
- Live slug preview when editing titles; saving commits changes and permanent redirects together. Old URLs continue to resolve after repeated renames.
- Editable specification rows and YouTube/Vimeo videos by ID. Videos are embedded from those services; direct video-file upload is not implemented.
- Shared light/dark styling and a direct sun/moon toggle. The device preference applies until a manual choice is saved.

To edit categories, use **Admin → Categories**, select a category, make changes, then click **Save category**. Product fields are available in **Admin → Products → Edit** or **Add New Product**. Preview changes do not save automatically.

## Configuration and launch work

Configure either `RESEND_API_KEY` or the SMTP settings in `.env.local` for verification, password-reset, and contact emails. Missing email configuration is not a successful send. Set `NEXT_PUBLIC_SITE_URL` to the public origin when hosting if you want to pin the canonical domain; otherwise catalog metadata uses the request host.

The project works locally but still needs launch preparation. Bulk leads and store settings retain browser-local flows. Remaining work includes email delivery verification, removal of hardcoded bootstrap credentials, authorization/status audits, durable customer logo uploads, and production build/end-to-end checks.

Hosting must preserve the SQLite database and uploaded files, with backups. Setting `DATABASE_URL` alone does not switch this application to PostgreSQL: Prisma/PostgreSQL is an incomplete migration scaffold. See [the implementation plan](plan.md) and [the remaining tasks](tasks.md) before deployment.

## Verification

Checks completed on 2026-11-06: full TypeScript, targeted catalog ESLint, isolated catalog database/metadata/redirect regression tests, and local route checks. These do not certify a production build or a full browser end-to-end test.

```powershell
node node_modules/typescript/bin/tsc --noEmit --incremental false
node scratch/check-catalog.cjs
```

The catalog regression script creates a temporary database and does not modify store records. It checks multiple categories, SEO/specification/video persistence, failed-save rollback, repeated slug renames/reversions, metadata, and 308/404 routing.

## Project reference

| File | Purpose |
| --- | --- |
| [constitution.md](constitution.md) | Architecture rules and required behavior |
| [specification.md](specification.md) | Implemented routes, data contracts, APIs, and storage |
| [plan.md](plan.md) | Roadmap and next priorities |
| [tasks.md](tasks.md) | Completed work, pending work, dated verification |
| [AGENTS.md](AGENTS.md) | Instructions for coding agents and installed Next.js documentation |
| [.env.example](.env.example) | Environment variable reference |

Application code is in `src/`. Read `src/lib/serverDb.ts` for active persistence, `src/types/product.ts` for catalog types, and `src/app/admin/` for the management screens.
