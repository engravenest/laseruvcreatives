import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  try {
    await clearSessionCookie("admin");
    return NextResponse.json({ success: true, message: "Admin logged out successfully." });
  } catch (error: any) {
    console.error("Admin logout error:", error);
    return NextResponse.json({ error: "Failed to logout." }, { status: 500 });
  }
}
