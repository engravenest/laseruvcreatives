import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/serverDb";
import { verifyUserOtp, hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, newPassword, confirmPassword } = body;

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "Email, OTP code, and new password are required." }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters long." }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const user = serverDb.getUserByEmail(cleanEmail);
    if (!user) {
      return NextResponse.json({ error: "No account found for this email address." }, { status: 404 });
    }

    // Verify OTP
    const verification = verifyUserOtp(user, cleanOtp);
    if (!verification.success) {
      return NextResponse.json({ error: verification.error || "Invalid verification code." }, { status: 400 });
    }

    // Update password hash and revoke active user sessions
    const passwordHash = hashPassword(newPassword);
    serverDb.updateUser(user.id, {
      passwordHash,
      isEmailVerified: true,
    });
    serverDb.deleteUserSessions(user.id);

    return NextResponse.json({
      success: true,
      message: "Password reset successfully! You can now log in with your new password.",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Failed to reset password. Please try again." }, { status: 500 });
  }
}
