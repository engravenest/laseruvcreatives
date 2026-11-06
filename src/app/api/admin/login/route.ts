import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/serverDb";
import { verifyPassword, hashPassword, createSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const inputEmail = String(email).toLowerCase().trim();
    const inputPass = String(password).trim();

    // 1. Check against DB admin user (primary authentication path)
    const dbAdmin = serverDb.getUserByEmail(inputEmail);
    let authenticatedAdminId: string | null = null;

    if (dbAdmin && dbAdmin.role === "admin" && dbAdmin.password_hash) {
      if (verifyPassword(inputPass, dbAdmin.password_hash)) {
        authenticatedAdminId = dbAdmin.id;
      }
    }

    // 2. Fallback: env credentials for initial setup only (email + password, NO PIN bypass)
    //    This allows the first login when the DB admin user has no password hash yet.
    if (!dbAdmin || (dbAdmin.role === "admin" && !dbAdmin.password_hash)) {
      const envAdminEmail = (process.env.ADMIN_EMAIL || "admin@laseruvcreatives.com").toLowerCase().trim();
      const envAdminPass = process.env.ADMIN_PASSWORD;

      if (envAdminPass && inputEmail === envAdminEmail && inputPass === envAdminPass) {
        // Find or create admin user in DB with a proper hashed password
        let adminUser = dbAdmin;
        if (!adminUser) {
          adminUser = serverDb.createUser({
            id: `admin-${Date.now()}`,
            fullName: "LaserUVCreatives Admin",
            email: envAdminEmail,
            passwordHash: hashPassword(envAdminPass),
            role: "admin",
            isEmailVerified: true,
          });
        } else if (!adminUser.password_hash) {
          // Upgrade: set the hashed password so env fallback is no longer needed
          serverDb.updateUser(adminUser.id, { passwordHash: hashPassword(envAdminPass) });
        }
        authenticatedAdminId = adminUser.id;
      }
    }

    if (!authenticatedAdminId) {
      return NextResponse.json({ error: "Invalid administrative credentials." }, { status: 401 });
    }

    // Create secure server-side admin session
    await createSessionCookie(authenticatedAdminId, "admin");

    return NextResponse.json({
      success: true,
      message: "Admin authentication successful.",
      admin: {
        id: authenticatedAdminId,
        email: inputEmail,
        role: "admin",
      },
    });
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Authentication failed." }, { status: 500 });
  }
}
