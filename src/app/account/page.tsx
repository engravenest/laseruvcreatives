"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { formatPKR } from "@/lib/utils";
import { STORE_CONFIG } from "@/constants/store";

interface OrderCustomization {
  engravingText?: string;
  fontChoice?: string;
  engravingLocation?: string;
  logoFileName?: string;
  specialInstructions?: string;
}

interface OrderItem {
  id: string;
  productSlug: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  image: string;
  selectedVariants?: Record<string, string>;
  customization?: OrderCustomization;
}

interface CustomerOrder {
  id: string;
  orderNumber: string;
  customer: {
    fullName: string;
    phoneNumber: string;
    email?: string;
  };
  shippingAddress: {
    fullName: string;
    phoneNumber: string;
    city: string;
    province: string;
    addressLine: string;
    nearestLandmark?: string;
    postalCode?: string;
  };
  items: OrderItem[];
  paymentMethod: string;
  paymentStatus: string;
  couponCode?: string;
  discount?: number;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: string;
  courier?: {
    carrier?: string;
    trackingNumber?: string;
    dispatchedAt?: string;
  };
  notes?: string;
  createdAt: string;
}

interface SavedAddress {
  id: string;
  fullName: string;
  phoneNumber: string;
  city: string;
  province: string;
  addressLine: string;
  nearestLandmark?: string;
  isDefault?: boolean;
}

