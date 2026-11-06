import { CatalogError } from "@/lib/catalog";
import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/serverDb";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const products = serverDb.getProducts();
    return NextResponse.json({ configured: true, products });
  } catch (error) {
    console.error("Failed to fetch products from database:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 401 });
    }

    const body = await req.json();

    if (!body.name || !body.price || !body.categorySlug) {
      return NextResponse.json({ error: "Product name, price, and category are required." }, { status: 400 });
    }

    const created = serverDb.createProduct(body);
    return NextResponse.json({ configured: true, product: created }, { status: 201 });
  } catch (error: any) {
    if (error instanceof CatalogError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Failed to create product in database:", error);
    return NextResponse.json(
      { error: "Failed to create product in database", details: String(error) },
      { status: 500 }
    );
  }
}
