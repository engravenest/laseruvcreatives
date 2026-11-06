import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/serverDb";
import { createOtpForUser } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = serverDb.getUserByEmail(cleanEmail);

    if (!user) {
      return NextResponse.json({ error: "No account found with this email address." }, { status: 404 });
    }

    // Check cooldown
    if (user.otp_cooldown_until && new Date(user.otp_cooldown_until).getTime() > Date.now()) {
      const remainingSeconds = Math.ceil(
        (new Date(user.otp_cooldown_until).getTime() - Date.now()) / 1000
      );
      return NextResponse.json(
        { error: `Please wait ${remainingSeconds}s before requesting a new code.` },
        { status: 429 }
      );
    }

    // Generate new OTP
    const { plainOtp, expiresAt, cooldownUntil } = createOtpForUser(user.id);

    try {
      await sendOtpEmail({
        to: cleanEmail,
        customerName: user.full_name,
        otpCode: plainOtp,
      });
    } catch (emailErr: any) {
      console.error("Failed to resend OTP email:", emailErr);
      return NextResponse.json(
        { error: `Failed to send email: ${emailErr.message || "Email provider error"}` },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `A new 6-digit verification code has been sent to ${cleanEmail}.`,
      expiresAt,
      cooldownUntil,
    });
  } catch (error: any) {
    console.error("Resend OTP error:", error);
    return NextResponse.json({ error: "Failed to resend code. Please try again." }, { status: 500 });
  }
}
