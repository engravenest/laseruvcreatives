import { NextResponse } from "next/server";
import { getAuthenticatedCustomer } from "@/lib/auth";

export async function GET() {
  try {
    const customer = await getAuthenticatedCustomer();
    if (!customer) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: customer,
    });
  } catch (error: any) {
    console.error("Auth check error:", error);
    return NextResponse.json({ authenticated: false, user: null });
  }
}
