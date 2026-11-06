import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/serverDb";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const order = serverDb.getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ configured: true, order });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch order", details: String(error) }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Admin authorization check
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 401 });
    }

    const body = await req.json();
    const updated = serverDb.updateOrderStatus(id, body.status, body.courier);

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ configured: true, order: updated });
  } catch (error: any) {
    console.error("Failed to update order in database:", error);
    return NextResponse.json(
      { error: "Failed to update order in database", details: String(error) },
      { status: 500 }
    );
  }
}
