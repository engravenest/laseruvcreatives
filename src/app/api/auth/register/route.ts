import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/serverDb";
import { hashPassword, createOtpForUser } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, password, confirmPassword } = body;

    // Validation
    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      return NextResponse.json({ error: "Please enter your full name (minimum 2 characters)." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = serverDb.getUserByEmail(cleanEmail);

    let userId: string;

    if (existing) {
      if (existing.is_email_verified) {
        return NextResponse.json(
          { error: "An account with this email address already exists. Please sign in instead." },
          { status: 409 }
        );
      }

      // Check OTP cooldown
      if (existing.otp_cooldown_until && new Date(existing.otp_cooldown_until).getTime() > Date.now()) {
        const remainingSeconds = Math.ceil(
          (new Date(existing.otp_cooldown_until).getTime() - Date.now()) / 1000
        );
        return NextResponse.json(
          { error: `Please wait ${remainingSeconds} seconds before requesting another code.` },
          { status: 429 }
        );
      }

      // Update password hash and name for unverified user
      const passwordHash = hashPassword(password);
      serverDb.updateUser(existing.id, {
        fullName: fullName.trim(),
        passwordHash,
      });
      userId = existing.id;
    } else {
      // Create new customer account (Always role: customer)
      const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const passwordHash = hashPassword(password);

      serverDb.createUser({
        id,
        fullName: fullName.trim(),
        email: cleanEmail,
        passwordHash,
        role: "customer", // Strict invariant: public registration never creates admin
        isEmailVerified: false,
      });
      userId = id;
    }

    // Generate 6-digit OTP
    const { plainOtp, expiresAt } = createOtpForUser(userId);

    // Send OTP email through configured provider
    try {
      await sendOtpEmail({
        to: cleanEmail,
        customerName: fullName.trim(),
        otpCode: plainOtp,
      });
    } catch (emailErr: any) {
      console.error("Failed to deliver OTP email:", emailErr);
      return NextResponse.json(
        {
          error: `Could not send verification email: ${emailErr.message || "Email provider error"}. Please ensure RESEND_API_KEY or SMTP credentials are configured.`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      expiresAt,
      message: `A 6-digit verification code has been sent to ${cleanEmail}. Please enter it to activate your account.`,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
