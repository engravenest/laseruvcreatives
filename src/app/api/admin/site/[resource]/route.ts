import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { getPages, savePage, deletePage, getColors, saveColors, getCoupons, saveCoupon, deleteCoupon } from "@/lib/siteStore";
import { StoreInputError } from "@/lib/coupons";
type Context = { params: Promise<{ resource: string }> };
async function handle(req: NextRequest, context: Context) {
  if (!await getAuthenticatedAdmin()) return NextResponse.json({ error: "Admin privileges required." }, { status: 401 });
  const { resource } = await context.params;
  if (!["pages", "colors", "coupons"].includes(resource)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    if (req.method === "GET") return NextResponse.json({ value: resource === "pages" ? getPages() : resource === "colors" ? getColors() : getCoupons() });
    const body = await req.json();
    if (req.method === "DELETE") {
      if (resource === "pages") deletePage(body.id);
      else if (resource === "coupons") deleteCoupon(body.id);
      else throw new StoreInputError("Colors cannot be deleted; use a preset instead.");
      return NextResponse.json({ success: true });
    }
    const value = resource === "pages" ? savePage(body) : resource === "colors" ? saveColors(body) : saveCoupon(body);
    return NextResponse.json({ value });
  } catch (error) {
    return NextResponse.json({ error: error instanceof StoreInputError ? error.message : "Could not save changes. Please try again." }, { status: error instanceof StoreInputError ? 400 : 500 });
  }
}
export const GET = handle;
export const PUT = handle;
export const DELETE = handle;
