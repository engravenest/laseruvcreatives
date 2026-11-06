import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/serverDb";
import { verifyPassword, createSessionCookie, createOtpForUser } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = serverDb.getUserByEmail(cleanEmail);

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Verify password hash
    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Verify email activation status
    if (!user.is_email_verified) {
      // Send fresh OTP so they can complete verification
      try {
        const { plainOtp } = createOtpForUser(user.id);
        await sendOtpEmail({
          to: cleanEmail,
          customerName: user.full_name,
          otpCode: plainOtp,
        });
      } catch (e) {
        console.warn("Could not resend OTP on unverified login attempt:", e);
      }

      return NextResponse.json(
        {
          requiresVerification: true,
          email: cleanEmail,
          message: "Please verify your email address before logging in. A new verification code has been sent.",
        },
        { status: 403 }
      );
    }

    // Establish persistent customer session
    await createSessionCookie(user.id, "customer");

    return NextResponse.json({
      success: true,
      message: "Logged in successfully.",
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "An error occurred during login. Please try again." }, { status: 500 });
  }
}
