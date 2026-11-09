import { NextResponse } from "next/server";
import { getColors, getPages } from "@/lib/siteStore";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({ colors: getColors(), pages: getPages().filter(page => page.published && page.showInFooter).map(page => ({ id: page.id, title: page.title, slug: page.slug })) });
}
