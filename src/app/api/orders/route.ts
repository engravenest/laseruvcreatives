import { StoreInputError } from "@/lib/coupons";
import { randomUUID } from "node:crypto";
import { getShippingFee, MAX_SAVED_ADDRESSES, sameShippingAddress, validateShippingAddress } from "@/lib/shipping";
import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/serverDb";
import { getAuthenticatedCustomer, getAuthenticatedAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    const customer = await getAuthenticatedCustomer();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;

    // If admin is logged in, return all orders (optionally filtered by status)
    if (admin) {
      const orders = serverDb.getOrders({ status });
      return NextResponse.json({ configured: true, orders, role: "admin" });
    }

    // If customer is logged in, return their orders
    if (customer) {
      const orders = serverDb.getOrders({
        userId: customer.id,
        email: customer.email,
        status,
      });
      return NextResponse.json({ configured: true, orders, role: "customer" });
    }

    // Unauthenticated GET request to all orders is forbidden
    return NextResponse.json(
      { error: "Unauthorized. Please sign in to view orders." },
      { status: 401 }
    );
  } catch (error: any) {
    if (error instanceof StoreInputError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.couponCode !== undefined && (typeof body.couponCode !== "string" || body.couponCode.length > 40)) return NextResponse.json({ error: "Invalid coupon code." }, { status: 400 });
    const addressError = validateShippingAddress(body.shippingAddress);
    if (addressError) return NextResponse.json({ error: addressError }, { status: 400 });
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }
    const items = [];
    for (const item of body.items) {
      const product = item && typeof item.productId === "string" ? serverDb.getProductById(item.productId) : null;
      if (!product || !product.inStock || !Number.isSafeInteger(item.quantity) || item.quantity < 1) {
        return NextResponse.json({ error: "Please check product availability and quantities in your cart." }, { status: 400 });
      }
      items.push({ ...item, id: randomUUID(), unitPrice: product.price, productName: product.name });
    }
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const shippingFee = getShippingFee(body.shippingAddress.province);
    // Associate orders only with the authenticated customer.
    const customer = await getAuthenticatedCustomer();
    if (customer) {
      const user = serverDb.getUserById(customer.id);
      const addresses = JSON.parse(user.addresses_json || "[]");
      if (!addresses.some((address: Record<string, unknown>) => sameShippingAddress(address, body.shippingAddress))) {
        if (addresses.length >= MAX_SAVED_ADDRESSES) {
          return NextResponse.json({ error: "You already have 5 saved addresses. Choose one or remove an address in your dashboard before adding another." }, { status: 400 });
        }
        addresses.push({ ...body.shippingAddress, id: randomUUID(), isDefault: addresses.length === 0 });
        serverDb.updateUser(customer.id, { addressesJson: JSON.stringify(addresses) });
      }
    }
    const orderData = {
      ...body,
      id: randomUUID(),
      orderNumber: `LUC-${randomUUID().slice(0, 8).toUpperCase()}`,
      userId: customer?.id || null,
      items,
      subtotal,
      shippingFee,
      total: subtotal + shippingFee,
      status: "pending_confirmation",
      paymentMethod: "Cash on Delivery (COD)",
      paymentStatus: "unpaid",
      courier: undefined,
      customer: {
        ...body.customer,
        email: body.customer?.email || customer?.email || null,
      },
    };

    const created = serverDb.createOrder(orderData);

    return NextResponse.json({
      configured: true,
      success: true,
      order: created,
    }, { status: 201 });
  } catch (error: any) {
    if (error instanceof StoreInputError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order in database.", details: String(error) },
      { status: 500 }
    );
  }
}
