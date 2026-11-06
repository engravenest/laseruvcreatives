import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ------------------------------------------------------------------
// Next.js 16 Proxy (formerly middleware.ts)
// Protects /account/* and /admin/* routes at the server/edge level.
// API routes already have their own server-side auth checks in each
// route handler, so we only guard page-level navigation here.
// ------------------------------------------------------------------

const CUSTOMER_SESSION_COOKIE = "luc_customer_session";
const ADMIN_SESSION_COOKIE = "luc_admin_session";

// Routes that require a logged-in customer
const CUSTOMER_PROTECTED_PATHS = ["/account"];

// Routes that require an admin session (excluding /admin/login itself)
const ADMIN_PROTECTED_PATHS = ["/admin"];
const ADMIN_LOGIN_PATH = "/admin/login";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin route protection ──────────────────────────────────────
  if (pathname.startsWith("/admin") && pathname !== ADMIN_LOGIN_PATH) {
    const adminToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

    if (!adminToken) {
      const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Customer account route protection ───────────────────────────
  if (CUSTOMER_PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    const customerToken = request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;

    if (!customerToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match /account and /admin pages, but exclude API routes, static files,
    // image optimizations, and common metadata files.
    "/account/:path*",
    "/admin/:path*",
  ],
};
