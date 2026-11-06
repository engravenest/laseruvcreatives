import React from "react";
import type { Metadata } from "next";
import { AdminProvider } from "@/context/AdminContext";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import AdminLayoutShell from "@/components/admin/AdminLayoutShell";

export const metadata: Metadata = {
  title: "Admin Studio | LaserUVCreatives",
  description: "Administrative dashboard for LaserUVCreatives (Pakistan)",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <AdminAuthGuard>
        <AdminLayoutShell>{children}</AdminLayoutShell>
      </AdminAuthGuard>
    </AdminProvider>
  );
}
