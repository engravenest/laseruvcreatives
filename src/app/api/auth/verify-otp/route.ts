import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/serverDb";
import { verifyUserOtp, createSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and 6-digit OTP code are required." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const user = serverDb.getUserByEmail(cleanEmail);
    if (!user) {
      return NextResponse.json({ error: "No account found for this email address." }, { status: 404 });
    }

    const verification = verifyUserOtp(user, cleanOtp);
    if (!verification.success) {
      return NextResponse.json({ error: verification.error || "Invalid verification code." }, { status: 400 });
    }

    // Mark email as verified
    serverDb.updateUser(user.id, { isEmailVerified: true });

    // Establish persistent customer session cookie
    await createSessionCookie(user.id, "customer");

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! Welcome to LaserUVCreatives.",
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone || "",
        role: "customer",
      },
    });
  } catch (error: any) {
    console.error("OTP verification error:", error);
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
  }
}
