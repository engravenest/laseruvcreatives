import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      admin,
    });
  } catch (error: any) {
    console.error("Admin session verification error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
