"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import type { CartItem, CartItemCustomization } from "@/types/cart";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CART_STORAGE_KEY = "laseruvCreatives_cart_v1";

/**
 * Build a deterministic cart-line ID from the product + chosen options.
 * Two cart lines are "identical" (and should merge) when they share the
 * same product, variants, and every customization field.
 */
function buildCartLineId(
  productId: string,
  selectedVariants: Record<string, string>,
  customization?: CartItemCustomization
): string {
  const parts: string[] = [productId];

  // Sort variant keys for stability
  Object.keys(selectedVariants)
    .sort()
    .forEach((k) => parts.push(`${k}:${selectedVariants[k]}`));

  if (customization) {
    parts.push(customization.engravingText ?? "");
    parts.push(customization.fontChoice ?? "");
    parts.push(customization.engravingLocation ?? "");
    parts.push(customization.logoFileName ?? "");
    parts.push(customization.specialInstructions ?? "");
  }

  // Simple deterministic hash (not crypto – just for uniqueness in state)
  return parts.join("|");
}

// ---------------------------------------------------------------------------
// State & Actions
// ---------------------------------------------------------------------------

interface CartState {
  items: CartItem[];
}

type CartAction =
  | {
      type: "ADD_ITEM";
      payload: Omit<CartItem, "id" | "quantity"> & { quantity: number };
    }
  | { type: "REMOVE_ITEM"; payload: { id: string } }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "HYDRATE"; payload: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.payload };

    case "ADD_ITEM": {
      const lineId = buildCartLineId(
        action.payload.productId,
        action.payload.selectedVariants,
        action.payload.customization
      );
      const existing = state.items.find((i) => i.id === lineId);
      if (existing) {
        // Merge: just bump quantity (capped at 99)
        return {
          items: state.items.map((i) =>
            i.id === lineId
              ? { ...i, quantity: Math.min(99, i.quantity + action.payload.quantity) }
              : i
          ),
        };
      }
      return {
        items: [...state.items, { ...action.payload, id: lineId }],
      };
    }

    case "REMOVE_ITEM":
      return { items: state.items.filter((i) => i.id !== action.payload.id) };

    case "UPDATE_QUANTITY": {
      const qty = Math.max(1, Math.min(99, action.payload.quantity));
      return {
        items: state.items.map((i) =>
          i.id === action.payload.id ? { ...i, quantity: qty } : i
        ),
      };
    }

    case "CLEAR_CART":
      return { items: [] };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  addItem: (
    item: Omit<CartItem, "id" | "quantity">,
    quantity?: number
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const hydratedRef = useRef(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once on mount (client-only)
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed: CartItem[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          dispatch({ type: "HYDRATE", payload: parsed });
        }
      }
    } catch {
      // Silently ignore corrupt storage
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist to localStorage whenever cart changes (after first hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // Silently ignore quota exceeded etc.
    }
  }, [state.items, hydrated]);

  const itemCount = useMemo(
    () => state.items.reduce((sum, i) => sum + i.quantity, 0),
    [state.items]
  );

  const subtotal = useMemo(
    () => state.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [state.items]
  );

  const addItem = useCallback(
    (item: Omit<CartItem, "id" | "quantity">, quantity = 1) => {
      dispatch({
        type: "ADD_ITEM",
        payload: { ...item, quantity: Math.max(1, quantity) },
      });
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { id } });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      itemCount,
      subtotal,
      total: subtotal, // Shipping is calculated at checkout from the delivery province.
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [state.items, itemCount, subtotal, addItem, removeItem, updateQuantity, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return ctx;
}
