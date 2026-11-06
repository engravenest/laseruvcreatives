import { CatalogError } from "@/lib/catalog";
import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/serverDb";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const product = serverDb.getProductById(id) || serverDb.getProductBySlug(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ configured: true, product });
  } catch (error: any) {
    if (error instanceof CatalogError) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ error: "Failed to fetch product", details: String(error) }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 401 });
    }

    const body = await req.json();
    const updated = serverDb.updateProduct(id, body);

    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ configured: true, product: updated });
  } catch (error: any) {
    if (error instanceof CatalogError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Failed to update product:", error);
    return NextResponse.json({ error: "Failed to update product", details: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 401 });
    }

    serverDb.deleteProduct(id);
    return NextResponse.json({ success: true, message: "Product deleted successfully." });
  } catch (error: any) {
    if (error instanceof CatalogError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: "Failed to delete product", details: String(error) }, { status: 500 });
  }
}
