import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedCustomer } from "@/lib/auth";
import { MAX_SAVED_ADDRESSES, validateShippingAddress } from "@/lib/shipping";
import { serverDb } from "@/lib/serverDb";

export async function GET() {
  try {
    const customer = await getAuthenticatedCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = serverDb.getUserById(customer.id);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    let savedAddresses = [];
    try {
      savedAddresses = user.addresses_json ? JSON.parse(user.addresses_json) : [];
    } catch {
      savedAddresses = [];
    }

    return NextResponse.json({
      profile: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        isEmailVerified: Boolean(user.is_email_verified),
        createdAt: user.created_at,
      },
      savedAddresses,
    });
  } catch (error: any) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Failed to load profile." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const customer = await getAuthenticatedCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, phone, savedAddresses } = body;

    const updates: any = {};
    if (fullName && typeof fullName === "string" && fullName.trim().length >= 2) {
      updates.fullName = fullName.trim();
    }
    if (phone !== undefined) {
      updates.phone = String(phone).trim();
    }
    if (savedAddresses !== undefined) {
      if (!Array.isArray(savedAddresses) || savedAddresses.length > MAX_SAVED_ADDRESSES) {
        return NextResponse.json({ error: "You can save a maximum of 5 delivery addresses." }, { status: 400 });
      }
      for (const address of savedAddresses) {
        const error = validateShippingAddress(address);
        if (error) return NextResponse.json({ error }, { status: 400 });
      }
      updates.addressesJson = JSON.stringify(savedAddresses);
    }

    const updated = serverDb.updateUser(customer.id, updates);

    let parsedAddresses = [];
    try {
      parsedAddresses = updated.addresses_json ? JSON.parse(updated.addresses_json) : [];
    } catch {
      parsedAddresses = [];
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: updated.id,
        fullName: updated.full_name,
        email: updated.email,
        phone: updated.phone || "",
        role: updated.role,
        isEmailVerified: Boolean(updated.is_email_verified),
      },
      savedAddresses: parsedAddresses,
    });
  } catch (error: any) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