const PROVINCES = ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad Capital Territory", "Gilgit-Baltistan", "Azad Kashmir"];

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { customer, loading: authLoading, logout, refreshCustomer } = useCustomerAuth();

  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "addresses" | "password">("orders");

  // Orders State
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);

  // Profile Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [addressError, setAddressError] = useState("");

  // Saved Addresses State
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<Omit<SavedAddress, "id">>({
    fullName: "",
    phoneNumber: "",
    city: "",
    province: "Punjab",
    addressLine: "",
    nearestLandmark: "",
    isDefault: false,
  });

  // Password Change State
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [passSaving, setPassSaving] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Redirect unauthenticated visitors to login
  useEffect(() => {
    if (!authLoading && !customer) {
      router.push("/login?redirect=/account");
    }
  }, [authLoading, customer, router]);

  // Sync profile fields from customer
  useEffect(() => {
    if (customer) {
      setFullName(customer.fullName || "");
      setPhone(customer.phone || "");
    }
  }, [customer]);

  // Load customer orders from persistent database
  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/customer/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // Load saved addresses
  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/customer/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.savedAddresses) {
          setAddresses(data.savedAddresses);
        }
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  }, []);

  useEffect(() => {
    if (customer) {
      loadOrders();
      loadProfile();
    }
  }, [customer, loadOrders, loadProfile]);

  // Handle Profile Update
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);

    try {
      const res = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone }),
      });
      const data = await res.json();
      setProfileSaving(false);

      if (res.ok) {
        setProfileMsg({ type: "success", text: "Profile details updated successfully." });
        await refreshCustomer();
      } else {
        setProfileMsg({ type: "error", text: data.error || "Failed to update profile." });
      }
    } catch {
      setProfileSaving(false);
      setProfileMsg({ type: "error", text: "Network error occurred." });
    }
  };

  // Handle Save Address
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError("");
    if (!editingAddressId && addresses.length >= 5) { setAddressError("You can save a maximum of 5 addresses."); return; }
    let updatedList: SavedAddress[];

    if (editingAddressId) {
      updatedList = addresses.map((addr) =>
        addr.id === editingAddressId
          ? {
              ...addressForm,
              id: editingAddressId,
              isDefault: addressForm.isDefault || addr.isDefault,
            }
          : addressForm.isDefault
          ? { ...addr, isDefault: false }
          : addr
      );
    } else {
      const newAddr: SavedAddress = {
        ...addressForm,
        id: `addr-${Date.now()}`,
        isDefault: addresses.length === 0 || addressForm.isDefault,
      };
      updatedList = addressForm.isDefault
        ? [...addresses.map((a) => ({ ...a, isDefault: false })), newAddr]
        : [...addresses, newAddr];
    }

    try {
      const res = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savedAddresses: updatedList }),
      });
      if (res.ok) {
        setAddresses(updatedList);
        setAddressModalOpen(false);
        setEditingAddressId(null);
      } else {
        const data = await res.json();
        setAddressError(data.error || "Could not save address.");
      }
    } catch (err) {
      setAddressError("Could not save address. Please try again.");
      console.error("Failed to save address:", err);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    const updatedList = addresses.filter((a) => a.id !== id);
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savedAddresses: updatedList }),
      });
      if (res.ok) {
        setAddresses(updatedList);
      }
    } catch (err) {
      console.error("Failed to delete address:", err);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSaving(true);
    setPassMsg(null);

    if (newPass !== confirmPass) {
      setPassMsg({ type: "error", text: "New passwords do not match." });
      setPassSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/customer/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPass,
          newPassword: newPass,
          confirmPassword: confirmPass,
        }),
      });
      const data = await res.json();
      setPassSaving(false);

      if (res.ok) {
        setPassMsg({ type: "success", text: "Password changed successfully." });
        setCurrentPass("");
        setNewPass("");
        setConfirmPass("");
      } else {
        setPassMsg({ type: "error", text: data.error || "Failed to change password." });
      }
    } catch {
      setPassSaving(false);
      setPassMsg({ type: "error", text: "Network error occurred." });
    }
  };

  if (authLoading || !customer) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-amber-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-xs uppercase tracking-widest text-zinc-500">Loading Account...</span>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_confirmation":
        return <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">Pending Confirmation</span>;
      case "confirmed":
        return <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Order Confirmed</span>;
      case "in_engraving":
        return <span className="rounded-full bg-sky-500/15 border border-sky-500/30 px-2.5 py-0.5 text-[11px] font-bold text-sky-400">In Engraving Bed</span>;
      case "dispatched":
        return <span className="rounded-full bg-violet-500/15 border border-violet-500/30 px-2.5 py-0.5 text-[11px] font-bold text-violet-400">Dispatched via TCS</span>;
      case "delivered":
        return <span className="rounded-full bg-green-500/20 border border-green-500/40 px-2.5 py-0.5 text-[11px] font-bold text-green-300">Delivered</span>;
      case "cancelled":
        return <span className="rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 dark:text-rose-400">Cancelled</span>;
      default:
        return <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] text-zinc-700 dark:text-zinc-300">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-10 px-4 sm:px-6 lg:px-8 selection:bg-amber-500 selection:text-zinc-950">
      <div className="mx-auto max-w-6xl">
        {/* Top Header Card */}
        <div className="mb-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-zinc-950 font-black text-2xl shadow-lg shadow-amber-500/20">
              {customer.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">{customer.fullName}</h1>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  Verified Customer
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">{customer.email}</p>
              {customer.phone && <p className="text-xs text-zinc-500 mt-0.5">{customer.phone}</p>}
            </div>
          </div>

          <button
            onClick={async () => {
              await logout();
              router.push("/");
            }}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:border-rose-500/50 hover:text-rose-700 dark:hover:text-rose-400 transition-colors shadow-xs"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>

        {/* Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 p-3 backdrop-blur-xl">
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                  activeTab === "orders"
                    ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span>📦</span>
                  <span>My Orders</span>
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  activeTab === "orders" ? "bg-zinc-50 dark:bg-zinc-950 text-amber-700 dark:text-amber-400" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}>
                  {orders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all mt-1 ${
                  activeTab === "profile"
                    ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60"
                }`}
              >
                <span>👤</span>
                <span>My Profile</span>
              </button>

              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all mt-1 ${
                  activeTab === "addresses"
                    ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60"
                }`}
              >
                <span>📍</span>
                <span>Saved Addresses</span>
              </button>

              <button
                onClick={() => setActiveTab("password")}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all mt-1 ${
                  activeTab === "password"
                    ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60"
                }`}
              >
                <span>🔒</span>
                <span>Change Password</span>
              </button>
            </div>

            {/* Quick WhatsApp Support Box */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold mb-1">
                <span>💬</span>
                <span>Need Order Assistance?</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed mb-3">
                Connect directly with our master engraver on WhatsApp for live proofs.
              </p>
              <a
                href={`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                  `Hello LaserUVCreatives! I am logged into my account (${customer.email}) and have an inquiry about my orders.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-sm"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Main Tab Content */}
          <div className="lg:col-span-3">
            {/* 1. MY ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Your Orders</h2>
                  <Link href="/shop" className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline">
                    + Order More Gifts
                  </Link>
                </div>

                {ordersLoading ? (
                  <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-12 text-center text-zinc-500">
                    Loading your orders...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-12 text-center">
                    <span className="text-4xl block mb-3">🎁</span>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">No Orders Placed Yet</h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto mb-6">
                      Explore our handcrafted rosewood pens, metal executive pens, and laser-engraved thermal bottles with Cash on Delivery across Pakistan.
                    </p>
                    <Link
                      href="/shop"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-xs font-bold text-zinc-950 shadow-md"
                    >
                      Browse Catalogue
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 p-5 backdrop-blur-xl transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-2">
                          <div>
                            <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                              {order.orderNumber}
                            </span>
                            <span className="text-xs text-zinc-500 ml-3">
                              {new Date(order.createdAt).toLocaleDateString("en-PK", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <div>{getStatusBadge(order.status)}</div>
                        </div>

                        {/* Order Items Preview */}
                        <div className="py-4 space-y-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-300/60 dark:border-zinc-700/60">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={item.image}
                                    alt={item.productName}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{item.productName}</p>
                                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400">Qty: {item.quantity}</p>
                                  {item.customization?.engravingText && (
                                    <p className="text-[10px] text-amber-700/90 dark:text-amber-400/90 font-mono">
                                      Engraved: &quot;{item.customization.engravingText}&quot; ({item.customization.fontChoice || "Standard"})
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                {formatPKR(item.unitPrice * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Bottom Total & Actions */}
                        <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
                          <div className="text-xs">
                            <span className="text-zinc-500">Total Amount: </span>
                            <span className="font-extrabold text-amber-700 dark:text-amber-400 text-sm">
                              {formatPKR(order.total)}
                            </span>
                            <span className="text-[11px] text-zinc-500 ml-2 font-mono">
                              ({order.paymentMethod})
                            </span>
                          </div>

                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-900 dark:text-white transition-colors"
                          >
                            View Order Details →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. MY PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 p-6 sm:p-8 backdrop-blur-xl">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">My Profile Details</h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-6">
                  Manage your name and contact phone for faster checkout and order tracking.
                </p>

                {profileMsg && (
                  <div
                    className={`mb-6 rounded-xl p-4 text-xs font-semibold ${
                      profileMsg.type === "success"
                        ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                        : "border border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    {profileMsg.text}
                  </div>
                )}

                <form onSubmit={handleProfileSave} className="space-y-5 max-w-lg">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/70 px-4 py-3 text-sm text-zinc-900 dark:text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Email Address (Verified)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={customer.email}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/40 px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Mobile / WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 03001234567"
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/70 px-4 py-3 text-sm text-zinc-900 dark:text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-xs font-bold text-zinc-950 shadow-md hover:from-amber-400 hover:to-amber-500 active:scale-98 disabled:opacity-50"
                  >
                    {profileSaving ? "Saving..." : "Save Profile Changes"}
                  </button>
                </form>
              </div>
            )}

            {/* 3. SAVED ADDRESSES TAB */}
            {activeTab === "addresses" && (
              <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 p-6 sm:p-8 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Saved Delivery Addresses</h2>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Save up to 5 delivery addresses. Choose one at checkout.
                    </p>
                  </div>
                  <button
                    disabled={addresses.length >= 5}
                    onClick={() => {
                      setAddressError("");
                      setEditingAddressId(null);
                      setAddressForm({
                        fullName: customer.fullName || "",
                        phoneNumber: customer.phone || "",
                        city: "",
                        province: "Punjab",
                        addressLine: "",
                        nearestLandmark: "",
                        isDefault: addresses.length === 0,
                      });
                      setAddressModalOpen(true);
                    }}
                    className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 shadow-sm"
                  >
                    {addresses.length >= 5 ? "5 address limit reached" : "+ Add New Address"}
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center text-zinc-500 text-xs">
                    No addresses saved yet. Click &quot;Add New Address&quot; to save your home or office address.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`rounded-2xl border p-5 relative transition-all ${
                          addr.isDefault
                            ? "border-amber-500/40 bg-amber-500/5"
                            : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/60"
                        }`}
                      >
                        {addr.isDefault && (
                          <span className="absolute top-4 right-4 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-zinc-950">
                            Default
                          </span>
                        )}
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{addr.fullName}</h4>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{addr.phoneNumber}</p>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-2 font-medium">
                          {addr.addressLine}
                        </p>
                        {addr.nearestLandmark && (
                          <p className="text-[11px] text-zinc-500">
                            Landmark: {addr.nearestLandmark}
                          </p>
                        )}
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 font-semibold">
                          {addr.city}, {addr.province}
                        </p>

                        <div className="mt-4 pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center gap-3 text-xs">
                          <button
                            onClick={() => {
                              setEditingAddressId(addr.id);
                              setAddressForm({
                                fullName: addr.fullName,
                                phoneNumber: addr.phoneNumber,
                                city: addr.city,
                                province: addr.province,
                                addressLine: addr.addressLine,
                                nearestLandmark: addr.nearestLandmark || "",
                                isDefault: addr.isDefault || false,
                              });
                              setAddressModalOpen(true);
                            }}
                            className="text-amber-700 dark:text-amber-400 font-semibold hover:underline"
                          >
                            Edit
                          </button>
                          <span className="text-zinc-600">•</span>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-rose-700 dark:text-rose-400 font-semibold hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. CHANGE PASSWORD TAB */}
            {activeTab === "password" && (
              <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 p-6 sm:p-8 backdrop-blur-xl">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Change Account Password</h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-6">
                  Ensure your account is protected with a secure password of at least 8 characters.
                </p>

                {passMsg && (
                  <div
                    className={`mb-6 rounded-xl p-4 text-xs font-semibold ${
                      passMsg.type === "success"
                        ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                        : "border border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    {passMsg.text}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Current Password
                    </label>
                    <input
                      type={showPass ? "text" : "password"}
                      required
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/70 px-4 py-3 text-sm text-zinc-900 dark:text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      New Password (min. 8 characters)
                    </label>
                    <input
                      type={showPass ? "text" : "password"}
                      required
                      minLength={8}
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/70 px-4 py-3 text-sm text-zinc-900 dark:text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type={showPass ? "text" : "password"}
                      required
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/70 px-4 py-3 text-sm text-zinc-900 dark:text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="show-pass-toggle"
                      checked={showPass}
                      onChange={(e) => setShowPass(e.target.checked)}
                      className="h-4 w-4 rounded accent-amber-500"
                    />
                    <label htmlFor="show-pass-toggle" className="text-xs text-zinc-600 dark:text-zinc-400">
                      Show passwords
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={passSaving}
                    className="w-full mt-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 text-xs font-bold text-zinc-950 shadow-md hover:from-amber-400 hover:to-amber-500 active:scale-98 disabled:opacity-50"
                  >
                    {passSaving ? "Updating Password..." : "Update Password"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                  Order Details: <span className="text-amber-700 dark:text-amber-400 font-mono">{selectedOrder.orderNumber}</span>
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString("en-PK")}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Status & Courier Info */}
            <div className="my-6 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-600 dark:text-zinc-400">Current Status:</span>
                <div>{getStatusBadge(selectedOrder.status)}</div>
              </div>
              {selectedOrder.courier?.carrier && (
                <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 text-xs">
                  <span className="text-zinc-600 dark:text-zinc-400">Courier Carrier:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{selectedOrder.courier.carrier}</span>
                </div>
              )}
              {selectedOrder.courier?.trackingNumber && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-600 dark:text-zinc-400">Tracking Number:</span>
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                    {selectedOrder.courier.trackingNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Items with full customizations */}
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-3">
              Ordered Products &amp; Laser Customization
            </h4>
            <div className="space-y-3 mb-6">
              {selectedOrder.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 p-3.5 flex items-start gap-3"
                >
                  <div className="h-16 w-16 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-300 dark:border-zinc-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-zinc-900 dark:text-white">{item.productName}</h5>
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                        {formatPKR(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">Quantity: {item.quantity}</p>

                    {item.customization && (
                      <div className="mt-2 rounded-lg bg-white/80 dark:bg-zinc-900/80 p-2 text-[11px] border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
                        {item.customization.engravingText && (
                          <p className="text-zinc-700 dark:text-zinc-300">
                            <strong className="text-amber-700 dark:text-amber-400">Engraving Text:</strong> &quot;{item.customization.engravingText}&quot;
                          </p>
                        )}
                        {item.customization.fontChoice && (
                          <p className="text-zinc-600 dark:text-zinc-400">
                            <strong>Font Style:</strong> {item.customization.fontChoice}
                          </p>
                        )}
                        {item.customization.engravingLocation && (
                          <p className="text-zinc-600 dark:text-zinc-400">
                            <strong>Placement:</strong> {item.customization.engravingLocation}
                          </p>
                        )}
                        {item.customization.logoFileName && (
                          <p className="text-zinc-600 dark:text-zinc-400">
                            <strong>Logo Engraving:</strong> {item.customization.logoFileName}
                          </p>
                        )}
                        {item.customization.specialInstructions && (
                          <p className="text-zinc-600 dark:text-zinc-400">
                            <strong>Special Note:</strong> {item.customization.specialInstructions}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery & Totals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800 text-xs">
              <div className="rounded-xl bg-zinc-50/60 dark:bg-zinc-950/60 p-3 border border-zinc-200/80 dark:border-zinc-800/80">
                <h5 className="font-bold text-zinc-700 dark:text-zinc-300 mb-1">Shipping Destination</h5>
                <p className="text-zinc-900 dark:text-white font-medium">{selectedOrder.shippingAddress.fullName}</p>
                <p className="text-zinc-600 dark:text-zinc-400">{selectedOrder.shippingAddress.phoneNumber}</p>
                <p className="text-zinc-700 dark:text-zinc-300 mt-1">{selectedOrder.shippingAddress.addressLine}</p>
                <p className="text-amber-700 dark:text-amber-400 font-semibold">
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.province}
                </p>
              </div>

              <div className="rounded-xl bg-zinc-50/60 dark:bg-zinc-950/60 p-3 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between">
                <div>
                  <h5 className="font-bold text-zinc-700 dark:text-zinc-300 mb-1">Payment Breakdown</h5>
                  {(selectedOrder.discount || 0) > 0 && <div className="flex justify-between text-sm text-green-700 dark:text-green-400"><span>Coupon ({selectedOrder.couponCode})</span><span>−{formatPKR(selectedOrder.discount || 0)}</span></div>}
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400 mt-1">
                    <span>Subtotal:</span>
                    <span>{formatPKR(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Shipping Fee:</span>
                    <span>{selectedOrder.shippingFee === 0 ? "FREE" : formatPKR(selectedOrder.shippingFee)}</span>
                  </div>
                </div>
                <div className="flex justify-between font-bold text-sm text-zinc-900 dark:text-white pt-2 border-t border-zinc-200 dark:border-zinc-800 mt-2">
                  <span>Total Amount:</span>
                  <span className="text-amber-700 dark:text-amber-400">{formatPKR(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Track Button */}
            <div className="mt-6 flex items-center justify-between gap-3">
              <a
                href={`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                  `Assalam-o-Alaikum LaserUVCreatives! I would like to inquire about my order #${selectedOrder.orderNumber} (${selectedOrder.customer.fullName}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-bold text-white shadow-sm"
              >
                <span>💬 Track / Inquire on WhatsApp</span>
              </a>

              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-5 py-3 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADDRESS CREATE/EDIT MODAL */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-2xl">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-4">
              {editingAddressId ? "Edit Delivery Address" : "Add Delivery Address"}
            </h3>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              {addressError && <p role="alert" className="text-sm text-red-400">{addressError}</p>}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Recipient Name</label>
                <input
                  type="text"
                  required
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/70 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="03001234567"
                  value={addressForm.phoneNumber}
                  onChange={(e) => setAddressForm({ ...addressForm, phoneNumber: e.target.value })}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/70 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Lahore / Karachi"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/70 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Province</label>
                  <select
                    value={addressForm.province}
                    onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/70 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white outline-none focus:border-amber-500"
                  >
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Full Street Address</label>
                <textarea
                  required
                  rows={2}
                  placeholder="House #, Street #, Sector / Colony"
                  value={addressForm.addressLine}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/70 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Nearest Landmark (Optional)</label>
                <input
                  type="text"
                  placeholder="Near Commercial Market / Chowk"
                  value={addressForm.nearestLandmark}
                  onChange={(e) => setAddressForm({ ...addressForm, nearestLandmark: e.target.value })}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/70 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="default-addr-chk"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="h-4 w-4 rounded accent-amber-500"
                />
                <label htmlFor="default-addr-chk" className="text-xs text-zinc-700 dark:text-zinc-300">
                  Set as default shipping address
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 shadow-sm"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
