"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { Product } from "@/types/product";
import { Order, OrderStatus } from "@/types/order";
import { BulkQuoteLead, StoreSettings } from "@/types/admin";
import { PRODUCTS } from "@/data/products";
import { MOCK_ADMIN_ORDERS, MOCK_BULK_LEADS } from "@/data/mockAdminOrders";
import { STORE_CONFIG } from "@/constants/store";

interface AdminContextType {
  // Auth
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email?: string; password: string } | string) => Promise<boolean>;
  logout: () => Promise<void>;

  isSaving: boolean;
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, "id" | "createdAt">) => Promise<Product | null>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<void>;
  toggleStock: (id: string) => Promise<void>;

  // Orders
  orders: Order[];
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    courierData?: { carrier: "TCS" | "Leopard Courier" | "PostEx" | "Trax" | "Other"; trackingNumber: string }
  ) => Promise<boolean>;
  getOrderById: (orderId: string) => Order | undefined;
  addOrder: (order: Order) => void;

  // Bulk Leads
  bulkLeads: BulkQuoteLead[];
  updateLeadStatus: (leadId: string, status: BulkQuoteLead["status"], quotedAmount?: number) => void;

  // Settings
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;

  // Calculated Stats
  stats: {
    totalRevenue: number;
    activeOrdersCount: number;
    inEngravingCount: number;
    pendingCount: number;
    dispatchedCount: number;
    deliveredCount: number;
    todaySales: number;
  };

  // Reset demo data
  resetDemoData: () => void;
  refreshData: () => Promise<void>;
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: STORE_CONFIG.name,
  tagline: STORE_CONFIG.tagline,
  whatsappNumber: STORE_CONFIG.contact.whatsapp,
  supportEmail: STORE_CONFIG.contact.email,
  studioAddress: "Main Boulevard, Gulberg III / DHA Phase 5, Lahore, Pakistan",
  defaultCourier: "TCS",
  announcementText: "✨ Eid & Corporate Gifting Season: 15% OFF On Bulk Pen & Flask Sets | Fast COD Nationwide",
  announcementEnabled: true,
  freeShippingThreshold: 2000,
  minimumOrderValue: 500,
  currencySymbol: "Rs.",
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bulkLeads, setBulkLeads] = useState<BulkQuoteLead[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);

  // 1. Verify Server-Side Admin Session
  const checkAdminAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          return true;
        }
      }
      setIsAuthenticated(false);
      return false;
    } catch {
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  // 2. Fetch server-side persistent records
  const refreshData = useCallback(async () => {
    try {
      // Products from persistent DB
      const prodRes = await fetch("/api/products");
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (Array.isArray(prodData.products)) {
          setProducts(prodData.products);
          localStorage.setItem("luc_admin_products", JSON.stringify(prodData.products));
        }
      }

      // Orders from persistent DB
      const orderRes = await fetch("/api/orders");
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        if (orderData.orders) {
          setOrders(orderData.orders);
          localStorage.setItem("luc_admin_orders", JSON.stringify(orderData.orders));
        }
      }
    } catch (err) {
      console.warn("Could not load database records, using local fallback:", err);
    }
  }, []);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      const authed = await checkAdminAuth();

      // Load products & orders from localStorage initially for fast render
      try {
        const storedProducts = localStorage.getItem("luc_admin_products");
        if (storedProducts) setProducts(JSON.parse(storedProducts));
        else setProducts(PRODUCTS);

        const storedOrders = localStorage.getItem("luc_admin_orders");
        if (storedOrders) setOrders(JSON.parse(storedOrders));
        else setOrders(MOCK_ADMIN_ORDERS);

        const storedLeads = localStorage.getItem("luc_admin_bulk_leads");
        if (storedLeads) setBulkLeads(JSON.parse(storedLeads));
        else setBulkLeads(MOCK_BULK_LEADS);

        const storedSettings = localStorage.getItem("luc_admin_settings");
        if (storedSettings) setSettings(JSON.parse(storedSettings));
      } catch (e) {
        console.error("Local storage load error:", e);
      }

      if (authed) {
        await refreshData();
      }

      setIsLoading(false);
    }

    init();

    // Event listeners for multi-tab sync
    const handleOrdersUpdate = () => refreshData();
    window.addEventListener("luc_orders_updated", handleOrdersUpdate);
    window.addEventListener("luc_categories_updated", handleOrdersUpdate);
    return () => {
      window.removeEventListener("luc_orders_updated", handleOrdersUpdate);
      window.removeEventListener("luc_categories_updated", handleOrdersUpdate);
    };
  }, [checkAdminAuth, refreshData]);

  // Server-side Admin Login
  const login = async (credentials: { email?: string; password: string } | string): Promise<boolean> => {
    let email: string | undefined;
    let password = "";

    if (typeof credentials === "string") {
      password = credentials;
    } else {
      email = credentials.email;
      password = credentials.password;
    }

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setIsAuthenticated(false);
        return false;
      }

      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        await refreshData();
        return true;
      }

      return false;
    } catch {
      return false;
    }
  };

  // Server-side Admin Logout
  const logout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      setIsAuthenticated(false);
    }
  };

  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const saving = useRef(false);

  async function save<T>(action: string, work: () => Promise<T>): Promise<T | null> {
    if (saving.current) {
      setSaveError("A save is already in progress. Please wait and try again.");
      return null;
    }
    saving.current = true;
    setIsSaving(true);
    setSaveError("");
    try {
      return await work();
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Please try again.";
      setSaveError(`Could not ${action}. ${reason}`);
      return null;
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  }

  async function requestChange(url: string, method: string, body?: unknown) {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) throw new Error(result?.error || `Server returned ${response.status}.`);
    if (!result) throw new Error("The server did not confirm the change.");
    return result;
  }

  function cacheConfirmed(key: string, records: Product[] | Order[]) {
    try {
      localStorage.setItem(key, JSON.stringify(records));
    } catch {
      // The database write succeeded even if the browser cache is unavailable.
    }
  }

  function publishProducts(updated: Product[]) {
    setProducts(updated);
    cacheConfirmed("luc_admin_products", updated);
    window.dispatchEvent(new CustomEvent("luc_products_updated", { detail: updated }));
  }

  const addProduct = (productData: Omit<Product, "id" | "createdAt">) =>
    save("create product", async () => {
      const { product } = await requestChange("/api/products", "POST", productData);
      if (!product?.id) throw new Error("The server did not confirm the new product.");
      publishProducts([product, ...products]);
      return product as Product;
    });

  const updateProduct = async (id: string, updates: Partial<Product>) =>
    (await save("update product", async () => {
      const { product } = await requestChange(`/api/products/${id}`, "PUT", updates);
      if (product?.id !== id) throw new Error("The server did not confirm the product update.");
      publishProducts(products.map(current => current.id === id ? product : current));
      return true;
    })) === true;

  const deleteProduct = async (id: string) => {
    await save("delete product", async () => {
      const result = await requestChange(`/api/products/${id}`, "DELETE");
      if (result.success !== true) throw new Error("The server did not confirm deletion.");
      publishProducts(products.filter(product => product.id !== id));
    });
  };

  const toggleStock = async (id: string) => {
    const product = products.find(product => product.id === id);
    if (product) await updateProduct(id, { inStock: !product.inStock });
  };

  const updateOrderStatus: AdminContextType["updateOrderStatus"] = async (id, status, courier) =>
    (await save("update order", async () => {
      const result = await requestChange(`/api/orders/${id}`, "PATCH", { status, courier });
      if (result.order?.id !== id) throw new Error("The server did not confirm the order update.");
      const updated = orders.map(order => order.id === id ? result.order : order);
      setOrders(updated);
      cacheConfirmed("luc_admin_orders", updated);
      return true;
    })) === true;

  const getOrderById = (orderId: string): Order | undefined => {
    return orders.find((o) => o.id === orderId);
  };

  const addOrder = (order: Order) => {
    const updated = [order, ...orders];
    setOrders(updated);
    localStorage.setItem("luc_admin_orders", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("luc_orders_updated", { detail: updated }));
  };

  // Bulk Leads
  const updateLeadStatus = (leadId: string, status: BulkQuoteLead["status"], quotedAmount?: number) => {
    const updated = bulkLeads.map((lead) => {
      if (lead.id !== leadId) return lead;
      return {
        ...lead,
        status,
        quotedAmountPKR: quotedAmount !== undefined ? quotedAmount : lead.quotedAmountPKR,
        updatedAt: new Date().toISOString(),
      };
    });
    setBulkLeads(updated);
    localStorage.setItem("luc_admin_bulk_leads", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("luc_bulk_leads_updated", { detail: updated }));
  };

  // Settings
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem("luc_admin_settings", JSON.stringify(updated));
  };

  // Calculate stats
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const activeOrdersCount = orders.filter(
    (o) => o.status === "pending_confirmation" || o.status === "in_engraving" || o.status === "confirmed"
  ).length;

  const inEngravingCount = orders.filter((o) => o.status === "in_engraving").length;
  const pendingCount = orders.filter((o) => o.status === "pending_confirmation").length;
  const dispatchedCount = orders.filter((o) => o.status === "dispatched").length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;

  const todayIso = new Date().toISOString().split("T")[0];
  const todaySales = orders
    .filter((o) => o.createdAt.startsWith(todayIso) && o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const resetDemoData = () => {
    setProducts(PRODUCTS);
    setOrders(MOCK_ADMIN_ORDERS);
    setBulkLeads(MOCK_BULK_LEADS);
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem("luc_admin_products", JSON.stringify(PRODUCTS));
    localStorage.setItem("luc_admin_orders", JSON.stringify(MOCK_ADMIN_ORDERS));
    localStorage.setItem("luc_admin_bulk_leads", JSON.stringify(MOCK_BULK_LEADS));
    localStorage.setItem("luc_admin_settings", JSON.stringify(DEFAULT_SETTINGS));
  };

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        isSaving,
        isLoading,
        login,
        logout,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleStock,
        orders,
        updateOrderStatus,
        getOrderById,
        addOrder,
        bulkLeads,
        updateLeadStatus,
        settings,
        updateSettings,
        stats: {
          totalRevenue,
          activeOrdersCount,
          inEngravingCount,
          pendingCount,
          dispatchedCount,
          deliveredCount,
          todaySales,
        },
        resetDemoData,
        refreshData,
      }}
    >
      {saveError && (
        <div role="alert" className="fixed top-4 left-1/2 z-[100] flex w-max max-w-[90vw] -translate-x-1/2 items-center gap-3 rounded-xl bg-red-800 px-4 py-3 text-sm text-white shadow-lg">
          {saveError}
          <button type="button" className="underline" onClick={() => setSaveError("")}>Dismiss</button>
        </div>
      )}
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
