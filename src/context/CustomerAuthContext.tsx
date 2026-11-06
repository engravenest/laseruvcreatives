"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface CustomerUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  isEmailVerified: boolean;
}

interface CustomerAuthContextType {
  customer: CustomerUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; requiresVerification?: boolean; email?: string; error?: string }>;
  register: (fullName: string, email: string, pass: string, confirm: string) => Promise<{ success: boolean; email?: string; expiresAt?: string; error?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  resendOtp: (email: string) => Promise<{ success: boolean; error?: string; cooldownUntil?: string }>;
  logout: () => Promise<void>;
  refreshCustomer: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshCustomer = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCustomer(data.user);
        } else {
          setCustomer(null);
        }
      } else {
        setCustomer(null);
      }
    } catch {
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCustomer();
  }, [refreshCustomer]);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.requiresVerification) {
          return { success: false, requiresVerification: true, email: data.email, error: data.message };
        }
        return { success: false, error: data.error || "Login failed." };
      }
      setCustomer(data.user);
      return { success: true };
    } catch {
      return { success: false, error: "Network error during login. Please try again." };
    }
  };

  const register = async (fullName: string, email: string, pass: string, confirm: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password: pass, confirmPassword: confirm }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Registration failed." };
      }
      return { success: true, email: data.email, expiresAt: data.expiresAt };
    } catch {
      return { success: false, error: "Network error during registration. Please try again." };
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Verification failed." };
      }
      setCustomer(data.user);
      return { success: true };
    } catch {
      return { success: false, error: "Network error during verification." };
    }
  };

  const resendOtp = async (email: string) => {
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to resend code." };
      }
      return { success: true, cooldownUntil: data.cooldownUntil };
    } catch {
      return { success: false, error: "Network error while resending code." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setCustomer(null);
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        loading,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
        refreshCustomer,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  }
  return context;
}
