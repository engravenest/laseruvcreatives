"use client";

import { useCart } from "@/context/CartContext";
import Header from "./Header";

/**
 * Thin client-side wrapper that reads the cart item count from CartContext
 * and passes it down to the <Header /> component.
 *
 * This keeps Header itself free of direct context dependency so it can
 * remain a reusable component that also accepts a static cartCount prop.
 */
export default function CartAwareHeader() {
  const { itemCount } = useCart();
  return <Header cartCount={itemCount} />;
}
