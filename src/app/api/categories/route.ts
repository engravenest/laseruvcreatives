import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/serverDb";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { CatalogError } from "@/lib/catalog";

export async function GET() {
  return NextResponse.json({ categories: serverDb.getCategories() });
}

export async function PUT(req: NextRequest) {
  if (!await getAuthenticatedAdmin()) return NextResponse.json({ error: "Admin privileges required." }, { status: 401 });
  try {
    const { id, ...data } = await req.json();
    if (typeof id !== "string") return NextResponse.json({ error: "Category ID is required." }, { status: 400 });
    const category = serverDb.updateCategory(id, data);
    if (!category) return NextResponse.json({ error: "Category not found." }, { status: 404 });
    return NextResponse.json({ category });
  } catch (error) {
    return NextResponse.json({ error: error instanceof CatalogError ? error.message : "Could not save category." }, { status: error instanceof CatalogError ? 400 : 500 });
  }
}
