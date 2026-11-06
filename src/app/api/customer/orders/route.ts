import { NextResponse } from "next/server";
import { getAuthenticatedCustomer } from "@/lib/auth";
import { serverDb } from "@/lib/serverDb";

export async function GET() {
  try {
    const customer = await getAuthenticatedCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Strictly fetch orders belonging to this customer by userId or matching customerEmail
    const orders = serverDb.getOrders({
      userId: customer.id,
      email: customer.email,
    });

    return NextResponse.json({
      orders,
      count: orders.length,
    });
  } catch (error: any) {
    console.error("Customer orders error:", error);
    return NextResponse.json({ error: "Failed to load orders." }, { status: 500 });
  }
}
