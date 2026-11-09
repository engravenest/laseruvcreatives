import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedCustomer } from "@/lib/auth";
import { serverDb, getDatabase } from "@/lib/serverDb";
import { checkCoupon, StoreInputError } from "@/lib/coupons";
export async function POST(req: NextRequest) {
  try {
    const customer = await getAuthenticatedCustomer();
    if (!customer) return NextResponse.json({ error: "Sign in to use a coupon." }, { status: 401 });
    const { code, items } = await req.json();
    if (typeof code !== "string" || code.length > 40 || !Array.isArray(items) || !items.length) throw new StoreInputError("Enter a coupon and add products to your cart.");
    let subtotal = 0;
    for (const item of items) {
      const product = typeof item?.productId === "string" ? serverDb.getProductById(item.productId) : null;
      if (!product || !product.inStock || !Number.isSafeInteger(item.quantity) || item.quantity < 1) throw new StoreInputError("Review your cart availability and quantities.");
      subtotal += product.price * item.quantity;
    }
    const { coupon, discount } = checkCoupon(getDatabase(), code, customer.id, subtotal);
    return NextResponse.json({ code: coupon.code, discount, subtotal });
  } catch (error) {
    return NextResponse.json({ error: error instanceof StoreInputError ? error.message : "Could not validate this coupon." }, { status: 400 });
  }
}
