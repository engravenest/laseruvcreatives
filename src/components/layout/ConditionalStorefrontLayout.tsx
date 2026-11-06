"use client";

import { usePathname } from "next/navigation";
import CartAwareHeader from "@/components/layout/CartAwareHeader";
import Footer from "@/components/layout/Footer";

interface Props {
  children: React.ReactNode;
}

export default function ConditionalStorefrontLayout({ children }: Props) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <main className="min-h-screen w-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">{children}</main>;
  }

  return (
    <>
      <CartAwareHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
