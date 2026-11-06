import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/serverDb";
import { createOtpForUser } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = serverDb.getUserByEmail(cleanEmail);

    // If user does not exist, return a generic message to prevent account enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email address, you will receive a verification code.",
      });
    }

    // Check cooldown
    if (user.otp_cooldown_until && new Date(user.otp_cooldown_until).getTime() > Date.now()) {
      const remainingSeconds = Math.ceil(
        (new Date(user.otp_cooldown_until).getTime() - Date.now()) / 1000
      );
      return NextResponse.json(
        { error: `Please wait ${remainingSeconds}s before requesting a new reset code.` },
        { status: 429 }
      );
    }

    const { plainOtp } = createOtpForUser(user.id);

    try {
      await sendPasswordResetEmail({
        to: cleanEmail,
        customerName: user.full_name,
        resetCode: plainOtp,
      });
    } catch (emailErr: any) {
      console.error("Failed to send password reset email:", emailErr);
      return NextResponse.json(
        { error: `Could not send reset email: ${emailErr.message || "Email provider error"}` },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit password reset code has been sent to ${cleanEmail}.`,
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Failed to process request." }, { status: 500 });
  }
}
