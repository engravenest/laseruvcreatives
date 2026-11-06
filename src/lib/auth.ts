import crypto from "node:crypto";
import { cookies } from "next/headers";
import { serverDb } from "@/lib/serverDb";

const CUSTOMER_SESSION_COOKIE = "luc_customer_session";
const ADMIN_SESSION_COOKIE = "luc_admin_session";
const SESSION_TTL_DAYS = 7;
const OTP_TTL_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;

// -------------------------------------------------------------
// Cryptographic Password Hashing (scrypt + random salt)
// -------------------------------------------------------------

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, originalHash] = storedHash.split(":");
    if (!salt || !originalHash) return false;
    const computedHash = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(
      Buffer.from(computedHash, "hex"),
      Buffer.from(originalHash, "hex")
    );
  } catch {
    return false;
  }
}

// -------------------------------------------------------------
// Token & Hash Utilities
// -------------------------------------------------------------

export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// -------------------------------------------------------------
// 6-digit OTP Generation & Verification
// -------------------------------------------------------------

export function generateSixDigitOtp(): string {
  // Generates integer between 100000 and 999999
  const num = crypto.randomInt(100000, 1000000);
  return num.toString();
}

export interface OtpIssueResult {
  plainOtp: string; // Used ONLY for sending via email, NEVER logged or returned to client!
  expiresAt: string;
  cooldownUntil: string;
}

export function createOtpForUser(userId: string): OtpIssueResult {
  const plainOtp = generateSixDigitOtp();
  const otpHash = hashToken(plainOtp);

  const now = Date.now();
  const expiresAt = new Date(now + OTP_TTL_MINUTES * 60 * 1000).toISOString();
  const cooldownUntil = new Date(now + OTP_RESEND_COOLDOWN_SECONDS * 1000).toISOString();

  serverDb.setOtp(userId, { otpHash, expiresAt, cooldownUntil });

  return { plainOtp, expiresAt, cooldownUntil };
}

export function verifyUserOtp(user: any, enteredOtp: string): { success: boolean; error?: string } {
  if (!user.otp_code_hash || !user.otp_expires_at) {
    return { success: false, error: "No verification code active. Please request a new code." };
  }

  // Check expiration
  const expiresAt = new Date(user.otp_expires_at).getTime();
  if (Date.now() > expiresAt) {
    serverDb.clearOtp(user.id);
    return { success: false, error: "Verification code has expired. Please request a new code." };
  }

  // Check attempt limit
  const attempts = Number(user.otp_attempts || 0);
  if (attempts >= MAX_OTP_ATTEMPTS) {
    serverDb.clearOtp(user.id);
    return {
      success: false,
      error: "Too many failed attempts. For your security, this code has been invalidated. Please request a new one.",
    };
  }

  // Compare hash
  const inputHash = hashToken(enteredOtp.trim());
  const match = crypto.timingSafeEqual(
    Buffer.from(inputHash, "utf-8"),
    Buffer.from(user.otp_code_hash, "utf-8")
  );

  if (!match) {
    serverDb.incrementOtpAttempts(user.id);
    const remaining = MAX_OTP_ATTEMPTS - (attempts + 1);
    return {
      success: false,
      error: `Invalid verification code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : "Please request a new code."}`,
    };
  }

  // Success: Clear OTP
  serverDb.clearOtp(user.id);
  return { success: true };
}

// -------------------------------------------------------------
// Session Management & Cookies
// -------------------------------------------------------------

export async function createSessionCookie(userId: string, role: "customer" | "admin") {
  const token = generateSecureToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  serverDb.createSession(tokenHash, userId, role, expiresAt);

  const cookieName = role === "admin" ? ADMIN_SESSION_COOKIE : CUSTOMER_SESSION_COOKIE;
  const cookieStore = await cookies();

  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });

  return token;
}

export async function clearSessionCookie(role: "customer" | "admin") {
  const cookieName = role === "admin" ? ADMIN_SESSION_COOKIE : CUSTOMER_SESSION_COOKIE;
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;

  if (token) {
    const tokenHash = hashToken(token);
    serverDb.deleteSession(tokenHash);
  }

  cookieStore.delete(cookieName);
}

export async function getAuthenticatedCustomer() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = serverDb.getSession(tokenHash);
  if (!session) return null;

  // Check expiration
  if (new Date(session.expires_at).getTime() < Date.now()) {
    serverDb.deleteSession(tokenHash);
    return null;
  }

  return {
    id: session.user_id,
    fullName: session.full_name,
    email: session.email,
    phone: session.phone || "",
    role: session.role,
    isEmailVerified: Boolean(session.is_email_verified),
  };
}

export async function getAuthenticatedAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = serverDb.getSession(tokenHash);
  if (!session || session.role !== "admin") return null;

  if (new Date(session.expires_at).getTime() < Date.now()) {
    serverDb.deleteSession(tokenHash);
    return null;
  }

  return {
    id: session.user_id,
    fullName: session.full_name,
    email: session.email,
    role: "admin" as const,
  };
}
