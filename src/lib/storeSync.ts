"use client";

import { useState, useEffect } from "react";
import { Order } from "@/types/order";
import { Product } from "@/types/product";
import { BulkQuoteLead } from "@/types/admin";
import { PRODUCTS } from "@/data/products";
import { MOCK_ADMIN_ORDERS, MOCK_BULK_LEADS } from "@/data/mockAdminOrders";

const ORDERS_KEY = "luc_admin_orders";
const LEADS_KEY = "luc_admin_bulk_leads";

/**
 * Persists a new customer order into the shared admin orders store.
 * Dispatches a window event so active admin views immediately reflect the new order.
 */
export function saveOrderToStore(order: Order): Order[] {
  if (typeof window === "undefined") return [order];

  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    let orders: Order[] = raw ? JSON.parse(raw) : [...MOCK_ADMIN_ORDERS];
    // Check if order already exists
    const exists = orders.some((o) => o.id === order.id || o.orderNumber === order.orderNumber);
    if (!exists) {
      orders = [order, ...orders];
    } else {
      orders = orders.map((o) => (o.id === order.id ? order : o));
    }
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent("luc_orders_updated", { detail: orders }));
    return orders;
  } catch (err) {
    console.error("Failed to save order to localStorage:", err);
    return [order];
  }
}

/**
 * Retrieves all stored orders or defaults to initial seed orders.
 */
export function getStoredOrders(): Order[] {
  if (typeof window === "undefined") return MOCK_ADMIN_ORDERS;
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return MOCK_ADMIN_ORDERS;
}

/**
 * Persists a new corporate bulk lead into the shared admin leads store.
 */
export function saveBulkLeadToStore(lead: BulkQuoteLead): BulkQuoteLead[] {
  if (typeof window === "undefined") return [lead];

  try {
    const raw = localStorage.getItem(LEADS_KEY);
    let leads: BulkQuoteLead[] = raw ? JSON.parse(raw) : [...MOCK_BULK_LEADS];
    leads = [lead, ...leads];
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    window.dispatchEvent(new CustomEvent("luc_bulk_leads_updated", { detail: leads }));
    return leads;
  } catch (err) {
    console.error("Failed to save bulk lead to localStorage:", err);
    return [lead];
  }
}

/**
 * React hook to access live synchronized product catalog.
 * Any price, in-stock, or detail change made in /admin/products is immediately
 * reflected on the storefront without page reload.
 */
export function useLiveProducts(initialProducts: Product[] = PRODUCTS): Product[] {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    let controller: AbortController;
    const refresh = () => {
      controller?.abort();
      controller = new AbortController();
      fetch("/api/products", { cache: "no-store", signal: controller.signal })
        .then(response => response.ok ? response.json() : Promise.reject())
        .then(data => { if (Array.isArray(data.products)) setProducts(data.products); })
        .catch(() => {});
    };
    refresh();
    window.addEventListener("luc_products_updated", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      controller.abort();
      window.removeEventListener("luc_products_updated", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  return products;
}
